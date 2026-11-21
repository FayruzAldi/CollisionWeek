import { PrismaClient } from "@prisma/client";
import { addDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Collision Week Synthetic Data Seeding...");

  // Clean existing data
  await prisma.helpResponse.deleteMany();
  await prisma.helpRequest.deleteMany();
  await prisma.dateMoveProposal.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.weeklyMetric.deleteMany();
  await prisma.user.deleteMany();
  await prisma.program.deleteMany();

  // 1. Create Academic Program
  const semesterStartDate = new Date("2026-08-24T00:00:00.000Z"); // Fall 2026, Week 1
  const program = await prisma.program.create({
    data: {
      code: "IF-ITB",
      name: "Teknik Informatika",
      semesterStartDate,
      totalWeeks: 16,
    },
  });

  console.log(`✅ Created Program: ${program.name}`);

  // 2. Create Users (Admin, Lecturers, Students)
  const admin = await prisma.user.create({
    data: {
      programId: program.id,
      name: "Prof. Maya Arisanti",
      email: "maya@itb.ac.id",
      role: "ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
  });

  const lecturerHendra = await prisma.user.create({
    data: {
      programId: program.id,
      name: "Dr. Hendra Wijaya",
      email: "hendra@itb.ac.id",
      role: "LECTURER",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  const lecturerRina = await prisma.user.create({
    data: {
      programId: program.id,
      name: "Dr. Rina Anggraini",
      email: "rina@itb.ac.id",
      role: "LECTURER",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    },
  });

  const lecturerBudi = await prisma.user.create({
    data: {
      programId: program.id,
      name: "Dr. Budi Santoso",
      email: "budi@itb.ac.id",
      role: "LECTURER",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  });

  const lecturerSri = await prisma.user.create({
    data: {
      programId: program.id,
      name: "Dr. Sri Rahayu",
      email: "sri@itb.ac.id",
      role: "LECTURER",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    },
  });

  const lecturerFauzi = await prisma.user.create({
    data: {
      programId: program.id,
      name: "Dr. Ahmad Fauzi",
      email: "fauzi@itb.ac.id",
      role: "LECTURER",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
  });

  const lecturerCitra = await prisma.user.create({
    data: {
      programId: program.id,
      name: "Dr. Citra Lestari",
      email: "citra@itb.ac.id",
      role: "LECTURER",
      avatarUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    },
  });

  // Students
  const studentAldi = await prisma.user.create({
    data: {
      programId: program.id,
      name: "Aldiansyah Fayruz",
      email: "aldi@mahasiswa.itb.ac.id",
      role: "STUDENT",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    },
  });

  const studentKhadijah = await prisma.user.create({
    data: {
      programId: program.id,
      name: "Khadijah Passa",
      email: "khadijah@mahasiswa.itb.ac.id",
      role: "STUDENT",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
  });

  const studentKhalisha = await prisma.user.create({
    data: {
      programId: program.id,
      name: "Khalisha Kaylanasywa",
      email: "khalisha@mahasiswa.itb.ac.id",
      role: "STUDENT",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    },
  });

  const studentShiti = await prisma.user.create({
    data: {
      programId: program.id,
      name: "Shiti Azzahra",
      email: "shiti@mahasiswa.itb.ac.id",
      role: "STUDENT",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    },
  });

  const studentFarhan = await prisma.user.create({
    data: {
      programId: program.id,
      name: "Farhan Pratama",
      email: "farhan@mahasiswa.itb.ac.id",
      role: "STUDENT",
      avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    },
  });

  console.log("✅ Created Users (Admin, 6 Lecturers, 5 Students)");

  // 3. Create Courses
  const courseDb = await prisma.course.create({
    data: {
      programId: program.id,
      lecturerId: lecturerHendra.id,
      courseCode: "IF2110",
      courseName: "Sistem Basis Data",
      semesterLevel: 5,
      color: "#2563eb", // Royal blue
    },
  });

  const courseSe = await prisma.course.create({
    data: {
      programId: program.id,
      lecturerId: lecturerRina.id,
      courseCode: "IF2120",
      courseName: "Rekayasa Perangkat Lunak",
      semesterLevel: 5,
      color: "#059669", // Emerald green
    },
  });

  const courseCn = await prisma.course.create({
    data: {
      programId: program.id,
      lecturerId: lecturerBudi.id,
      courseCode: "IF2130",
      courseName: "Jaringan Komputer",
      semesterLevel: 5,
      color: "#7c3aed", // Purple
    },
  });

  const courseAlgo = await prisma.course.create({
    data: {
      programId: program.id,
      lecturerId: lecturerSri.id,
      courseCode: "IF2140",
      courseName: "Desain & Analisis Algoritma",
      semesterLevel: 5,
      color: "#d97706", // Amber
    },
  });

  const courseOs = await prisma.course.create({
    data: {
      programId: program.id,
      lecturerId: lecturerFauzi.id,
      courseCode: "IF2150",
      courseName: "Sistem Operasi",
      semesterLevel: 5,
      color: "#db2777", // Pink/Rose
    },
  });

  const courseAi = await prisma.course.create({
    data: {
      programId: program.id,
      lecturerId: lecturerCitra.id,
      courseCode: "IF2160",
      courseName: "Kecerdasan Buatan",
      semesterLevel: 5,
      color: "#0891b2", // Cyan
    },
  });

  console.log("✅ Created 6 Courses");

  // Helper to compute date from week and day offset (0 to 6)
  function getWeekDate(weekNumber, dayOffset = 3) {
    const daysToAdd = (weekNumber - 1) * 7 + dayOffset;
    return addDays(semesterStartDate, daysToAdd);
  }

  // 4. Assignments across 16 weeks
  // Let's create a realistic semester schedule with deliberate collision peaks:
  // - Week 8: 4 major assignments (IF2110, IF2120, IF2130, IF2150) -> Collision Count = 4
  // - Week 14: 3 major assignments (IF2110, IF2120, IF2160) -> Collision Count = 3
  // - Week 6: 2 major assignments (IF2130, IF2140) -> Caution (C=2)
  // - Week 10: 2 major assignments (IF2140, IF2150) -> Caution (C=2)
  // Other weeks are safe (C <= 1)

  const assignmentRawData = [
    // Week 1
    {
      courseId: courseAlgo.id,
      title: "Diagnostic Problem Set: Recurrence Relations",
      type: "QUIZ",
      weightScore: 1,
      weekNumber: 1,
      dueDate: getWeekDate(1, 4),
      subtopics: ["Master Theorem", "Substitution Method"],
    },

    // Week 2
    {
      courseId: courseDb.id,
      title: "Relational Algebra & Entity-Relationship Modeling",
      type: "LAB",
      weightScore: 2,
      weekNumber: 2,
      dueDate: getWeekDate(2, 4),
      subtopics: ["ER Diagramming", "Relational Mapping", "Cardinality Constraints"],
    },
    {
      courseId: courseOs.id,
      title: "Linux Shell & Process Inspection Lab",
      type: "LAB",
      weightScore: 2,
      weekNumber: 2,
      dueDate: getWeekDate(2, 5),
      subtopics: ["Bash Scripting", "fork() System Call", "Process Hierarchy"],
    },

    // Week 3
    {
      courseId: courseSe.id,
      title: "Agile Estimation & User Stories Breakdown",
      type: "LAB",
      weightScore: 2,
      weekNumber: 3,
      dueDate: getWeekDate(3, 3),
      subtopics: ["Scrum Sprints", "Story Points", "Acceptance Criteria"],
    },
    {
      courseId: courseCn.id,
      title: "Wireshark Packet Sniffing & HTTP/DNS Inspection",
      type: "LAB",
      weightScore: 2,
      weekNumber: 3,
      dueDate: getWeekDate(3, 5),
      subtopics: ["Wireshark Filters", "DNS Hierarchy", "HTTP 1.1 vs HTTP/2"],
    },

    // Week 4
    {
      courseId: courseAlgo.id,
      title: "Divide & Conquer Sorting Benchmark",
      type: "LAB",
      weightScore: 2,
      weekNumber: 4,
      dueDate: getWeekDate(4, 4),
      subtopics: ["MergeSort Inversions", "QuickSort Pivoting", "Asymptotic Analysis"],
    },

    // Week 5
    {
      courseId: courseAi.id,
      title: "State Space Search & Uninformed Graph Traversal",
      type: "LAB",
      weightScore: 2,
      weekNumber: 5,
      dueDate: getWeekDate(5, 3),
      subtopics: ["BFS vs DFS", "Uniform Cost Search", "State Space Formulation"],
    },
    {
      courseId: courseDb.id,
      title: "SQL Intermediate Joins & Aggregation",
      type: "LAB",
      weightScore: 2,
      weekNumber: 5,
      dueDate: getWeekDate(5, 5),
      subtopics: ["LEFT JOIN vs FULL OUTER", "GROUP BY HAVING", "Window Functions"],
    },

    // Week 6 (Caution Zone: C=2)
    {
      courseId: courseCn.id,
      title: "Reliable Data Transfer (RDT 3.0 & Go-Back-N Protocol)",
      type: "PROJECT",
      weightScore: 3, // Major
      weekNumber: 6,
      dueDate: getWeekDate(6, 4),
      subtopics: ["Sliding Window Protocol", "Cumulative ACK", "Timeout Estimation"],
    },
    {
      courseId: courseAlgo.id,
      title: "Dynamic Programming Memoization Problem Set",
      type: "PROJECT",
      weightScore: 3, // Major
      weekNumber: 6,
      dueDate: getWeekDate(6, 5),
      subtopics: ["0/1 Knapsack", "Longest Common Subsequence", "Matrix Chain Multiplication"],
    },

    // Week 7
    {
      courseId: courseOs.id,
      title: "CPU Scheduling Simulator: Round-Robin vs MLFQ",
      type: "LAB",
      weightScore: 2,
      weekNumber: 7,
      dueDate: getWeekDate(7, 4),
      subtopics: ["Turnaround Time", "Multilevel Feedback Queues", "Context Switch Overhead"],
    },

    // Week 8 (CRITICAL COLLISION WEEK! C=4, L=16)
    {
      courseId: courseDb.id,
      title: "Midterm Project: 3NF Normalization & B-Tree Indexing",
      type: "PROJECT",
      weightScore: 4, // Major
      weekNumber: 8,
      dueDate: getWeekDate(8, 2),
      subtopics: ["3NF Normalization", "BCNF Decomposition", "B-Tree Indexing", "SQL Join Optimization"],
    },
    {
      courseId: courseSe.id,
      title: "Software Requirements Specification & System Architecture",
      type: "PROJECT",
      weightScore: 4, // Major
      weekNumber: 8,
      dueDate: getWeekDate(8, 3),
      subtopics: ["Clean Architecture", "Dependency Injection", "Use Case Realization", "Domain Driven Design"],
    },
    {
      courseId: courseCn.id,
      title: "Multi-threaded Socket Programming Server",
      type: "PROJECT",
      weightScore: 4, // Major
      weekNumber: 8,
      dueDate: getWeekDate(8, 4),
      subtopics: ["TCP 3-way Handshake", "Concurrent Socket Pool", "Non-blocking I/O", "Packet Serialization"],
    },
    {
      courseId: courseOs.id,
      title: "Process Synchronization: Dining Philosophers & Deadlock",
      type: "LAB",
      weightScore: 3, // Major (weight >= 3)
      weekNumber: 8,
      dueDate: getWeekDate(8, 5),
      subtopics: ["Mutex Locks", "Semaphores", "Banker's Algorithm", "Deadlock Prevention"],
    },
    {
      courseId: courseAlgo.id,
      title: "Midterm Review Quiz",
      type: "QUIZ",
      weightScore: 1, // Minor
      weekNumber: 8,
      dueDate: getWeekDate(8, 5),
      subtopics: ["Asymptotic Notation", "Recurrence Relations"],
    },

    // Week 9
    {
      courseId: courseAi.id,
      title: "Heuristic Search: A* with Admissible Heuristics",
      type: "LAB",
      weightScore: 2,
      weekNumber: 9,
      dueDate: getWeekDate(9, 4),
      subtopics: ["Manhattan Distance", "A* Consistency", "Informed Search"],
    },

    // Week 10 (Caution Zone: C=2)
    {
      courseId: courseAlgo.id,
      title: "Graph Algorithms: Network Flow & Max Bipartite Matching",
      type: "PROJECT",
      weightScore: 4, // Major
      weekNumber: 10,
      dueDate: getWeekDate(10, 3),
      subtopics: ["Ford-Fulkerson Method", "Edmonds-Karp Algorithm", "Residual Graphs"],
    },
    {
      courseId: courseOs.id,
      title: "Virtual Memory: Page Replacement Algorithms Simulator",
      type: "PROJECT",
      weightScore: 3, // Major
      weekNumber: 10,
      dueDate: getWeekDate(10, 5),
      subtopics: ["LRU Page Replacement", "Clock Algorithm", "Thrashing", "Translation Lookaside Buffer"],
    },

    // Week 11
    {
      courseId: courseDb.id,
      title: "Transaction Concurrency & Two-Phase Locking (2PL)",
      type: "LAB",
      weightScore: 2,
      weekNumber: 11,
      dueDate: getWeekDate(11, 4),
      subtopics: ["ACID Properties", "Strict 2PL", "Serializability", "Write-Ahead Logging"],
    },

    // Week 12
    {
      courseId: courseCn.id,
      title: "Routing Protocols: Link State vs Distance Vector",
      type: "LAB",
      weightScore: 2,
      weekNumber: 12,
      dueDate: getWeekDate(12, 4),
      subtopics: ["Dijkstra SPF", "Bellman-Ford", "Count-to-Infinity Problem"],
    },
    {
      courseId: courseSe.id,
      title: "Integration Testing & CI/CD Pipeline Automation",
      type: "LAB",
      weightScore: 2,
      weekNumber: 12,
      dueDate: getWeekDate(12, 5),
      subtopics: ["Test Containers", "GitHub Actions", "Code Coverage > 80%"],
    },

    // Week 13
    {
      courseId: courseAlgo.id,
      title: "NP-Completeness Proofs & Approximation Algorithms",
      type: "LAB",
      weightScore: 2,
      weekNumber: 13,
      dueDate: getWeekDate(13, 4),
      subtopics: ["Polynomial Reduction", "3-SAT to CLIQUE", "Vertex Cover Approximation"],
    },

    // Week 14 (CRITICAL COLLISION WEEK! C=3, L=14)
    {
      courseId: courseDb.id,
      title: "Distributed Database Sharding & High-Availability Replication",
      type: "PROJECT",
      weightScore: 5, // Major
      weekNumber: 14,
      dueDate: getWeekDate(14, 2),
      subtopics: ["CAP Theorem", "Consensus Raft", "Consistent Hashing", "Read Replicas"],
    },
    {
      courseId: courseSe.id,
      title: "Microservices System Milestone & End-to-End Delivery",
      type: "PROJECT",
      weightScore: 5, // Major
      weekNumber: 14,
      dueDate: getWeekDate(14, 3),
      subtopics: ["Event-Driven Architecture", "API Gateway", "Kafka Pub/Sub", "Distributed Tracing"],
    },
    {
      courseId: courseAi.id,
      title: "Adversarial Search & Reinforcement Learning Agent",
      type: "PROJECT",
      weightScore: 4, // Major
      weekNumber: 14,
      dueDate: getWeekDate(14, 5),
      subtopics: ["Minimax with Alpha-Beta Pruning", "Q-Learning", "Reward Shaping", "Markov Decision Processes"],
    },

    // Week 15 (Safe Zone: Final Polish)
    {
      courseId: courseOs.id,
      title: "File System Implementation & Inode Table Walk",
      type: "LAB",
      weightScore: 2,
      weekNumber: 15,
      dueDate: getWeekDate(15, 3),
      subtopics: ["ext4 Inode Allocation", "Directory Entries", "Superblock Recovery"],
    },

    // Week 16 (Exams spread out)
    {
      courseId: courseAlgo.id,
      title: "Comprehensive Final Assessment",
      type: "EXAM",
      weightScore: 5, // Major
      weekNumber: 16,
      dueDate: getWeekDate(16, 4),
      subtopics: ["Complete Algorithm Syllabus", "Dynamic Programming", "Flow Networks"],
    },
  ];

  const createdAssignments = [];
  for (const raw of assignmentRawData) {
    const a = await prisma.assignment.create({
      data: {
        courseId: raw.courseId,
        title: raw.title,
        type: raw.type,
        weightScore: raw.weightScore,
        dueDate: raw.dueDate,
        weekNumber: raw.weekNumber,
        subtopics: JSON.stringify(raw.subtopics),
      },
    });
    createdAssignments.push(a);
  }

  console.log(`✅ Created ${createdAssignments.length} Assignments across 16 weeks`);

  // 5. Compute & Seed Weekly Metrics
  // We compute loadIndex and collisionCount for each week 1..16
  for (let w = 1; w <= 16; w++) {
    const weekAssignments = createdAssignments.filter((a) => a.weekNumber === w);
    const loadIndex = weekAssignments.reduce((acc, curr) => acc + curr.weightScore, 0);

    const majorCourses = new Set(
      weekAssignments
        .filter((a) => a.weightScore >= 3)
        .map((a) => a.courseId)
    );
    const collisionCount = majorCourses.size;
    const isFlagged = collisionCount >= 3;

    await prisma.weeklyMetric.create({
      data: {
        programId: program.id,
        weekNumber: w,
        loadIndex,
        collisionCount,
        isFlagged,
      },
    });
  }

  console.log("✅ Precomputed 16 Weekly Metrics (Week 8 & Week 14 marked as Collision Weeks)");

  // 6. Pre-generate Date Move Proposals for Flagged Weeks
  // Find Week 8 assignments to propose moves
  const dbWeek8Project = createdAssignments.find(
    (a) => a.courseId === courseDb.id && a.weekNumber === 8 && a.weightScore >= 3
  );

  const seWeek8Project = createdAssignments.find(
    (a) => a.courseId === courseSe.id && a.weekNumber === 8 && a.weightScore >= 3
  );

  const osWeek8Lab = createdAssignments.find(
    (a) => a.courseId === courseOs.id && a.weekNumber === 8 && a.weightScore >= 3
  );

  if (osWeek8Lab) {
    // Propose moving OS Lab from Week 8 to Week 7 (Week 7 currently has C=1, after move C=2)
    // Moving it reduces Week 8 collision count from 4 to 3!
    const proposedDue = addDays(osWeek8Lab.dueDate, -7);
    await prisma.dateMoveProposal.create({
      data: {
        assignmentId: osWeek8Lab.id,
        originalWeek: 8,
        proposedWeek: 7,
        proposedDueDate: proposedDue,
        loadReductionDelta: osWeek8Lab.weightScore,
        status: "PENDING",
      },
    });
  }

  if (dbWeek8Project) {
    // Propose moving Database Project from Week 8 to Week 9 (Week 9 currently has C=0 major assignments, C_target becomes 1)
    // Moving it reduces Week 8 collision count from 4 to 3 (or 3 to 2 if OS was also moved)!
    const proposedDue = addDays(dbWeek8Project.dueDate, 7);
    await prisma.dateMoveProposal.create({
      data: {
        assignmentId: dbWeek8Project.id,
        originalWeek: 8,
        proposedWeek: 9,
        proposedDueDate: proposedDue,
        loadReductionDelta: dbWeek8Project.weightScore,
        status: "PENDING",
      },
    });
  }

  // Week 14: Propose moving AI Project from Week 14 to Week 15 (Week 15 has C=0 major assignments)
  const aiWeek14Project = createdAssignments.find(
    (a) => a.courseId === courseAi.id && a.weekNumber === 14 && a.weightScore >= 3
  );

  if (aiWeek14Project) {
    const proposedDue = addDays(aiWeek14Project.dueDate, 7);
    await prisma.dateMoveProposal.create({
      data: {
        assignmentId: aiWeek14Project.id,
        originalWeek: 14,
        proposedWeek: 15,
        proposedDueDate: proposedDue,
        loadReductionDelta: aiWeek14Project.weightScore,
        status: "PENDING",
      },
    });
  }

  console.log("✅ Created Deterministic Date Move Proposals for Week 8 & Week 14");

  // 7. Create Help Requests & Responses (Sub-topic Peer Help)
  // Request 1: Needs Peer Help (> 14h open, cold-start highlight)
  if (dbWeek8Project) {
    const req1 = await prisma.helpRequest.create({
      data: {
        assignmentId: dbWeek8Project.id,
        requesterId: studentAldi.id,
        subtopicLabel: "3NF Normalization",
        questionDetail:
          "I'm stuck on determining if decomposing table R(A, B, C, D) with FDs {A->B, BC->D} into R1(A,B) and R2(B,C,D) preserves functional dependency BC->D without violating 3NF candidate key constraints. How do we test dependency preservation systematically?",
        status: "OPEN",
        createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000), // 14 hours ago (flags Needs Peer Help!)
      },
    });

    // Request 2: In Progress with written response
    const req2 = await prisma.helpRequest.create({
      data: {
        assignmentId: dbWeek8Project.id,
        requesterId: studentKhadijah.id,
        subtopicLabel: "B-Tree Indexing",
        questionDetail:
          "In the query optimization section, why does a composite index on (created_at, user_id) fail to utilize index seek when filtering on `WHERE user_id = 123` without created_at? Does order of index columns matter?",
        status: "IN_PROGRESS",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        firstResponseAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    });

    await prisma.helpResponse.create({
      data: {
        requestId: req2.id,
        helperId: studentFarhan.id,
        responseType: "WRITTEN",
        contentOrUrl:
          "Yes! B-Trees follow the Leftmost Prefix Rule. The index is sorted first by the first column (created_at). If you don't supply `created_at` in your WHERE clause, the database engine cannot binary-search through the B-tree nodes and will fall back to an Index Full Scan or Table Scan. If you frequently query by user_id alone, make user_id the leading column `(user_id, created_at)`!",
        isAccepted: false,
      },
    });
  }

  // Request 3: Resolved with 20-Minute Micro-Session
  const cnWeek8Project = createdAssignments.find(
    (a) => a.courseId === courseCn.id && a.weekNumber === 8
  );

  if (cnWeek8Project) {
    const req3 = await prisma.helpRequest.create({
      data: {
        assignmentId: cnWeek8Project.id,
        requesterId: studentKhalisha.id,
        subtopicLabel: "TCP 3-way Handshake",
        questionDetail:
          "How do we handle the TIME_WAIT socket state in Python/C when restarting the test server rapidly during grading? We keep getting `Address already in use` error.",
        status: "RESOLVED",
        createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000),
        firstResponseAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
      },
    });

    await prisma.helpResponse.create({
      data: {
        requestId: req3.id,
        helperId: studentAldi.id,
        responseType: "SESSION_20MIN",
        contentOrUrl:
          "We held a 20-minute Google Meet micro-session. Demonstrated adding `SO_REUSEADDR` socket flag: `sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)` which allows binding to port even in TIME_WAIT state.",
        scheduledSlot: new Date(Date.now() - 22 * 60 * 60 * 1000),
        isAccepted: true,
      },
    });
  }

  // Request 4: Software Engineering Clean Architecture
  if (seWeek8Project) {
    const req4 = await prisma.helpRequest.create({
      data: {
        assignmentId: seWeek8Project.id,
        requesterId: studentShiti.id,
        subtopicLabel: "Clean Architecture",
        questionDetail:
          "Where should database transaction management live? In the controller, use case/interactor, or repository layer? Having trouble decoupling Prisma from domain entities.",
        status: "IN_PROGRESS",
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        firstResponseAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
    });

    await prisma.helpResponse.create({
      data: {
        requestId: req4.id,
        helperId: studentKhadijah.id,
        responseType: "RECORDED_LINK",
        contentOrUrl: "https://www.loom.com/share/demo-clean-architecture-unit-of-work-pattern",
        isAccepted: false,
      },
    });
  }

  console.log("✅ Seeded Sub-topic Help Requests & 3 Response Channels (Written, Recorded Link, 20-min Session)");
  console.log("🎉 Seeding complete! Database is primed with authentic 1-semester data.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
