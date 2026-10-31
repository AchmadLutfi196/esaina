"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  Copy,
  FileText,
  FolderOpen,
  ArrowRight,
  Calendar,
  KeyRound,
  Plus,
  Users,
  X,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input, Select, Field } from "@/components/ui/input";
import { formatDueDate } from "@/lib/utils";
import {
  ASSESSMENT_STATUS_LABEL,
  type Assessment,
  type ClassItem,
  type Role,
} from "@/types";

const bannerGradients = [
  "from-[#0A1680] via-[#13259C] to-[#1E3A8A]",
  "from-[#0F2396] via-[#0A1680] to-[#1A2E8A]",
  "from-[#081266] via-[#12228A] to-[#233B9E]",
];

export function ClassesView({
  role,
  classes,
  assessments,
}: {
  role: Role;
  classes: ClassItem[];
  assessments: Assessment[];
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const handleCopy = (e: React.MouseEvent, id: string, code: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard?.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div className="glass-panel flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-pastel bg-butter-yellow px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand">
            <BookOpen className="h-3.5 w-3.5" />
            <span>
              {role === "teacher"
                ? "Manajemen Kelas & Asesmen"
                : "Ruang Kelas Siswa"}
            </span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-brand sm:text-2xl">
            {role === "teacher"
              ? "Daftar Kelas yang Diajar"
              : "Daftar Kelas Saya"}
          </h1>
          <p className="text-xs text-muted sm:text-sm">
            {role === "teacher"
              ? "Kelola kelas dan asesmen esai Anda. Klik kartu kelas untuk membuka ruang kelas."
              : "Pilih kelas untuk melihat daftar tugas asesmen esai dari guru."}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          {role === "teacher" ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 text-butter-yellow" />
              <span>Buat Kelas Baru</span>
            </Button>
          ) : (
            <Link href="/join">
              <Button>
                <KeyRound className="h-4 w-4 text-butter-yellow" />
                <span>Gabung Kelas via Kode</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Class Cards */}
      {classes.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-line" />
          <p className="text-sm font-semibold text-ink">Belum ada kelas</p>
          <p className="mt-1 text-xs text-muted">
            {role === "teacher"
              ? "Buat kelas pertama Anda dengan tombol di atas."
              : "Gabung kelas dengan kode dari guru Anda."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {classes.map((cls, index) => {
            const clsAssessments = assessments.filter(
              (a) => a.classId === cls.id
            );
            const activeCount = clsAssessments.filter(
              (a) => a.status === "active"
            ).length;
            const gradient = bannerGradients[index % bannerGradients.length];

            return (
              <div
                key={cls.id}
                className="glass-card group flex flex-col justify-between overflow-hidden border border-line transition-all hover:border-brand"
              >
                {/* Banner */}
                <Link href={`/classes/${cls.id}`}>
                  <div
                    className={`relative cursor-pointer bg-gradient-to-br p-5 text-white transition-opacity group-hover:opacity-95 ${gradient}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-md bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-butter-yellow backdrop-blur-xs">
                        {cls.subject} · {cls.grade}
                      </span>

                      <button
                        type="button"
                        onClick={(e) =>
                          handleCopy(e, cls.id, cls.classCode)
                        }
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 font-mono text-[11px] font-bold text-white transition-colors hover:bg-white/25"
                        title="Salin Kode Kelas"
                      >
                        <span>{cls.classCode}</span>
                        {copiedId === cls.id ? (
                          <Check className="h-3 w-3 text-butter-yellow" />
                        ) : (
                          <Copy className="h-3 w-3 text-bleu-ciel" />
                        )}
                      </button>
                    </div>

                    <h2 className="mt-3 text-lg font-extrabold tracking-tight text-white group-hover:underline">
                      {cls.name}
                    </h2>

                    <div className="mt-2 flex items-center gap-3 text-xs font-medium text-bleu-ciel">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {cls.studentCount}{" "}
                        Siswa
                      </span>
                      <span aria-hidden>·</span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />{" "}
                        {clsAssessments.length} Asesmen
                      </span>
                      <span aria-hidden>·</span>
                      <span className="font-semibold text-butter-yellow">
                        {activeCount} Aktif
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Assessment list inside card */}
                <div className="space-y-2.5 p-5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
                    Daftar Asesmen ({clsAssessments.length})
                  </span>

                  {clsAssessments.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-line bg-white/60 p-4 text-center text-xs text-muted">
                      Belum ada asesmen di kelas ini.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {clsAssessments.slice(0, 3).map((asm) => {
                        const submitted = asm.submissions.filter(
                          (s) => s.statusWork === "submitted"
                        ).length;
                        const final_ = asm.submissions.filter(
                          (s) => s.statusGrading === "final"
                        ).length;

                        return (
                          <Link
                            key={asm.id}
                            href={`/assessments/${asm.id}`}
                            className="flex items-center justify-between gap-2 rounded-xl border border-line/80 bg-white/80 p-3 transition-all hover:border-brand hover:bg-paper"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] font-bold text-muted">
                                  {asm.code}
                                </span>
                                <Badge
                                  status={
                                    ASSESSMENT_STATUS_LABEL[asm.status]
                                  }
                                />
                              </div>
                              <p className="mt-0.5 truncate text-xs font-bold text-brand">
                                {asm.title}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-[10px] text-muted">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />{" "}
                                  {formatDueDate(asm.dueDate)}
                                </span>
                                {role === "teacher" && (
                                  <>
                                    <span>·</span>
                                    <span className="nums font-semibold text-brand">
                                      {final_}/{submitted} Dinilai
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 shrink-0 text-brand" />
                          </Link>
                        );
                      })}
                      {clsAssessments.length > 3 && (
                        <p className="text-center text-[11px] text-muted">
                          +{clsAssessments.length - 3} asesmen lainnya
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-2 border-t border-line/70 bg-paper/80 px-5 py-3.5">
                  <Link href={`/classes/${cls.id}`} className="w-full">
                    <Button variant="primary" size="sm" className="w-full">
                      <FolderOpen className="h-3.5 w-3.5 text-butter-yellow" />
                      <span>Buka Ruang Kelas</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Class Dialog - placeholder */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Buat Ruang Kelas Baru"
        description="Form pembuatan kelas baru — fitur ini memerlukan API route."
      >
        <div className="space-y-4 py-4">
          <Field label="Nama Kelas" required>
            <Input placeholder="Contoh: Biologi XI MIPA 2" disabled />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mata Pelajaran" required>
              <Input value="Biologi" disabled />
            </Field>
            <Field label="Tingkat Kelas">
              <Select disabled>
                <option>Kelas X</option>
                <option>Kelas XI</option>
                <option>Kelas XII</option>
              </Select>
            </Field>
          </div>
          <p className="flex items-center gap-1.5 text-[11px] text-muted">
            <Info className="h-3.5 w-3.5 shrink-0 text-brand" />
            <span>API route untuk membuat kelas akan ditambahkan di iterasi berikutnya.</span>
          </p>
        </div>
      </Dialog>
    </div>
  );
}
