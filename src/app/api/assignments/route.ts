import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseSubtopics } from "@/lib/utils";
import { requireCapability } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireCapability("help.view");
    const { searchParams } = new URL(req.url);
    const requestedProgramId = searchParams.get("programId");

    const where =
      user.role === "ADMIN"
        ? requestedProgramId
          ? { course: { programId: requestedProgramId } }
          : {}
        : { course: { programId: user.programId } };

    const rows = await prisma.assignment.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            courseCode: true,
            courseName: true,
            programId: true,
          },
        },
      },
      orderBy: [{ weekNumber: "asc" }, { dueDate: "asc" }],
    });

    return NextResponse.json({
      assignments: rows.map((a) => ({
        id: a.id,
        title: a.title,
        courseCode: a.course.courseCode,
        courseName: a.course.courseName,
        weekNumber: a.weekNumber,
        dueDate: a.dueDate,
        weightScore: a.weightScore,
        subtopics: parseSubtopics(a.subtopics),
      })),
    });
  } catch (error) {
    const authError = toErrorResponse(error);
    if (authError) return authError;
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
