"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  FileText,
  Filter,
  Plus,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { cn, formatDueDate } from "@/lib/utils";
import {
  ASSESSMENT_STATUS_LABEL,
  type Assessment,
  type ClassItem,
  type Role,
} from "@/types";

export function AssessmentsListView({
  role,
  assessments,
  classes,
}: {
  role: Role;
  assessments: Assessment[];
  classes: ClassItem[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  const filtered = assessments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || a.status === statusFilter;
    const matchesClass = classFilter === "all" || a.classId === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div className="glass-panel flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-pastel bg-butter-yellow px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand">
            <FileText className="h-3.5 w-3.5" />
            <span>Manajemen Asesmen</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-brand sm:text-2xl">
            Daftar Asesmen
          </h1>
          <p className="text-xs text-muted sm:text-sm">
            {role === "teacher"
              ? "Kelola semua asesmen esai yang Anda buat."
              : "Daftar asesmen esai dari seluruh kelas Anda."}
          </p>
        </div>

        {role === "teacher" && (
          <Link href="/assessments/new">
            <Button>
              <Plus className="h-4 w-4 text-butter-yellow" />
              <span>Buat Asesmen Baru</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, kode, atau mata pelajaran..."
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-44"
        >
          <option value="all">Semua Status</option>
          <option value="draft">Draf</option>
          <option value="active">Dibuka</option>
          <option value="completed">Ditutup</option>
        </Select>
        <Select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="sm:w-52"
        >
          <option value="all">Semua Kelas</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-line" />
          <p className="text-sm font-semibold text-ink">
            Tidak ada asesmen ditemukan
          </p>
          <p className="mt-1 text-xs text-muted">
            Coba ubah filter atau buat asesmen baru.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((asm) => {
            const submitted = asm.submissions.filter(
              (s) => s.statusWork === "submitted"
            ).length;
            const final_ = asm.submissions.filter(
              (s) => s.statusGrading === "final"
            ).length;
            const progress =
              asm.submissions.length > 0
                ? Math.round((final_ / asm.submissions.length) * 100)
                : 0;

            return (
              <Link
                key={asm.id}
                href={`/assessments/${asm.id}`}
                className="glass-card flex flex-col justify-between gap-4 p-5 transition-all hover:border-brand"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md border border-brand-line/70 bg-brand-tint px-2 py-0.5 font-mono text-[10px] font-bold text-brand">
                      {asm.code}
                    </span>
                    <Badge status={ASSESSMENT_STATUS_LABEL[asm.status]} />
                  </div>
                  <h3 className="mt-2 text-sm font-bold break-words text-brand">
                    {asm.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted">
                    {asm.subject} • {asm.className}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[11px] text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />{" "}
                      {formatDueDate(asm.dueDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {asm.durationMinutes} mnt
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-muted">
                      <span>Progres penilaian</span>
                      <span className="nums">
                        {final_}/{asm.submissions.length}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-line/30 pt-2">
                    <span className="flex items-center gap-1 text-[11px] text-muted">
                      <Users className="h-3 w-3" /> {submitted} terkumpul
                    </span>
                    {role === "teacher" ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-brand">
                        <Sparkles className="h-3 w-3" />
                        Nilai
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-brand">
                        Lihat →
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
