export type UserRole = "STUDENT" | "LECTURER" | "ADMIN";

export type AssignmentType = "QUIZ" | "LAB" | "PROJECT" | "EXAM";

export type ProposalStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type HelpRequestStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export type ResponseType = "WRITTEN" | "RECORDED_LINK" | "SESSION_20MIN";

export interface ProgramInfo {
  id: string;
  code: string;
  name: string;
  semesterStartDate: string;
  totalWeeks: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  programId: string;
}

export interface CourseData {
  id: string;
  courseCode: string;
  courseName: string;
  semesterLevel: number;
  color?: string | null;
  lecturer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AssignmentData {
  id: string;
  courseId: string;
  title: string;
  type: AssignmentType;
  weightScore: number;
  dueDate: string;
  weekNumber: number;
  subtopics: string[];
  course?: {
    id: string;
    courseCode: string;
    courseName: string;
    color?: string | null;
    lecturer?: {
      name: string;
    };
  };
}

export interface WeeklyMetricData {
  id: string;
  weekNumber: number;
  loadIndex: number;
  collisionCount: number;
  isFlagged: boolean;
  computedAt: string;
  totalAssignments?: number;
  majorAssignments?: number;
  coursesCount?: number;
}

export interface DateMoveProposalCandidate {
  id?: string;
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
  weekDelta?: number;
  status?: ProposalStatus;
  reason: string;
}

export interface HelpResponseData {
  id: string;
  requestId: string;
  helperId: string;
  responseType: ResponseType;
  contentOrUrl: string;
  scheduledSlot?: string | null;
  isAccepted: boolean;
  createdAt: string;
  helper: {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string | null;
  };
}

export interface HelpRequestData {
  id: string;
  assignmentId: string;
  requesterId: string;
  subtopicLabel: string;
  questionDetail: string;
  status: HelpRequestStatus;
  createdAt: string;
  firstResponseAt?: string | null;
  resolvedAt?: string | null;
  isUrgent?: boolean; // True if > 12h without response
  assignment: {
    id: string;
    title: string;
    weekNumber: number;
    course: {
      courseCode: string;
      courseName: string;
      color?: string | null;
    };
  };
  requester: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  responses: HelpResponseData[];
  responsesCount?: number;
}
