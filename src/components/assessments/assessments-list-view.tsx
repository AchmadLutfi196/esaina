"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  FileText,
  Plus,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { formatDueDate } from "@/lib/utils";
import {
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
      a.subject.toLowerCase().includes(search.toLowerCase()) ||
      (a.className ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || a.status === statusFilter;
    const matchesClass = classFilter === "all" || a.classId === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  return (
    <div className="animate-fade-up space-y-6">
      {/* Top Header matching 03 · Guru daftar asesmen.png */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/80 bg-white/85 p-6 shadow-[0_4px_24px_rgba(10,22,128,0.04)] backdrop-blur-md sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-extrabold tracking-wide text-brand sm:text-3xl">
            DAFTAR ASESMEN
          </h1>
          <p className="text-xs text-muted sm:text-sm">
            Semua asesmen yang dapat Anda akses sebagai koordinator maupun penilai.
          </p>
        </div>

        {role === "teacher" && (
          <Link href="/assessments/new">
            <Button className="gap-2 rounded-xl bg-brand font-bold text-white shadow-md hover:bg-brand-dark">
              <Plus className="h-4 w-4" />
              <span>Buat Asesmen Baru</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-xs sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, mata pelajaran, atau kode..."
            className="pl-9 bg-paper/50"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-44 bg-paper/50"
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="draft">Draf</option>
          <option value="completed">Selesai</option>
        </Select>
        <Select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="sm:w-48 bg-paper/50"
        >
          <option value="all">Semua Kelas</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Table matching 03 · Guru daftar asesmen.png */}
      <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_4px_24px_rgba(10,22,128,0.04)]">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-line" />
            <p className="text-sm font-bold text-ink">Tidak ada asesmen ditemukan</p>
            <p className="mt-1 text-xs text-muted">
              Coba sesuaikan kata kunci pencarian atau ubah filter status.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line/60 bg-paper/70 text-[11px] font-extrabold uppercase tracking-wider text-muted">
                  <th className="py-3.5 px-4 sm:px-6">ASESMEN</th>
                  <th className="py-3.5 px-4">KODE</th>
                  <th className="py-3.5 px-4">SOAL</th>
                  <th className="py-3.5 px-4">PESERTA</th>
                  <th className="py-3.5 px-4">BATAS WAKTU</th>
                  <th className="py-3.5 px-4">STATUS</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40 text-xs">
                {filtered.map((asm) => {
                  const submittedCount = asm.submissions.filter(
                    (s) => s.statusWork === "submitted"
                  ).length;

                  return (
                    <tr
                      key={asm.id}
                      className="transition-colors hover:bg-paper/40"
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <div className="min-w-0">
                          <h3 className="font-bold text-ink text-sm">
                            {asm.title}
                          </h3>
                          <p className="mt-0.5 text-[11px] text-muted">
                            {asm.subject} - {asm.className}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block rounded-md border border-line bg-paper px-2 py-0.5 font-mono text-[11px] font-bold text-brand">
                          {asm.code}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-ink">
                        {asm.questions.length} Soal
                      </td>
                      <td className="py-4 px-4 font-semibold text-ink">
                        {submittedCount} Siswa
                      </td>
                      <td className="py-4 px-4 font-medium text-muted">
                        {formatDueDate(asm.dueDate)}
                      </td>
                      <td className="py-4 px-4">
                        {asm.status === "active" ? (
                          <span className="inline-block rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                            AKTIF
                          </span>
                        ) : asm.status === "draft" ? (
                          <span className="inline-block rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                            DRAF
                          </span>
                        ) : (
                          <span className="inline-block rounded-md border border-line bg-paper px-2 py-0.5 text-[10px] font-bold text-muted uppercase">
                            SELESAI
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <Link href={`/assessments/${asm.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg border-line px-3.5 text-xs font-bold text-brand hover:border-brand hover:bg-white"
                          >
                            Kelola
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
