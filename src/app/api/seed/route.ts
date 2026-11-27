import { NextResponse } from "next/server";
import { runBenchmarkSeed } from "@/lib/seed-benchmark";
import { requireCapability } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-error";

/**
 * Pulihkan dataset demo.
 *
 * Otorisasi: `demo.reset` (admin saja). Route ini menghapus seluruh isi
 * database, jadi tidak boleh bisa dipanggil dari browser mahasiswa.
 */
export async function POST() {
  try {
    await requireCapability("demo.reset");
    await runBenchmarkSeed();
    return NextResponse.json({
      success: true,
      message: "Data demo 16 pekan berhasil dipulihkan.",
    });
  } catch (error) {
    const authError = toErrorResponse(error);
    if (authError) return authError;
    console.error("Gagal melakukan seed benchmark:", error);
    return NextResponse.json(
      { error: "Gagal mengatur ulang data demo." },
      { status: 500 }
    );
  }
}
