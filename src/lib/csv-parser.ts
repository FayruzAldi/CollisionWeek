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
GE101,Reading Summary & Paraphrasing,LAB,1,2027-03-05,"Main argument, Paraphrasing"
IF101,Algorithm Complexity Quiz 1,QUIZ,1,2027-03-12,"Big-O notation, Time Complexity"
IF104,Probability & Statistics Problem Set 1,LAB,2,2027-03-12,"Mean and variance, Probability basics"
IF102,Relational ER Diagram Modeling,PROJECT,3,2027-03-19,"Entities and relationships, Cardinality"
IF103,HTML/CSS Flexbox Mini Project,PROJECT,3,2027-03-26,"Semantic HTML, Flexbox layout, Responsive Design"
GE102,Propositional Logic Problem Set 1,LAB,2,2027-03-26,"Propositional logic, Truth tables"
IF101,Sorting Algorithms Benchmark,LAB,3,2027-04-02,"Merge sort, Quick sort, Complexity analysis"
IF102,Advanced SQL Queries & Indexing,PROJECT,3,2027-04-02,"Joins, Aggregation, Subqueries"
IF104,Applied Statistics Hypothesis Report,PROJECT,3,2027-04-02,"Hypothesis testing, Data visualization"
IF105,Packet Tracing & OSI Inspection,LAB,2,2027-04-02,"OSI layers, Wireshark filters"
GE101,Academic Essay Argument Draft,LAB,2,2027-04-09,"Thesis statement, Citation APA"
IF106,User Persona & Field Interview Guide,PROJECT,3,2027-04-16,"Interview guide, Persona creation"
IF103,JavaScript Async & Fetch Integration,PROJECT,3,2027-04-23,"DOM events, Fetch API, Async Await"
IF101,Graph Traversal & Shortest Path,PROJECT,4,2027-04-30,"BFS and DFS, Dijkstra Shortest Path"
IF105,IPv4 Subnetting & VLSM Architecture,PROJECT,4,2027-04-30,"IPv4 subnetting, VLSM"
IF106,High-Fidelity Prototype & Heuristics,PROJECT,3,2027-04-30,"Wireframing, Usability heuristics"
GE102,Mathematical Induction Proofs,LAB,3,2027-04-30,"Induction, Set proofs"
IF102,Database Normalization to 3NF/BCNF,PROJECT,3,2027-05-07,"Functional dependencies, 3NF and BCNF"
IF104,Confidence Intervals Estimation Quiz,QUIZ,1,2027-05-14,"Confidence intervals, Normal distribution"
GE101,Final Academic Research Paper,PROJECT,3,2027-05-14,"Argument structure, Citation synthesis"
IF103,Fullstack Web Auth & REST Services,PROJECT,3,2027-05-21,"REST API design, JWT Authentication"
IF101,Comprehensive Algorithm Capstone,PROJECT,5,2027-05-28,"Algorithm design, Complexity analysis"
IF102,Distributed Database Final Project,PROJECT,5,2027-05-28,"Schema design, Query optimization, Sharding"
IF103,Interactive Cloud Web Application,PROJECT,5,2027-05-28,"Deployment, State management, Cloud run"
IF105,Enterprise Routing & Troubleshoot,LAB,3,2027-05-28,"Routing protocols, Network troubleshooting"
IF106,Usability Evaluation & SUS Report,PROJECT,3,2027-05-28,"Test protocol, Findings analysis, SUS score"
GE102,Combinatorics & Recurrence Relations,LAB,2,2027-06-04,"Combinatorics, Recurrence relations"
IF104,Final Multivariate Regression Report,PROJECT,3,2027-06-11,"Regression analysis, Reporting results"
`;
