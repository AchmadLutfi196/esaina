"use client";

import React from "react";
import Link from "next/link";
import {
  Brain,
  Building2,
  ChartColumn,
  FileText,
  Users,
  GraduationCap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui/table";
import { ASSESSMENT_STATUS_LABEL, type Assessment } from "@/types";

export function AdminDashboard({
  user,
  stats,
  assessments,
}: {
  user: { name: string; role: string };
  stats: {
    teachers: number;
    students: number;
    activeAssessments: number;
    totalAssessments: number;
  };
  assessments: Assessment[];
}) {
  const kpis = [
    {
      label: "Total Guru",
      value: stats.teachers,
      sub: "Guru Evaluator",
      foot: "Peran Penilai",
      tone: "brand" as const,
      icon: Users,
      href: "/admin/users?role=teacher",
    },
    {
      label: "Total Siswa",
      value: stats.students,
      sub: "Siswa Terdaftar",
      foot: "Peserta Asesmen",
      tone: "purple" as const,
      icon: GraduationCap,
      href: "/admin/users?role=student",
    },
    {
      label: "Asesmen Aktif",
      value: stats.activeAssessments,
      sub: "Sedang Berjalan",
      foot: `${stats.totalAssessments} Total Paket`,
      tone: "blue" as const,
      icon: FileText,
      href: "/assessments?status=active",
    },
    {
      label: "Mesin AI IndoBERT",
      value: "Aktif",
      sub: "Rekomendasi tersedia",
      foot: "Skor referensi",
      tone: "amber" as const,
      icon: Brain,
      href: "/admin/monitoring",
    },
  ];

  const toneClass = {
    brand: "border-brand-line/40 bg-brand-tint text-brand",
    purple: "border-purple-500/25 bg-[#F0EAFE] text-[#4C1D95]",
    blue: "border-blue-500/25 bg-[#E7EFFB] text-[#0B3E7F]",
    amber: "border-amber-500/25 bg-[#FDF2E0] text-[#7A4C05]",
  } as const;

  return (
    <div className="animate-fade-up space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-forest p-6 text-white shadow-lg sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -bottom-10 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/3 h-60 w-60 rounded-full bg-amber-500/10 blur-2xl"
        />

        <div className="relative z-10 max-w-xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[11px] font-bold tracking-wide text-emerald-300 uppercase backdrop-blur-md">
              Panel Administrator &amp; Kurikulum
            </span>
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-medium text-emerald-200">
              <span className="h-2 w-2 animate-pulse-dot rounded-full bg-emerald-400" />
              Sistem Multi-Rater Aktif
            </span>
          </div>

          <h1 className="font-heading text-2xl leading-snug font-extrabold tracking-tight text-white sm:text-3xl">
            Dasbor Admin — Monitoring Konsensus Multi-Rater
          </h1>

          <p className="text-sm leading-relaxed text-brand-tint">
            Kelola akun guru dan siswa, pantau alokasi penilai per asesmen, serta
            verifikasi konsistensi penilaian esai lintas penilai.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/admin/users"
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-accent/25 transition-colors hover:bg-accent-dark"
            >
              <Users className="h-4 w-4" />
              Kelola Pengguna ({stats.teachers + stats.students})
            </Link>
            <Link
              href="/assessments"
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/25"
            >
              <FileText className="h-4 w-4 text-emerald-300" />
              Daftar Asesmen
            </Link>
            <Link
              href="/admin/monitoring"
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/25"
            >
              <ChartColumn className="h-4 w-4 text-emerald-300" />
              Analitik Monitoring
            </Link>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ label, value, sub, foot, tone, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="group glass-card p-5 border-white/80 hover:border-brand-line/60"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-muted uppercase">
                {label}
              </span>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl border ${toneClass[tone]} transition-transform group-hover:scale-110`}
              >
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="nums text-2xl font-extrabold text-[#101828]">
                {value}
              </span>
              <span className="text-xs font-medium text-muted">{sub}</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between border-t border-line/25 pt-2.5 text-[11px] font-medium text-muted">
              <span className="font-semibold">{foot}</span>
              <span>Detail</span>
            </div>
          </Link>
        ))}
      </section>

      {/* Recent assessments */}
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-ink">Asesmen Terbaru</h3>
          <Link href="/admin/monitoring" className="text-xs font-semibold text-brand">
            Monitoring lengkap →
          </Link>
        </div>

        {assessments.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted">Belum ada asesmen.</p>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Asesmen</TH>
                <TH>Kelas</TH>
                <TH>Status</TH>
                <TH>Peserta</TH>
                <TH>Terkumpul</TH>
              </TR>
            </THead>
            <TBody>
              {assessments.slice(0, 10).map((a) => {
                const submitted = a.submissions.filter(
                  (s) => s.statusWork === "submitted"
                ).length;
                return (
                  <TR key={a.id}>
                    <TD className="font-semibold">
                      <Link
                        href={`/assessments/${a.id}`}
                        className="text-ink hover:text-brand"
                      >
                        {a.title}
                      </Link>
                      <span className="block text-[11px] font-normal text-muted">
                        {a.subject} • {a.code}
                      </span>
                    </TD>
                    <TD className="text-muted">{a.className}</TD>
                    <TD>
                      <Badge status={ASSESSMENT_STATUS_LABEL[a.status]} />
                    </TD>
                    <TD className="nums">{a.submissions.length}</TD>
                    <TD className="nums">{submitted}</TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-3 border-brand-line/40 bg-brand-tint/60">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-line/50 bg-white text-brand">
            <Building2 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-bold text-ink">Konsistensi penilaian</p>
            <p className="text-[11px] text-muted">
              Selisih skor antar penilai di atas 15 poin ditandai otomatis untuk
              ditinjau.
            </p>
          </div>
        </div>
        <Link
          href="/admin/monitoring"
          className="text-xs font-bold text-brand hover:underline"
        >
          Buka monitoring →
        </Link>
      </Card>
    </div>
  );
}
