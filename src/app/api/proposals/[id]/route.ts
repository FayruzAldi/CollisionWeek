import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeAllWeeklyMetrics, AssignmentMetricInput } from "@/lib/calculator";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proposalId = params.id;
    const body = await req.json();
    const action = body.action as "ACCEPT" | "REJECT";

    if (!action || !["ACCEPT", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be ACCEPT or REJECT" },
        { status: 400 }
      );
    }

    // Check if proposal exists in database or is passed as candidate payload
    let proposal = await prisma.dateMoveProposal.findUnique({
      where: { id: proposalId },
      include: {
        assignment: {
          include: {
            course: true,
          },
        },
      },
    });

    // If proposalId is a generated candidate ID, create it in DB first
    if (!proposal && body.candidate) {
      const candidate = body.candidate;
      proposal = await prisma.dateMoveProposal.create({
        data: {
          assignmentId: candidate.assignmentId,
          originalWeek: candidate.originalWeek,
          proposedWeek: candidate.proposedWeek,
          proposedDueDate: new Date(candidate.proposedDueDate),
          loadReductionDelta: candidate.loadReductionDelta,
          status: "PENDING",
        },
        include: {
          assignment: {
            include: {
              course: true,
            },
          },
        },
      });
    }

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    if (action === "REJECT") {
      const updatedProposal = await prisma.dateMoveProposal.update({
        where: { id: proposal.id },
        data: { status: "REJECTED" },
      });
      return NextResponse.json({
        success: true,
        proposal: updatedProposal,
        message: "Proposal was rejected.",
      });
    }

    // Action is ACCEPT:
    // 1. Update the assignment's due date and week number
    const updatedAssignment = await prisma.assignment.update({
      where: { id: proposal.assignmentId },
      data: {
        dueDate: proposal.proposedDueDate,
        weekNumber: proposal.proposedWeek,
      },
    });

    // 2. Mark proposal as ACCEPTED
    const updatedProposal = await prisma.dateMoveProposal.update({
      where: { id: proposal.id },
      data: { status: "ACCEPTED" },
    });

    // 3. Recalculate all weekly metrics in DB
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
        where: {
          programId_weekNumber: {
            programId,
            weekNumber: weekNum,
          },
        },
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
      message: `Date shift approved! Moved assignment to Week ${proposal.proposedWeek}. Weekly metrics recalculated.`,
      proposal: updatedProposal,
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json(
      { error: "Failed to process date move proposal" },
      { status: 500 }
    );
  }
}
