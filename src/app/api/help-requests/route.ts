import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isMoreThan12HoursOld } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const status = searchParams.get("status");
    const filter = searchParams.get("filter"); // "all" | "needs_help" | "in_progress" | "resolved"
    const search = searchParams.get("search");

    const where: any = {};

    if (courseId && courseId !== "all") {
      where.assignment = { courseId };
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { subtopicLabel: { contains: search } },
        { questionDetail: { contains: search } },
        { assignment: { title: { contains: search } } },
      ];
    }

    const requests = await prisma.helpRequest.findMany({
      where,
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            weekNumber: true,
            course: {
              select: {
                id: true,
                courseCode: true,
                courseName: true,
                color: true,
              },
            },
          },
        },
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
    });

    // Check cold-start rule (PRD Section 8.2: Permintaan Bantuan Belum Direspons > 12 jam)
    const enriched = requests.map((r) => {
      const isUrgent =
        r.status === "OPEN" &&
        r.responses.length === 0 &&
        isMoreThan12HoursOld(r.createdAt);

      return {
        ...r,
        isUrgent,
        responsesCount: r.responses.length,
      };
    });

    // If filter is "needs_help", return only urgent ones
    let result = enriched;
    if (filter === "needs_help") {
      result = enriched.filter((r) => r.isUrgent);
    } else if (filter === "in_progress") {
      result = enriched.filter((r) => r.status === "IN_PROGRESS");
    } else if (filter === "resolved") {
      result = enriched.filter((r) => r.status === "RESOLVED");
    }

    // Sort: Urgent "Needs Peer Help" prioritized at the top (PRD Section 8.2)
    result.sort((a, b) => {
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      requests: result,
      stats: {
        total: requests.length,
        open: requests.filter((r) => r.status === "OPEN").length,
        needsHelpUrgent: requests.filter((r) => (r as any).isUrgent).length,
        inProgress: requests.filter((r) => r.status === "IN_PROGRESS").length,
        resolved: requests.filter((r) => r.status === "RESOLVED").length,
      },
    });
  } catch (error) {
    console.error("Error fetching help requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch help requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { assignmentId, requesterId, subtopicLabel, questionDetail } = body;

    if (!assignmentId || !requesterId || !subtopicLabel || !questionDetail) {
      return NextResponse.json(
        { error: "Missing required fields: assignmentId, requesterId, subtopicLabel, questionDetail" },
        { status: 400 }
      );
    }

    const newRequest = await prisma.helpRequest.create({
      data: {
        assignmentId,
        requesterId,
        subtopicLabel: subtopicLabel.trim(),
        questionDetail: questionDetail.trim(),
        status: "OPEN",
      },
      include: {
        assignment: {
          include: {
            course: true,
          },
        },
        requester: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Help request created successfully with class-wide visibility!",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error creating help request:", error);
    return NextResponse.json(
      { error: "Failed to create help request" },
      { status: 500 }
    );
  }
}
