import { differenceInCalendarDays, addDays } from "date-fns";

export interface AssignmentMetricInput {
  id: string;
  courseId: string;
  courseCode?: string;
  title: string;
  weightScore: number;
  dueDate: Date | string;
  weekNumber: number;
}

export interface ComputedWeekMetric {
  weekNumber: number;
  loadIndex: number;
  collisionCount: number;
  isFlagged: boolean;
  totalAssignments: number;
  majorAssignmentsCount: number;
  courseIdsWithMajor: string[];
}

export interface DateMoveCandidate {
  assignmentId: string;
  assignmentTitle: string;
  courseCode: string;
  originalWeek: number;
  proposedWeek: number;
  originalDueDate: string;
  proposedDueDate: string;
  loadReductionDelta: number;
  originalCollisionCount: number;
  projectedCollisionCount: number;
  originalTargetCollisionCount: number;
  projectedTargetCollisionCount: number;
  weekDelta: number;
  reason: string;
}

/**
 * Maps a due date to academic week number (1..totalWeeks)
 * based on semesterStartDate.
 */
export function calculateWeekNumber(
  dueDate: Date | string,
  semesterStartDate: Date | string,
  totalWeeks: number = 16
): number {
  const due = new Date(dueDate);
  const start = new Date(semesterStartDate);
  const daysDiff = differenceInCalendarDays(due, start);

  if (daysDiff < 0) return 1;
  const week = Math.floor(daysDiff / 7) + 1;
  if (week > totalWeeks) return totalWeeks;
  if (week < 1) return 1;
  return week;
}

/**
 * Computes deterministic Load Index and Collision Count for all weeks.
 * C_w = |{course_id | week = w and weight_score >= 3}|
 * L_w = sum(weight_score)
 * is_flagged = (C_w >= 3)
 */
export function computeAllWeeklyMetrics(
  assignments: AssignmentMetricInput[],
  totalWeeks: number = 16
): Map<number, ComputedWeekMetric> {
  const metricsMap = new Map<number, ComputedWeekMetric>();

  // Initialize for all weeks 1..totalWeeks
  for (let w = 1; w <= totalWeeks; w++) {
    metricsMap.set(w, {
      weekNumber: w,
      loadIndex: 0,
      collisionCount: 0,
      isFlagged: false,
      totalAssignments: 0,
      majorAssignmentsCount: 0,
      courseIdsWithMajor: [],
    });
  }

  // Group assignments and calculate
  for (const a of assignments) {
    const w = a.weekNumber;
    if (w < 1 || w > totalWeeks) continue;

    const metric = metricsMap.get(w)!;
    metric.totalAssignments += 1;
    metric.loadIndex += a.weightScore;

    if (a.weightScore >= 3) {
      metric.majorAssignmentsCount += 1;
      if (!metric.courseIdsWithMajor.includes(a.courseId)) {
        metric.courseIdsWithMajor.push(a.courseId);
      }
    }
  }

  // Update collision count and flag status
  for (let w = 1; w <= totalWeeks; w++) {
    const metric = metricsMap.get(w)!;
    metric.collisionCount = metric.courseIdsWithMajor.length;
    metric.isFlagged = metric.collisionCount >= 3;
  }

  return metricsMap;
}

/**
 * Deterministic Minimal Date Move Algorithm (PRD Section 5.2):
 * Finds the minimal date shift candidates that resolve a flagged week (Cw >= 3)
 * without causing new collisions in target weeks (Cw' < 3).
 */
