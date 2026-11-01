"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  FolderOpen,
  ArrowRight,
  Calendar,
  KeyRound,
  Plus,
  Users,
  Search,
  GraduationCap,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input, Field } from "@/components/ui/input";
import type { Assessment, ClassItem, Role } from "@/types";

const bannerGradients = [
  "from-[#0A1680] via-[#13259C] to-[#1E3A8A]",
  "from-[#0F2396] via-[#0A1680] to-[#1A2E8A]",
  "from-[#081266] via-[#12228A] to-[#233B9E]",
];

const class3dIcons = [
  "/icons/3d/web-design.png",
  "/icons/3d/ai-component.png",
  "/icons/3d/source-code.png",
  "/icons/3d/laptop-coding.png",
  "/icons/3d/website.png",
  "/icons/3d/domain.png",
];

export function ClassesView({
  role,
  classes,
}: {
  role: Role;
  classes: ClassItem[];
  assessments?: Assessment[];
}) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, id: string, code: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard?.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    setIsSubmitting(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClassName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || data?.error || "Gagal membuat kelas.");
      }

      setNewClassName("");
      setCreateOpen(false);
      router.refresh();
    } catch (err: any) {
      setCreateError(err.message || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClasses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return classes;
    return classes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.classCode.toLowerCase().includes(q) ||
        (c.teacherName && c.teacherName.toLowerCase().includes(q))
    );
  }, [classes, searchQuery]);

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div className="glass-panel flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-center gap-4">
          <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-line/60 bg-white/80 p-2 shadow-xs sm:flex">
            <img
              src="/icons/3d/classroom.png"
              alt="Ruang Kelas 3D"
              className="h-10 w-10 object-contain drop-shadow-sm transition-transform duration-300 hover:scale-110"
            />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-pastel bg-butter-yellow px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand">
              <BookOpen className="h-3.5 w-3.5" />
              <span>
                {role === "teacher"
                  ? "Manajemen Ruang Kelas"
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
                ? "Informasi ruang kelas yang Anda ampu. Klik kartu untuk masuk ke detail tugas dan rekap nilai."
                : "Pilih kelas untuk masuk ke ruang kelas dan mengerjakan tugas asesmen dari guru."}
            </p>
          </div>
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

      {/* Search & Overview Filter Bar */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama kelas, mapel, kode kelas, guru..."
            className="pl-9 text-xs"
          />
        </div>

        <span className="text-xs font-semibold text-muted">
          Menampilkan <strong className="text-brand">{filteredClasses.length}</strong> dari{" "}
          <strong className="text-brand">{classes.length}</strong> kelas
        </span>
      </div>

      {/* Class Cards */}
      {filteredClasses.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-line" />
          <p className="text-sm font-semibold text-ink">
            {searchQuery ? "Kelas tidak ditemukan" : "Belum ada kelas"}
          </p>
          <p className="mt-1 text-xs text-muted">
            {searchQuery
              ? `Tidak ada kelas yang cocok dengan kata kunci "${searchQuery}".`
              : role === "teacher"
                ? "Buat kelas pertama Anda dengan tombol di atas."
                : "Gabung kelas dengan kode dari guru Anda."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredClasses.map((cls, index) => {
            const gradient = bannerGradients[index % bannerGradients.length];

            return (
              <div
                key={cls.id}
                className="glass-card group flex flex-col justify-between overflow-hidden border border-line transition-all duration-300 hover:border-brand hover:shadow-[0_12px_36px_rgba(10,22,128,0.12)]"
              >
                {/* Banner Top */}
                <Link href={`/classes/${cls.id}`} className="block">
                  <div
                    className={`relative cursor-pointer bg-gradient-to-br p-5 text-white transition-opacity group-hover:opacity-95 ${gradient}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-md bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-butter-yellow backdrop-blur-xs">
                        {cls.subject} · {cls.grade}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleCopy(e, cls.id, cls.classCode)}
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 font-mono text-[11px] font-bold text-white transition-colors hover:bg-white/25"
                        title="Salin Kode Kelas"
                        aria-label="Salin kode kelas"
                      >
                        <span>{cls.classCode}</span>
                        {copiedId === cls.id ? (
                          <span className="flex items-center gap-1 text-butter-yellow">
                            <Check className="h-3 w-3" />
                            <span className="text-[10px] font-sans">Tersalin</span>
                          </span>
                        ) : (
                          <Copy className="h-3 w-3 text-bleu-ciel" />
                        )}
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-extrabold tracking-tight text-white group-hover:underline">
                          {cls.name}
                        </h2>

                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-bleu-ciel">
                          <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            Guru:{" "}
                            <strong className="font-semibold text-white">
                              {cls.teacherName || "Guru Pengampu"}
                            </strong>
                          </span>
                        </p>
                      </div>

                      <div className="shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110">
                        <img
                          src={class3dIcons[index % class3dIcons.length]}
                          alt="Icon 3D Web Component"
                          className="h-12 w-12 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.28)]"
                        />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Keterangan Kelas (Hanya Info & Keterangan Kelas, Tanpa Daftar Asesmen) */}
                <div className="flex-1 space-y-4 p-5">
                  {/* Grid Statistik & Keterangan */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-xl border border-line/70 bg-white/70 p-3">
                      <div className="flex items-center gap-1.5 text-muted">
                        <Users className="h-3.5 w-3.5 text-brand" />
                        <span className="text-[11px] font-semibold">Siswa</span>
                      </div>
                      <p className="nums mt-1 text-base font-extrabold text-brand">
                        {cls.studentCount}{" "}
                        <span className="text-xs font-medium text-muted">terdaftar</span>
                      </p>
                    </div>

                    <div className="rounded-xl border border-line/70 bg-white/70 p-3">
                      <div className="flex items-center gap-1.5 text-muted">
                        <BookOpen className="h-3.5 w-3.5 text-brand" />
                        <span className="text-[11px] font-semibold">Asesmen</span>
                      </div>
                      <p className="nums mt-1 text-base font-extrabold text-brand">
                        {cls.assessmentCount}{" "}
                        <span className="text-xs font-medium text-muted">tugas esai</span>
                      </p>
                    </div>

                    <div className="rounded-xl border border-line/70 bg-white/70 p-3">
                      <div className="flex items-center gap-1.5 text-muted">
                        <Calendar className="h-3.5 w-3.5 text-brand" />
                        <span className="text-[11px] font-semibold">Semester</span>
                      </div>
                      <p className="mt-1 truncate text-xs font-bold text-ink">
                        {cls.academicYear}
                      </p>
                    </div>

                    <div className="rounded-xl border border-line/70 bg-white/70 p-3">
                      <div className="flex items-center gap-1.5 text-muted">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-[11px] font-semibold">Status</span>
                      </div>
                      <p className="mt-1 truncate text-xs font-bold text-emerald-700">
                        Kelas Aktif
                      </p>
                    </div>
                  </div>

                  {/* Ringkasan Keterangan Ruang Kelas */}
                  <div className="rounded-xl border border-line/60 bg-paper/70 p-3 text-xs leading-relaxed text-muted">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Keterangan Kelas</span>
                    </div>
                    <p className="mt-1 text-[11px]">
                      Ruang pembelajaran esai dan asesmen analitik. Daftar tugas esai, rubrik kriteria, pengerjaan LJK, serta rekapitulasi nilai dapat diakses langsung di dalam ruang kelas.
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="border-t border-line/70 bg-paper/80 p-4">
                  <Link href={`/classes/${cls.id}`} className="block w-full">
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

      {/* Create Class Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => {
          if (!isSubmitting) setCreateOpen(false);
        }}
        title="Buat Ruang Kelas Baru"
        description="Masukkan nama kelas baru untuk mulai mengelola siswa dan asesmen esai."
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setCreateOpen(false)}
            >
              Batal
            </Button>
            <Button
              size="sm"
              disabled={isSubmitting || !newClassName.trim()}
              onClick={handleCreateClass}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 text-butter-yellow" />
                  <span>Simpan Kelas</span>
                </>
              )}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateClass} className="space-y-4 py-2">
          {createError && (
            <p
              role="alert"
              className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-900"
            >
              {createError}
            </p>
          )}

          <Field label="Nama Kelas" required>
            <Input
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Contoh: XII D — Biologi Lingkungan"
              required
              autoFocus
            />
          </Field>

          <p className="text-[11px] text-muted">
            Kode kelas (join code) 6 digit akan di-generate otomatis secara acak oleh sistem.
          </p>
        </form>
      </Dialog>
    </div>
  );
}
