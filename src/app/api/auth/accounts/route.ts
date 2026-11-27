import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizeRole } from "@/lib/permissions";

export const dynamic = "force-dynamic";

/**
 * Daftar akun untuk halaman masuk (pemilih akun demo).
 *
 * Sengaja publik: tanpa ini tidak ada yang bisa masuk. Yang dikembalikan hanya
 * id, nama, email, peran, dan avatar. Tidak ada kredensial, dan peran di sini
 * hanya untuk label di UI. Hak akses tetap dibaca server dari database saat
 * permintaan sebenarnya datang.
 */
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: [{ role: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        programId: true,
        program: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    return NextResponse.json({
      users: users.map((u) => ({ ...u, role: normalizeRole(u.role) })),
    });
  } catch (error) {
    console.error("Gagal mengambil daftar akun:", error);
    return NextResponse.json({ error: "Gagal mengambil daftar akun." }, { status: 500 });
  }
}
