import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import {
  SESSION_COOKIE,
  createSessionToken,
  getSessionUser,
  sessionCookieOptions,
} from "@/lib/session";
import { capabilitiesOf, normalizeRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

/** Sesi aktif + capability-nya. UI memakai ini untuk menyembunyikan aksi. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null, capabilities: [] });
  }
  return NextResponse.json({
    user,
    capabilities: capabilitiesOf(user.role),
  });
}

/**
 * Masuk sebagai akun demo.
 *
 * Yang dikirim klien hanya `userId`. Peran TIDAK diterima dari klien: peran
 * dibaca dari database, lalu ditandatangani ke dalam cookie. Jadi mengganti
 * `role` di browser tidak mengubah hak akses.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = typeof body?.userId === "string" ? body.userId : "";

    if (!userId) {
      return NextResponse.json({ error: "userId wajib diisi." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        programId: true,
        avatarUrl: true,
        program: { select: { id: true, code: true, name: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
    }

    cookies().set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions(req));

    const role = normalizeRole(user.role);
    return NextResponse.json({
      user: { ...user, role },
      capabilities: capabilitiesOf(role),
    });
  } catch (error) {
    console.error("Error saat login:", error);
    return NextResponse.json({ error: "Gagal membuat sesi." }, { status: 500 });
  }
}

/** Keluar: hapus cookie sesi. */
export async function DELETE(req: NextRequest) {
  cookies().set(SESSION_COOKIE, "", { ...sessionCookieOptions(req), maxAge: 0 });
  return NextResponse.json({ success: true });
}
