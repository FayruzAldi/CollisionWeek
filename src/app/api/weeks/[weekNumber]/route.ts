import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  findMinimalDateMoveCandidates,
  AssignmentMetricInput,
} from "@/lib/calculator";
import { parseSubtopics } from "@/lib/utils";
import { requireCapability } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-error";

export async function GET(
  req: NextRequest,
  { params }: { params: { weekNumber: string } }
) {
  try {
    // Otorisasi: `week.view` (semua peran yang sudah masuk).
    const { user } = await requireCapability("week.view");

    const weekNumber = parseInt(params.weekNumber, 10);
    if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 16) {
      return NextResponse.json({ error: "Invalid week number" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const requestedProgramId = searchParams.get("programId");
    // Hanya ADMIN yang boleh melihat prodi lain; mahasiswa & dosen terkunci ke prodinya sendiri.
    const effectiveProgramId =
      user.role === "ADMIN" && requestedProgramId
        ? requestedProgramId
        : user.programId;

    const program =
      (effectiveProgramId
        ? await prisma.program.findUnique({ where: { id: effectiveProgramId } })
        : null) || (await prisma.program.findFirst());
    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    // Fetch this week's metric
    const metric = await prisma.weeklyMetric.findUnique({
      where: {
        programId_weekNumber: {
          programId: program.id,
          weekNumber,
        },
      },
    });

    // Fetch all assignments in semester to feed the deterministic minimal date move calculator
    const allAssignments = await prisma.assignment.findMany({
      where: { course: { programId: program.id } },
      include: {
        course: {
          select: {
            id: true,
            courseCode: true,
            courseName: true,
            color: true,
            lecturer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        dateMoveProposals: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            helpRequests: true,
          },
        },
      },
    });

    // Filter assignments for this specific week
    const weekAssignments = allAssignments.filter(
      (a) => a.weekNumber === weekNumber
    );

    // Identify colliding courses (weightScore >= 3)
    const majorAssignments = weekAssignments.filter((a) => a.weightScore >= 3);
    const collidingCoursesMap = new Map<string, { code: string; name: string; count: number }>();
    for (const a of majorAssignments) {
      const code = a.course.courseCode;
      if (!collidingCoursesMap.has(code)) {
        collidingCoursesMap.set(code, {
          code,
          name: a.course.courseName,
          count: 1,
        });
      } else {
        collidingCoursesMap.get(code)!.count += 1;
      }
    }

    // Convert for deterministic candidate finder
    const metricInputs: AssignmentMetricInput[] = allAssignments.map((a) => ({
      id: a.id,
      courseId: a.courseId,
      courseCode: a.course.courseCode,
      title: a.title,
      weightScore: a.weightScore,
      dueDate: a.dueDate,
      weekNumber: a.weekNumber,
    }));

    // Find deterministic candidates if flagged (or to alleviate load)
    const assignmentById = new Map(allAssignments.map((a) => [a.id, a]));
    const candidates = findMinimalDateMoveCandidates(
      metricInputs,
      weekNumber,
      program.totalWeeks
    ).map((c) => {
      const a = assignmentById.get(c.assignmentId);
      return {
        ...c,
        lecturerId: a?.course.lecturer.id,
        lecturerName: a?.course.lecturer.name,
      };
    });

    // Fetch saved proposals from DB for this week
    const savedProposals = await prisma.dateMoveProposal.findMany({
      where: { originalWeek: weekNumber },
      include: {
        assignment: {
          include: {
            course: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      weekNumber,
      metric: metric || {
        weekNumber,
        loadIndex: weekAssignments.reduce((acc, curr) => acc + curr.weightScore, 0),
        collisionCount: collidingCoursesMap.size,
        isFlagged: collidingCoursesMap.size >= 3,
      },
      assignments: weekAssignments.map((a) => ({
        id: a.id,
        courseId: a.courseId,
        courseCode: a.course.courseCode,
        courseName: a.course.courseName,
        courseColor: a.course.color,
        lecturerId: a.course.lecturer.id,
        lecturerName: a.course.lecturer.name,
        title: a.title,
        type: a.type,
        weightScore: a.weightScore,
        dueDate: a.dueDate,
        weekNumber: a.weekNumber,
        subtopics: parseSubtopics(a.subtopics),
        isMajor: a.weightScore >= 3,
        helpRequestsCount: a._count.helpRequests,
        existingProposals: a.dateMoveProposals,
      })),
      collidingCourses: Array.from(collidingCoursesMap.values()),
      candidates,
      savedProposals,
    });
  } catch (error) {
    const authError = toErrorResponse(error);
    if (authError) return authError;
    console.error("Error fetching week details:", error);
    return NextResponse.json(
      { error: "Failed to fetch week details" },
      { status: 500 }
    );
  }
}
