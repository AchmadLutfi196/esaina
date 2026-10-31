"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Send,
  Sparkles,
  UserCheck,
  Users,
  CheckCircle2,
  BarChart3,
  History,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import {
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui/table";
import { cn, formatDateTime } from "@/lib/utils";
import {
  ASSESSMENT_STATUS_LABEL,
  GRADING_STATUS_LABEL,
  WORK_STATUS_LABEL,
  type Assessment,
  type Role,
} from "@/types";
import { calculateQuestionScore, calculateSubmissionTotalScore, hasSubmissionAnyScore } from "@/lib/scoring";

export function AssessmentDetailView({
  role,
  assessment,
}: {
  role: Role;
  assessment: Assessment;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"submissions" | "questions" | "recap">("submissions");
  const [filterGrading, setFilterGrading] = useState("all");
  const [searchStudent, setSearchStudent] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!confirm("Terbitkan seluruh nilai resmi untuk siswa? Siswa akan dapat melihat skor dan umpan balik mereka.")) {
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
      if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
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
      ].map(escapeCsv).join(",");
    });

    // Add UTF-8 BOM so Microsoft Excel correctly displays Indonesian characters
    const csvContent = "\uFEFF" + [headers.map(escapeCsv).join(","), ...rows].join("\r\n");
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
      {/* Nav */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/classes/${assessment.classId}`}
          className="flex items-center gap-2 text-xs font-bold text-muted transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Ruang Kelas</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge status={ASSESSMENT_STATUS_LABEL[assessment.status]} />
          <Badge
            status={
              assessment.publicationStatus === "published"
                ? "Diterbitkan"
                : "Belum diterbitkan"
            }
          />
        </div>
      </div>

      {/* Main Info */}
      <div className="glass-panel p-6 sm:p-7">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-3xl space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="font-bold text-brand">{assessment.subject}</span>
              <span aria-hidden>·</span>
              <span className="rounded border border-line bg-paper px-2 py-0.5 font-mono font-bold text-brand">
                {assessment.code}
              </span>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-1 font-semibold text-brand">
                <UserCheck className="h-3.5 w-3.5" /> {assessment.raterCount}{" "}
                Rater + AI
              </span>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {assessment.durationMinutes}{" "}
                Menit
              </span>
            </div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-brand sm:text-3xl">
              {assessment.title}
            </h1>
            <p className="text-xs leading-relaxed text-muted sm:text-sm">
              {assessment.instructions}
            </p>
          </div>

          {role === "teacher" && (
            <div className="flex shrink-0 flex-wrap gap-2.5 lg:flex-col">
              {assessment.publicationStatus === "unpublished" ? (
                <Button loading={publishing} onClick={handlePublish}>
                  <Send className="h-4 w-4" />
                  <span>Terbitkan Nilai Resmi</span>
                </Button>
              ) : (
                <div className="rounded-xl border border-bleu-ciel bg-bleu-ciel/25 p-3 text-center text-xs text-brand">
                  <div className="flex items-center justify-center gap-1.5 font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Nilai Telah Terbit</span>
                  </div>
                </div>
              )}
              {publishMessage && (
                <p className="text-[11px] font-bold text-emerald-700">
                  ✅ {publishMessage}
                </p>
              )}
              <Link href={`/grading/${assessment.id}`}>
                <Button variant="accent" className="w-full">
                  <Sparkles className="h-4 w-4" />
                  <span>Buka Ruang Penilaian</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line/60 pt-5">
          {(
            [
              ["submissions", `LJK Siswa (${submitted}/${totalStudents})`, Users],
              ["questions", `Soal (${assessment.questions.length})`, BookOpen],
              ["recap", "Rekap Nilai", BarChart3],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all",
                activeTab === key
                  ? "bg-brand text-white shadow-xs"
                  : "text-muted hover:bg-paper hover:text-brand"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB: Questions */}
      {activeTab === "questions" && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {assessment.questions.map((q, idx) => (
            <Card key={q.id} className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-brand">
                    Soal Nomor {idx + 1}
                  </span>
                  <span className="nums rounded-lg border border-orange-pastel bg-butter-yellow px-2.5 py-1 text-xs font-bold text-brand">
                    Maks: {q.maxScore} Poin
                  </span>
                </div>

                <h3 className="text-sm font-bold leading-relaxed text-brand">
                  {q.prompt}
                </h3>

                <div>
                  <span className="mb-1.5 block text-[11px] font-semibold text-muted">
                    Kata Kunci:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {q.expectedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="rounded-md border border-bleu-ciel bg-bleu-ciel/25 px-2 py-0.5 text-[11px] font-bold text-brand"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-line/70 pt-3">
                <span className="text-xs font-semibold text-muted">
                  {q.rubric.length} Kriteria Rubrik
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB: Submissions */}
      {activeTab === "submissions" && (
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-brand">
                Lembar Jawaban Siswa
              </h2>
              <p className="text-xs text-muted">
                Klik &quot;Buka LJK&quot; untuk membuka ruang penilaian penuh.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="text"
                placeholder="Cari nama atau NIS..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-48"
              />
              <Select
                value={filterGrading}
                onChange={(e) => setFilterGrading(e.target.value)}
                className="w-40"
              >
                <option value="all">Semua Status</option>
                <option value="ungraded">Belum dinilai</option>
                <option value="draft_graded">Draf penilaian</option>
                <option value="final">Final</option>
              </Select>
            </div>
          </div>

          <Card className="overflow-hidden p-0">
            <Table>
              <THead>
                <TR>
                  <TH className="p-4">Siswa</TH>
                  <TH className="p-4">Status Kerja</TH>
                  <TH className="p-4">Waktu Kumpul</TH>
                  <TH className="p-4">Status Penilaian</TH>
                  <TH className="p-4 text-center">Skor</TH>
                  <TH className="p-4 text-right">Aksi</TH>
                </TR>
              </THead>
              <TBody>
                {filteredSubmissions.map((sub) => {
                  const hasScore = hasSubmissionAnyScore(sub);
                  const totalScore = calculateSubmissionTotalScore(sub);
                  const isSubmitted = sub.statusWork === "submitted";

                  return (
                    <TR key={sub.id}>
                      <TD className="p-4">
                        <div className="text-sm font-bold text-brand">
                          {sub.studentName}
                        </div>
                        <span className="text-[11px] text-muted">
                          NIS: {sub.studentNis}
                        </span>
                      </TD>
                      <TD className="p-4">
                        <Badge status={WORK_STATUS_LABEL[sub.statusWork]} />
                      </TD>
                      <TD className="p-4 text-muted">
                        {sub.submittedAt
                          ? formatDateTime(sub.submittedAt)
                          : "—"}
                      </TD>
                      <TD className="p-4">
                        <Badge
                          status={GRADING_STATUS_LABEL[sub.statusGrading]}
                        />
                      </TD>
                      <TD className="p-4 text-center">
                        {hasScore ? (
                          <span className="nums text-base font-extrabold text-brand">
                            {sub.statusGrading === "final"
                              ? totalScore
                              : `Draf ${totalScore}`}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </TD>
                      <TD className="p-4 text-right">
                        {isSubmitted && role === "teacher" ? (
                          <div className="inline-flex items-center gap-2">
                            <Link href={`/grading/${assessment.id}`}>
                              <Button size="sm">
                                <Sparkles className="h-3.5 w-3.5 text-bleu-ciel" />
                                <span>Buka LJK</span>
                              </Button>
                            </Link>
                          </div>
                        ) : isSubmitted ? (
                          <span className="text-xs text-muted">Terkumpul</span>
                        ) : (
                          <span className="text-xs italic text-muted">
                            Menunggu
                          </span>
                        )}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </Card>
        </div>
      )}

      {/* TAB: Recap */}
      {activeTab === "recap" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Belum Kumpul", value: totalStudents - submitted, bg: "bg-white/70" },
              { label: "Belum Dinilai", value: ungraded, bg: "bg-butter-yellow/60" },
              { label: "Draf Penilaian", value: draftGraded, bg: "bg-orange-pastel/20" },
              { label: "Final", value: finalGraded, bg: "bg-bleu-ciel/30" },
            ].map(({ label, value, bg }) => (
              <Card key={label} className={cn("space-y-1 p-5", bg)}>
                <span className="text-xs font-bold text-brand">{label}</span>
                <p className="nums text-3xl font-extrabold text-brand">
                  {value}
                </p>
              </Card>
            ))}
          </div>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-base font-bold text-brand">
                Tabel Rekapitulasi Nilai Siswa
              </h3>
              <p className="text-xs text-muted">
                Rekapitulasi lengkap skor seluruh butir soal dan status penilaian per siswa.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportRecapToCsv}
              className="gap-2 border-brand-line/60 bg-white/80 hover:bg-white text-brand shadow-xs"
            >
              <Download className="h-4 w-4 text-brand" />
              <span>Ekspor Rekap (CSV/Excel)</span>
            </Button>
          </div>

          <Card className="overflow-hidden p-0">
            <Table>
              <THead>
                <TR>
                  <TH className="p-4">Siswa</TH>
                  {assessment.questions.map((q, i) => (
                    <TH key={q.id} className="p-4 text-center">
                      Soal {i + 1} ({q.maxScore}p)
                    </TH>
                  ))}
                  <TH className="p-4 text-center">Total</TH>
                  <TH className="p-4">Status</TH>
                </TR>
              </THead>
              <TBody>
                {assessment.submissions.map((sub) => {
                  const total = calculateSubmissionTotalScore(sub);
                  const hasScored = hasSubmissionAnyScore(sub);

                  return (
                    <TR key={sub.id}>
                      <TD className="p-4">
                        <span className="block font-bold text-brand">
                          {sub.studentName}
                        </span>
                        <span className="text-[11px] text-muted">
                          {sub.studentNis}
                        </span>
                      </TD>
                      {assessment.questions.map((q) => {
                        const qVal = calculateQuestionScore(
                          sub.answers[q.id]?.scores
                        );
                        return (
                          <TD
                            key={q.id}
                            className="nums p-4 text-center font-bold text-brand"
                          >
                            {hasScored ? qVal : "—"}
                          </TD>
                        );
                      })}
                      <TD className="p-4 text-center">
                        {hasScored ? (
                          <span className="nums text-sm font-extrabold text-brand">
                            {total}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </TD>
                      <TD className="p-4">
                        <Badge
                          status={GRADING_STATUS_LABEL[sub.statusGrading]}
                        />
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
