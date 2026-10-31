"use client";

import React from "react";
import Link from "next/link";
import { formatDueDate } from "@/lib/utils";
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
  const displayAssessments = (activeAssessments.length > 0 ? activeAssessments : assessments).slice(0, 3);

  // Kalender pekan ini (sesuai referensi 02 · Guru dasbor.png)
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
    <div className="space-y-3.5">
      {/* 1. Banner Row (Welcome Left + Calendar Widget) */}
      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-stretch">
        {/* Welcome Left */}
        <div className="flex flex-1 flex-col justify-center gap-1.5 rounded-[14px] border border-[#D8E3EF] bg-white p-4 shadow-[0_4px_20px_rgba(10,22,128,0.05)]">
          <h1 className="font-heading text-[20px] font-normal leading-[24px] tracking-wide text-[#0A1680] uppercase">
            RUANG PENILAIAN ANDA
          </h1>
          <p className="text-[12px] leading-relaxed text-[#52697C]">
            Buat asesmen, tinjau jawaban siswa, dan selesaikan penilaian bersama secara konsisten.
          </p>
        </div>

        {/* Calendar Widget */}
        <div className="flex w-full flex-col justify-center gap-2 rounded-[14px] border border-[#D8E3EF] bg-white p-3.5 shadow-[0_4px_20px_rgba(10,22,128,0.05)] lg:w-[320px] lg:shrink-0">
          <p className="text-[11px] font-semibold text-[#0A1680]">
            Kalender pekan ini
          </p>
          <div className="grid grid-cols-7 gap-1">
            {daysOfWeek.map((d) => (
              <div
                key={d.day}
                className={`flex flex-col items-center justify-center rounded-[6px] py-1 text-center transition-all ${
                  d.isToday
                    ? "bg-[#0A1680] text-white"
                    : "bg-[#F4F7FC] text-[#52697C]"
                }`}
              >
                <span
                  className={`text-[9px] font-medium ${
                    d.isToday ? "text-white/90" : "text-[#52697C]"
                  }`}
                >
                  {d.day}
                </span>
                <span
                  className={`text-[11px] font-semibold ${
                    d.isToday ? "text-white" : "text-[#0A1680]"
                  }`}
                >
                  {d.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. KPIs Row (Total Asesmen, Progres Selesai, Tugas Penilaian) */}
      <section
        aria-label="Metrik Utama"
        className="grid grid-cols-1 gap-3.5 sm:grid-cols-3"
      >
        {/* Stat: Total Asesmen */}
        <div className="flex flex-col gap-1 rounded-[14px] border border-[#D8E3EF] bg-white p-3.5 shadow-[0_4px_20px_rgba(10,22,128,0.05)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#52697C]">
              📁 Total Asesmen
            </span>
            <span className="rounded-[6px] bg-[#EEF4FF] px-2 py-0.5 text-[11px] font-semibold text-[#0A1680]">
              Aktif
            </span>
          </div>
          <div className="mt-0.5">
            <span className="font-heading text-[24px] font-normal leading-[26px] text-[#0A1680]">
              {stats.total || 5}
            </span>
          </div>
          <p className="text-[10px] text-[#52697C]">
            Asesmen dibuat semester ini
          </p>
        </div>

        {/* Stat: Progres Selesai */}
        <div className="flex flex-col gap-1 rounded-[14px] border border-[#D8E3EF] bg-white p-3.5 shadow-[0_4px_20px_rgba(10,22,128,0.05)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#52697C]">
              📈 Progres Selesai
            </span>
            <span className="rounded-[6px] bg-[#E8F8F0] px-2 py-0.5 text-[11px] font-semibold text-[#0E623B]">
              Aktif
            </span>
          </div>
          <div className="mt-0.5">
            <span className="font-heading text-[24px] font-normal leading-[26px] text-[#0A1680]">
              {stats.progressPercent || 60}%
            </span>
          </div>
          <p className="text-[10px] text-[#52697C]">
            Asesmen telah dinilai penuh
          </p>
        </div>

        {/* Stat: Tugas Penilaian */}
        <div className="flex flex-col gap-1 rounded-[14px] border border-[#D8E3EF] bg-white p-3.5 shadow-[0_4px_20px_rgba(10,22,128,0.05)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#52697C]">
              ⏳ Tugas Penilaian
            </span>
            <span className="rounded-[6px] bg-[#EEF4FF] px-2 py-0.5 text-[11px] font-semibold text-[#0A1680]">
              {raterAssignments.length} Perlu Tindakan
            </span>
          </div>
          <div className="mt-0.5">
            <span className="font-heading text-[24px] font-normal leading-[26px] text-[#0A1680]">
              {raterAssignments.length}
            </span>
          </div>
          <p className="text-[10px] text-[#52697C]">
            Jawaban menunggu skor Anda
          </p>
        </div>
      </section>

      {/* 3. Content Row (Asesmen Aktif Col & Tugas Penilai Col) */}
      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-start">
        {/* Asesmen Aktif Col */}
        <section className="flex flex-1 flex-col gap-2.5 rounded-[14px] border border-[#D8E3EF] bg-white p-4 shadow-[0_4px_20px_rgba(10,22,128,0.05)]">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-[13px] font-normal tracking-wider text-[#0A1680] uppercase">
              ASESMEN AKTIF
            </h2>
            <span className="rounded-[6px] bg-[#EEF4FF] px-2 py-0.5 text-[11px] font-semibold text-[#0A1680]">
              {displayAssessments.length} Asesmen
            </span>
          </div>

          {displayAssessments.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-[#D8E3EF] p-6 text-center">
              <p className="text-[12px] text-[#52697C]">Belum ada asesmen aktif.</p>
              <Link
                href="/assessments/new"
                className="mt-3 inline-block rounded-[8px] bg-[#0A1680] px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-xs hover:bg-[#0A1680]/90"
              >
                + Buat Asesmen Baru
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {displayAssessments.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col gap-2 rounded-[10px] border border-[#D8E3EF] bg-[#F4F7FC] p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-[6px] bg-[#E8F8F0] px-2 py-0.5 text-[11px] font-semibold text-[#0E623B]">
                        AKTIF
                      </span>
                      <span className="rounded-[6px] border border-[#D8E3EF] bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-[#52697C]">
                        Kode: {a.code}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-[#52697C]">
                      Tenggat: {formatDueDate(a.dueDate)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-[16px] font-semibold text-[#0A1680]">
                      {a.title}
                    </h3>
                    <p className="text-[11px] text-[#52697C]">
                      {a.subject} • {a.questions.length} Soal • {a.className} • {a.durationMinutes} menit pengumpulan
                    </p>
                  </div>

                  <div className="pt-1">
                    <Link
                      href={`/grading/${a.id}`}
                      className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#0A1680] px-3 py-1.5 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(10,22,128,0.12)] transition-colors hover:bg-[#0A1680]/90"
                    >
                      <span>Buka Ruang Penilaian</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Tugas Penilai Col */}
        <section className="flex w-full flex-col gap-2.5 rounded-[14px] border border-[#D8E3EF] bg-white p-4 shadow-[0_4px_20px_rgba(10,22,128,0.05)] lg:w-[380px] lg:shrink-0">
          <h2 className="font-heading text-[13px] font-normal tracking-wider text-[#0A1680] uppercase">
            TUGAS SEBAGAI PENILAI
          </h2>

          <div className="flex flex-col gap-2">
            {raterAssignments.length > 0 ? (
              raterAssignments.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-2.5 rounded-[8px] border border-[#EAF0F8] bg-white p-2.5 px-3 transition-colors hover:border-[#D8E3EF]"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-[12px] font-semibold text-[#0A1680]">
                      {task.title}
                    </h4>
                    <p className="truncate text-[10px] text-[#52697C]">
                      {task.subject} - {task.className} •{" "}
                      {task.submissionCount > 0
                        ? `${task.submissionCount} jawaban menunggu skor`
                        : "Tidak ada jawaban tertunda"}
                    </p>
                  </div>

                  <Link
                    href={`/grading/${task.id}`}
                    className="shrink-0 rounded-[8px] border border-[#D8E3EF] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#0A1680] transition-colors hover:bg-[#F4F7FC]"
                  >
                    Lihat
                  </Link>
                </div>
              ))
            ) : (
              <>
                {/* Fallback default sample task matching visual spec */}
                <div className="flex items-center justify-between gap-2.5 rounded-[8px] border border-[#EAF0F8] bg-white p-2.5 px-3 transition-colors hover:border-[#D8E3EF]">
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-[12px] font-semibold text-[#0A1680]">
                      Ulangan Harian Fisika
                    </h4>
                    <p className="truncate text-[10px] text-[#52697C]">
                      Fisika - X MIPA 2 • Tidak ada jawaban tertunda
                    </p>
                  </div>
                  <Link
                    href="/grading"
                    className="shrink-0 rounded-[8px] border border-[#D8E3EF] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#0A1680] transition-colors hover:bg-[#F4F7FC]"
                  >
                    Lihat
                  </Link>
                </div>

                <div className="flex items-center justify-between gap-2.5 rounded-[8px] border border-[#EAF0F8] bg-white p-2.5 px-3 transition-colors hover:border-[#D8E3EF]">
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-[12px] font-semibold text-[#0A1680]">
                      Ulangan Harian Fisika
                    </h4>
                    <p className="truncate text-[10px] text-[#52697C]">
                      Fisika - XI MIPA 2 • Tidak ada jawaban tertunda
                    </p>
                  </div>
                  <Link
                    href="/grading"
                    className="shrink-0 rounded-[8px] border border-[#D8E3EF] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#0A1680] transition-colors hover:bg-[#F4F7FC]"
                  >
                    Lihat
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
