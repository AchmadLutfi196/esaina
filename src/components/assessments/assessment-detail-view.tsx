"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Send,
  Sparkles,
  UserCheck,
  Users,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { cn, formatDateTime, formatDueDate } from "@/lib/utils";
import {
  ASSESSMENT_STATUS_LABEL,
  GRADING_STATUS_LABEL,
  WORK_STATUS_LABEL,
  type Assessment,
  type Role,
} from "@/types";
import {
  calculateQuestionScore,
  calculateSubmissionTotalScore,
  hasSubmissionAnyScore,
} from "@/lib/scoring";

export function AssessmentDetailView({
  role,
  assessment,
}: {
  role: Role;
  assessment: Assessment;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"submissions" | "questions" | "recap">("recap");
  const [filterGrading, setFilterGrading] = useState("all");
  const [searchStudent, setSearchStudent] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  const handlePublish = async () => {
    if (
      !confirm(
        "Terbitkan seluruh nilai resmi untuk siswa? Siswa akan dapat melihat skor dan umpan balik mereka."
      )
    ) {
      return;
    }
    setPublishing(true);
    try {
      const res = await fetch(`/api/assessments/${assessment.id}/publish`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setPublishMessage(`Berhasil menerbitkan ${data.publishedCount} nilai.`);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  const exportRecapToCsv = () => {
    const headers = [
      "No",
      "Nama Siswa",
      "NIS",
      "Status Pengerjaan",
      "Status Penilaian",
      ...assessment.questions.map((q, i) => `Soal ${i + 1} (${q.maxScore}p)`),
      "Total Skor",
      "Waktu Pengumpulan",
    ];

    const escapeCsv = (val: unknown) => {
      const str = String(val ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = assessment.submissions.map((sub, index) => {
      const hasScored = hasSubmissionAnyScore(sub);
      const total = calculateSubmissionTotalScore(sub);
      const qScores = assessment.questions.map((q) => {
        if (!hasScored) return "—";
        return calculateQuestionScore(sub.answers[q.id]?.scores);
      });

      return [
        index + 1,
        sub.studentName,
        sub.studentNis,
        WORK_STATUS_LABEL[sub.statusWork] ?? sub.statusWork,
        GRADING_STATUS_LABEL[sub.statusGrading] ?? sub.statusGrading,
        ...qScores,
        hasScored ? total : "—",
        sub.submittedAt ? formatDateTime(sub.submittedAt) : "—",
      ]
        .map(escapeCsv)
        .join(",");
    });

    const csvContent =
      "\uFEFF" + [headers.map(escapeCsv).join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeCode = assessment.code || assessment.id;
    link.href = url;
    link.download = `Rekap_Nilai_${safeCode}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalStudents = assessment.submissions.length;
  const submitted = assessment.submissions.filter(
    (s) => s.statusWork === "submitted"
  ).length;
  const unsubmitted = totalStudents - submitted;
  const ungraded = assessment.submissions.filter(
    (s) => s.statusWork === "submitted" && s.statusGrading === "ungraded"
  ).length;
  const draftGraded = assessment.submissions.filter(
    (s) => s.statusGrading === "draft_graded"
  ).length;
  const finalGraded = assessment.submissions.filter(
    (s) => s.statusGrading === "final"
  ).length;

  const filteredSubmissions = assessment.submissions.filter((sub) => {
    const matchesName =
      sub.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      sub.studentNis.includes(searchStudent);
    if (filterGrading === "all") return matchesName;
    return matchesName && sub.statusGrading === filterGrading;
  });

  return (
    <div className="animate-fade-up space-y-6">
      {/* Top Header matching 06 · Guru rekap & konsensus.png */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/80 bg-white/85 p-6 shadow-[0_4px_24px_rgba(10,22,128,0.04)] backdrop-blur-md sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/assessments"
              className="flex items-center gap-1 text-xs font-semibold text-muted hover:text-brand"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali</span>
            </Link>
            <span className="text-muted" aria-hidden>
              ·
            </span>
            <span className="text-xs font-semibold text-brand">
              {assessment.subject} ({assessment.className})
            </span>
          </div>
          <h1 className="font-heading text-2xl font-extrabold tracking-wide text-brand sm:text-3xl">
            STATUS PENILAIAN LJK SISWA
          </h1>
          <p className="text-xs text-muted sm:text-sm">
            {assessment.title} · Kode: <strong className="font-mono text-brand">{assessment.code}</strong> · Tenggat: {formatDueDate(assessment.dueDate)}
          </p>
        </div>

        {role === "teacher" && (
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={exportRecapToCsv}
              className="gap-2 rounded-xl border-line text-xs font-bold text-brand hover:bg-paper"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Ekspor Nilai (CSV)</span>
            </Button>

            <Button
              type="button"
              onClick={handlePublish}
              loading={publishing}
              disabled={finalGraded === 0}
              className="gap-2 rounded-xl bg-brand text-xs font-bold text-white shadow-md hover:bg-brand-dark"
            >
              <Send className="h-4 w-4" />
              <span>Terbitkan Nilai Final ({finalGraded}) →</span>
            </Button>
          </div>
        )}
      </div>

      {publishMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{publishMessage}</span>
        </div>
      )}

      {/* 4 Status Metric Cards matching 06 · Guru rekap & konsensus.png */}
      <section
        aria-label="Status Ringkasan LJK"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* Belum Mengumpulkan */}
        <div className="rounded-2xl border border-white/90 bg-white p-5 shadow-[0_4px_24px_rgba(10,22,128,0.04)]">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-line bg-paper px-2.5 py-0.5 text-[10px] font-bold text-muted uppercase">
              Belum Mengumpulkan
            </span>
          </div>
          <div className="mt-3">
            <span className="font-heading text-3xl font-extrabold text-ink">
              {unsubmitted} SISWA
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-muted">
            Tidak dinilai nol otomatis
          </p>
        </div>

        {/* Belum Dinilai */}
        <div className="rounded-2xl border border-white/90 bg-white p-5 shadow-[0_4px_24px_rgba(10,22,128,0.04)]">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-bleu-ciel bg-bleu-ciel/25 px-2.5 py-0.5 text-[10px] font-bold text-brand uppercase">
              Belum Dinilai
            </span>
          </div>
          <div className="mt-3">
            <span className="font-heading text-3xl font-extrabold text-brand">
              {ungraded} LJK
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-muted">
            Menunggu pemeriksaan
          </p>
        </div>

        {/* Draf Nilai */}
        <div className="rounded-2xl border border-white/90 bg-white p-5 shadow-[0_4px_24px_rgba(10,22,128,0.04)]">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
              Draf Nilai
            </span>
          </div>
          <div className="mt-3">
            <span className="font-heading text-3xl font-extrabold text-amber-800">
              {draftGraded} LJK
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-muted">
            Tersimpan belum final
          </p>
        </div>

        {/* Nilai Final */}
        <div className="rounded-2xl border border-white/90 bg-white p-5 shadow-[0_4px_24px_rgba(10,22,128,0.04)]">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
              Nilai Final
            </span>
          </div>
          <div className="mt-3">
            <span className="font-heading text-3xl font-extrabold text-emerald-700">
              {finalGraded} LJK
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-muted">
            Siap dipublikasikan
          </p>
        </div>
      </section>

      {/* Multi-Rater Consensus Bar matching 06 · Guru rekap & konsensus.png */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-bleu-ciel/50 bg-[#F0F5FF] p-4 text-xs sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 font-bold text-brand">
            <BarChart3 className="h-4 w-4 shrink-0" />
            <span>Progres Multi-Rater:</span>
          </span>
          <span className="rounded-md border border-bleu-ciel/60 bg-white px-2.5 py-1 font-semibold text-brand">
            Penilai 1: Dra. Sri Wahyuni (100% Selesai)
          </span>
          <span className="rounded-md border border-bleu-ciel/60 bg-white px-2.5 py-1 font-semibold text-brand">
            Penilai 2: Budi Santoso (100% Selesai)
          </span>
        </div>
        <div className="rounded-md border border-emerald-300 bg-emerald-100/70 px-3 py-1 font-bold text-emerald-900">
          Tingkat Konsensus: 94.2% (Konsisten)
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-line/60 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("recap")}
          className={cn(
            "cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition-all",
            activeTab === "recap"
              ? "bg-brand text-white shadow-xs"
              : "text-muted hover:bg-paper hover:text-ink"
          )}
        >
          Rekapitulasi Konsensus
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("questions")}
          className={cn(
            "cursor-pointer rounded-xl px-4 py-2 text-xs font-bold transition-all",
            activeTab === "questions"
              ? "bg-brand text-white shadow-xs"
              : "text-muted hover:bg-paper hover:text-ink"
          )}
        >
          Soal & Rubrik ({assessment.questions.length})
        </button>
      </div>

      {/* TAB 1: Recap Table */}
      {activeTab === "recap" && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Cari nama atau NIS siswa..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-64 bg-white"
              />
              <Select
                value={filterGrading}
                onChange={(e) => setFilterGrading(e.target.value)}
                className="w-44 bg-white"
              >
                <option value="all">Semua Status</option>
                <option value="ungraded">Belum dinilai</option>
                <option value="draft_graded">Draf guru</option>
                <option value="final">Final disahkan</option>
              </Select>
            </div>

            <div className="text-xs text-muted">
              Menampilkan <strong className="text-brand">{filteredSubmissions.length}</strong> siswa
            </div>
          </div>

          {/* Table matching 06 · Guru rekap & konsensus.png */}
          <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_4px_24px_rgba(10,22,128,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-line/60 bg-paper/70 text-[11px] font-extrabold uppercase tracking-wider text-muted">
                    <th className="py-3.5 px-4 sm:px-6">NAMA SISWA</th>
                    <th className="py-3.5 px-4">WAKTU KUMPUL</th>
                    <th className="py-3.5 px-4">STATUS LJK</th>
                    <th className="py-3.5 px-4 text-center">TOTAL SKOR</th>
                    <th className="py-3.5 px-4">STATUS PUBLIKASI</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/40 text-xs">
                  {filteredSubmissions.map((sub) => {
                    const hasScore = hasSubmissionAnyScore(sub);
                    const totalScore = calculateSubmissionTotalScore(sub);
                    const isSubmitted = sub.statusWork === "submitted";

                    return (
                      <tr
                        key={sub.id}
                        className="transition-colors hover:bg-paper/40"
                      >
                        <td className="py-4 px-4 sm:px-6">
                          <div className="font-bold text-ink">
                            {sub.studentName}
                          </div>
                          <div className="text-[11px] text-muted font-mono">
                            NIS: {sub.studentNis}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-muted font-medium">
                          {sub.submittedAt
                            ? formatDateTime(sub.submittedAt)
                            : "Belum kumpul"}
                        </td>
                        <td className="py-4 px-4">
                          {sub.statusGrading === "final" ? (
                            <span className="inline-block rounded-md border border-brand bg-brand-tint px-2.5 py-0.5 text-[10px] font-bold text-brand uppercase">
                              Final Disahkan
                            </span>
                          ) : sub.statusGrading === "draft_graded" ? (
                            <span className="inline-block rounded-md border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                              Draf Guru
                            </span>
                          ) : (
                            <span className="inline-block rounded-md border border-line bg-paper px-2.5 py-0.5 text-[10px] font-bold text-muted uppercase">
                              Belum Dinilai
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-ink">
                          {hasScore ? (
                            <span className="font-mono text-sm text-brand font-extrabold">
                              {totalScore} / 100
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {assessment.publicationStatus === "published" ? (
                            <span className="inline-block rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              Diterbitkan
                            </span>
                          ) : sub.statusGrading === "final" ? (
                            <span className="inline-block rounded-md border border-bleu-ciel bg-bleu-ciel/30 px-2 py-0.5 text-[10px] font-bold text-brand">
                              Siap Terbit
                            </span>
                          ) : (
                            <span className="inline-block rounded-md border border-line bg-paper px-2 py-0.5 text-[10px] font-bold text-muted">
                              Belum Terbit
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-right">
                          {isSubmitted && role === "teacher" ? (
                            <Link href={`/grading`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg border-line px-3 text-xs font-bold text-brand hover:border-brand hover:bg-white"
                              >
                                Detail Nilai
                              </Button>
                            </Link>
                          ) : isSubmitted ? (
                            <span className="text-xs text-muted">Terkumpul</span>
                          ) : (
                            <span className="text-xs italic text-muted">Menunggu</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Questions & Rubrics */}
      {activeTab === "questions" && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {assessment.questions.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-2xl border border-white/90 bg-white p-6 shadow-[0_4px_24px_rgba(10,22,128,0.04)] space-y-4"
            >
              <div className="flex items-center justify-between border-b border-line/60 pb-2">
                <span className="font-heading text-xs font-extrabold uppercase tracking-wider text-brand">
                  Soal Nomor {idx + 1}
                </span>
                <span className="rounded-md border border-orange-pastel bg-butter-yellow px-2.5 py-0.5 font-mono text-xs font-bold text-brand">
                  Bobot: {q.maxScore} Poin
                </span>
              </div>

              <h3 className="text-sm font-bold text-ink leading-relaxed">
                {q.prompt}
              </h3>

              {q.referenceAnswer && (
                <div className="rounded-xl border border-line bg-paper/60 p-3 text-xs">
                  <span className="font-bold text-brand block mb-1">
                    Kunci Jawaban Acuan:
                  </span>
                  <p className="text-muted leading-relaxed">
                    {q.referenceAnswer}
                  </p>
                </div>
              )}

              <div className="border-t border-line/60 pt-3">
                <span className="text-xs font-bold text-brand block mb-2">
                  Rubrik Penilaian ({q.rubric.length} Kriteria):
                </span>
                <div className="space-y-1.5">
                  {q.rubric.map((r, rIdx) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-lg border border-line/40 bg-paper/30 p-2 text-xs"
                    >
                      <span className="font-medium text-ink">
                        {rIdx + 1}. {r.name}
                      </span>
                      <span className="font-mono font-bold text-brand">
                        {r.maxScore} Poin
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
