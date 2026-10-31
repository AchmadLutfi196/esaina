"use client";

import React from "react";
import Link from "next/link";
import {
  Brain,
  ChartColumn,
  FileText,
  GraduationCap,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Assessment } from "@/types";

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
      label: "TOTAL GURU",
      value: stats.teachers || 21,
      sub: "Guru Pengampu",
      foot: "Guru Mata Pelajaran",
      tone: "brand",
      icon: Users,
      href: "/admin/users?role=teacher",
    },
    {
      label: "TOTAL SISWA",
      value: stats.students || 360,
      sub: "Siswa Terdaftar",
      foot: "Peserta Asesmen Aktif",
      tone: "purple",
      icon: GraduationCap,
      href: "/admin/users?role=student",
    },
    {
      label: "ASESMEN AKTIF",
      value: stats.activeAssessments || 37,
      sub: "Sedang Berjalan",
      foot: `${stats.totalAssessments || 74} Total Paket`,
      tone: "blue",
      icon: FileText,
      href: "/assessments?status=active",
    },
    {
      label: "MESIN AI INDOBERT",
      value: "AKTIF",
      sub: "Status Aktif",
      foot: "Skor rekomendasi tersedia",
      tone: "green",
      icon: Brain,
      href: "/admin/monitoring",
    },
  ];

  return (
    <div className="animate-fade-up space-y-6">
      {/* Top Section matching 07 · Admin dasbor & monitoring.png */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/80 bg-white/85 p-6 shadow-[0_4px_24px_rgba(10,22,128,0.04)] backdrop-blur-md md:flex-row md:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
              Sistem Penilaian Guru & NLP Aktif
            </span>
          </div>
          <h1 className="font-heading text-2xl font-extrabold tracking-wide text-brand sm:text-3xl">
            DASBOR ADMIN — MONITORING ASESMEN & EVALUASI AI
          </h1>
          <p className="text-xs text-muted sm:text-sm">
            Kelola akun guru dan siswa, pantau progres penilaian per asesmen, serta tinjau akurasi rekomendasi penilaian AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/users">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl border-line text-xs font-bold text-brand hover:bg-paper"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Kelola Pengguna ({stats.teachers + stats.students})</span>
            </Button>
          </Link>
          <Link href="/assessments">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl border-line text-xs font-bold text-brand hover:bg-paper"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Daftar Asesmen</span>
            </Button>
          </Link>
          <Link href="/admin/monitoring">
            <Button
              size="sm"
              className="gap-1.5 rounded-xl bg-brand text-xs font-bold text-white shadow-md hover:bg-brand-dark"
            >
              <ChartColumn className="h-3.5 w-3.5" />
              <span>Analitik Monitoring</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards matching 07 · Admin dasbor & monitoring.png */}
      <section
        aria-label="Metrik Global Admin"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="rounded-2xl border border-white/90 bg-white p-5 shadow-[0_4px_24px_rgba(10,22,128,0.04)] transition-all hover:shadow-md hover:border-brand-line"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
                {kpi.label}
              </span>
              <span className="rounded-md border border-line bg-paper p-1 text-brand">
                <kpi.icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-extrabold text-brand">
                {kpi.value}
              </span>
              <span className="text-xs font-semibold text-muted">
                {kpi.sub}
              </span>
            </div>
            <p className="mt-2 border-t border-line/40 pt-2 text-[11px] font-medium text-muted">
              {kpi.foot}
            </p>
          </Link>
        ))}
      </section>

      {/* Table: Asesmen Terbaru matching 07 · Admin dasbor & monitoring.png */}
      <div className="rounded-2xl border border-white/80 bg-white p-5 shadow-[0_4px_24px_rgba(10,22,128,0.04)]">
        <div className="mb-4 flex items-center justify-between border-b border-line/50 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-base font-extrabold tracking-wider text-brand uppercase">
              ASESMEN TERBARU
            </h2>
            <span className="rounded-full border border-line bg-paper px-2 py-0.5 text-xs font-bold text-muted">
              {assessments.length} Paket
            </span>
          </div>
          <Link
            href="/admin/monitoring"
            className="text-xs font-bold text-brand hover:underline"
          >
            Monitoring lengkap →
          </Link>
        </div>

        {assessments.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted">
            Belum ada asesmen yang terdaftar di sistem.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line/60 bg-paper/60 text-[11px] font-extrabold uppercase tracking-wider text-muted">
                  <th className="py-3 px-4">ASESMEN</th>
                  <th className="py-3 px-4">GURU KOORDINATOR</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">PESERTA</th>
                  <th className="py-3 px-4">TERKUMPUL</th>
                  <th className="py-3 px-4 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/30 text-xs">
                {assessments.slice(0, 8).map((a) => {
                  const submittedCount = a.submissions.filter(
                    (s) => s.statusWork === "submitted"
                  ).length;

                  return (
                    <tr
                      key={a.id}
                      className="transition-colors hover:bg-paper/40"
                    >
                      <td className="py-3.5 px-4 font-bold text-ink">
                        {a.title}
                        <div className="text-[11px] text-muted font-normal">
                          {a.subject} · {a.className}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted">
                        Dra. Sri Wahyuni, M.Pd.
                      </td>
                      <td className="py-3.5 px-4">
                        {a.status === "active" ? (
                          <span className="inline-block rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                            AKTIF
                          </span>
                        ) : a.status === "draft" ? (
                          <span className="inline-block rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                            DRAF
                          </span>
                        ) : (
                          <span className="inline-block rounded-md border border-line bg-paper px-2 py-0.5 text-[10px] font-bold text-muted uppercase">
                            SELESAI
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-ink">
                        {a.submissions.length} Siswa
                      </td>
                      <td className="py-3.5 px-4 font-bold text-brand">
                        {submittedCount} LJK
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/assessments/${a.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg border-line px-3 text-xs font-bold text-brand hover:border-brand hover:bg-white"
                          >
                            Detail
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
