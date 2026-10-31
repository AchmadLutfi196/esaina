"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MessageSquare,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Assessment, StudentSubmission } from "@/types";

export function StudentResultView({
  assessment,
  submission,
}: {
  assessment: Assessment;
  submission: StudentSubmission;
}) {
  const isPublished =
    assessment.publicationStatus === "published" ||
    submission.publishedScore !== null;

  const totalScore =
    submission.publishedScore ??
    (submission.statusGrading === "final"
      ? Object.values(submission.answers).reduce(
          (sum, a) =>
            sum + Object.values(a.scores).reduce((x, y) => x + y, 0),
          0
        )
      : null);

  const maxScore = assessment.questions.reduce(
    (sum, q) => sum + q.maxScore,
    0
  );

  return (
    <div className="animate-fade-up space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Link
          href="/classes"
          className="flex items-center gap-2 text-xs font-bold text-muted transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </Link>
        <Badge status={isPublished ? "Diterbitkan" : "Menunggu hasil"} />
      </div>

      {!isPublished ? (
        <Card className="mx-auto max-w-2xl space-y-5 p-8 text-center sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-butter-yellow/60 text-brand">
            <MessageSquare className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block rounded-full border border-orange-pastel bg-butter-yellow px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand">
              Status: Menunggu Pemeriksaan
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-brand sm:text-3xl">
              LJK Anda Sedang Diperiksa
            </h1>
            <p className="mx-auto max-w-lg text-xs leading-relaxed text-muted sm:text-sm">
              Jawaban esai Anda untuk{" "}
              <strong>{assessment.title}</strong> telah terkumpul.
              Guru sedang memeriksa dengan asistensi AI.
            </p>
          </div>

          <Card className="mx-auto max-w-md space-y-1.5 bg-white/70 p-4 text-left text-xs">
            <div className="flex justify-between">
              <span className="text-muted">Mata Pelajaran:</span>
              <strong className="text-brand">{assessment.subject}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Penilai:</span>
              <strong className="text-brand">
                {submission.raterName || "Guru"}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Waktu Kumpul:</span>
              <strong className="text-brand">
                {submission.submittedAt
                  ? formatDate(submission.submittedAt)
                  : "Tersimpan"}
              </strong>
            </div>
          </Card>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <Card className="p-6 sm:p-7">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="font-bold text-brand">
                    {assessment.subject}
                  </span>
                  <span aria-hidden>·</span>
                  <span className="flex items-center gap-1 font-semibold text-brand">
                    <UserCheck className="h-3.5 w-3.5" /> Dinilai oleh{" "}
                    {submission.raterName || "Guru"}
                  </span>
                  <span aria-hidden>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />{" "}
                    {assessment.publishedAt
                      ? formatDate(assessment.publishedAt)
                      : "—"}
                  </span>
                </div>
                <h1 className="text-2xl font-bold leading-tight tracking-tight text-brand sm:text-3xl">
                  {assessment.title}
                </h1>
                <p className="text-xs text-muted">
                  Siswa:{" "}
                  <strong className="text-brand">{submission.studentName}</strong>{" "}
                  (NIS: {submission.studentNis})
                </p>
              </div>

              <Card className="min-w-[200px] border-white/80 bg-bleu-ciel/30 p-5 text-center">
                <span className="block text-xs font-bold uppercase tracking-wider text-brand">
                  Nilai Akhir
                </span>
                <span className="nums my-1 block text-5xl font-extrabold text-brand">
                  {totalScore}
                </span>
                <span className="block text-[11px] font-bold text-brand">
                  dari {maxScore} Poin
                </span>
              </Card>
            </div>
          </Card>

          {/* Teacher general note */}
          {submission.teacherGeneralNotes && (
            <Card className="flex items-start gap-3 border-white/80 bg-butter-yellow/80 p-4 text-xs text-brand">
              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <span className="block font-bold uppercase tracking-wider">
                  Evaluasi Umum Guru:
                </span>
                <p className="mt-0.5 leading-relaxed">
                  {submission.teacherGeneralNotes}
                </p>
              </div>
            </Card>
          )}

          {/* Per-question breakdown */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-brand">
              Rincian Nilai & Umpan Balik per Soal
            </h2>

            {assessment.questions.map((q, idx) => {
              const ans = submission.answers[q.id];
              const questionTotal = ans
                ? Object.values(ans.scores).reduce((a, b) => a + b, 0)
                : 0;

              return (
                <Card key={q.id} className="space-y-4 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4 border-b border-line/60 pb-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand">
                        Soal Nomor {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-brand">
                        {q.prompt}
                      </h3>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="block text-xs text-muted">Skor</span>
                      <span className="nums text-xl font-extrabold text-brand">
                        {questionTotal} / {q.maxScore}
                      </span>
                    </div>
                  </div>

                  {/* Student answer */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-muted">
                      Jawaban Anda:
                    </span>
                    <div className="whitespace-pre-line rounded-xl border border-line bg-paper p-3.5 text-xs leading-relaxed text-brand">
                      {ans?.studentAnswer || "(Tidak ada jawaban)"}
                    </div>
                  </div>

                  {/* Criteria scores */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold text-brand">
                      Capaian Kriteria Rubrik:
                    </span>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {q.rubric.map((crit) => {
                        const earned = ans?.scores[crit.id] ?? 0;
                        const matchedLevel = crit.levels.find(
                          (l) => l.score === earned
                        );
                        return (
                          <div
                            key={crit.id}
                            className="space-y-1.5 rounded-xl border border-line bg-paper p-3"
                          >
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold text-brand">
                                {crit.name}
                              </h5>
                              <span className="nums rounded bg-bleu-ciel/30 px-1.5 py-0.5 text-xs font-bold text-brand">
                                {earned}/{crit.maxScore}p
                              </span>
                            </div>
                            <span className="inline-block rounded border border-orange-pastel bg-butter-yellow px-2 py-0.5 text-[10px] font-bold uppercase text-brand">
                              {matchedLevel?.label || "Tercapai"}
                            </span>
                            <p className="text-[11px] text-muted">
                              {matchedLevel?.description || crit.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Teacher feedback */}
                  {ans?.teacherFeedback && (
                    <div className="space-y-1 rounded-xl border border-bleu-ciel bg-bleu-ciel/20 p-3.5 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-brand">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Umpan Balik Guru:</span>
                      </div>
                      <p className="whitespace-pre-line leading-relaxed text-brand">
                        {ans.teacherFeedback}
                      </p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
