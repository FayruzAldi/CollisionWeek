import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireCapability } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-error";

const VALID_TYPES = ["WRITTEN", "RECORDED_LINK", "SESSION_20MIN"];

/**
 * Kirim tanggapan atas permintaan bantuan.
 *
 * Otorisasi: `help.respond` (semua peran yang sudah masuk). `helperId` dibaca
 * dari sesi, bukan dari body, supaya tidak bisa menanggapi atas nama orang lain.
 * Penanya sendiri tidak boleh menanggapi pertanyaannya.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireCapability("help.respond");

    const body = await req.json();
    const { responseType, contentOrUrl, scheduledSlot } = body;

    if (!responseType || !contentOrUrl) {
      return NextResponse.json(
        { error: "responseType dan contentOrUrl wajib diisi." },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(responseType)) {
      return NextResponse.json(
        { error: "responseType harus WRITTEN, RECORDED_LINK, atau SESSION_20MIN." },
        { status: 400 }
      );
    }

    const request = await prisma.helpRequest.findUnique({
      where: { id: params.id },
      include: { responses: true },
    });

    if (!request) {
      return NextResponse.json({ error: "Permintaan tidak ditemukan." }, { status: 404 });
    }

    if (request.requesterId === user.id) {
      return NextResponse.json(
        { error: "Kamu tidak dapat menanggapi pertanyaanmu sendiri." },
        { status: 403 }
      );
    }

    const newResponse = await prisma.helpResponse.create({
      data: {
        requestId: request.id,
        helperId: user.id,
        responseType,
        contentOrUrl: String(contentOrUrl).trim(),
        scheduledSlot: scheduledSlot ? new Date(scheduledSlot) : null,
      },
      include: {
        helper: {
          select: { id: true, name: true, email: true, avatarUrl: true, role: true },
        },
      },
    });

    const updateData: any = {
      status: request.status === "RESOLVED" ? "RESOLVED" : "IN_PROGRESS",
    };
    if (!request.firstResponseAt) {
      updateData.firstResponseAt = new Date();
    }

    await prisma.helpRequest.update({ where: { id: request.id }, data: updateData });

    return NextResponse.json({
      success: true,
      message: "Tanggapan terkirim.",
      response: newResponse,
    });
  } catch (error) {
    const authError = toErrorResponse(error);
    if (authError) return authError;
    console.error("Gagal mengirim tanggapan:", error);
    return NextResponse.json({ error: "Gagal mengirim tanggapan." }, { status: 500 });
  }
}
