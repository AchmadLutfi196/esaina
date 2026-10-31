"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Target,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDueDate } from "@/lib/utils";
import {
  ASSESSMENT_STATUS_LABEL,
  WORK_STATUS_LABEL,
  type Assessment,
  type ClassItem,
} from "@/types";

export function StudentDashboard({
  user,
  classes,
  assessments,
}: {
  user: { name: string; role: string };
  classes: ClassItem[];
  assessments: Assessment[];
}) {
  const available = assessments.filter((a) => a.status === "active");
  const published = assessments.filter(
    (a) => a.publicationStatus === "published" && a.status === "completed"
  );

  const mySubmissions = assessments.flatMap((a) =>
    a.submissions
      .filter((s) => s.statusWork === "submitted")
      .map((s) => ({ assessment: a, submission: s }))
  );

  const graded = mySubmissions.filter((s) => s.submission.statusGrading === "final");
  const avgScore =
    graded.length > 0
      ? Math.round(
          graded.reduce((sum, g) => {
            const total = Object.values(g.submission.answers).reduce(
              (acc, a) => acc + Object.values(a.scores).reduce((x, y) => x + y, 0),
              0
            );
            return sum + total;
          }, 0) / graded.length
        )
      : 0;

  return (
    <div className="animate-fade-up space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-forest p-6 text-white shadow-md sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-bleu-ciel/25 blur-3xl"
        />
        <div className="relative z-10 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div className="max-w-md space-y-3">
            <p className="text-[11px] font-bold tracking-[0.16em] text-butter-yellow uppercase">
              Ruang belajar Anda
            </p>
            <h2 className="font-heading text-2xl leading-tight font-bold tracking-tight sm:text-3xl">
              Halo, {user.name.split(" ")[0]}!
            </h2>
            <p className="text-sm leading-relaxed text-mist">
              Kerjakan asesmen esai, pantau tenggat, dan lihat umpan balik guru
              lengkap dengan rincian skor per kriteria rubrik.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link href="/classes">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-forest shadow-sm transition-colors hover:bg-emerald-50">
                  <BookOpen className="h-3.5 w-3.5" />
                  Buka Kelas
                </span>
              </Link>
              <Link href="/join">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-white/20">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Gabung Kelas
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="space-y-3 border-brand-line/40 bg-brand-tint/70">
          <span className="flex items-center gap-2 text-xs font-semibold text-brand">
            <FileText className="h-4 w-4" />
            Asesmen Aktif
          </span>
          <span className="nums block text-3xl font-extrabold tracking-tight text-brand">
            {available.length}
          </span>
          <p className="text-xs font-medium text-brand/80">Siap dikerjakan</p>
        </Card>

        <Card className="space-y-3 border-[#0B3E7F]/25 bg-[#E7EFFB]">
          <span className="flex items-center gap-2 text-xs font-semibold text-[#0B3E7F]">
            <CheckCircle2 className="h-4 w-4" />
            Sudah Dikumpulkan
          </span>
          <span className="nums block text-3xl font-extrabold tracking-tight text-[#0B3E7F]">
            {mySubmissions.length}
          </span>
          <p className="text-xs font-medium text-[#0B3E7F]/80">Menunggu atau sudah dinilai</p>
        </Card>

        <Card className="space-y-3 border-[#4C1D95]/25 bg-[#F0EAFE]">
          <span className="flex items-center gap-2 text-xs font-semibold text-[#4C1D95]">
            <Trophy className="h-4 w-4" />
            Rata-rata Nilai
          </span>
          <span className="nums block text-3xl font-extrabold tracking-tight text-[#4C1D95]">
            {graded.length > 0 ? avgScore : "—"}
          </span>
          <p className="text-xs font-medium text-[#4C1D95]/80">
            {graded.length} asesmen dinilai
          </p>
        </Card>

        <Card className="space-y-3 border-[#7A4C05]/25 bg-[#FDF2E0]">
          <span className="flex items-center gap-2 text-xs font-semibold text-[#7A4C05]">
            <BookOpen className="h-4 w-4" />
            Kelas Diikuti
          </span>
          <span className="nums block text-3xl font-extrabold tracking-tight text-[#7A4C05]">
            {classes.length}
          </span>
          <p className="text-xs font-medium text-[#7A4C05]/80">Kelas terdaftar</p>
        </Card>
      </section>

      {/* Available assessments */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-bold text-ink">Asesmen untuk Dikerjakan</h3>
          <Link
            href="/classes"
            className="flex items-center gap-1 text-xs font-medium text-muted hover:text-ink"
          >
            Lihat semua asesmen
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {available.length === 0 ? (
          <Card className="p-8 text-center">
            <Target className="mx-auto mb-2 h-8 w-8 text-line" />
            <p className="text-xs text-muted">
              Belum ada asesmen aktif. Gabung kelas dengan kode dari guru Anda.
            </p>
            <Link href="/join" className="mt-3 inline-block">
              <Button size="sm">Gabung Kelas</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {available.map((a) => {
              const mine = a.submissions.find((s) => s.statusWork !== "not_started");
              const done = mine?.statusWork === "submitted";
              return (
                <Card key={a.id} className="flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge status={ASSESSMENT_STATUS_LABEL[a.status]} />
                      <span className="font-mono text-[10px] font-bold text-muted">
                        {a.code}
                      </span>
                    </div>
                    <h4 className="mt-2 text-sm font-bold break-words text-ink">
                      {a.title}
                    </h4>
                    <p className="text-xs text-muted">
                      {a.subject} • {a.className}
                    </p>
                  </div>

                  <dl className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-lg bg-white/70 p-2">
                      <dt className="flex items-center gap-1 text-muted">
                        <FileText className="h-3 w-3" /> Soal
                      </dt>
                      <dd className="nums font-bold text-ink">{a.questions.length}</dd>
                    </div>
                    <div className="rounded-lg bg-white/70 p-2">
                      <dt className="flex items-center gap-1 text-muted">
                        <Clock className="h-3 w-3" /> Durasi
                      </dt>
                      <dd className="nums font-bold text-ink">
                        {a.durationMinutes} mnt
                      </dd>
                    </div>
                  </dl>

                  <div className="space-y-2">
                    <p className="flex items-center gap-1 text-[11px] text-muted">
                      <Calendar className="h-3 w-3" />
                      Tenggat: {formatDueDate(a.dueDate)}
                    </p>
                    <Link href={`/assessments/${a.id}/take`}>
                      <Button size="sm" className="w-full" variant={done ? "secondary" : "primary"}>
                        {done ? "Lihat Jawaban Saya" : mine ? "Lanjutkan Mengerjakan" : "Mulai Mengerjakan"}
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Published results */}
      {published.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-base font-bold text-ink">Hasil Terbit</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {published.map((a) => {
              const mine = a.submissions.find((s) => s.publishedScore !== null);
              return (
                <Link key={a.id} href={`/assessments/${a.id}/result`}>
                  <Card className="flex items-center justify-between gap-3 transition-colors hover:border-brand-line">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{a.title}</p>
                      <p className="text-xs text-muted">
                        {a.subject} • {a.className}
                      </p>
                      <p className="mt-1 text-[11px] text-muted">
                        {mine ? WORK_STATUS_LABEL[mine.statusWork] : "Sudah diterbitkan"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="nums text-2xl font-extrabold text-brand">
                        {mine?.publishedScore ?? "—"}
                      </p>
                      <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
                        Nilai
                      </p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
