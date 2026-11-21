import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id;

    const request = await prisma.helpRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json({ error: "Help request not found" }, { status: 404 });
    }

    const updated = await prisma.helpRequest.update({
      where: { id: requestId },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Help request marked as RESOLVED! Resolution metrics updated.",
      request: updated,
    });
  } catch (error) {
    console.error("Error resolving help request:", error);
    return NextResponse.json(
      { error: "Failed to resolve help request" },
      { status: 500 }
    );
  }
}
