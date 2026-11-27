import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { addDays } from "date-fns";
import { requireCapability } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Otorisasi: `dashboard.view`. Peta beban kelas tidak boleh dibaca anonim.
    const { user } = await requireCapability("dashboard.view");

    const { searchParams } = new URL(req.url);
    const requestedProgramId = searchParams.get("programId");

    // Hanya ADMIN yang boleh memilih prodi lain; mahasiswa & dosen terkunci ke prodinya sendiri.
    const effectiveProgramId =
      user.role === "ADMIN" && requestedProgramId
        ? requestedProgramId
        : user.programId;

    const programs =
      user.role === "ADMIN"
        ? await prisma.program.findMany({
            orderBy: { code: "asc" },
            select: { id: true, code: true, name: true },
          })
        : [];

    const program =
      (effectiveProgramId
        ? await prisma.program.findUnique({ where: { id: effectiveProgramId } })
        : null) || (await prisma.program.findFirst());
    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    // Fast precomputed metrics (< 300ms SLA per PRD Section 6.3)
    const metrics = await prisma.weeklyMetric.findMany({
      where: { programId: program.id },
      orderBy: { weekNumber: "asc" },
    });

    // Get assignment details with lecturer info, due dates
    const assignments = await prisma.assignment.findMany({
      where: { course: { programId: program.id } },
      select: {
        id: true,
        weekNumber: true,
        weightScore: true,
        courseId: true,
        dueDate: true,
        course: {
          select: {
            courseCode: true,
            courseName: true,
            color: true,
            lecturer: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    const semStart = new Date(program.semesterStartDate);

    const enrichedMetrics = metrics.map((m) => {
      const weekAssignments = assignments.filter((a) => a.weekNumber === m.weekNumber);
      const majorAssignments = weekAssignments.filter((a) => a.weightScore >= 3);
      const uniqueCourses = Array.from(
        new Set(weekAssignments.map((a) => a.course.courseCode))
      );

      // Collect unique lecturer names for this week
      const lecturerNames = Array.from(
        new Set(
          weekAssignments
            .map((a) => a.course.lecturer?.name)
            .filter(Boolean) as string[]
        )
      );

      // Due date range
      const dueDates = weekAssignments
        .map((a) => a.dueDate)
        .filter(Boolean)
        .sort();
      const dueDateRange =
        dueDates.length > 0
          ? {
              earliest: dueDates[0].toISOString(),
              latest: dueDates[dueDates.length - 1].toISOString(),
            }
          : null;

      // Week calendar date range (Mon–Sun)
      const weekStart = addDays(semStart, (m.weekNumber - 1) * 7);
      const weekEnd = addDays(weekStart, 6);

      return {
        ...m,
        totalAssignments: weekAssignments.length,
        majorAssignmentsCount: majorAssignments.length,
        courses: uniqueCourses,
        lecturerNames,
        dueDateRange,
        weekDateRange: {
          start: weekStart.toISOString(),
          end: weekEnd.toISOString(),
        },
        assignmentsSummary: weekAssignments.map((a) => ({
          id: a.id,
          courseCode: a.course.courseCode,
          color: a.course.color,
          weightScore: a.weightScore,
        })),
      };
    });

    return NextResponse.json({
      program: {
        id: program.id,
        code: program.code,
        name: program.name,
        semesterStartDate: program.semesterStartDate,
        totalWeeks: program.totalWeeks,
      },
      programs,
      metrics: enrichedMetrics,
      summary: {
        totalWeeks: program.totalWeeks,
        flaggedWeeksCount: metrics.filter((m) => m.isFlagged).length,
        peakLoadIndex: Math.max(...metrics.map((m) => m.loadIndex), 0),
        avgLoadIndex: Math.round(
          metrics.reduce((acc, m) => acc + m.loadIndex, 0) / (metrics.length || 1)
        ),
      },
    });
  } catch (error) {
    const authError = toErrorResponse(error);
    if (authError) return authError;
    console.error("Error fetching heatmap metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch heatmap metrics" },
      { status: 500 }
    );
  }
}
