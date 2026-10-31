"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  FileText,
  Inbox,
  NotebookPen,
  Scale,
  TrendingUp,
} from "lucide-react";
import { formatDueDate, cn } from "@/lib/utils";
import { ClayGraphic } from "@/components/ui/clay-graphic";
import type { Assessment, ClassItem } from "@/types";

interface RaterAssignment {
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
  raterAssignments,
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
  raterAssignments: RaterAssignment[];
}) {
  const activeAssessments = assessments.filter((a) => a.status === "active");
  const highlighted = (activeAssessments.length > 0 ? activeAssessments : assessments).slice(0, 3);
  const upcoming = [...activeAssessments]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const today = new Date();

  return (
    <div className="animate-fade-up grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
      {/* Kolom Kiri: Hero, 3 Kartu Metrik, Asesmen Aktif, Tugas sebagai Penilai (8 cols) */}
      <div className="space-y-6 xl:col-span-8">
        {/* 1. Hero Banner */}
        <section className="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl bg-[#1E3A2F] p-6 text-white shadow-md sm:flex-row sm:items-center sm:p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-[#93B2F8]/20 blur-3xl"
          />
          <div className="relative z-10 max-w-md space-y-3">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Ruang penilaian Anda
            </h2>
            <p className="text-sm leading-relaxed text-[#CFE3DE]">
              Buat asesmen, tinjau jawaban siswa, dan selesaikan penilaian bersama tim guru.
            </p>
            <Link href="/assessments/new" className="inline-block pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-[#1E3A2F] shadow-sm transition-colors hover:bg-emerald-50">
                <NotebookPen className="h-3.5 w-3.5" />
                Buat Asesmen Baru
              </span>
            </Link>
          </div>

          <div className="relative z-10 hidden sm:block shrink-0">
            <ClayGraphic variant="hero" className="h-28 w-36" />
          </div>
        </section>

        {/* 2. 3 Metric Cards (Toska, Biru, Ungu Pastel) */}
        <section
          aria-label="Ringkasan asesmen"
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {/* Card 1: Total Asesmen */}
          <Link
            href="/assessments"
            className="rounded-2xl border border-[#B8E2D8] bg-[#E6F4F1] p-5 shadow-xs transition-transform hover:-translate-y-0.5 space-y-2 block"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[#0D523C]">
              <span className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                Total Asesmen
              </span>
              <span className="rounded-full border border-[#0D523C]/20 bg-white/75 px-2.5 py-0.5 text-xs font-bold text-[#0D523C]">
                {stats.active || 1} Aktif
              </span>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-[#0D523C]">
                {stats.total || 5}
              </span>
            </div>
            <p className="text-xs font-medium text-[#0D523C]/80">
              Asesmen esai terdaftar
            </p>
          </Link>

          {/* Card 2: Progres Selesai */}
          <Link
            href="/assessments?status=completed"
            className="rounded-2xl border border-[#C5DCFC] bg-[#EBF3FE] p-5 shadow-xs transition-transform hover:-translate-y-0.5 space-y-2 block"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[#1E40AF]">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                Progres Selesai
              </span>
              <span className="rounded-full border border-[#1E40AF]/20 bg-white/75 px-2.5 py-0.5 text-xs font-bold text-[#1E40AF]">
                {stats.completed}/{stats.total || 5}
              </span>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-[#1E40AF]">
                {stats.progressPercent || 60}%
              </span>
            </div>
            <p className="text-xs font-medium text-[#1E40AF]/80">
              Asesmen telah dinilai penuh
            </p>
          </Link>

          {/* Card 3: Tugas Penilaian */}
          <div className="rounded-2xl border border-[#DDD0F7] bg-[#F3E8FF] p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#5B21B6]">
              <span className="flex items-center gap-1.5">
                <Scale className="h-4 w-4" />
                Tugas Penilaian
              </span>
              <span className="rounded-full border border-[#5B21B6]/20 bg-white/75 px-2.5 py-0.5 text-xs font-bold text-[#5B21B6]">
                Multi-Rater
              </span>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-[#5B21B6]">
                {raterAssignments.length}
              </span>
            </div>
            <p className="text-xs font-medium text-[#5B21B6]/80">
              Jawaban menunggu skor Anda
            </p>
          </div>
        </section>

        {/* 3. Asesmen Aktif */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-ink">Asesmen Aktif</h3>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                {activeAssessments.length || highlighted.length} Asesmen
              </span>
            </div>
            <Link
              href="/assessments"
              className="flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-ink"
            >
              <span>Lihat semua</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {highlighted.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-xs">
              <p className="text-xs text-muted">Belum ada asesmen yang dibuat.</p>
              <Link href="/assessments/new" className="mt-3 inline-block">
                <span className="inline-flex rounded-xl bg-[#1E3A2F] px-4 py-2 text-xs font-bold text-white shadow-xs">
                  Buat Asesmen Pertama
                </span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {highlighted.map((a) => (
                <Link
                  key={a.id}
                  href={`/grading/${a.id}`}
                  className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-xs transition-all hover:border-[#1E3A2F] hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-700">
                        {a.code}
                      </span>
                      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                        AKTIF
                      </span>
                    </div>

                    <h4 className="mt-2.5 truncate text-sm font-bold text-ink">
                      {a.title}
                    </h4>
                    <p className="text-xs text-muted">
                      {a.subject} • {a.questions.length} Soal
                    </p>
                  </div>

                  <div className="my-2 flex justify-center py-1">
                    <ClayGraphic variant="essay" className="h-16 w-20" />
                  </div>

                  <div className="space-y-1.5 border-t border-gray-100 pt-2.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#1E3A2F]"
                        style={{
                          width: `${
                            a.status === "completed" ? 100 : a.status === "active" ? 60 : 20
                          }%`,
                        }}
                      />
                    </div>
                    <span className="block text-[11px] text-muted truncate">
                      {a.className} • {a.durationMinutes} menit • {a.submissions.filter((s) => s.statusWork === "submitted").length} pengumpulan
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 4. Tugas sebagai Penilai */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
          <div className="mb-3 flex items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-ink">Tugas sebagai Penilai</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              {raterAssignments.length} Asesmen
            </span>
          </div>

          {raterAssignments.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted">
              Anda belum memiliki tugas penilai tertunda saat ini.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {raterAssignments.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-4 py-3.5 first:pt-1 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">
                      {task.title}
                    </p>
                    <p className="text-xs text-muted">
                      {task.subject} • {task.className}
                    </p>
                  </div>

                  <div className="hidden sm:block text-xs text-muted">
                    {task.submissionCount > 0
                      ? `${task.submissionCount} jawaban menunggu skor`
                      : "Tidak ada jawaban tertunda"}
                  </div>

                  <Link
                    href={`/grading/${task.id}`}
                    className="shrink-0 rounded-lg bg-[#E6F4F1] hover:bg-[#D4EFE9] text-[#0D523C] px-3.5 py-1.5 text-xs font-semibold transition-colors"
                  >
                    Lihat jawaban
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Kolom Kanan: Kalender Pekan Ini, Tenggat Terdekat, Kelas Anda (4 cols) */}
      <div className="space-y-6 xl:col-span-4">
        {/* 1. Widget Kalender */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-heading text-2xl font-extrabold tracking-tight text-ink">
              {new Intl.DateTimeFormat("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(today)}
            </h3>
            <span className="text-xs font-medium text-muted">Kalender pekan ini</span>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-semibold tracking-tight text-muted">
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Kapsul Kalender Hijau Forest */}
          <div className="rounded-full bg-[#1E3A2F] py-2 px-3 text-white shadow-inner">
            <div className="grid grid-cols-7 items-center text-center text-xs font-bold">
              {Array.from({ length: 7 }).map((_, offset) => {
                const day = new Date(today);
                const dayOfWeek = (today.getDay() + 6) % 7; // Monday = 0
                day.setDate(today.getDate() - dayOfWeek + offset);
                const isToday = day.toDateString() === today.toDateString();
                return isToday ? (
                  <span
                    key={offset}
                    className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#1E3A2F] shadow-xs"
                  >
                    {day.getDate()}
                  </span>
                ) : (
                  <span key={offset} className="opacity-90">
                    {day.getDate()}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
            <Link
              href="/assessments"
              className="flex items-center gap-1.5 text-xs font-semibold text-ink transition-colors hover:text-[#1E3A2F]"
            >
              <FileText className="h-3.5 w-3.5" />
              Kelola Asesmen
            </Link>
            <Link href="/assessments/new">
              <span className="flex items-center gap-1.5 rounded-full bg-[#1E3A2F] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#152A22]">
                <NotebookPen className="h-3.5 w-3.5" />
                Buat Baru
              </span>
            </Link>
          </div>
        </div>

        {/* 2. Tenggat Asesmen Terdekat */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-ink">Tenggat Asesmen Terdekat</h4>
            <Link
              href="/assessments"
              className="text-xs text-muted hover:text-ink transition-colors"
            >
              Lihat semua &gt;
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="py-6 text-center">
              <Inbox className="mx-auto mb-1.5 h-6 w-6 text-line" />
              <p className="text-xs text-muted">
                Tidak ada tenggat asesmen aktif saat ini.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((a) => (
                <Link
                  key={a.id}
                  href={`/grading/${a.id}`}
                  className="block rounded-xl border border-gray-100 bg-slate-50/70 p-3 shadow-2xs transition-colors hover:bg-slate-100/80 space-y-1"
                >
                  <h5 className="truncate text-xs font-bold text-ink">
                    {a.title}
                  </h5>
                  <p className="flex items-center gap-1.5 text-xs text-muted">
                    <Calendar className="h-3 w-3 text-emerald-700" />
                    <span>Tenggat: {formatDueDate(a.dueDate)}</span>
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 3. Kelas Anda */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-ink">Kelas Anda</h4>
            <Link
              href="/classes"
              className="text-xs text-muted hover:text-ink transition-colors"
            >
              Semua
            </Link>
          </div>

          {classes.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted">Belum ada kelas.</p>
          ) : (
            <div className="space-y-1">
              {classes.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  href={`/classes/${c.id}`}
                  className="flex items-center gap-2.5 rounded-xl p-2 transition-colors hover:bg-slate-50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-ink">
                      {c.name}
                    </span>
                    <span className="block text-[11px] text-muted">
                      {c.studentCount} siswa • {c.assessmentCount} asesmen
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
