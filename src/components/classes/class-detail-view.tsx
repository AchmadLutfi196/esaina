"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Copy,
  FileText,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDueDate, cn } from "@/lib/utils";
import {
  ASSESSMENT_STATUS_LABEL,
  GRADING_STATUS_LABEL,
  type Assessment,
  type ClassItem,
  type Role,
} from "@/types";

interface ClassDetailInfo extends ClassItem {
  creatorName: string;
}

export function ClassDetailView({
  role,
  classItem,
  allClasses,
  assessments,
}: {
  role: Role;
  classItem: ClassDetailInfo;
  allClasses: ClassItem[];
  assessments: Assessment[];
}) {
  const [activeTab, setActiveTab] = useState<"assignments" | "analytics">(
    "assignments"
  );
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");
  const [copiedCode, setCopiedCode] = useState(false);

  const filteredAssessments = assessments.filter(
    (a) => statusFilter === "all" || a.status === statusFilter
  );

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(classItem.classCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="animate-fade-up space-y-6">
      {/* Breadcrumb + Class Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/classes"
          className="flex items-center gap-2 text-xs font-bold text-muted transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Daftar Kelas</span>
        </Link>

        <div className="flex flex-wrap items-center gap-1.5">
          {allClasses.map((c) => (
            <Link
              key={c.id}
              href={`/classes/${c.id}`}
              className={cn(
                "cursor-pointer rounded-xl px-3 py-1 text-xs font-bold transition-all",
                c.id === classItem.id
                  ? "bg-brand text-white shadow-xs"
                  : "border border-line bg-white/75 text-muted hover:text-brand"
              )}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-brand to-[#14259E] p-6 text-white shadow-lg sm:p-7">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-butter-yellow">
              <span>{classItem.subject}</span>
              <span aria-hidden>·</span>
              <span>{classItem.grade}</span>
              <span aria-hidden>·</span>
              <span>{classItem.academicYear}</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
              {classItem.name}
            </h1>
            <p className="flex items-center gap-3 pt-1 text-xs text-bleu-ciel sm:text-sm">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {classItem.studentCount} Siswa
              </span>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" /> {assessments.length} Asesmen
              </span>
              <span aria-hidden>·</span>
              <span>Guru: {classItem.creatorName}</span>
            </p>
          </div>

          {/* Class Code */}
          <div className="flex min-w-[210px] items-center justify-between gap-4 rounded-xl border border-white/25 bg-white/12 p-3.5 backdrop-blur-md">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-bleu-ciel">
                Kode Kelas
              </span>
              <code className="font-mono text-base font-extrabold tracking-wide text-white">
                {classItem.classCode}
              </code>
            </div>
            <button
              onClick={handleCopyCode}
              className="cursor-pointer rounded-lg bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
              title="Salin Kode Kelas"
            >
              {copiedCode ? (
                <Check className="h-4 w-4 text-butter-yellow" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs + Filters */}
      <div className="flex flex-col justify-between gap-3 border-b border-line/80 pb-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("assignments")}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all",
              activeTab === "assignments"
                ? "bg-brand text-white shadow-xs"
                : "border border-line bg-white/75 text-muted hover:text-brand"
            )}
          >
            <FileText className="h-4 w-4" />
            <span>Tugas & Asesmen ({assessments.length})</span>
          </button>
        </div>

        {activeTab === "assignments" && (
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-line bg-white/80 p-1">
              {(
                [
                  ["all", "Semua"],
                  ["active", "Aktif"],
                  ["completed", "Selesai"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={cn(
                    "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold transition-all",
                    statusFilter === value
                      ? "bg-brand text-white"
                      : "text-muted hover:text-brand"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {role === "teacher" && (
              <Link href="/assessments/new">
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  <span>Buat Asesmen</span>
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Assessment list */}
      {activeTab === "assignments" && (
        <div className="space-y-3.5">
          {filteredAssessments.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-xs text-muted">
                {statusFilter === "all"
                  ? "Belum ada asesmen di kelas ini."
                  : `Tidak ada asesmen dengan status "${statusFilter}".`}
              </p>
            </Card>
          ) : (
            filteredAssessments.map((asm, idx) => {
              const submitted = asm.submissions.filter(
                (s) => s.statusWork === "submitted"
              ).length;
              const final_ = asm.submissions.filter(
                (s) => s.statusGrading === "final"
              ).length;

              return (
                <div
                  key={asm.id}
                  className="glass-card flex flex-col justify-between gap-5 p-5 transition-all hover:border-brand lg:flex-row lg:items-center"
                >
                  <div className="flex max-w-2xl items-start gap-4">
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-bold shadow-xs",
                        asm.status === "active"
                          ? "bg-brand text-white"
                          : "bg-bleu-ciel/35 text-brand"
                      )}
                    >
                      <FileText className="h-5 w-5" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand">
                          Tugas #{idx + 1} · {asm.code}
                        </span>
                        <Badge status={ASSESSMENT_STATUS_LABEL[asm.status]} />
                      </div>

                      <Link
                        href={`/assessments/${asm.id}`}
                        className="text-base font-bold leading-snug text-brand hover:underline"
                      >
                        {asm.title}
                      </Link>

                      <p className="line-clamp-2 text-xs leading-relaxed text-muted">
                        {asm.instructions}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-brand" />{" "}
                          Tenggat: {formatDueDate(asm.dueDate)}
                        </span>
                        <span aria-hidden>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-brand" />{" "}
                          {asm.durationMinutes} Menit
                        </span>
                        <span aria-hidden>·</span>
                        <span>{asm.questions.length} Soal Esai</span>
                      </div>
                    </div>
                  </div>

                  {role === "teacher" ? (
                    <div className="flex shrink-0 flex-col items-stretch gap-4 border-t border-line/60 pt-3 sm:flex-row sm:items-center lg:border-t-0 lg:pt-0">
                      <div className="flex items-center gap-4 rounded-xl border border-line/70 bg-white/70 px-3 py-1.5">
                        <div className="border-r border-line pr-4">
                          <span className="nums block text-xl font-extrabold leading-none text-brand">
                            {submitted}
                          </span>
                          <span className="text-[10px] font-semibold text-muted">
                            Terkumpul
                          </span>
                        </div>
                        <div>
                          <span className="nums block text-xl font-extrabold leading-none text-brand">
                            {final_}
                          </span>
                          <span className="text-[10px] font-semibold text-muted">
                            Final
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/assessments/${asm.id}`}>
                          <Button variant="outline" size="sm">
                            Detail
                          </Button>
                        </Link>
                        <Link href={`/grading/${asm.id}`}>
                          <Button size="sm">
                            <Sparkles className="h-3.5 w-3.5 text-butter-yellow" />
                            <span>Nilai</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="flex shrink-0 items-center gap-3 border-t border-line/60 pt-3 lg:border-t-0 lg:pt-0">
                      <Link
                        href={
                          asm.status === "active"
                            ? `/assessments/${asm.id}/take`
                            : `/assessments/${asm.id}/result`
                        }
                      >
                        <Button size="sm">
                          <BookOpen className="h-4 w-4" />
                          <span>
                            {asm.status === "active"
                              ? "Kerjakan"
                              : "Lihat Hasil"}
                          </span>
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
