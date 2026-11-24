import { prisma } from "./db";
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { differenceInCalendarDays, addDays } from "date-fns";

const COURSE_COLORS: Record<string, string> = {
  IF101: "#4F46E5", // Indigo
  IF102: "#0284C7", // Sky
  IF103: "#059669", // Emerald
  IF104: "#D97706", // Amber
  IF105: "#DC2626", // Red
  IF106: "#7C3AED", // Purple
  GE101: "#0D9488", // Teal
  GE102: "#EA580C", // Orange
};

function calculateWeekNumber(dueDate: Date, semesterStartDate: Date, totalWeeks = 16): number {
  const due = new Date(dueDate);
  const start = new Date(semesterStartDate);
  const daysDiff = differenceInCalendarDays(due, start);

  if (daysDiff < 0) return 1;
  const week = Math.floor(daysDiff / 7) + 1;
  if (week > totalWeeks) return totalWeeks;
  if (week < 1) return 1;
  return week;
}

function computeAllWeeklyMetrics(assignments: any[], totalWeeks = 16) {
  const metricsMap = new Map();

  for (let w = 1; w <= totalWeeks; w++) {
    metricsMap.set(w, {
      weekNumber: w,
      loadIndex: 0,
      collisionCount: 0,
      isFlagged: false,
      totalAssignments: 0,
      majorAssignmentsCount: 0,
      courseIdsWithMajor: [] as string[],
    });
  }

  for (const a of assignments) {
    const w = a.weekNumber;
    if (w < 1 || w > totalWeeks) continue;

    const metric = metricsMap.get(w);
    metric.totalAssignments += 1;
    metric.loadIndex += a.weightScore;

    if (a.weightScore >= 3) {
      metric.majorAssignmentsCount += 1;
      if (!metric.courseIdsWithMajor.includes(a.courseId)) {
        metric.courseIdsWithMajor.push(a.courseId);
      }
    }
  }

  for (let w = 1; w <= totalWeeks; w++) {
    const metric = metricsMap.get(w);
    metric.collisionCount = metric.courseIdsWithMajor.length;
    metric.isFlagged = metric.collisionCount >= 3;
  }

  return metricsMap;
}

function findMinimalDateMoveCandidates(assignments: any[], targetWeekNumber: number, totalWeeks = 16) {
  const currentMetrics = computeAllWeeklyMetrics(assignments, totalWeeks);
  const targetMetric = currentMetrics.get(targetWeekNumber);

  if (!targetMetric || targetMetric.collisionCount < 3) {
    return [];
  }

  const weekMajorAssignments = assignments.filter(
    (a) => a.weekNumber === targetWeekNumber && a.weightScore >= 3
  );

  const candidates: any[] = [];
  const candidateDeltas = [-1, 1, 2, -2, 3, -3];

  for (const assignment of weekMajorAssignments) {
    const originalDue = new Date(assignment.dueDate);

    for (const delta of candidateDeltas) {
      const candidateWeek = targetWeekNumber + delta;
      if (candidateWeek < 1 || candidateWeek > totalWeeks) continue;

      const candidateWeekMetric = currentMetrics.get(candidateWeek);
      if (!candidateWeekMetric) continue;

      const alreadyHasCourse = candidateWeekMetric.courseIdsWithMajor.includes(assignment.courseId);
      const projectedTargetCollisionCount = alreadyHasCourse
        ? candidateWeekMetric.collisionCount
        : candidateWeekMetric.collisionCount + 1;

      if (projectedTargetCollisionCount >= 3) continue;

      const otherSameCourseMajorsInTargetWeek = weekMajorAssignments.filter(
        (a) => a.id !== assignment.id && a.courseId === assignment.courseId
      );

      const projectedSourceCollisionCount =
        otherSameCourseMajorsInTargetWeek.length > 0
          ? targetMetric.collisionCount
          : targetMetric.collisionCount - 1;

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
            ? `Menyelesaikan Pekan Bertabrakan! Menurunkan tabrakan Pekan ${targetWeekNumber} dari ${targetMetric.collisionCount} ke ${projectedSourceCollisionCount}.`
            : `Meringankan beban Pekan ${targetWeekNumber} (-${assignment.weightScore} poin).`,
      });
    }
  }

  return candidates.sort((a, b) => {
    if (a.projectedCollisionCount < 3 && b.projectedCollisionCount >= 3) return -1;
    if (a.projectedCollisionCount >= 3 && b.projectedCollisionCount < 3) return 1;
    if (a.weekDelta !== b.weekDelta) return a.weekDelta - b.weekDelta;
    return b.loadReductionDelta - a.loadReductionDelta;
  });
}

