import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeAllWeeklyMetrics, AssignmentMetricInput } from "@/lib/calculator";
import { requireCapability } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-error";

/**
 * Terapkan atau tolak usulan pergeseran tanggal.
 *
 * Otorisasi: `schedule.move` (dosen/admin). Sebelumnya route ini terbuka, jadi
 * mahasiswa bisa memindahkan tenggat seluruh kelas hanya dengan memanggil API.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireCapability("schedule.move");

    const proposalId = params.id;
    const body = await req.json();
    const action = body.action as "ACCEPT" | "REJECT";

    if (!action || !["ACCEPT", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "Action harus ACCEPT atau REJECT" },
        { status: 400 }
      );
    }

    let proposal = await prisma.dateMoveProposal.findUnique({
      where: { id: proposalId },
      include: { assignment: { include: { course: true } } },
    });

    // Kalau yang dikirim adalah kandidat yang belum tersimpan, simpan dulu.
    if (!proposal && body.candidate) {
      const candidate = body.candidate;
      const assignment = await prisma.assignment.findUnique({
        where: { id: candidate.assignmentId },
        include: { course: true },
      });
      if (!assignment) {
        return NextResponse.json({ error: "Tugas tidak ditemukan." }, { status: 404 });
      }
      proposal = await prisma.dateMoveProposal.create({
        data: {
          assignmentId: candidate.assignmentId,
          originalWeek: candidate.originalWeek,
          proposedWeek: candidate.proposedWeek,
          proposedDueDate: new Date(candidate.proposedDueDate),
          loadReductionDelta: candidate.loadReductionDelta,
          status: "PENDING",
        },
        include: { assignment: { include: { course: true } } },
      });
    }

    if (!proposal) {
      return NextResponse.json({ error: "Usulan tidak ditemukan." }, { status: 404 });
    }

    // Dosen hanya boleh mengubah jadwal tugas pada mata kuliah yang diampunya sendiri.
    // Hanya ADMIN yang dapat menggeser jadwal lintas dosen.
    if (
      user.role === "LECTURER" &&
      proposal.assignment.course.lecturerId !== user.id
    ) {
      return NextResponse.json(
        {
          error:
            "Anda hanya dapat menggeser jadwal tugas pada mata kuliah yang Anda ampu.",
        },
        { status: 403 }
      );
    }

    if (proposal.status === "ACCEPTED") {
      return NextResponse.json(
        { error: "Usulan ini sudah diterapkan sebelumnya." },
        { status: 409 }
      );
    }

    if (action === "REJECT") {
      const updatedProposal = await prisma.dateMoveProposal.update({
        where: { id: proposal.id },
        data: { status: "REJECTED" },
      });
      return NextResponse.json({
        success: true,
        proposal: updatedProposal,
        message: "Usulan pergeseran ditolak.",
      });
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id: proposal.assignmentId },
      data: {
        dueDate: proposal.proposedDueDate,
        weekNumber: proposal.proposedWeek,
      },
    });

    const updatedProposal = await prisma.dateMoveProposal.update({
      where: { id: proposal.id },
      data: { status: "ACCEPTED" },
    });

    const programId = proposal.assignment.course.programId;
    const allAssignments = await prisma.assignment.findMany({
      where: { course: { programId } },
    });

    const metricInputs: AssignmentMetricInput[] = allAssignments.map((a) => ({
      id: a.id,
      courseId: a.courseId,
      title: a.title,
      weightScore: a.weightScore,
      dueDate: a.dueDate,
      weekNumber: a.weekNumber,
    }));

    const computedMetricsMap = computeAllWeeklyMetrics(metricInputs, 16);

    for (const [weekNum, computed] of Array.from(computedMetricsMap.entries())) {
      await prisma.weeklyMetric.upsert({
        where: { programId_weekNumber: { programId, weekNumber: weekNum } },
        create: {
          programId,
          weekNumber: weekNum,
          loadIndex: computed.loadIndex,
          collisionCount: computed.collisionCount,
          isFlagged: computed.isFlagged,
        },
        update: {
          loadIndex: computed.loadIndex,
          collisionCount: computed.collisionCount,
          isFlagged: computed.isFlagged,
          computedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Pergeseran diterapkan. Tugas dipindah ke Pekan ${proposal.proposedWeek}.`,
      proposal: updatedProposal,
      assignment: updatedAssignment,
      appliedBy: { id: user.id, name: user.name, role: user.role },
    });
  } catch (error) {
    const authError = toErrorResponse(error);
    if (authError) return authError;
    console.error("Gagal memproses usulan:", error);
    return NextResponse.json(
      { error: "Gagal memproses usulan pergeseran." },
      { status: 500 }
    );
  }
}
