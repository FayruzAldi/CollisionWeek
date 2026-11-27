import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseAndValidateCsv } from "@/lib/csv-parser";
import {
  calculateWeekNumber,
  computeAllWeeklyMetrics,
  AssignmentMetricInput,
} from "@/lib/calculator";
import { requireCapability } from "@/lib/session";
import { toErrorResponse } from "@/lib/api-error";

/**
 * Impor CSV tenggat tugas.
 *
 * Otorisasi: `schedule.import` (dosen/admin). Route ini menulis ulang jadwal
 * seluruh program, jadi tidak boleh bisa dipanggil dari browser mahasiswa.
 */
export async function POST(req: NextRequest) {
  try {
    const { user } = await requireCapability("schedule.import");
    const contentType = req.headers.get("content-type") || "";
    let csvContent = "";
    let requestedProgramCode = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      requestedProgramCode = ((formData.get("programCode") as string) || "").trim();
      if (!file) {
        return NextResponse.json(
          { error: "No CSV file provided in form data" },
          { status: 400 }
        );
      }
      csvContent = await file.text();
    } else {
      const json = await req.json();
      csvContent = json.csvContent || "";
      requestedProgramCode = (json.programCode || "").trim();
    }

    if (!csvContent.trim()) {
      return NextResponse.json(
        { error: "CSV content cannot be empty" },
        { status: 400 }
      );
    }

    // Parse and validate CSV with Zod per PRD Section 5.1 & 8.2
    const validation = parseAndValidateCsv(csvContent);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "CSV validation failed",
          totalRows: validation.totalRows,
          invalidRows: validation.invalidRows,
          validRowsCount: validation.validRows.length,
        },
        { status: 422 }
      );
    }

    // Tentukan program studi target:
    // - Dosen selalu mengimpor ke prodinya sendiri.
    // - Admin bisa memilih programCode atau otomatis dideteksi dari awalan course_code (IF/SI/TE/TI/MN/AK).
    const prefixMap: Record<string, string> = {
      IF: "IF-2027",
      GE: "IF-2027",
      SI: "SI-2027",
      TE: "TE-2027",
      TI: "TI-2027",
      MN: "MN-2027",
      AK: "AK-2027",
    };
    const firstPrefix = (validation.validRows[0]?.course_code || "")
      .trim()
      .slice(0, 2)
      .toUpperCase();
    const detectedCode = requestedProgramCode || prefixMap[firstPrefix] || "";

    const program =
      user.role === "ADMIN" && detectedCode
        ? (await prisma.program.findUnique({
            where: { code: detectedCode },
            include: { courses: true, users: true },
          })) ||
          (await prisma.program.findUnique({
            where: { id: user.programId },
            include: { courses: true, users: true },
          }))
        : await prisma.program.findUnique({
            where: { id: user.programId },
            include: { courses: true, users: true },
          });

    if (!program) {
      return NextResponse.json(
        { error: "Program studi tidak ditemukan. Pastikan semester sudah diinisialisasi." },
        { status: 404 }
      );
    }

    // Default lecturer if new course needs to be created
    const defaultLecturer =
      user.role === "LECTURER"
        ? user
        : program.users.find((u) => u.role === "LECTURER") || program.users[0] || user;

    const courseMap = new Map<string, string>();
    for (const c of program.courses) {
      courseMap.set(c.courseCode.toUpperCase(), c.id);
    }

    // Process valid rows
    const createdAssignments = [];
    for (const row of validation.validRows) {
      const code = row.course_code.toUpperCase();
      let courseId = courseMap.get(code);

      // Auto-create course if doesn't exist
      if (!courseId) {
        const newCourse = await prisma.course.create({
          data: {
            programId: program.id,
            lecturerId: defaultLecturer.id,
            courseCode: code,
            courseName: `${code} Course`,
            semesterLevel: 5,
            color: "#64748b",
          },
        });
        courseId = newCourse.id;
        courseMap.set(code, courseId);
      }

      const dueDate = new Date(row.due_date);
      const weekNumber = calculateWeekNumber(
        dueDate,
        program.semesterStartDate,
        program.totalWeeks
      );

      const subtopicsList = row.subtopics
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const assignment = await prisma.assignment.create({
        data: {
          courseId,
          title: row.title,
          type: row.type,
          weightScore: row.weight_score,
          dueDate,
          weekNumber,
          subtopics: JSON.stringify(subtopicsList),
        },
      });

      createdAssignments.push(assignment);
    }

    // Recalculate all weekly metrics in DB
    const allAssignments = await prisma.assignment.findMany({
      where: { course: { programId: program.id } },
    });

    const metricInputs: AssignmentMetricInput[] = allAssignments.map((a) => ({
      id: a.id,
      courseId: a.courseId,
      title: a.title,
      weightScore: a.weightScore,
      dueDate: a.dueDate,
      weekNumber: a.weekNumber,
    }));

    const computedMetricsMap = computeAllWeeklyMetrics(metricInputs, program.totalWeeks);

    for (const [weekNum, computed] of Array.from(computedMetricsMap.entries())) {
      await prisma.weeklyMetric.upsert({
        where: {
          programId_weekNumber: {
            programId: program.id,
            weekNumber: weekNum,
          },
        },
        create: {
          programId: program.id,
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

    const flaggedCount = Array.from(computedMetricsMap.values()).filter(
      (m) => m.isFlagged
    ).length;

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor ${createdAssignments.length} tugas ke jurusan ${program.name}. Peta beban telah dihitung ulang.`,
      programName: program.name,
      importedCount: createdAssignments.length,
      flaggedWeeksCount: flaggedCount,
    });
  } catch (error) {
    const authError = toErrorResponse(error);
    if (authError) return authError;
    console.error("Gagal mengimpor CSV:", error);
    return NextResponse.json(
      { error: "Gagal mengimpor CSV." },
      { status: 500 }
    );
  }
}
