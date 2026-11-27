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
  await prisma.studentShiftRequest.deleteMany();
  await prisma.dateMoveProposal.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.weeklyMetric.deleteMany();
  await prisma.user.deleteMany();
  await prisma.program.deleteMany();

  // 2. Create Multi-Major Academic Programs (Lintas Jurusan, 22 Feb 2027 - 11 Jun 2027)
  const semesterStartDate = new Date("2027-02-22T00:00:00.000Z");
  const programDefs = [
    { code: "IF-2027", name: "Teknik Informatika" },
    { code: "SI-2027", name: "Sistem Informasi" },
    { code: "TE-2027", name: "Teknik Elektro" },
    { code: "TI-2027", name: "Teknik Industri" },
    { code: "MN-2027", name: "Manajemen" },
    { code: "AK-2027", name: "Akuntansi" },
  ];
  const programsByCode = new Map<string, any>();
  for (const def of programDefs) {
    const p = await prisma.program.create({
      data: {
        code: def.code,
        name: def.name,
        semesterStartDate,
        totalWeeks: 16,
      },
    });
    programsByCode.set(def.code, p);
  }
  const program = programsByCode.get("IF-2027")!;

  const buildAvatarUrl = (name: string, role: "ADMIN" | "LECTURER" | "STUDENT") => {
    const bg =
      role === "ADMIN"
        ? "c0aede"
        : role === "LECTURER"
        ? "b6e3f4,d1d4f9"
        : "b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf";
    return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=${bg}`;
  };

  // 3. Create Admin (Kaprodi / Akademik Pusat)
  await prisma.user.create({
    data: {
      programId: program.id,
      name: "Prof. Maya Arisanti",
      email: "maya.arisanti@umk.ac.id",
      role: "ADMIN",
      avatarUrl: buildAvatarUrl("Prof. Maya Arisanti", "ADMIN"),
    },
  });

  // 4. Create Lecturers for IF-2027 (matching courses.csv) + dedicated lecturers for other jurusan
  const lecturerMap = new Map();
  const programList = Array.from(programsByCode.values());
  for (let i = 0; i < lecturersData.length; i++) {
    const l = lecturersData[i];
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

  const extraLecturersByProdi = new Map<string, any>();
  const extraLecturerDefs = [
    { code: "SI-2027", name: "Dr. Rina Kusuma", email: "rina.kusuma@umk.ac.id" },
    { code: "TE-2027", name: "Ir. Andi Pratama, M.T.", email: "andi.pratama@umk.ac.id" },
    { code: "TI-2027", name: "Dr. Dewi Kartika", email: "dewi.kartika@umk.ac.id" },
    { code: "MN-2027", name: "Dr. Hendra Wijaya, M.B.A.", email: "hendra.wijaya@umk.ac.id" },
    { code: "AK-2027", name: "Dr. Ratna Sari, M.Ak.", email: "ratna.sari@umk.ac.id" },
  ];
  for (const el of extraLecturerDefs) {
    const p = programsByCode.get(el.code);
    if (!p) continue;
    const u = await prisma.user.create({
      data: {
        programId: p.id,
        name: el.name,
        email: el.email,
        role: "LECTURER",
        avatarUrl: buildAvatarUrl(el.name, "LECTURER"),
      },
    });
    extraLecturersByProdi.set(el.code, u);
  }

  // 5. Create Students (40 students distributed across 6 jurusan, UMK student emails)
  const studentMap = new Map();
  const studentsByProdi = new Map<string, any[]>();
  const usedStudentEmails = new Set<string>();
  for (let i = 0; i < studentsData.length; i++) {
    const s = studentsData[i];
    const assignedProgram =
      i < 10
        ? programsByCode.get("IF-2027")!
        : programList[(i - 10) % programList.length];
    const baseSlug = s.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.+|\.+$/g, "");
    let studentEmail = `${baseSlug}@std.umk.ac.id`;
    if (usedStudentEmails.has(studentEmail)) {
      studentEmail = `${baseSlug}.${s.student_id.toLowerCase()}@std.umk.ac.id`;
    }
    usedStudentEmails.add(studentEmail);

    const user = await prisma.user.create({
      data: {
        programId: assignedProgram.id,
        name: s.name,
        email: studentEmail,
        role: "STUDENT",
        avatarUrl: buildAvatarUrl(s.name, "STUDENT"),
      },
    });
    studentMap.set(s.student_id, user);
    const arr = studentsByProdi.get(assignedProgram.code) || [];
    arr.push(user);
    studentsByProdi.set(assignedProgram.code, arr);
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

  // 8. Compute and Save Weekly Metrics for IF-2027
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

  // 8b. Seed courses, assignments & weekly metrics for lintas jurusan (SI, TE, TI, MN, AK)
  const allLecturers = Array.from(lecturerMap.values());
  const extraProdiCourses: Record<
    string,
    { code: string; name: string; color: string; tasks: { title: string; week: number; weight: number; subtopics: string[] }[] }[]
  > = {
    "SI-2027": [
      { code: "SI201", name: "Analisis & Desain Sistem", color: "#4F46E5", tasks: [{ title: "Dokumen SRS Sistem Kampus", week: 6, weight: 4, subtopics: ["Use Case", "ERD"] }, { title: "Prototipe Dashboard Bisnis", week: 10, weight: 4, subtopics: ["Wireframe", "API Integration"] }] },
      { code: "SI202", name: "Manajemen Basis Data Enterprise", color: "#0284C7", tasks: [{ title: "Normalisasi & Query Tuning", week: 10, weight: 3, subtopics: ["Indexing", "3NF"] }] },
      { code: "SI203", name: "Tata Kelola TI", color: "#059669", tasks: [{ title: "Audit COBIT 2019", week: 10, weight: 4, subtopics: ["Risk Matrix", "Compliance"] }, { title: "Laporan Evaluasi Akhir", week: 14, weight: 4, subtopics: ["Governance"] }] },
    ],
    "TE-2027": [
      { code: "TE201", name: "Rangkaian Listrik II", color: "#DC2626", tasks: [{ title: "Simulasi Rangkaian AC", week: 6, weight: 4, subtopics: ["Impedansi", "Phasor"] }, { title: "Proyek Filter Aktif", week: 10, weight: 4, subtopics: ["Op-Amp", "Bode Plot"] }] },
      { code: "TE202", name: "Sistem Mikroprosesor", color: "#D97706", tasks: [{ title: "Kontrol Sensor IoT", week: 10, weight: 4, subtopics: ["UART", "PWM"] }] },
      { code: "TE203", name: "Pengolahan Sinyal Digital", color: "#7C3AED", tasks: [{ title: "Implementasi FFT", week: 10, weight: 3, subtopics: ["Discrete Fourier", "Windowing"] }] },
    ],
    "TI-2027": [
      { code: "TI201", name: "Penelitian Operasional", color: "#0D9488", tasks: [{ title: "Optimasi Rantai Pasok", week: 10, weight: 4, subtopics: ["Linear Programming", "Simplex"] }] },
      { code: "TI202", name: "Ergonomi & Perancangan Kerja", color: "#EA580C", tasks: [{ title: "Analisis Postur REBA/RULA", week: 10, weight: 3, subtopics: ["Antropometri", "Workstation"] }] },
      { code: "TI203", name: "Sistem Produksi Lean", color: "#4F46E5", tasks: [{ title: "Value Stream Mapping", week: 10, weight: 4, subtopics: ["Kaizen", "Kanban"] }, { title: "Simulasi Lini Perakitan", week: 14, weight: 4, subtopics: ["Bottleneck"] }] },
    ],
    "MN-2027": [
      { code: "MN201", name: "Manajemen Pemasaran Strategis", color: "#7C3AED", tasks: [{ title: "Riset Pasar & Segmentasi", week: 6, weight: 3, subtopics: ["STP", "Survey"] }, { title: "Rencana Kampanye Produk", week: 10, weight: 4, subtopics: ["Brand Positioning", "ROI"] }] },
      { code: "MN202", name: "Manajemen Keuangan Korporat", color: "#0284C7", tasks: [{ title: "Valuasi Arus Kas DCF", week: 10, weight: 4, subtopics: ["NPV", "IRR", "WACC"] }] },
      { code: "MN203", name: "Perilaku Organisasi", color: "#059669", tasks: [{ title: "Studi Kasus Kepemimpinan", week: 10, weight: 3, subtopics: ["Motivasi Tim", "Budaya Kerja"] }] },
    ],
    "AK-2027": [
      { code: "AK201", name: "Akuntansi Keuangan Menengah", color: "#D97706", tasks: [{ title: "Penyusunan Laporan Laba Rugi", week: 6, weight: 4, subtopics: ["PSAK", "Aset Tetap"] }, { title: "Rekonsiliasi & Arus Kas", week: 10, weight: 4, subtopics: ["Cash Flow", "Jurnal Penyesuaian"] }] },
      { code: "AK202", name: "Audit & Asurans", color: "#DC2626", tasks: [{ title: "Kertas Kerja Pemeriksaan", week: 10, weight: 4, subtopics: ["Sampling Audit", "Materialitas"] }] },
      { code: "AK203", name: "Perpajakan Lanjutan", color: "#0D9488", tasks: [{ title: "Simulasi SPT Badan", week: 10, weight: 3, subtopics: ["PPh Badan", "Korek Fiskal"] }] },
    ],
  };

  for (const [prodiCode, courseDefs] of Object.entries(extraProdiCourses)) {
    const prodi = programsByCode.get(prodiCode);
    if (!prodi) continue;
    const prodiInputs: any[] = [];

    for (let cIdx = 0; cIdx < courseDefs.length; cIdx++) {
      const cd = courseDefs[cIdx];
      const lec =
        extraLecturersByProdi.get(prodiCode) ||
        allLecturers[(cIdx + prodiCode.charCodeAt(0)) % allLecturers.length];
      const createdCourse = await prisma.course.create({
        data: {
          programId: prodi.id,
          lecturerId: lec.id,
          courseCode: cd.code,
          courseName: cd.name,
          semesterLevel: 4,
          color: cd.color,
        },
      });

      const prodiStudents = studentsByProdi.get(prodiCode) || [];
      const reqStudent = prodiStudents[cIdx % prodiStudents.length];
      const helperStudent = prodiStudents[(cIdx + 1) % prodiStudents.length];

      for (const t of cd.tasks) {
        const dueDate = addDays(semesterStartDate, (t.week - 1) * 7 + 4);
        const createdA = await prisma.assignment.create({
          data: {
            courseId: createdCourse.id,
            title: t.title,
            type: t.weight >= 4 ? "PROJECT" : "LAB",
            weightScore: t.weight,
            dueDate,
            weekNumber: t.week,
            subtopics: JSON.stringify(t.subtopics),
          },
        });
        prodiInputs.push({
          id: createdA.id,
          courseId: createdCourse.id,
          courseCode: cd.code,
          title: t.title,
          weightScore: t.weight,
          dueDate,
          weekNumber: t.week,
        });

        // Seed 1 help request + video/written response per course's main task
        if (reqStudent && helperStudent && t.week === 10) {
          const sub = t.subtopics[0] || cd.name;
          const hr = await prisma.helpRequest.create({
            data: {
              assignmentId: createdA.id,
              requesterId: reqStudent.id,
              subtopicLabel: sub,
              questionDetail: `Mohon bantuan untuk materi "${sub}" pada mata kuliah ${cd.name}. Apakah ada referensi atau video penjelasannya?`,
              status: "IN_PROGRESS",
              firstResponseAt: new Date(),
            },
          });
          await prisma.helpResponse.create({
            data: {
              requestId: hr.id,
              helperId: helperStudent.id,
              responseType: "RECORDED_LINK",
              contentOrUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(sub + " " + cd.name)}\nCatatan: Rangkuman video pembahasan "${sub}" untuk tugas ${t.title}.`,
            },
          });
        }
      }
    }

    const prodiMetrics = computeAllWeeklyMetrics(prodiInputs, 16);
    for (let w = 1; w <= 16; w++) {
      const pm = prodiMetrics.get(w);
      await prisma.weeklyMetric.create({
        data: {
          programId: prodi.id,
          weekNumber: w,
          loadIndex: pm.loadIndex,
          collisionCount: pm.collisionCount,
          isFlagged: pm.isFlagged,
        },
      });
    }
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
      let contentOrUrl = `Halo ${requester.name}, berikut panduan langkah demi langkah untuk "${hr.sub_topic}":\n1. Pahami konsep dasar & batasan masalah pada modul kuliah.\n2. Uji dengan kasus uji kecil sebelum digabung ke proyek utama.\nReferensi catatan: https://docs.python.org/3/tutorial/`;

      if (hr.reply_type.toLowerCase() === "session") {
        replyType = "SESSION_20MIN";
        contentOrUrl = `Usulan sesi 20 menit via Google Meet untuk membahas materi ${hr.sub_topic} bersama.\nTautan Meet: https://meet.google.com/new\nJadwal fleksibel: malam ini pukul 19.30 WIB.`;
      } else if (hr.reply_type.toLowerCase() === "recorded") {
        replyType = "RECORDED_LINK";
        contentOrUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(hr.sub_topic + " tutorial")}\nCatatan: Video penjelasan konsep & contoh implementasi "${hr.sub_topic}" berdurasi ~8 menit.`;
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

  // 11. Seed Student Shift Requests & Reasons (agar dosen langsung melihat aspirasi mahasiswa)
  const w10Assignments = metricInputAssignments.filter(
    (a) => a.weekNumber === 10 && a.weightScore >= 3
  );
  const w14Assignments = metricInputAssignments.filter(
    (a) => a.weekNumber === 14 && a.weightScore >= 4
  );
  const ifStudents = studentsByProdi.get("IF-2027") || [];
  const sampleShiftReasons = [
    "Di Pekan 10 ada 4 tenggat proyek besar bersamaan sehingga waktu integrasi dan pengujian sangat sempit.",
    "Kami perlu tambahan 1 pekan untuk menyelesaikan konfigurasi subnetting & simulasi topologi jaringan.",
    "Bentrok dengan evaluasi proyek Algoritma dan Prototipe HCI di pekan yang sama, mohon kelonggaran ke pekan berikutnya.",
    "Pekan 14 menumpuk 5 proyek akhir lintas matkul sebelum UAS; menggeser satu tugas ke Pekan 15 sangat membantu kualitas hasil.",
  ];
  for (let i = 0; i < Math.min(3, w10Assignments.length); i++) {
    const a = w10Assignments[i];
    const stu = ifStudents[i % ifStudents.length];
    if (!stu) continue;
    await prisma.studentShiftRequest.create({
      data: {
        assignmentId: a.id,
        studentId: stu.id,
        originalWeek: 10,
        proposedWeek: 11,
        reason: sampleShiftReasons[i % sampleShiftReasons.length],
        status: "PENDING",
      },
    });
  }
  if (w14Assignments[0] && ifStudents[3]) {
    await prisma.studentShiftRequest.create({
      data: {
        assignmentId: w14Assignments[0].id,
        studentId: ifStudents[3].id,
        originalWeek: 14,
        proposedWeek: 15,
        reason: sampleShiftReasons[3],
        status: "PENDING",
      },
    });
  }

  return { success: true };
}
