import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-error";
import { can } from "@/lib/permissions";

/**
 * Tandai permintaan bantuan selesai.
 *
 * Aturan:
 *  - `help.resolve.own`  : penanya boleh menutup pertanyaannya sendiri
 *  - `help.resolve.any`  : dosen/admin boleh menutup pertanyaan siapa pun
 * Sebelumnya route ini terbuka, jadi siapa pun bisa menutup pertanyaan orang lain.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Sesi tidak ditemukan. Silakan masuk terlebih dahulu.", code: "UNAUTHENTICATED" },
        { status: 401 }
      );
    }

    const request = await prisma.helpRequest.findUnique({
      where: { id: params.id },
      select: { id: true, requesterId: true, status: true },
    });

    if (!request) {
      return NextResponse.json({ error: "Permintaan tidak ditemukan." }, { status: 404 });
    }

    const isOwner = request.requesterId === user.id;
    const mayResolveAny = can(user.role, "help.resolve.any");
    const mayResolveOwn = isOwner && can(user.role, "help.resolve.own");

    if (!mayResolveAny && !mayResolveOwn) {
      return NextResponse.json(
        {
          error: isOwner
            ? "Peranmu tidak dapat menutup pertanyaan."
            : "Hanya penanya, dosen, atau admin yang dapat menutup pertanyaan ini.",
          code: "FORBIDDEN",
          capability: "help.resolve.any",
        },
        { status: 403 }
      );
    }

    if (request.status === "RESOLVED") {
      return NextResponse.json(
        { error: "Pertanyaan ini sudah ditandai selesai." },
        { status: 409 }
      );
    }

    const updated = await prisma.helpRequest.update({
      where: { id: request.id },
      data: { status: "RESOLVED", resolvedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Pertanyaan ditandai selesai.",
      request: updated,
      resolvedBy: { id: user.id, name: user.name, role: user.role, isOwner },
    });
  } catch (error) {
    const authError = toErrorResponse(error);
    if (authError) return authError;
    console.error("Gagal menutup permintaan:", error);
    return NextResponse.json({ error: "Gagal menutup permintaan." }, { status: 500 });
  }
}