export function findMinimalDateMoveCandidates(
  assignments: AssignmentMetricInput[],
  targetWeekNumber: number,
  totalWeeks: number = 16
): DateMoveCandidate[] {
  const currentMetrics = computeAllWeeklyMetrics(assignments, totalWeeks);
  const targetMetric = currentMetrics.get(targetWeekNumber);

  if (!targetMetric || targetMetric.collisionCount < 3) {
    return [];
  }

  // Major assignments in the target week
  const weekMajorAssignments = assignments.filter(
    (a) => a.weekNumber === targetWeekNumber && a.weightScore >= 3
  );

  const candidates: DateMoveCandidate[] = [];

  // Preferred offset deltas: nearest neighbors first [-1, +1, +2, -2]
  const candidateDeltas = [-1, 1, 2, -2, 3, -3];

  for (const assignment of weekMajorAssignments) {
    const originalDue = new Date(assignment.dueDate);

    // Simulate moving this assignment
    for (const delta of candidateDeltas) {
      const candidateWeek = targetWeekNumber + delta;
      if (candidateWeek < 1 || candidateWeek > totalWeeks) continue;

      const candidateWeekMetric = currentMetrics.get(candidateWeek);
      if (!candidateWeekMetric) continue;

      // Check target week collision count if this assignment is added:
      // Does candidateWeek already have this course as a major assignment?
      const alreadyHasCourse = candidateWeekMetric.courseIdsWithMajor.includes(assignment.courseId);
      const projectedTargetCollisionCount = alreadyHasCourse
        ? candidateWeekMetric.collisionCount
        : candidateWeekMetric.collisionCount + 1;

      // Condition: Candidate week must NOT become a collision week (must be < 3)
      if (projectedTargetCollisionCount >= 3) {
        continue;
      }

      // Check if moving this assignment from targetWeek actually reduces targetWeek's collision count
      // Count other major assignments of this course in targetWeek
      const otherSameCourseMajorsInTargetWeek = weekMajorAssignments.filter(
        (a) => a.id !== assignment.id && a.courseId === assignment.courseId
      );

      const projectedSourceCollisionCount =
        otherSameCourseMajorsInTargetWeek.length > 0
          ? targetMetric.collisionCount
          : targetMetric.collisionCount - 1;

      // Compute proposed new due date by shifting delta weeks (delta * 7 days)
      const proposedDue = addDays(originalDue, delta * 7);

      candidates.push({
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        courseCode: assignment.courseCode || "COURSE",
        originalWeek: targetWeekNumber,
        proposedWeek: candidateWeek,
        originalDueDate: originalDue.toISOString(),
        proposedDueDate: proposedDue.toISOString(),
        loadReductionDelta: assignment.weightScore,
        originalCollisionCount: targetMetric.collisionCount,
        projectedCollisionCount: projectedSourceCollisionCount,
        originalTargetCollisionCount: candidateWeekMetric.collisionCount,
        projectedTargetCollisionCount: projectedTargetCollisionCount,
        weekDelta: Math.abs(delta),
        reason:
          projectedSourceCollisionCount < 3
            ? `Resolves Collision Week! Reduces Week ${targetWeekNumber} collisions from ${targetMetric.collisionCount} to ${projectedSourceCollisionCount}, keeping Week ${candidateWeek} safe at ${projectedTargetCollisionCount}.`
            : `Alleviates load on Week ${targetWeekNumber} (load -${assignment.weightScore}), keeping Week ${candidateWeek} safe at ${projectedTargetCollisionCount}.`,
      });
    }
  }

  // Sort candidates deterministically:
  // 1. Prioritize moves that successfully bring Week w below 3 collisions (projectedCollisionCount < 3)
  // 2. Smallest absolute week delta (|delta|)
  // 3. Lowest projected target collision count
  // 4. Higher weight score reduction
  candidates.sort((a, b) => {
    const aResolves = a.projectedCollisionCount < 3 ? 1 : 0;
    const bResolves = b.projectedCollisionCount < 3 ? 1 : 0;
    if (aResolves !== bResolves) return bResolves - aResolves;
    if (a.weekDelta !== b.weekDelta) return a.weekDelta - b.weekDelta;
    if (a.projectedTargetCollisionCount !== b.projectedTargetCollisionCount) {
      return a.projectedTargetCollisionCount - b.projectedTargetCollisionCount;
    }
    return b.loadReductionDelta - a.loadReductionDelta;
  });

  return candidates;
}
