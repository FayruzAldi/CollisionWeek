import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireCapability } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Otorisasi: `dashboard.view` (semua peran yang sudah masuk).
    const { user } = await requireCapability("dashboard.view");

    const courses = await prisma.course.findMany({
      where: user.role === "ADMIN" ? undefined : { programId: user.programId },
      include: {
        lecturer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            assignments: true,
          },
        },
      },
      orderBy: { courseCode: "asc" },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    const authError = toErrorResponse(error);
    if (authError) return authError;
    console.error("Error fetching courses:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}
