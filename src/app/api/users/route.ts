import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireCapability } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-error";

export const dynamic = "force-dynamic";

/**
 * Daftar akun untuk pemilih akun demo.
 *
 * Otorisasi: `users.list` (dosen/admin). Halaman masuk memakai
 * /api/auth/accounts yang publik; route ini untuk kebutuhan administratif dan
 * mengembalikan data yang lebih lengkap.
 */
export async function GET() {
  try {
    await requireCapability("users.list");

    const users = await prisma.user.findMany({
      orderBy: [{ role: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        programId: true,
        createdAt: true,
        _count: { select: { helpRequests: true, helpResponses: true } },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    const authError = toErrorResponse(error);
    if (authError) return authError;
    console.error("Gagal mengambil pengguna:", error);
    return NextResponse.json({ error: "Gagal mengambil pengguna." }, { status: 500 });
  }
}
