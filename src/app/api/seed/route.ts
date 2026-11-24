import { NextResponse } from "next/server";
import { runBenchmarkSeed } from "@/lib/seed-benchmark";

export async function POST() {
  try {
    await runBenchmarkSeed();
    return NextResponse.json({
      success: true,
      message: "Data demo resmi 16 pekan berhasil dipulihkan dari dataset benchmark synthetic data.",
    });
  } catch (error) {
    console.error("Gagal melakukan seed benchmark:", error);
    return NextResponse.json(
      { error: "Gagal mengatur ulang data benchmark." },
      { status: 500 }
    );
  }
}
