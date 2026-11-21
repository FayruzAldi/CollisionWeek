import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { addDays } from "date-fns";

export async function POST() {
  try {
    // 1. Clean existing
    await prisma.helpResponse.deleteMany();
    await prisma.helpRequest.deleteMany();
    await prisma.dateMoveProposal.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.course.deleteMany();
    await prisma.weeklyMetric.deleteMany();
    await prisma.user.deleteMany();
    await prisma.program.deleteMany();

    // 2. Program
    const semesterStartDate = new Date("2026-08-24T00:00:00.000Z");
    const program = await prisma.program.create({
      data: {
        code: "IF-ITB",
        name: "Teknik Informatika",
        semesterStartDate,
        totalWeeks: 16,
      },
    });

    // 3. Users
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

    // 4. Courses
    const courseDb = await prisma.course.create({
      data: {
        programId: program.id,
        lecturerId: lecturerHendra.id,
        courseCode: "IF2110",
        courseName: "Sistem Basis Data",
        semesterLevel: 5,
        color: "#2563eb",
      },
    });

    const courseSe = await prisma.course.create({
      data: {
        programId: program.id,
        lecturerId: lecturerRina.id,
        courseCode: "IF2120",
        courseName: "Rekayasa Perangkat Lunak",
        semesterLevel: 5,
        color: "#059669",
      },
    });

    const courseCn = await prisma.course.create({
      data: {
        programId: program.id,
        lecturerId: lecturerBudi.id,
        courseCode: "IF2130",
        courseName: "Jaringan Komputer",
        semesterLevel: 5,
        color: "#7c3aed",
      },
    });

    const courseAlgo = await prisma.course.create({
      data: {
        programId: program.id,
        lecturerId: lecturerSri.id,
        courseCode: "IF2140",
        courseName: "Desain & Analisis Algoritma",
        semesterLevel: 5,
        color: "#d97706",
      },
    });

    const courseOs = await prisma.course.create({
      data: {
        programId: program.id,
        lecturerId: lecturerFauzi.id,
        courseCode: "IF2150",
        courseName: "Sistem Operasi",
        semesterLevel: 5,
        color: "#db2777",
      },
    });

    const courseAi = await prisma.course.create({
      data: {
        programId: program.id,
        lecturerId: lecturerCitra.id,
        courseCode: "IF2160",
        courseName: "Kecerdasan Buatan",
        semesterLevel: 5,
        color: "#0891b2",
      },
    });

    const getWeekDate = (weekNumber: number, dayOffset = 3) => {
      const daysToAdd = (weekNumber - 1) * 7 + dayOffset;
      return addDays(semesterStartDate, daysToAdd);
    };

    const assignmentRawData = [
      {
        courseId: courseAlgo.id,
        title: "Diagnostic Problem Set: Recurrence Relations",
        type: "QUIZ",
        weightScore: 1,
        weekNumber: 1,
        dueDate: getWeekDate(1, 4),
        subtopics: ["Master Theorem", "Substitution Method"],
      },
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
      {
        courseId: courseAlgo.id,
        title: "Divide & Conquer Sorting Benchmark",
        type: "LAB",
        weightScore: 2,
        weekNumber: 4,
        dueDate: getWeekDate(4, 4),
        subtopics: ["MergeSort Inversions", "QuickSort Pivoting", "Asymptotic Analysis"],
      },
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
      {
        courseId: courseCn.id,
        title: "Reliable Data Transfer (RDT 3.0 & Go-Back-N Protocol)",
        type: "PROJECT",
        weightScore: 3,
        weekNumber: 6,
        dueDate: getWeekDate(6, 4),
        subtopics: ["Sliding Window Protocol", "Cumulative ACK", "Timeout Estimation"],
      },
      {
        courseId: courseAlgo.id,
        title: "Dynamic Programming Memoization Problem Set",
        type: "PROJECT",
        weightScore: 3,
        weekNumber: 6,
        dueDate: getWeekDate(6, 5),
        subtopics: ["0/1 Knapsack", "Longest Common Subsequence", "Matrix Chain Multiplication"],
      },
      {
        courseId: courseOs.id,
        title: "CPU Scheduling Simulator: Round-Robin vs MLFQ",
        type: "LAB",
        weightScore: 2,
        weekNumber: 7,
        dueDate: getWeekDate(7, 4),
        subtopics: ["Turnaround Time", "Multilevel Feedback Queues", "Context Switch Overhead"],
      },
      {
        courseId: courseDb.id,
        title: "Midterm Project: 3NF Normalization & B-Tree Indexing",
        type: "PROJECT",
        weightScore: 4,
        weekNumber: 8,
        dueDate: getWeekDate(8, 2),
        subtopics: ["3NF Normalization", "BCNF Decomposition", "B-Tree Indexing", "SQL Join Optimization"],
      },
      {
        courseId: courseSe.id,
        title: "Software Requirements Specification & System Architecture",
        type: "PROJECT",
        weightScore: 4,
        weekNumber: 8,
        dueDate: getWeekDate(8, 3),
        subtopics: ["Clean Architecture", "Dependency Injection", "Use Case Realization", "Domain Driven Design"],
      },
      {
        courseId: courseCn.id,
        title: "Multi-threaded Socket Programming Server",
        type: "PROJECT",
        weightScore: 4,
        weekNumber: 8,
        dueDate: getWeekDate(8, 4),
        subtopics: ["TCP 3-way Handshake", "Concurrent Socket Pool", "Non-blocking I/O", "Packet Serialization"],
      },
      {
        courseId: courseOs.id,
        title: "Process Synchronization: Dining Philosophers & Deadlock",
        type: "LAB",
        weightScore: 3,
        weekNumber: 8,
        dueDate: getWeekDate(8, 5),
        subtopics: ["Mutex Locks", "Semaphores", "Banker's Algorithm", "Deadlock Prevention"],
      },
      {
        courseId: courseAlgo.id,
        title: "Midterm Review Quiz",
        type: "QUIZ",
        weightScore: 1,
        weekNumber: 8,
        dueDate: getWeekDate(8, 5),
        subtopics: ["Asymptotic Notation", "Recurrence Relations"],
      },
      {
        courseId: courseAi.id,
        title: "Heuristic Search: A* with Admissible Heuristics",
        type: "LAB",
        weightScore: 2,
        weekNumber: 9,
        dueDate: getWeekDate(9, 4),
        subtopics: ["Manhattan Distance", "A* Consistency", "Informed Search"],
      },
      {
        courseId: courseAlgo.id,
        title: "Graph Algorithms: Network Flow & Max Bipartite Matching",
        type: "PROJECT",
        weightScore: 4,
        weekNumber: 10,
        dueDate: getWeekDate(10, 3),
        subtopics: ["Ford-Fulkerson Method", "Edmonds-Karp Algorithm", "Residual Graphs"],
      },
      {
        courseId: courseOs.id,
        title: "Virtual Memory: Page Replacement Algorithms Simulator",
        type: "PROJECT",
        weightScore: 3,
        weekNumber: 10,
        dueDate: getWeekDate(10, 5),
        subtopics: ["LRU Page Replacement", "Clock Algorithm", "Thrashing", "Translation Lookaside Buffer"],
      },
      {
        courseId: courseDb.id,
        title: "Transaction Concurrency & Two-Phase Locking (2PL)",
        type: "LAB",
        weightScore: 2,
        weekNumber: 11,
        dueDate: getWeekDate(11, 4),
        subtopics: ["ACID Properties", "Strict 2PL", "Serializability", "Write-Ahead Logging"],
      },
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
      {
        courseId: courseAlgo.id,
        title: "NP-Completeness Proofs & Approximation Algorithms",
        type: "LAB",
        weightScore: 2,
        weekNumber: 13,
        dueDate: getWeekDate(13, 4),
        subtopics: ["Polynomial Reduction", "3-SAT to CLIQUE", "Vertex Cover Approximation"],
      },
      {
        courseId: courseDb.id,
        title: "Distributed Database Sharding & High-Availability Replication",
        type: "PROJECT",
        weightScore: 5,
        weekNumber: 14,
        dueDate: getWeekDate(14, 2),
        subtopics: ["CAP Theorem", "Consensus Raft", "Consistent Hashing", "Read Replicas"],
      },
      {
        courseId: courseSe.id,
        title: "Microservices System Milestone & End-to-End Delivery",
        type: "PROJECT",
        weightScore: 5,
        weekNumber: 14,
        dueDate: getWeekDate(14, 3),
        subtopics: ["Event-Driven Architecture", "API Gateway", "Kafka Pub/Sub", "Distributed Tracing"],
      },
      {
        courseId: courseAi.id,
        title: "Adversarial Search & Reinforcement Learning Agent",
        type: "PROJECT",
        weightScore: 4,
        weekNumber: 14,
        dueDate: getWeekDate(14, 5),
        subtopics: ["Minimax with Alpha-Beta Pruning", "Q-Learning", "Reward Shaping", "Markov Decision Processes"],
      },
      {
        courseId: courseOs.id,
        title: "File System Implementation & Inode Table Walk",
        type: "LAB",
        weightScore: 2,
        weekNumber: 15,
        dueDate: getWeekDate(15, 3),
        subtopics: ["ext4 Inode Allocation", "Directory Entries", "Superblock Recovery"],
      },
      {
        courseId: courseAlgo.id,
        title: "Comprehensive Final Assessment",
        type: "EXAM",
        weightScore: 5,
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

    for (let w = 1; w <= 16; w++) {
      const weekAssignments = createdAssignments.filter((a) => a.weekNumber === w);
      const loadIndex = weekAssignments.reduce((acc, curr) => acc + curr.weightScore, 0);
      const majorCourses = new Set(
        weekAssignments.filter((a) => a.weightScore >= 3).map((a) => a.courseId)
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

    const osWeek8Lab = createdAssignments.find(
      (a) => a.courseId === courseOs.id && a.weekNumber === 8 && a.weightScore >= 3
    );
    if (osWeek8Lab) {
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

    const dbWeek8Project = createdAssignments.find(
      (a) => a.courseId === courseDb.id && a.weekNumber === 8 && a.weightScore >= 3
    );
    if (dbWeek8Project) {
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

    // Help requests
    if (dbWeek8Project) {
      await prisma.helpRequest.create({
        data: {
          assignmentId: dbWeek8Project.id,
          requesterId: studentAldi.id,
          subtopicLabel: "3NF Normalization",
          questionDetail:
            "I'm stuck on determining if decomposing table R(A, B, C, D) with FDs {A->B, BC->D} into R1(A,B) and R2(B,C,D) preserves functional dependency BC->D without violating 3NF candidate key constraints. How do we test dependency preservation systematically?",
          status: "OPEN",
          createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000),
        },
      });

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
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database successfully reset and primed with fresh synthetic data!",
    });
  } catch (error) {
    console.error("Error resetting database:", error);
    return NextResponse.json({ error: "Failed to reset database" }, { status: 500 });
  }
}
