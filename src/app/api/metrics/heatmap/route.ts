import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const program = await prisma.program.findFirst();
    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    // Fast precomputed metrics (< 300ms SLA per PRD Section 6.3)
    const metrics = await prisma.weeklyMetric.findMany({
      where: { programId: program.id },
      orderBy: { weekNumber: "asc" },
    });

    // Also get assignment count breakdown per week
    const assignments = await prisma.assignment.findMany({
      where: { course: { programId: program.id } },
      select: {
        id: true,
        weekNumber: true,
        weightScore: true,
        courseId: true,
        course: {
          select: {
            courseCode: true,
            courseName: true,
            color: true,
          },
        },
      },
    });

    const enrichedMetrics = metrics.map((m) => {
      const weekAssignments = assignments.filter((a) => a.weekNumber === m.weekNumber);
      const majorAssignments = weekAssignments.filter((a) => a.weightScore >= 3);
      const uniqueCourses = Array.from(
        new Set(weekAssignments.map((a) => a.course.courseCode))
      );

      return {
        ...m,
        totalAssignments: weekAssignments.length,
        majorAssignmentsCount: majorAssignments.length,
        courses: uniqueCourses,
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
    console.error("Error fetching heatmap metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch heatmap metrics" },
      { status: 500 }
    );
  }
}
