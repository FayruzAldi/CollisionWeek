import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id;
    const body = await req.json();
    const { helperId, responseType, contentOrUrl, scheduledSlot } = body;

    if (!helperId || !responseType || !contentOrUrl) {
      return NextResponse.json(
        { error: "Missing required fields: helperId, responseType, contentOrUrl" },
        { status: 400 }
      );
    }

    if (!["WRITTEN", "RECORDED_LINK", "SESSION_20MIN"].includes(responseType)) {
      return NextResponse.json(
        { error: "responseType must be WRITTEN, RECORDED_LINK, or SESSION_20MIN" },
        { status: 400 }
      );
    }

    const request = await prisma.helpRequest.findUnique({
      where: { id: requestId },
      include: { responses: true },
    });

    if (!request) {
      return NextResponse.json({ error: "Help request not found" }, { status: 404 });
    }

    // 1. Create response
    const newResponse = await prisma.helpResponse.create({
      data: {
        requestId,
        helperId,
        responseType,
        contentOrUrl: contentOrUrl.trim(),
        scheduledSlot: scheduledSlot ? new Date(scheduledSlot) : null,
      },
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
    });

    // 2. Update request: record firstResponseAt if this is first response & set status = IN_PROGRESS
    const updateData: any = {
      status: request.status === "RESOLVED" ? "RESOLVED" : "IN_PROGRESS",
    };

    if (!request.firstResponseAt) {
      updateData.firstResponseAt = new Date();
    }

    await prisma.helpRequest.update({
      where: { id: requestId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Help response delivered successfully!",
      response: newResponse,
    });
  } catch (error) {
    console.error("Error creating help response:", error);
    return NextResponse.json(
      { error: "Failed to submit response" },
      { status: 500 }
    );
  }
}
