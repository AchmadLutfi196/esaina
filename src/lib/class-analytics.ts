import type { Assessment, StudentSubmission } from "@/types";

/**
 * Utilitas murni untuk tab "Rekap Nilai & Sebaran Skor".
 * Semua perhitungan dilakukan di klien dari data yang sudah diotorisasi server.
 */

export interface ScoreCell {
  raw: number | null;
  max: number;
  percent: number | null;
  state: "final" | "draft" | "ungraded" | "not_submitted";
}

export interface DistributionBin {
  range: string;
  min: number;
  max: number;
  count: number;
  students: { name: string; score: number }[];
}

export interface ClassStats {
  mean: number | null;
  highest: number | null;
  lowest: number | null;
  passRate: number | null;
  gradedCount: number;
}

export interface TrendPoint {
  label: string;
  shortLabel: string;
  average: number;
  highest: number;
  lowest: number;
  count: number;
}

export function maxScoreOf(assessment: Assessment): number {
  const total = assessment.questions.reduce((sum, q) => sum + (q.maxScore ?? 0), 0);
  return total > 0 ? total : 100;
}

export function rawScoreOf(submission: StudentSubmission): number | null {
  if (submission.statusWork !== "submitted") return null;

  if (typeof submission.publishedScore === "number") {
    return submission.publishedScore;
  }
  if (typeof submission.overallFinalScore === "number") {
    return submission.overallFinalScore;
  }

  const answers = Object.values(submission.answers ?? {});
  const scored = answers.some((a) => Object.keys(a.scores ?? {}).length > 0);
  if (!scored) return null;

  return answers.reduce(
    (sum, a) => sum + Object.values(a.scores ?? {}).reduce((x, y) => x + y, 0),
    0
  );
}

export function scoreCellOf(
  submission: StudentSubmission | undefined,
  assessment: Assessment
): ScoreCell {
  const max = maxScoreOf(assessment);

  if (!submission || submission.statusWork !== "submitted") {
    return { raw: null, max, percent: null, state: "not_submitted" };
  }

  const raw = rawScoreOf(submission);
  const state: ScoreCell["state"] =
    submission.statusGrading === "final"
      ? "final"
      : submission.statusGrading === "draft_graded"
        ? "draft"
        : "ungraded";

  if (raw === null) {
    return { raw: null, max, percent: null, state: "ungraded" };
  }

  return {
    raw,
    max,
    percent: Math.round((raw / max) * 100),
    state,
  };
}

export const SCORE_BINS: { range: string; min: number; max: number }[] = [
  { range: "0–59", min: 0, max: 59 },
  { range: "60–69", min: 60, max: 69 },
  { range: "70–79", min: 70, max: 79 },
  { range: "80–89", min: 80, max: 89 },
  { range: "90–100", min: 90, max: 100 },
];

export function buildDistribution(
  points: { name: string; percent: number }[]
): DistributionBin[] {
  return SCORE_BINS.map((bin) => {
    const students = points
      .filter((p) => p.percent >= bin.min && p.percent <= bin.max)
      .sort((a, b) => b.percent - a.percent)
      .map((p) => ({ name: p.name, score: p.percent }));
    return { ...bin, count: students.length, students };
  });
}

export function classStats(percents: number[]): ClassStats {
  if (percents.length === 0) {
    return { mean: null, highest: null, lowest: null, passRate: null, gradedCount: 0 };
  }
  const sum = percents.reduce((a, b) => a + b, 0);
  const passed = percents.filter((p) => p >= 70).length;
  return {
    mean: Math.round((sum / percents.length) * 10) / 10,
    highest: Math.max(...percents),
    lowest: Math.min(...percents),
    passRate: Math.round((passed / percents.length) * 100),
    gradedCount: percents.length,
  };
}

export function buildTrends(
  assessments: Assessment[],
  percentOf: (submission: StudentSubmission, assessment: Assessment) => number | null
): TrendPoint[] {
  return assessments
    .slice()
    .reverse()
    .map((assessment, index) => {
      const percents = assessment.submissions
        .map((sub) => percentOf(sub, assessment))
        .filter((v): v is number => typeof v === "number");

      return {
        label: assessment.title,
        shortLabel: `Tugas #${index + 1}`,
        average:
          percents.length > 0
            ? Math.round(
                (percents.reduce((a, b) => a + b, 0) / percents.length) * 10
              ) / 10
            : 0,
        highest: percents.length > 0 ? Math.max(...percents) : 0,
        lowest: percents.length > 0 ? Math.min(...percents) : 0,
        count: percents.length,
      };
    })
    .filter((point) => point.count > 0);
}
