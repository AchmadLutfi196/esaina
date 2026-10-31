// ─────────────────────────────────────────────────────────────
// Shared domain types for ESAINA.
// These mirror the Prisma models but stay JSON-friendly for
// client components (dates as ISO strings, records keyed by id).
// ─────────────────────────────────────────────────────────────

export type Role = "admin" | "teacher" | "student";
export type AssessmentStatus = "draft" | "active" | "completed";
export type PublicationStatus = "unpublished" | "published";
export type WorkStatus = "not_started" | "draft" | "submitted";
export type GradingStatus = "ungraded" | "draft_graded" | "final";
export type AnswerStatus = "waiting_raters" | "ready_for_review" | "completed";
export type IndoBertStatus = "pending" | "available" | "unavailable";
export type GradeAction =
  | "ai_pregrade"
  | "score_adjustment"
  | "feedback_edit"
  | "status_change"
  | "finalized";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  identifier?: string | null;
}

export interface RubricLevel {
  score: number;
  label: string;
  description: string;
}

export interface RubricCriterion {
  id: string;
  name: string;
  weight: number;
  maxScore: number;
  description: string;
  levels: RubricLevel[];
}

export interface Question {
  id: number;
  prompt: string;
  referenceAnswer?: string;
  maxScore: number;
  expectedKeywords: string[];
  rubric: RubricCriterion[];
}

export interface AiEvidenceQuote {
  text: string;
  criterionId: string;
  sentiment: "strength" | "improvement";
  note: string;
}

export interface AiExplanation {
  overallAssessment: string;
  suggestedScores: Record<string, number>;
  keyEvidenceQuotes: AiEvidenceQuote[];
  improvementTips: string[];
}

export interface QuestionAnswer {
  questionId: number;
  studentAnswer: string;
  wordCount: number;
  lastUpdated: string;
  scores: Record<string, number>;
  teacherFeedback: string;
  aiSuggestion?: AiExplanation;
  isAiApplied?: boolean;
}

export interface GradeHistoryEntry {
  id: string;
  timestamp: string;
  raterName: string;
  action: GradeAction;
  actionLabel: string;
  questionId?: number;
  questionTitle?: string;
  previousScore?: number;
  newScore?: number;
  scoreDelta?: number;
  criterionChanges?: {
    criterionId: string;
    criterionName: string;
    previousScore: number;
    newScore: number;
  }[];
  previousFeedback?: string;
  newFeedback?: string;
  note?: string;
}

export interface StudentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentNis: string;
  submittedAt: string | null;
  statusWork: WorkStatus;
  statusGrading: GradingStatus;
  raterName: string;
  answers: Record<number, QuestionAnswer>;
  publishedScore: number | null;
  overallFinalScore?: number | null;
  teacherGeneralNotes?: string;
  gradeHistory?: GradeHistoryEntry[];
}

export interface Assessment {
  id: string;
  classId: string;
  className?: string;
  title: string;
  code: string;
  subject: string;
  status: AssessmentStatus;
  publicationStatus: PublicationStatus;
  publishedAt?: string;
  dueDate: string;
  durationMinutes: number;
  raterCount: number;
  targetRaters?: number;
  instructions: string;
  questions: Question[];
  submissions: StudentSubmission[];
}

export interface ClassItem {
  id: string;
  name: string;
  grade: string;
  academicYear: string;
  classCode: string;
  studentCount: number;
  assessmentCount: number;
  subject: string;
}

/** Human-facing labels (Indonesian) for database enums. */
export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrator",
  teacher: "Guru",
  student: "Siswa",
};

export const ASSESSMENT_STATUS_LABEL: Record<AssessmentStatus, string> = {
  draft: "Draf",
  active: "Dibuka",
  completed: "Ditutup",
};

export const GRADING_STATUS_LABEL: Record<GradingStatus, string> = {
  ungraded: "Belum dinilai",
  draft_graded: "Draf penilaian",
  final: "Final",
};

export const WORK_STATUS_LABEL: Record<WorkStatus, string> = {
  not_started: "Belum mulai",
  draft: "Draf jawaban",
  submitted: "Dikumpulkan",
};
