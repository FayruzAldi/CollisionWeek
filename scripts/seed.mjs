import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { fileURLToPath } from "url";
import { differenceInCalendarDays, addDays } from "date-fns";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const COURSE_COLORS = {
  IF101: "#4F46E5", // Indigo
  IF102: "#0284C7", // Sky
  IF103: "#059669", // Emerald
  IF104: "#D97706", // Amber
  IF105: "#DC2626", // Red
  IF106: "#7C3AED", // Purple
  GE101: "#0D9488", // Teal
  GE102: "#EA580C", // Orange
};

function calculateWeekNumber(dueDate, semesterStartDate, totalWeeks = 16) {
  const due = new Date(dueDate);
  const start = new Date(semesterStartDate);
  const daysDiff = differenceInCalendarDays(due, start);

  if (daysDiff < 0) return 1;
  const week = Math.floor(daysDiff / 7) + 1;
  if (week > totalWeeks) return totalWeeks;
  if (week < 1) return 1;
  return week;
}

function computeAllWeeklyMetrics(assignments, totalWeeks = 16) {
  const metricsMap = new Map();

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

function findMinimalDateMoveCandidates(assignments, targetWeekNumber, totalWeeks = 16) {
  const currentMetrics = computeAllWeeklyMetrics(assignments, totalWeeks);
  const targetMetric = currentMetrics.get(targetWeekNumber);

  if (!targetMetric || targetMetric.collisionCount < 3) {
    return [];
  }

  const weekMajorAssignments = assignments.filter(
    (a) => a.weekNumber === targetWeekNumber && a.weightScore >= 3
  );

  const candidates = [];
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

function readCsv(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  return Papa.parse(content.trim(), {
    header: true,
    skipEmptyLines: true,
  }).data;
}

export async function runSeed() {
  console.log("🌱 Starting Collision Week Official Benchmark Seeding...");

  const dataDir = path.join(__dirname, "..", "data", "synthetic_data");

  // Read CSV files
  const lecturersData = readCsv(path.join(dataDir, "lecturers.csv"));
  const coursesData = readCsv(path.join(dataDir, "courses.csv"));
  const studentsData = readCsv(path.join(dataDir, "students.csv"));
  const assignmentsData = readCsv(path.join(dataDir, "assignments.csv"));
  const helpRequestsData = readCsv(path.join(dataDir, "help_requests.csv"));
  const expectedMetricsData = readCsv(path.join(dataDir, "weekly_metrics_expected.csv"));

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
  console.log(`✅ Created Program: ${program.name} (Semester Mulai: 2027-02-22)`);

  const buildAvatarUrl = (name, role) => {
    const bg =
      role === "ADMIN"
        ? "c0aede"
        : role === "LECTURER"
        ? "b6e3f4,d1d4f9"
        : "b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf";
    return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=${bg}`;
  };

  // 3. Create Admin
  await prisma.user.create({
    data: {
      programId: program.id,
      name: "Prof. Maya Arisanti",
      email: "maya.arisanti@umk.ac.id",
      role: "ADMIN",
      avatarUrl: buildAvatarUrl("Prof. Maya Arisanti", "ADMIN"),
    },
  });

  // 4. Create Lecturers
  const lecturerMap = new Map();
  for (const l of lecturersData) {
    const cleanSlug = l.name
      .toLowerCase()
      .replace(/^(dr\.|prof\.|ir\.)\s*/g, "")
      .replace(/,.*$/g, "")
      .trim()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.+|\.+$/g, "");
    const user = await prisma.user.create({
      data: {
        programId: program.id,
        name: l.name,
        email: `${cleanSlug || l.lecturer_id.toLowerCase()}@umk.ac.id`,
        role: "LECTURER",
        avatarUrl: buildAvatarUrl(l.name, "LECTURER"),
      },
    });
    lecturerMap.set(l.lecturer_id, user);
  }
  console.log(`✅ Created ${lecturerMap.size} Official Lecturers`);

  // 5. Create Students (40 students S01..S40)
  const studentMap = new Map();
  for (const s of studentsData) {
    const baseSlug = s.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.+|\.+$/g, "");
    const user = await prisma.user.create({
      data: {
        programId: program.id,
        name: s.name,
        email: `${baseSlug}@std.umk.ac.id`,
        role: "STUDENT",
        avatarUrl: buildAvatarUrl(s.name, "STUDENT"),
      },
    });
    studentMap.set(s.student_id, user);
  }
  console.log(`✅ Created ${studentMap.size} Students (S01 - S40)`);

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
  console.log(`✅ Created ${courseMap.size} Courses (IF101 - IF106, GE101, GE102)`);

  // 7. Create Assignments (28 assignments)
  const assignmentMap = new Map();
  const metricInputAssignments = [];

  for (const a of assignmentsData) {
    const course = courseMap.get(a.course_code);
    if (!course) continue;

    const dueDate = new Date(`${a.due_date}T23:59:59.000Z`);
    const weekNumber = calculateWeekNumber(dueDate, semesterStartDate, 16);
    const weightScore = parseInt(a.weight, 10) || 3;
    const subtopics = a.sub_topics ? a.sub_topics.split(";").map((t) => t.trim()) : [];

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
  console.log(`✅ Created ${assignmentMap.size} Assignments across 16 weeks`);

  // 8. Compute and Save Weekly Metrics
  const computedMetrics = computeAllWeeklyMetrics(metricInputAssignments, 16);

  console.log("\n📊 Verifikasi Ground Truth (computed vs expected):");
  for (let w = 1; w <= 16; w++) {
    const m = computedMetrics.get(w);
    const exp = expectedMetricsData.find((x) => parseInt(x.week, 10) === w);
    const expLoad = exp ? parseInt(exp.load_index, 10) : 0;
    const expColl = exp ? parseInt(exp.collision_count, 10) : 0;
    const expFlag = exp ? exp.flagged.toLowerCase() === "true" : false;

    const match = m.loadIndex === expLoad && m.collisionCount === expColl && m.isFlagged === expFlag;
    console.log(
      `Pekan ${String(w).padStart(2)}: Beban=${String(m.loadIndex).padStart(2)} (exp ${String(expLoad).padStart(2)}) | Tabrakan=${m.collisionCount} (exp ${expColl}) | Kritis=${m.isFlagged} ${match ? "✓ MATCH" : "✗ MISMATCH"}`
    );

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
  let proposalCount = 0;

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
      proposalCount++;
    }
  }
  console.log(`✅ Generated ${proposalCount} Minimal Date Move proposals for Weeks 6, 10, and 14`);

  // 10. Seed Help Requests & Responses (from help_requests.csv)
  let requestCount = 0;
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
    requestCount++;

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
  console.log(`✅ Seeded ${requestCount} Official Help Requests & Responses`);

  console.log("\n🎉 Seeding benchmark selesai! Database telah dimuat dengan data resmi kompetisi.");
}

if (process.argv[1] && process.argv[1].endsWith("seed.mjs")) {
  runSeed()
    .catch((e) => {
      console.error("❌ Error during seeding:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
