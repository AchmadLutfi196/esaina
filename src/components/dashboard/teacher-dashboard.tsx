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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDueDate, cn } from "@/lib/utils";
import { ASSESSMENT_STATUS_LABEL, type Assessment, type ClassItem } from "@/types";

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
      <div className="space-y-6 xl:col-span-8">
        {/* Hero */}
        <section className="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl bg-forest p-6 text-white shadow-md sm:flex-row sm:items-center sm:p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-bleu-ciel/25 blur-3xl"
          />
          <div className="relative z-10 max-w-md space-y-3">
            <h2 className="font-heading text-2xl leading-tight font-bold tracking-tight text-white sm:text-3xl">
              Ruang penilaian Anda
            </h2>
            <p className="text-sm leading-relaxed text-mist">
              Buat asesmen, tinjau jawaban siswa, dan selesaikan penilaian bersama
              tim guru.
            </p>
            <Link href="/assessments/new" className="inline-block pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-forest shadow-sm transition-colors hover:bg-emerald-50">
                <NotebookPen className="h-3.5 w-3.5" />
                Buat Asesmen Baru
              </span>
            </Link>
          </div>
        </section>

        {/* Metric cards */}
        <section
          aria-label="Ringkasan asesmen"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <Link
            href="/assessments"
            className="glass-card space-y-3 p-5 text-brand bg-gradient-to-br from-brand-tint/90 to-white/70 border-white/80 hover:border-brand-line/60 lg:col-span-2"
          >
            <span className="flex items-center gap-2 text-xs font-semibold">
              <FileText className="h-4 w-4" />
              Total Asesmen
            </span>
            <span className="flex flex-wrap items-baseline gap-2">
              <span className="nums text-3xl font-extrabold tracking-tight">
                {stats.total}
              </span>
              <span className="nums glass-pill rounded-full border border-brand-line/50 px-2 py-0.5 text-xs font-bold">
                {stats.active} Aktif
              </span>
            </span>
            <p className="text-xs font-medium text-muted">Asesmen esai terdaftar</p>
          </Link>

          <Link
            href="/assessments?status=completed"
            className="glass-card min-w-0 space-y-3 p-5 text-[#0B3E7F] bg-gradient-to-br from-[#E7EFFB]/90 to-white/70 border-white/80 hover:border-blue-400/60"
          >
            <span className="flex items-center gap-2 text-xs font-semibold">
              <TrendingUp className="h-4 w-4" />
              Progres Selesai
            </span>
            <span className="flex flex-wrap items-baseline gap-2">
              <span className="nums text-3xl font-extrabold tracking-tight">
                {stats.progressPercent}%
              </span>
              <span className="nums glass-pill rounded-full border border-[#0B3E7F]/30 px-2 py-0.5 text-xs font-bold">
                {stats.completed}/{stats.total}
              </span>
            </span>
            <p className="text-xs font-medium text-muted">Asesmen telah dinilai penuh</p>
          </Link>

          <div className="glass-card min-w-0 space-y-3 p-5 text-[#4C1D95] bg-gradient-to-br from-[#F0EAFE]/90 to-white/70 border-white/80">
            <span className="flex items-center gap-2 text-xs font-semibold">
              <Scale className="h-4 w-4" />
              Tugas Penilaian
            </span>
            <span className="flex flex-wrap items-baseline gap-2">
              <span className="nums text-3xl font-extrabold tracking-tight">
                {stats.pendingGrading}
              </span>
              <span className="glass-pill rounded-full border border-[#4C1D95]/30 px-2 py-0.5 text-xs font-bold">
                Multi-Rater
              </span>
            </span>
            <p className="text-xs font-medium text-muted">Jawaban menunggu skor Anda</p>
          </div>
        </section>

        {/* Active assessments */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-ink">Asesmen Aktif</h3>
              <span className="rounded-full border border-brand-line/50 bg-brand-tint px-2.5 py-0.5 text-xs font-semibold text-forest">
                {activeAssessments.length} Asesmen
              </span>
            </div>
            <Link
              href="/assessments"
              className="flex items-center gap-0.5 text-xs font-medium text-muted transition-colors hover:text-ink"
            >
              Lihat semua
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {highlighted.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-xs text-muted">Belum ada asesmen yang dibuat.</p>
              <Link href="/assessments/new" className="mt-3 inline-block">
                <Button size="sm">Buat Asesmen Pertama</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {highlighted.map((a) => (
                <Link
                  key={a.id}
                  href={`/assessments/${a.id}`}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-line/30 bg-white/80 p-5 shadow-xs transition-colors hover:border-brand"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md border border-brand-line/70 bg-brand-tint px-2 py-0.5 font-mono text-[10px] font-bold text-brand">
                        {a.code}
                      </span>
                      <Badge status={ASSESSMENT_STATUS_LABEL[a.status]} />
                    </div>
                    <h4 className="mt-2 text-sm font-bold break-words text-ink">
                      {a.title}
                    </h4>
                    <p className="text-xs font-medium text-muted">
                      {a.subject} • {a.questions.length} Soal
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full bg-forest"
                        style={{
                          width: `${
                            a.status === "completed" ? 100 : a.status === "active" ? 50 : 10
                          }%`,
                        }}
                      />
                    </div>
                    <span className="block text-xs font-medium text-muted">
                      {a.className} • {a.durationMinutes} menit •{" "}
                      {a.submissions.filter((s) => s.statusWork === "submitted").length}{" "}
                      pengumpulan
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Rater assignments */}
        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-ink">Tugas sebagai Penilai</h3>
            <Badge tone="neutral">{raterAssignments.length} Asesmen</Badge>
          </div>

          {raterAssignments.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted">
              Anda belum ditugaskan sebagai penilai pada asesmen manapun.
            </p>
          ) : (
            <ul className="divide-y divide-line/25">
              {raterAssignments.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {a.title}
                    </p>
                    <p className="text-xs text-muted">
                      {a.subject} • {a.className}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs font-bold text-amber-600">
                      {a.submissionCount} esai
                    </span>
                    <Link href={`/assessments/${a.id}`}>
                      <Button size="sm">Nilai</Button>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Right column */}
      <div className="space-y-6 xl:col-span-4">
        {/* Calendar */}
        <Card className="space-y-5 p-6">
          <div className="text-center sm:text-left">
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

          <div className="rounded-full bg-forest px-3 py-2 text-white shadow-inner">
            <div className="grid grid-cols-7 items-center text-center text-xs font-bold">
              {Array.from({ length: 7 }).map((_, offset) => {
                const day = new Date(today);
                const dayOfWeek = (today.getDay() + 6) % 7; // Monday = 0
                day.setDate(today.getDate() - dayOfWeek + offset);
                const isToday = day.toDateString() === today.toDateString();
                return isToday ? (
                  <span
                    key={offset}
                    className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-white text-forest shadow-xs"
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

          <div className="flex items-center justify-between gap-2 pt-1">
            <Link
              href="/assessments"
              className="flex items-center gap-1.5 text-xs font-semibold text-ink transition-colors hover:text-brand"
            >
              <FileText className="h-3.5 w-3.5" />
              Kelola Asesmen
            </Link>
            <Link href="/assessments/new">
              <span className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-forest-dark">
                <NotebookPen className="h-3.5 w-3.5" />
                Buat Baru
              </span>
            </Link>
          </div>
        </Card>

        {/* Upcoming deadlines */}
        <Card className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-ink">Tenggat Terdekat</h3>
            <Link
              href="/assessments"
              className="text-xs font-medium text-muted hover:text-ink-2"
            >
              Lihat semua
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="py-6 text-center">
              <Inbox className="mx-auto mb-1.5 h-7 w-7 text-line" />
              <p className="text-xs text-muted">
                Tidak ada tenggat asesmen aktif saat ini.
              </p>
            </div>
          ) : (
            upcoming.map((a) => (
              <Link
                key={a.id}
                href={`/assessments/${a.id}`}
                className={cn(
                  "group block space-y-2 rounded-2xl border border-line/60 bg-white/70 p-3.5 shadow-xs transition-colors hover:bg-white"
                )}
              >
                <h4 className="line-clamp-1 text-xs font-bold text-ink transition-colors group-hover:text-brand">
                  {a.title}
                </h4>
                <p className="flex items-center gap-1 text-xs text-muted">
                  <Calendar className="h-3 w-3" />
                  Tenggat: {formatDueDate(a.dueDate)}
                </p>
              </Link>
            ))
          )}
        </Card>

        {/* Classes summary */}
        <Card className="space-y-3 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink">Kelas Anda</h3>
            <Link href="/classes" className="text-xs font-medium text-muted">
              Semua
            </Link>
          </div>
          {classes.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted">Belum ada kelas.</p>
          ) : (
            classes.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                href={`/classes/${c.id}`}
                className="flex items-center gap-2.5 rounded-xl border border-transparent p-2 transition-colors hover:border-line/60 hover:bg-white/70"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
                  <BookOpen className="h-3.5 w-3.5" />
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
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
