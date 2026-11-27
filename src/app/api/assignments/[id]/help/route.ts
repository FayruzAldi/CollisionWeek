import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseSubtopics, isMoreThan12HoursOld } from "@/lib/utils";
import { requireCapability } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-error";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Otorisasi: `help.view`. Isi tiket bantuan memuat nama dan email.
    await requireCapability("help.view");

    const assignmentId = params.id;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
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
        helpRequests: {
          include: {
            requester: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                role: true,
              },
            },
            responses: {
              include: {
                helper: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    role: true,
                  },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const subtopics = parseSubtopics(assignment.subtopics);

    const enrichedRequests = assignment.helpRequests.map((r) => {
      const isUrgent =
        r.status === "OPEN" &&
        r.responses.length === 0 &&
        isMoreThan12HoursOld(r.createdAt);

      return {
        ...r,
        isUrgent,
      };
    });

    return NextResponse.json({
      assignment: {
        id: assignment.id,
        title: assignment.title,
        type: assignment.type,
        weightScore: assignment.weightScore,
        dueDate: assignment.dueDate,
        weekNumber: assignment.weekNumber,
        subtopics,
        course: assignment.course,
      },
      subtopics,
      helpRequests: enrichedRequests,
    });
  } catch (error) {
    const authError = toErrorResponse(error);
    if (authError) return authError;
    console.error("Error fetching assignment help:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment help requests" },
      { status: 500 }
    );
  }
}
