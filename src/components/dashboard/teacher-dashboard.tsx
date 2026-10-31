"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  FileText,
  NotebookPen,
  Scale,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDueDate, cn } from "@/lib/utils";
import { ASSESSMENT_STATUS_LABEL, type Assessment, type ClassItem } from "@/types";

interface PendingGradingTask {
  id: string;
  title: string;
  subject: string;
  className: string;
  submissionCount: number;
  dueDate: string;
}

export function TeacherDashboard({
  user,
  stats,
  classes,
  assessments,
  pendingTasks = [],
}: {
  user: { name: string; role: string };
  stats: {
    total: number;
    active: number;
    completed: number;
    pendingGrading: number;
    progressPercent: number;
  };
  classes: ClassItem[];
  assessments: Assessment[];
  pendingTasks?: PendingGradingTask[];
}) {
  const tasks = pendingTasks;
  const activeAssessments = assessments.filter((a) => a.status === "active");
  const displayAssessments = (activeAssessments.length > 0 ? activeAssessments : assessments).slice(0, 4);

  // Generate week calendar items around today
  const daysOfWeek = [
    { day: "Sen", date: 23, isToday: false },
    { day: "Sel", date: 24, isToday: false },
    { day: "Rab", date: 25, isToday: true },
    { day: "Kam", date: 26, isToday: false },
    { day: "Jum", date: 27, isToday: false },
    { day: "Sab", date: 28, isToday: false },
    { day: "Min", date: 29, isToday: false },
  ];

  return (
    <div className="animate-fade-up space-y-6">
      {/* Top Section: Header & Week Calendar (matching 02 · Guru dasbor.png) */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/80 bg-white/85 p-6 shadow-[0_4px_24px_rgba(10,22,128,0.04)] backdrop-blur-md md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-extrabold tracking-wide text-brand sm:text-3xl">
            RUANG PENILAIAN ANDA
          </h1>
          <p className="text-xs text-muted sm:text-sm">
            Buat asesmen, tinjau jawaban siswa, dan selesaikan penilaian bersama secara konsisten.
          </p>
        </div>

        {/* Calendar Widget */}
        <div className="flex flex-col items-start gap-1.5 rounded-xl border border-line/60 bg-paper/60 p-3 sm:items-end">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted">
            <Calendar className="h-3.5 w-3.5 text-brand" />
            <span>Kalender pekan ini · 25 Oktober 2026</span>
          </div>
          <div className="flex items-center gap-1">
            {daysOfWeek.map((d) => (
              <div
                key={d.day}
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg px-2.5 py-1 text-center transition-all",
                  d.isToday
                    ? "bg-brand text-white shadow-xs font-bold"
                    : "text-muted hover:bg-white"
                )}
              >
                <span className="text-[9px] uppercase tracking-wider">{d.day}</span>
                <span className="font-mono text-xs font-bold">{d.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metric KPI Cards (matching 02 · Guru dasbor.png) */}
      <section
        aria-label="Metrik Ruang Penilaian"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {/* Total Asesmen */}
        <div className="rounded-2xl border border-white/90 bg-white p-5 shadow-[0_4px_24px_rgba(10,22,128,0.04)] transition-all hover:shadow-md">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 font-bold text-brand">
              <FileText className="h-4 w-4" />
              Total Asesmen
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
              Aktif
            </span>
          </div>
          <div className="mt-3">
            <span className="font-heading text-4xl font-extrabold text-brand">
              {stats.total}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">Asesmen esai terdaftar</p>
        </div>

        {/* Progres Selesai */}
        <div className="rounded-2xl border border-white/90 bg-white p-5 shadow-[0_4px_24px_rgba(10,22,128,0.04)] transition-all hover:shadow-md">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 font-bold text-brand">
              <TrendingUp className="h-4 w-4" />
              Progres Selesai
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
              Aktif
            </span>
          </div>
          <div className="mt-3">
            <span className="font-heading text-4xl font-extrabold text-brand">
              {stats.progressPercent}%
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">Asesmen telah dinilai penuh</p>
        </div>

        {/* Tugas Penilaian */}
        <div className="rounded-2xl border border-white/90 bg-white p-5 shadow-[0_4px_24px_rgba(10,22,128,0.04)] transition-all hover:shadow-md">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 font-bold text-brand">
              <Scale className="h-4 w-4" />
              Tugas Penilaian
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
              Aktif
            </span>
          </div>
          <div className="mt-3">
            <span className="font-heading text-4xl font-extrabold text-brand">
              {stats.pendingGrading}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">Jawaban menunggu skor Anda</p>
        </div>
      </section>

      {/* Main Content Grid: Asesmen Aktif (Left) & Tugas Sebagai Penilai (Right) */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Column: Asesmen Aktif (7 cols) */}
        <section className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="font-heading text-base font-extrabold tracking-wider text-brand uppercase">
                ASESMEN AKTIF
              </h2>
              <span className="rounded-full border border-brand-line/50 bg-brand-tint px-2.5 py-0.5 text-xs font-bold text-brand">
                {activeAssessments.length || displayAssessments.length} Asesmen
              </span>
            </div>
            <Link
              href="/assessments"
              className="flex items-center gap-1 text-xs font-semibold text-brand transition-colors hover:text-brand-dark"
            >
              <span>Lihat semua</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {displayAssessments.length === 0 ? (
            <div className="rounded-2xl border border-white/80 bg-white p-8 text-center shadow-xs">
              <p className="text-xs text-muted">Belum ada asesmen yang dibuat.</p>
              <Link href="/assessments/new" className="mt-3 inline-block">
                <Button size="sm">Buat Asesmen Pertama</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {displayAssessments.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-white/90 bg-white p-5 shadow-[0_4px_20px_rgba(10,22,128,0.03)] transition-all hover:border-brand-line hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/50 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                        AKTIF
                      </span>
                      <span className="rounded-md border border-line bg-paper px-2 py-0.5 font-mono text-[10px] font-bold text-brand">
                        Kode: {a.code}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-muted">
                      Tenggat: {formatDueDate(a.dueDate)}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-heading text-lg font-bold text-ink">
                      {a.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted">
                      {a.subject} · {a.questions.length} Soal · {a.className} · {a.durationMinutes} menit pengumpulan
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-line/40 pt-3">
                    <div className="text-xs text-muted">
                      <span className="font-bold text-ink">
                        {a.submissions.filter((s) => s.statusWork === "submitted").length}
                      </span>{" "}
                      LJK terkumpul
                    </div>

                    <Link href={`/grading`}>
                      <Button size="sm" className="gap-1.5 rounded-xl bg-brand font-bold text-white hover:bg-brand-dark">
                        <span>Buka Ruang Penilaian</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Antrean Penilaian Guru (5 cols) */}
        <section className="space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-extrabold tracking-wider text-brand uppercase">
              ANTREAN PENILAIAN
            </h2>
            <span className="rounded-full border border-line bg-paper px-2 py-0.5 text-xs font-bold text-muted">
              {tasks.length} Asesmen
            </span>
          </div>

          <div className="rounded-2xl border border-white/90 bg-white p-5 shadow-[0_4px_24px_rgba(10,22,128,0.04)]">
            {tasks.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted">
                Tidak ada tugas penilaian tertunda untuk kelas Anda saat ini.
              </p>
            ) : (
              <ul className="divide-y divide-line/40">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <h4 className="truncate text-xs font-bold text-ink">
                        {task.title}
                      </h4>
                      <p className="truncate text-[11px] text-muted">
                        {task.subject} - {task.className} · {task.submissionCount > 0 ? `${task.submissionCount} LJK siap dinilai` : "Belum ada LJK terkumpul"}
                      </p>
                    </div>

                    <Link href={`/grading/${task.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg border-line px-3 text-xs font-semibold hover:border-brand hover:text-brand"
                      >
                        Nilai
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick Create CTA Card */}
          <div className="rounded-2xl border border-bleu-ciel/40 bg-gradient-to-br from-[#060E59] to-[#0A1680] p-5 text-white shadow-md">
            <h3 className="font-heading text-base font-extrabold text-white">
              Buat Asesmen Esai Baru
            </h3>
            <p className="mt-1 text-xs text-mist">
              Rancang pertanyaan esai, tentukan kunci jawaban acuan, dan tentukan rubrik kriteria ganda.
            </p>
            <Link href="/assessments/new" className="mt-4 inline-block">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-brand shadow-xs hover:bg-paper">
                <NotebookPen className="h-3.5 w-3.5" />
                <span>Mulai Buat Asesmen</span>
              </span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
