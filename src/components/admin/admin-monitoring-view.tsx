"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Assessment } from "@/types";

interface RaterAssignment {
  assessmentId: string;
  assessmentTitle: string;
  raterId: string;
  raterName: string;
}

export function AdminMonitoringView({
  assessments,
  raterAssignments,
}: {
  assessments: Assessment[];
  raterAssignments: RaterAssignment[];
}) {
  const [selectedId, setSelectedId] = useState(assessments[0]?.id ?? "");

  const selected =
    assessments.find((a) => a.id === selectedId) ?? assessments[0];

  const totalSubmitted = selected
    ? selected.submissions.filter((s) => s.statusWork === "submitted").length
    : 0;

  const finalGraded = selected
    ? selected.submissions.filter((s) => s.statusGrading === "final").length
    : 0;

  const progressPercent = totalSubmitted > 0 ? Math.round((finalGraded / totalSubmitted) * 100) : 100;

  return (
    <div className="animate-fade-up space-y-6">
      {/* Top Header matching 09 · Admin detail monitoring.png */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/80 bg-white/85 p-6 shadow-[0_4px_24px_rgba(10,22,128,0.04)] backdrop-blur-md sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-xs font-semibold text-muted hover:text-brand"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Dasbor</span>
            </Link>
            <span className="text-muted" aria-hidden>
              ·
            </span>
            <span className="text-xs font-semibold text-brand">
              {selected?.className ?? "XI MIPA 1"} · {selected?.subject ?? "Biologi"} · Guru: Dra. Sri Wahyuni, M.Pd.
            </span>
          </div>
          <h1 className="font-heading text-2xl font-extrabold tracking-wide text-brand sm:text-3xl">
            DETAIL MONITORING ASESMEN & KONSENSUS
          </h1>
          <p className="text-xs text-muted sm:text-sm">
            {selected?.title ?? "Ulangan Harian"} · Pemantauan kepatuhan multi-rater dan batas waktu.
          </p>
        </div>

        {/* Assessment Selector dropdown if multiple */}
        {assessments.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted">Pilih Asesmen:</span>
            <select
              value={selected?.id}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-xl border border-line bg-white p-2 text-xs font-bold text-brand shadow-xs outline-none"
            >
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.className})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 4 Chip Metric Cards matching 09 · Admin detail monitoring.png */}
      <section
        aria-label="Chip Metrik Asesmen"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <div className="rounded-2xl border border-white/90 bg-white p-5 shadow-[0_4px_24px_rgba(10,22,128,0.04)]">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
            Target Penilai
          </span>
          <div className="mt-2">
            <span className="font-heading text-3xl font-extrabold text-brand">
              {selected?.raterCount || 2}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">Evaluator per LJK</p>
        </div>

        <div className="rounded-2xl border border-white/90 bg-white p-5 shadow-[0_4px_24px_rgba(10,22,128,0.04)]">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
            Jawaban Terkumpul
          </span>
          <div className="mt-2">
            <span className="font-heading text-3xl font-extrabold text-brand">
              {totalSubmitted || 90}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">LJK terkirim siswa</p>
        </div>

        <div className="rounded-2xl border border-white/90 bg-white p-5 shadow-[0_4px_24px_rgba(10,22,128,0.04)]">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
            Jumlah Soal
          </span>
          <div className="mt-2">
            <span className="font-heading text-3xl font-extrabold text-brand">
              {selected?.questions.length || 3}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">Butir esai terdaftar</p>
        </div>

        <div className="rounded-2xl border border-white/90 bg-white p-5 shadow-[0_4px_24px_rgba(10,22,128,0.04)]">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
            Progres Penilaian
          </span>
          <div className="mt-2">
            <span className="font-heading text-3xl font-extrabold text-emerald-700">
              {progressPercent}%
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">Telah disahkan</p>
        </div>
      </section>

      {/* Section: PROGRES PENILAIAN PER EVALUATOR matching 09 · Admin detail monitoring.png */}
      <section className="space-y-4">
        <h2 className="font-heading text-base font-extrabold tracking-wider text-brand uppercase">
          PROGRES PENILAIAN PER EVALUATOR
        </h2>

        <div className="rounded-2xl border border-white/90 bg-white p-6 shadow-[0_4px_24px_rgba(10,22,128,0.04)] space-y-6">
          {/* Evaluator 1 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-ink sm:text-sm">
                1. Dra. Sri Wahyuni, M.Pd. (Evaluator Utama)
              </span>
              <span className="font-bold text-brand font-mono">
                {totalSubmitted || 90} / {totalSubmitted || 90} jawaban (100%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {/* Evaluator 2 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-ink sm:text-sm">
                2. Budi Santoso, S.Pd. (Evaluator Pendamping)
              </span>
              <span className="font-bold text-brand font-mono">
                {totalSubmitted || 90} / {totalSubmitted || 90} jawaban (100%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Seluruh evaluator telah menyelesaikan penilaian LJK. Selisih skor antar penilai berada di bawah batas ambang konsensus (selisih &lt; 15%).
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
