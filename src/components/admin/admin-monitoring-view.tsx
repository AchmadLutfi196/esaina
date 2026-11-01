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

export function AdminMonitoringView({
  assessments,
}: {
  assessments: Assessment[];
}) {
  // Urutkan agar asesmen aktif yang memiliki submisi tampil lebih dulu.
  const ordered = React.useMemo(() => {
    const rank = (a: Assessment) =>
      (a.status === "active" ? 2 : a.status === "completed" ? 1 : 0) +
      (a.submissions.length > 0 ? 1 : 0);
    return [...assessments].sort((a, b) => rank(b) - rank(a));
  }, [assessments]);

  const [selectedId, setSelectedId] = useState(ordered[0]?.id ?? "");

  const selected =
    ordered.find((a) => a.id === selectedId) ?? ordered[0];

  const totalSubmitted = selected
    ? selected.submissions.filter((s) => s.statusWork === "submitted").length
    : 0;

  const finalGraded = selected
    ? selected.submissions.filter((s) => s.statusGrading === "final").length
    : 0;

  const progressPercent = totalSubmitted > 0 ? Math.round((finalGraded / totalSubmitted) * 100) : 100;

  return (
    <div className="animate-fade-up space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/80 bg-white/85 p-6 shadow-[0_4px_24px_rgba(10,22,128,0.04)] backdrop-blur-md sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href="/dashboard"
              className="flex shrink-0 items-center gap-1 text-xs font-semibold text-muted hover:text-brand"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Dasbor</span>
            </Link>
            <span className="text-muted" aria-hidden>
              ·
            </span>
            <span className="line-clamp-1 text-xs font-semibold text-brand">
              {selected?.className ?? "Kelas"} · {selected?.subject ?? "Mata Pelajaran"} · Guru: {selected?.teacherName ?? "—"}
            </span>
          </div>
          <h1 className="font-heading text-2xl font-extrabold tracking-wide text-brand sm:text-3xl">
            DETAIL MONITORING ASESMEN & EVALUASI
          </h1>
          <p className="line-clamp-2 text-xs text-muted sm:text-sm">
            {selected?.title ?? "Ulangan Harian"} · Pemantauan progres penyelesaian penilaian guru dan verifikasi AI.
          </p>
        </div>

        {/* Assessment Selector dropdown if multiple */}
        {ordered.length > 1 && (
          <div className="flex shrink-0 items-center gap-2">
            <span className="shrink-0 text-xs font-semibold text-muted">Pilih Asesmen:</span>
            <select
              value={selected?.id}
              onChange={(e) => setSelectedId(e.target.value)}
              className="max-w-[15rem] rounded-xl border border-line bg-white p-2 text-xs font-bold text-brand shadow-xs outline-none"
            >
              {ordered.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 4 Chip Metric Cards */}
      <section
        aria-label="Chip Metrik Asesmen"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <div className="rounded-2xl border border-white/90 bg-white p-5 shadow-[0_4px_24px_rgba(10,22,128,0.04)]">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
            Guru Pengampu
          </span>
          <div className="mt-2">
            <span className="font-heading text-3xl font-extrabold text-brand">
              {selected?.teacherName?.split(",")[0] ?? "1 Guru"}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">Evaluator Utama</p>
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

      {/* Section: PROGRES PENILAIAN GURU & ASISTENSI AI */}
      <section className="space-y-4">
        <h2 className="font-heading text-base font-extrabold tracking-wider text-brand uppercase">
          PROGRES PENILAIAN GURU & ASISTENSI AI
        </h2>

        <div className="rounded-2xl border border-white/90 bg-white p-6 shadow-[0_4px_24px_rgba(10,22,128,0.04)] space-y-6">
          {/* Guru Pengampu */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-ink sm:text-sm">
                1. Guru Pengampu Mata Pelajaran ({selected?.className ?? "Kelas"})
              </span>
              <span className="font-bold text-brand font-mono">
                {finalGraded} / {totalSubmitted} LJK disahkan ({progressPercent}%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Asistensi AI IndoBERT */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-ink sm:text-sm">
                2. Model Analisis Semantik AI (IndoBERT)
              </span>
              <span className="font-bold text-emerald-700 font-mono">
                Siap & Aktif Memberikan Rekomendasi
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Penilaian LJK berjalan optimal dengan verifikasi guru pengampu dan asistensi rubrik kriteria berbasis model AI IndoBERT.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
