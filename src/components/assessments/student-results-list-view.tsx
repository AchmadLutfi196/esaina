"use client";

import React from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import {
  GRADING_STATUS_LABEL,
  type Assessment,
} from "@/types";
import { calculateSubmissionTotalScore, scorePercent, scoreToGrade } from "@/lib/scoring";

export function StudentResultsListView({
  userId,
  assessments,
}: {
  userId: string;
  assessments: Assessment[];
}) {
  const rows = assessments
    .map((a) => {
      const sub = a.submissions.find((s) => s.studentId === userId);
      return sub ? { assessment: a, submission: sub } : null;
    })
    .filter((r): r is { assessment: Assessment; submission: NonNullable<typeof r>["submission"] } => r !== null);

  const submitted = rows.filter(
    (r) => r.submission.statusWork === "submitted"
  );
  const graded = submitted.filter(
    (r) =>
      r.submission.statusGrading === "final" &&
      r.submission.publishedScore !== null
  );

  const avgPercent =
    graded.length > 0
      ? Math.round(
          graded.reduce((sum, r) => {
            const max = r.assessment.questions.reduce(
              (m, q) => m + q.maxScore,
              0
            );
            const total =
              r.submission.publishedScore ??
              calculateSubmissionTotalScore(r.submission);
            return sum + scorePercent(total, max);
          }, 0) / graded.length
        )
      : 0;

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div className="glass-panel flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-pastel bg-butter-yellow px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand">
            <Award className="h-3.5 w-3.5" />
            <span>Hasil & Nilai</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-brand sm:text-2xl">
            Hasil Asesmen Saya
          </h1>
          <p className="text-xs text-muted sm:text-sm">
            Rincian nilai dan umpan balik dari guru untuk setiap asesmen.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="space-y-2 border-brand-line/40 bg-brand-tint/70">
          <span className="flex items-center gap-2 text-xs font-semibold text-brand">
            <FileText className="h-4 w-4" /> Total Dikumpulkan
          </span>
          <span className="nums block text-3xl font-extrabold text-brand">
            {submitted.length}
          </span>
        </Card>

        <Card className="space-y-2 border-[#4C1D95]/25 bg-[#F0EAFE]">
          <span className="flex items-center gap-2 text-xs font-semibold text-[#4C1D95]">
            <CheckCircle2 className="h-4 w-4" /> Sudah Dinilai
          </span>
          <span className="nums block text-3xl font-extrabold text-[#4C1D95]">
            {graded.length}
          </span>
        </Card>

        <Card className="space-y-2 border-[#7A4C05]/25 bg-[#FDF2E0]">
          <span className="flex items-center gap-2 text-xs font-semibold text-[#7A4C05]">
            <Trophy className="h-4 w-4" /> Rata-rata
          </span>
          <span className="nums block text-3xl font-extrabold text-[#7A4C05]">
            {graded.length > 0 ? `${avgPercent}%` : "—"}
          </span>
        </Card>
      </div>

      {/* List */}
      {rows.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-line" />
          <p className="text-sm font-semibold text-ink">Belum ada asesmen</p>
          <p className="mt-1 text-xs text-muted">
            Kerjakan asesmen dari kelas Anda terlebih dahulu.
          </p>
          <Link href="/classes" className="mt-4 inline-block text-xs font-bold text-brand hover:underline">
            Buka Daftar Kelas →
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map(({ assessment, submission }) => {
            const max = assessment.questions.reduce(
              (m, q) => m + q.maxScore,
              0
            );
            const total =
              submission.publishedScore ??
              calculateSubmissionTotalScore(submission);
            const percent = scorePercent(total, max);
            const grade = scoreToGrade(percent);
            const isPublished =
              assessment.publicationStatus === "published" ||
              submission.publishedScore !== null;

            return (
              <Card
                key={assessment.id}
                className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                      isPublished
                        ? "bg-brand text-white"
                        : "bg-bleu-ciel/35 text-brand"
                    )}
                  >
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-muted">
                        {assessment.code}
                      </span>
                      <Badge
                        status={
                          isPublished
                            ? "Diterbitkan"
                            : GRADING_STATUS_LABEL[submission.statusGrading]
                        }
                      />
                    </div>
                    <h3 className="mt-1 text-sm font-bold text-brand">
                      {assessment.title}
                    </h3>
                    <p className="text-xs text-muted">
                      {assessment.subject} • {assessment.className}
                    </p>
                    <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />{" "}
                        {submission.submittedAt
                          ? formatDate(submission.submittedAt)
                          : "—"}
                      </span>
                      <span>{assessment.questions.length} soal</span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-4 border-t border-line/40 pt-3 sm:border-t-0 sm:pt-0">
                  {isPublished ? (
                    <>
                      <div className="text-right">
                        <span className="nums block text-2xl font-extrabold text-brand">
                          {total}
                        </span>
                        <span className="text-[10px] font-semibold text-muted">
                          dari {max} • {grade.letter} ({grade.label})
                        </span>
                      </div>
                      <Link href={`/assessments/${assessment.id}/result`}>
                        <span className="cursor-pointer rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-dark">
                          Lihat Detail
                        </span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="text-right">
                        <span className="nums block text-2xl font-extrabold text-muted">
                          —
                        </span>
                        <span className="text-[10px] font-semibold text-muted">
                          Menunggu penilaian
                        </span>
                      </div>
                      <Link href={`/assessments/${assessment.id}/result`}>
                        <span className="cursor-pointer rounded-xl border border-line bg-white px-4 py-2 text-xs font-bold text-brand">
                          Tinjau
                        </span>
                      </Link>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