function readCsv(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  return Papa.parse<Record<string, string>>(content.trim(), {
    header: true,
    skipEmptyLines: true,
  }).data;
}

export async function runBenchmarkSeed() {
  const dataDir = path.join(process.cwd(), "data", "synthetic_data");

  const lecturersData = readCsv(path.join(dataDir, "lecturers.csv"));
  const coursesData = readCsv(path.join(dataDir, "courses.csv"));
  const studentsData = readCsv(path.join(dataDir, "students.csv"));
  const assignmentsData = readCsv(path.join(dataDir, "assignments.csv"));
  const helpRequestsData = readCsv(path.join(dataDir, "help_requests.csv"));

  // 1. Clean existing records
  await prisma.helpResponse.deleteMany();
  await prisma.helpRequest.deleteMany();
  await prisma.dateMoveProposal.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.weeklyMetric.deleteMany();
  await prisma.user.deleteMany();
  await prisma.program.deleteMany();

  // 2. Create Academic Program (22 Feb 2027 - 11 Jun 2027)
  const semesterStartDate = new Date("2027-02-22T00:00:00.000Z");
  const program = await prisma.program.create({
    data: {
      code: "IF-2027",
      name: "Teknik Informatika",
      semesterStartDate,
      totalWeeks: 16,
    },
  });

  // 3. Create Admin
  await prisma.user.create({
    data: {
      programId: program.id,
      name: "Prof. Maya Arisanti",
      email: "maya.arisanti@itb.ac.id",
      role: "ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 4. Create Lecturers
  const lecturerMap = new Map();
  for (const l of lecturersData) {
    const emailPrefix = l.name.toLowerCase().replace(/[^a-z]/g, "");
    const user = await prisma.user.create({
      data: {
        programId: program.id,
        name: l.name,
        email: `${emailPrefix || l.lecturer_id.toLowerCase()}@itb.ac.id`,
        role: "LECTURER",
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(l.name)}`,
      },
    });
    lecturerMap.set(l.lecturer_id, user);
  }

  // 5. Create Students (40 students S01..S40)
  const studentMap = new Map();
  for (const s of studentsData) {
    const user = await prisma.user.create({
      data: {
        programId: program.id,
        name: s.name,
        email: `${s.student_id.toLowerCase()}@mahasiswa.itb.ac.id`,
        role: "STUDENT",
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(s.name)}`,
      },
    });
    studentMap.set(s.student_id, user);
  }

  // 6. Create Courses (8 Courses)
  const courseMap = new Map();
  for (const c of coursesData) {
    const lecturer = lecturerMap.get(c.lecturer_id) || Array.from(lecturerMap.values())[0];
    const course = await prisma.course.create({
      data: {
        programId: program.id,
        lecturerId: lecturer.id,
        courseCode: c.course_code,
        courseName: c.course_name,
        semesterLevel: 4,
        color: COURSE_COLORS[c.course_code] || "#4F46E5",
      },
    });
    courseMap.set(c.course_code, course);
  }

  // 7. Create Assignments (28 assignments)
  const assignmentMap = new Map();
  const metricInputAssignments: any[] = [];

  for (const a of assignmentsData) {
    const course = courseMap.get(a.course_code);
    if (!course) continue;

    const dueDate = new Date(`${a.due_date}T23:59:59.000Z`);
    const weekNumber = calculateWeekNumber(dueDate, semesterStartDate, 16);
    const weightScore = parseInt(a.weight, 10) || 3;
    const subtopics = a.sub_topics ? a.sub_topics.split(";").map((t: string) => t.trim()) : [];

    let type = "PROJECT";
    const lowerTitle = a.assignment_title.toLowerCase();
    if (lowerTitle.includes("quiz")) type = "QUIZ";
    else if (lowerTitle.includes("lab") || lowerTitle.includes("problem set") || lowerTitle.includes("task")) type = "LAB";
    else if (lowerTitle.includes("final") || lowerTitle.includes("exam")) type = "EXAM";

    const createdAssignment = await prisma.assignment.create({
      data: {
        courseId: course.id,
        title: a.assignment_title,
        type,
        weightScore,
        dueDate,
        weekNumber,
        subtopics: JSON.stringify(subtopics),
      },
    });

    assignmentMap.set(a.assignment_id, createdAssignment);

    metricInputAssignments.push({
      id: createdAssignment.id,
      courseId: course.id,
      courseCode: course.courseCode,
      title: createdAssignment.title,
      weightScore,
      dueDate,
      weekNumber,
    });
  }

  // 8. Compute and Save Weekly Metrics
  const computedMetrics = computeAllWeeklyMetrics(metricInputAssignments, 16);

  for (let w = 1; w <= 16; w++) {
    const m = computedMetrics.get(w);
    await prisma.weeklyMetric.create({
      data: {
        programId: program.id,
        weekNumber: w,
        loadIndex: m.loadIndex,
        collisionCount: m.collisionCount,
        isFlagged: m.isFlagged,
      },
    });
  }

  // 9. Generate Deterministic Date Move Proposals for Flagged Weeks
  const flaggedWeeks = [6, 10, 14];
  for (const fw of flaggedWeeks) {
    const candidates = findMinimalDateMoveCandidates(metricInputAssignments, fw, 16);
    for (const c of candidates) {
      await prisma.dateMoveProposal.create({
        data: {
          assignmentId: c.assignmentId,
          originalWeek: c.originalWeek,
          proposedWeek: c.proposedWeek,
          proposedDueDate: new Date(c.proposedDueDate),
          loadReductionDelta: c.loadReductionDelta,
          status: "PENDING",
        },
      });
    }
  }

  // 10. Seed Help Requests & Responses (from help_requests.csv)
  for (const hr of helpRequestsData) {
    const assignment = assignmentMap.get(hr.assignment_id);
    const requester = studentMap.get(hr.requester_id);
    if (!assignment || !requester) continue;

    const isResolved = hr.status.toLowerCase() === "resolved";
    const requestDate = new Date(`${hr.request_date}T09:00:00.000Z`);
    const hoursToFirst = hr.hours_to_first_response ? parseFloat(hr.hours_to_first_response) : null;
    const firstResponseAt = hoursToFirst
      ? new Date(requestDate.getTime() + hoursToFirst * 3600 * 1000)
      : null;
    const resolvedAt = isResolved && firstResponseAt
      ? new Date(firstResponseAt.getTime() + 2 * 3600 * 1000)
      : null;

    const request = await prisma.helpRequest.create({
      data: {
        assignmentId: assignment.id,
        requesterId: requester.id,
        subtopicLabel: hr.sub_topic,
        questionDetail: `Mohon bantuan untuk sub-topik "${hr.sub_topic}". Saya mengalami kendala saat mengerjakan bagian ini.`,
        status: isResolved ? "RESOLVED" : "OPEN",
        createdAt: requestDate,
        firstResponseAt,
        resolvedAt,
      },
    });

    if (hr.helper_id && studentMap.has(hr.helper_id)) {
      const helper = studentMap.get(hr.helper_id);
      let replyType = "WRITTEN";
      let contentOrUrl = `Halo ${requester.name}, berikut adalah solusi dan panduan untuk ${hr.sub_topic}. Semoga membantu!`;

      if (hr.reply_type.toLowerCase() === "session") {
        replyType = "SESSION_20MIN";
        contentOrUrl = `Usulan sesi 20 menit via Google Meet untuk membahas materi ${hr.sub_topic} bersama.`;
      } else if (hr.reply_type.toLowerCase() === "recorded") {
        replyType = "RECORDED_LINK";
        contentOrUrl = "https://loom.com/share/demo-tutorial-subtopic\nCatatan: Penjelasan langkah penyelesaian 5 menit.";
      }

      await prisma.helpResponse.create({
        data: {
          requestId: request.id,
          helperId: helper.id,
          responseType: replyType,
          contentOrUrl,
          createdAt: firstResponseAt || requestDate,
          isAccepted: isResolved,
        },
      });
    }
  }

  return { success: true };
}
