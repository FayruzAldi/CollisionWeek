import Papa from "papaparse";
import { z } from "zod";

export const assignmentCsvRowSchema = z.object({
  course_code: z.string().min(1, "Course code is required (e.g. IF2110)"),
  title: z.string().min(1, "Assignment title is required"),
  type: z.enum(["QUIZ", "LAB", "PROJECT", "EXAM"], {
    errorMap: () => ({
      message: "Type must be one of: QUIZ, LAB, PROJECT, EXAM",
    }),
  }),
  weight_score: z
    .number({ invalid_type_error: "Weight score must be a number between 1 and 5" })
    .int()
    .min(1, "Weight score must be at least 1")
    .max(5, "Weight score cannot exceed 5"),
  due_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid due_date format. Please use YYYY-MM-DD (e.g. 2026-10-15)",
  }),
  subtopics: z.string().min(1, "Subtopics are required (comma-separated)"),
});

export type AssignmentCsvRow = z.infer<typeof assignmentCsvRowSchema>;

export interface CsvValidationResult {
  totalRows: number;
  validRows: (AssignmentCsvRow & { rawRowNumber: number })[];
  invalidRows: {
    rawRowNumber: number;
    data: Record<string, string>;
    errors: string[];
  }[];
  isValid: boolean;
}

export function parseAndValidateCsv(csvText: string): CsvValidationResult {
  const parsed = Papa.parse<Record<string, string>>(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
  });

  const validRows: (AssignmentCsvRow & { rawRowNumber: number })[] = [];
  const invalidRows: {
    rawRowNumber: number;
    data: Record<string, string>;
    errors: string[];
  }[] = [];

  parsed.data.forEach((row, index) => {
    const rawRowNumber = index + 2; // Row 1 is header
    const normalizedData = {
      course_code: row.course_code?.trim() || "",
      title: row.title?.trim() || "",
      type: row.type?.trim().toUpperCase() || "",
      weight_score: Number(row.weight_score),
      due_date: row.due_date?.trim() || "",
      subtopics: row.subtopics?.trim() || "",
    };

    const result = assignmentCsvRowSchema.safeParse(normalizedData);
    if (result.success) {
      validRows.push({ ...result.data, rawRowNumber });
    } else {
      invalidRows.push({
        rawRowNumber,
        data: row,
        errors: result.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`),
      });
    }
  });

  return {
    totalRows: parsed.data.length,
    validRows,
    invalidRows,
    isValid: invalidRows.length === 0 && validRows.length > 0,
  };
}

export const SAMPLE_CSV_CONTENT = `course_code,title,type,weight_score,due_date,subtopics
IF2110,Relational Schema Normalization Lab,LAB,2,2026-09-12,"1NF Normalization, 2NF Normalization"
IF2110,Midterm Query Optimization Project,PROJECT,4,2026-10-14,"B-Tree Indexing, SQL Join Optimization, Execution Plans"
IF2120,Software Requirements Specification,PROJECT,4,2026-10-15,"Use Case Diagrams, User Stories, Acceptance Criteria"
IF2130,Socket Programming Milestone 1,PROJECT,4,2026-10-16,"TCP Handshake, UDP Streaming, Thread Pool"
IF2140,Algorithm Complexity Problem Set,LAB,2,2026-10-17,"Master Theorem, Divide and Conquer"
IF2150,Process Scheduling Simulation,LAB,3,2026-10-17,"Round Robin, Priority Inversion, Deadlock Prevention"
IF2160,Heuristic Search Implementation,PROJECT,4,2026-11-25,"A* Search Algorithm, Heuristic Functions, Minimax with Alpha-Beta"
IF2120,Architecture Design & Microservices,PROJECT,4,2026-11-26,"Event-Driven Architecture, REST vs gRPC, Docker Containerization"
IF2110,Distributed Database Sharding,PROJECT,5,2026-11-27,"CAP Theorem, Two-Phase Commit, Database Replication"
`;
