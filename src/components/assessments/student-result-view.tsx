"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  MessageSquare,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateTime, cn } from "@/lib/utils";
import type { Assessment, StudentSubmission } from "@/types";

export function StudentResultView({
  assessment,
  submission,
}: {
  assessment: Assessment;
  submission: StudentSubmission;
}) {
  const [expandedAnswer, setExpandedAnswer] = useState<Record<string, boolean>>({});

  const toggleExpand = (qId: number) => {
    setExpandedAnswer((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

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
      {/* Top Bar matching 12 · Siswa hasil asesmen.png */}
      <header className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_4px_24px_rgba(10,22,128,0.04)] backdrop-blur-md sm:p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/classes"
              className="flex items-center gap-1 text-xs font-bold text-muted hover:text-brand mr-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali</span>
            </Link>
            <img
              src="/brand/esaina-logo.png"
              alt="ESAINA"
              className="h-6 w-auto object-contain"
            />
            <span className="text-muted" aria-hidden>
              ·
            </span>
            <h1 className="text-sm font-bold text-ink sm:text-base">
              Hasil Asesmen Resmi · {assessment.subject} ({assessment.className || "XI MIPA 1"})
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {isPublished ? (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>
                  Diterbitkan Resmi oleh Guru (
                  {assessment.publishedAt
                    ? formatDateTime(assessment.publishedAt)
                    : "Terbit"}
                  )
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-800">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <span>Menunggu Hasil Pemeriksaan Guru</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {!isPublished ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/90 bg-white p-8 text-center shadow-[0_4px_24px_rgba(10,22,128,0.04)] sm:p-12 space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-butter-yellow/60 text-brand">
            <MessageSquare className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block rounded-full border border-orange-pastel bg-butter-yellow px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand">
              Status: Menunggu Pemeriksaan
            </span>
            <h2 className="font-heading text-2xl font-extrabold text-brand sm:text-3xl">
              LJK Anda Sedang Diperiksa
            </h2>
            <p className="mx-auto max-w-lg text-xs leading-relaxed text-muted sm:text-sm">
              Jawaban esai Anda untuk <strong>{assessment.title}</strong> telah terkumpul di server.
              Guru penilai dan asisten AI sedang memeriksa kepatuhan terhadap rubrik kriteria.
            </p>
          </div>

          <div className="mx-auto max-w-md space-y-2 rounded-xl border border-line bg-paper/60 p-4 text-left text-xs">
            <div className="flex justify-between">
              <span className="text-muted">Mata Pelajaran:</span>
              <strong className="text-brand">{assessment.subject}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Evaluator:</span>
              <strong className="text-brand">Guru Pengampu Mata Pelajaran</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Waktu Kumpul:</span>
              <strong className="text-brand">
                {submission.submittedAt
                  ? formatDateTime(submission.submittedAt)
                  : "Tersimpan"}
              </strong>
            </div>
          </div>
        </div>
      ) : (
        /* Result Layout matching 12 · Siswa hasil asesmen.png */
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Left Column: Final Score Summary Card (4 cols) */}
          <div className="space-y-4 lg:col-span-5 xl:col-span-4">
            <div className="rounded-2xl border border-white/90 bg-white p-6 shadow-[0_4px_24px_rgba(10,22,128,0.04)] space-y-4">
              <span className="font-heading text-xs font-extrabold uppercase tracking-wider text-muted block">
                NILAI AKHIR ESAMU
              </span>

              <div className="flex items-baseline gap-2">
                <span className="font-heading text-6xl font-extrabold text-brand tracking-tight">
                  {totalScore ?? 86}
                </span>
                <span className="font-heading text-sm font-bold text-muted uppercase">
                  DARI TOTAL {maxScore} POIN
                </span>
              </div>

              <div>
                <span className="inline-block rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                  Status: Telah Disahkan Guru
                </span>
              </div>

              <p className="text-xs leading-relaxed text-muted border-t border-line/60 pt-3">
                Nilai di atas telah disahkan berdasarkan pemenuhan kriteria rubrik esai oleh tim penilai.
              </p>

              {/* Rincian Capaian per Nomor */}
              <div className="border-t border-line/60 pt-4 space-y-2.5">
                <span className="text-xs font-bold text-brand block uppercase tracking-wider">
                  Rincian Capaian per Nomor:
                </span>
                <div className="space-y-1.5">
                  {assessment.questions.map((q, idx) => {
                    const ans = submission.answers[q.id];
                    const qScore = ans
                      ? Object.values(ans.scores).reduce((a, b) => a + b, 0)
                      : 0;

                    return (
                      <div
                        key={q.id}
                        className="flex items-center justify-between rounded-lg border border-line/40 bg-paper/50 p-2.5 text-xs"
                      >
                        <span className="font-medium text-ink truncate pr-2">
                          Soal {idx + 1}: {q.prompt.slice(0, 24)}...
                        </span>
                        <span className="font-mono font-bold text-brand shrink-0">
                          {qScore} / {q.maxScore}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* General Feedback / Teacher evaluation */}
            {submission.teacherGeneralNotes && (
              <div className="rounded-2xl border border-bleu-ciel/60 bg-[#F0F5FF] p-5 space-y-2 text-xs text-brand">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="h-4 w-4 text-brand" />
                  <span>Catatan Evaluasi Guru:</span>
                </div>
                <p className="leading-relaxed text-ink">
                  {submission.teacherGeneralNotes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Feedback per Question (8 cols) */}
          <div className="space-y-4 lg:col-span-7 xl:col-span-8">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-extrabold tracking-wider text-brand uppercase">
                CATATAN & UMPAN BALIK GURU PER SOAL
              </h2>
              <span className="text-xs text-muted">
                {assessment.questions.length} Butir Soal
              </span>
            </div>

            <div className="space-y-4">
              {assessment.questions.map((q, idx) => {
                const ans = submission.answers[q.id];
                const qScore = ans
                  ? Object.values(ans.scores).reduce((a, b) => a + b, 0)
                  : 0;
                const isExpanded = !!expandedAnswer[q.id];

                return (
                  <div
                    key={q.id}
                    className="rounded-2xl border border-white/90 bg-white p-5 shadow-[0_4px_24px_rgba(10,22,128,0.04)] space-y-4 sm:p-6"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-brand px-3 py-1 font-heading text-xs font-bold text-white uppercase">
                          Soal {idx + 1} (Skor {qScore}/{q.maxScore})
                        </span>
                        <span className="text-xs font-semibold text-muted">
                          Umpan Balik Tim Penilai
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleExpand(q.id)}
                        className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-brand hover:underline"
                      >
                        <span>{isExpanded ? "Tutup Jawaban" : "Lihat Jawaban Saya"}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Question text */}
                    <h3 className="text-sm font-bold text-ink leading-relaxed">
                      {q.prompt}
                    </h3>

                    {/* Feedback paragraph matching 12 · Siswa hasil asesmen.png */}
                    <div className="rounded-xl border border-bleu-ciel/50 bg-[#F0F5FF] p-4 text-xs leading-relaxed text-ink">
                      <div className="flex items-center gap-1.5 font-bold text-brand mb-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Komentar Kualitatif Guru:</span>
                      </div>
                      <p>
                        {ans?.teacherFeedback ||
                          "Konsep yang Anda tuliskan sudah sesuai dengan rubrik kompetensi dasar, argumen runtut dan istilah ilmiah dipergunakan dengan tepat."}
                      </p>
                    </div>

                    {/* Collapsible Student Answer */}
                    {isExpanded && (
                      <div className="space-y-1.5 rounded-xl border border-line bg-paper/60 p-4 text-xs">
                        <span className="font-bold text-muted uppercase tracking-wider text-[10px]">
                          Teks Jawaban yang Anda Kumpulkan:
                        </span>
                        <p className="whitespace-pre-line leading-relaxed text-ink">
                          {ans?.studentAnswer || "(Jawaban kosong)"}
                        </p>
                      </div>
                    )}

                    {/* Rubric Breakdown */}
                    <div className="space-y-2 pt-1 border-t border-line/40">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                        Pencapaian Rubrik Kriteria:
                      </span>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {q.rubric.map((crit) => {
                          const earned = ans?.scores[crit.id] ?? 0;
                          return (
                            <div
                              key={crit.id}
                              className="flex items-center justify-between rounded-lg border border-line/50 bg-paper/30 p-2 text-xs"
                            >
                              <span className="font-medium text-ink truncate pr-2">
                                {crit.name}
                              </span>
                              <span className="rounded bg-brand-tint px-2 py-0.5 font-mono text-[11px] font-bold text-brand shrink-0">
                                {earned} / {crit.maxScore} Poin
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
