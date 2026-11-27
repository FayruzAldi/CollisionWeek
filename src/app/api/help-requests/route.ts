import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isMoreThan12HoursOld } from "@/lib/utils";
import { requireCapability, getSessionUser } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-error";

export const dynamic = "force-dynamic";

/** Baca papan bantuan. Butuh sesi aktif (semua peran boleh membaca). */
export async function GET(req: NextRequest) {
  try {
    const { user } = await requireCapability("help.view");

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const status = searchParams.get("status");
    const filter = searchParams.get("filter");
    const search = searchParams.get("search");

    const where: any = {};

    if (user.role !== "ADMIN") {
      where.assignment = {
        course: { programId: user.programId },
        ...(courseId && courseId !== "all" ? { courseId } : {}),
      };
    } else if (courseId && courseId !== "all") {
      where.assignment = { courseId };
    }
    if (status && status !== "all") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { subtopicLabel: { contains: search, mode: "insensitive" } },
        { questionDetail: { contains: search, mode: "insensitive" } },
        { assignment: { title: { contains: search, mode: "insensitive" } } },
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
              select: { id: true, courseCode: true, courseName: true, color: true },
            },
          },
        },
        requester: {
          select: { id: true, name: true, email: true, avatarUrl: true, role: true },
        },
        responses: {
          include: {
            helper: {
              select: { id: true, name: true, email: true, avatarUrl: true, role: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = requests.map((r) => ({
      ...r,
      isUrgent:
        r.status === "OPEN" && r.responses.length === 0 && isMoreThan12HoursOld(r.createdAt),
      responsesCount: r.responses.length,
    }));

    let result = enriched;
    if (filter === "needs_help") result = enriched.filter((r) => r.isUrgent);
    else if (filter === "in_progress") result = enriched.filter((r) => r.status === "IN_PROGRESS");
    else if (filter === "resolved") result = enriched.filter((r) => r.status === "RESOLVED");

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
        needsHelpUrgent: enriched.filter((r) => r.isUrgent).length,
        inProgress: requests.filter((r) => r.status === "IN_PROGRESS").length,
        resolved: requests.filter((r) => r.status === "RESOLVED").length,
      },
    });
  } catch (error) {
    const authError = toErrorResponse(error);
    if (authError) return authError;
    console.error("Gagal mengambil permintaan bantuan:", error);
    return NextResponse.json(
      { error: "Gagal mengambil permintaan bantuan." },
      { status: 500 }
    );
  }
}

/**
 * Buat permintaan bantuan.
 *
 * Otorisasi: `help.create`. `requesterId` TIDAK lagi dibaca dari body, melainkan
 * dari sesi. Sebelumnya siapa pun bisa membuat pertanyaan atas nama orang lain.
 */
export async function POST(req: NextRequest) {
  try {
    const { user } = await requireCapability("help.create");

    const body = await req.json();
    const { assignmentId, subtopicLabel, questionDetail } = body;

    if (!assignmentId || !subtopicLabel || !questionDetail) {
      return NextResponse.json(
        { error: "assignmentId, subtopicLabel, dan questionDetail wajib diisi." },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { id: true, course: { select: { programId: true } } },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Tugas tidak ditemukan." }, { status: 404 });
    }

    if (assignment.course.programId !== user.programId) {
      return NextResponse.json(
        { error: "Tugas ini bukan bagian dari program studi kamu." },
        { status: 403 }
      );
    }

    const newRequest = await prisma.helpRequest.create({
      data: {
        assignmentId,
        requesterId: user.id,
        subtopicLabel: String(subtopicLabel).trim(),
        questionDetail: String(questionDetail).trim(),
        status: "OPEN",
      },
      include: {
        assignment: { include: { course: true } },
        requester: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Permintaan bantuan terkirim dan terlihat seluruh kelas.",
      request: newRequest,
    });
  } catch (error) {
    const authError = toErrorResponse(error);
    if (authError) return authError;
    console.error("Gagal membuat permintaan bantuan:", error);
    return NextResponse.json(
      { error: "Gagal membuat permintaan bantuan." },
      { status: 500 }
    );
  }
}
