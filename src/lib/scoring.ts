import type { Assessment, Question, RubricCriterion, StudentSubmission } from "@/types";

/** Sum of all criterion scores for a single answer. */
export function calculateQuestionScore(
  scores: Record<string, number> | undefined | null
): number {
  if (!scores) return 0;
  return Object.values(scores).reduce((sum, val) => sum + (Number(val) || 0), 0);
}

/** Sum of every answer's score inside a submission. */
export function calculateSubmissionTotalScore(
  submission: Pick<StudentSubmission, "answers"> | null | undefined
): number {
  if (!submission?.answers) return 0;
  return Object.values(submission.answers).reduce(
    (total, ans) => total + calculateQuestionScore(ans.scores),
    0
  );
}

export function hasSubmissionAnyScore(
  submission: Pick<StudentSubmission, "answers"> & Partial<Pick<StudentSubmission, "statusGrading">> | null | undefined
): boolean {
  if (!submission?.answers) return false;
  if (submission.statusGrading === "ungraded") return false;
  return Object.values(submission.answers).some(
    (ans) => ans.scores && Object.keys(ans.scores).length > 0
  );
}

export function getAssessmentMaxScore(
  assessment: Pick<Assessment, "questions">
): number {
  return assessment.questions.reduce((sum, q) => sum + q.maxScore, 0);
}

export interface ScoreBreakdown {
  criterionId: string;
  criterionName: string;
  maxScore: number;
  score: number;
  weight: number;
}

export function buildScoreBreakdown(
  question: Pick<Question, "rubric">,
  scores: Record<string, number>
): ScoreBreakdown[] {
  return question.rubric.map((crit: RubricCriterion) => ({
    criterionId: crit.id,
    criterionName: crit.name,
    maxScore: crit.maxScore,
    score: scores[crit.id] ?? 0,
    weight: crit.weight,
  }));
}

/** Percentage of the maximum possible score, 0–100. */
export function scorePercent(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((score / maxScore) * 100)));
}

/** Letter grade used in result screens. */
export function scoreToGrade(percent: number): { letter: string; label: string } {
  if (percent >= 90) return { letter: "A", label: "Sangat Baik" };
  if (percent >= 80) return { letter: "B", label: "Baik" };
  if (percent >= 70) return { letter: "C", label: "Cukup" };
  if (percent >= 60) return { letter: "D", label: "Kurang" };
  return { letter: "E", label: "Perlu Bimbingan" };
}
