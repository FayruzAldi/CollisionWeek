import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireCapability } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-error";

export const dynamic = "force-dynamic";

/**
 * Daftar permintaan geser tanggal yang diajukan mahasiswa beserta alasannya.
 * Dibatasi pada program studi pengguna (kecuali ADMIN yang boleh menyaring ?programId=).
 */
export async function GET(req: NextRequest) {
  try {
    const { user } = await requireCapability("week.view");
    const { searchParams } = new URL(req.url);
    const weekParam = searchParams.get("weekNumber");
    const requestedProgramId = searchParams.get("programId");

    const effectiveProgramId =
      user.role === "ADMIN" && requestedProgramId
        ? requestedProgramId
        : user.role === "ADMIN"
        ? undefined
        : user.programId;

    const where: any = {};
    if (weekParam) {
      const w = parseInt(weekParam, 10);
      if (!isNaN(w)) {
        where.originalWeek = w;
      }
    }
    if (effectiveProgramId) {
      where.assignment = {
        course: { programId: effectiveProgramId },
      };
    }

    const requests = await prisma.studentShiftRequest.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
            program: { select: { id: true, name: true } },
          },
        },
        assignment: {
          select: {
            id: true,
            title: true,
            weekNumber: true,
            dueDate: true,
            weightScore: true,
            course: {
              select: {
                id: true,
                courseCode: true,
                courseName: true,
                lecturerId: true,
                lecturer: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    const authError = toErrorResponse(error);
    if (authError) return authError;
    console.error("Gagal mengambil permintaan geser mahasiswa:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar permintaan geser tanggal." },
      { status: 500 }
    );
  }
}

/**
 * Mahasiswa mengajukan permintaan geser tanggal tugas kepada dosen pengampu beserta alasannya.
 */
export async function POST(req: NextRequest) {
  try {
    const { user } = await requireCapability("help.create");
    const body = await req.json().catch(() => ({}));
    const assignmentId = typeof body.assignmentId === "string" ? body.assignmentId.trim() : "";
    const proposedWeek = Number(body.proposedWeek);
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";

    if (!assignmentId) {
      return NextResponse.json({ error: "Tugas wajib dipilih." }, { status: 400 });
    }
    if (!Number.isInteger(proposedWeek) || proposedWeek < 1 || proposedWeek > 16) {
      return NextResponse.json({ error: "Pekan usulan harus antara 1 sampai 16." }, { status: 400 });
    }
    if (reason.length < 8) {
      return NextResponse.json(
        { error: "Tuliskan alasan minimal 8 karakter agar dosen bisa mempertimbangkannya." },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { course: true },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Tugas tidak ditemukan." }, { status: 404 });
    }
    if (user.role !== "ADMIN" && assignment.course.programId !== user.programId) {
      return NextResponse.json(
        { error: "Anda hanya dapat mengajukan pergeseran untuk jurusan Anda sendiri." },
        { status: 403 }
      );
    }

    const created = await prisma.studentShiftRequest.create({
      data: {
        assignmentId,
        studentId: user.id,
        originalWeek: assignment.weekNumber,
        proposedWeek,
        reason,
        status: "PENDING",
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
            program: { select: { id: true, name: true } },
          },
        },
        assignment: {
          select: {
            id: true,
            title: true,
            weekNumber: true,
            dueDate: true,
            weightScore: true,
            course: {
              select: {
                id: true,
                courseCode: true,
                courseName: true,
                lecturerId: true,
                lecturer: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Permintaan geser tanggal dan alasan berhasil dikirim ke dosen.",
        request: created,
      },
      { status: 201 }
    );
  } catch (error) {
    const authError = toErrorResponse(error);
    if (authError) return authError;
    console.error("Gagal membuat permintaan geser mahasiswa:", error);
    return NextResponse.json(
      { error: "Gagal mengirim permintaan geser tanggal." },
      { status: 500 }
    );
  }
}
