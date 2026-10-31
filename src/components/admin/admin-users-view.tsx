"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Plus,
  Search,
  Shield,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { ROLE_LABEL, type Role } from "@/types";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  identifier: string | null;
  isActive: boolean;
  createdAt: string;
  submissionCount: number;
  assessmentCount: number;
  classCount: number;
}

export function AdminUsersView({ users }: { users: AdminUser[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.identifier ?? "").includes(search);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header matching 08 · Admin kelola pengguna.png */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/80 bg-white/85 p-6 shadow-[0_4px_24px_rgba(10,22,128,0.04)] backdrop-blur-md sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-extrabold tracking-wide text-brand sm:text-3xl">
            MANAJEMEN PENGGUNA
          </h1>
          <p className="text-xs text-muted sm:text-sm">
            Kelola data akun pengajar dan siswa peserta asesmen esai.
          </p>
        </div>

        <Button className="gap-2 rounded-xl bg-brand font-bold text-white shadow-md hover:bg-brand-dark">
          <Plus className="h-4 w-4" />
          <span>Tambah Pengguna</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-xs sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, NIS/NIP..."
            className="pl-9 bg-paper/50"
          />
        </div>
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "all" | Role)}
          className="sm:w-48 bg-paper/50"
        >
          <option value="all">Semua Peran</option>
          <option value="admin">Administrator</option>
          <option value="teacher">Guru (Evaluator)</option>
          <option value="student">Siswa (Peserta)</option>
        </Select>
      </div>

      {/* Table matching 08 · Admin kelola pengguna.png */}
      <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_4px_24px_rgba(10,22,128,0.04)]">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-line" />
            <p className="text-sm font-bold text-ink">Tidak ada pengguna ditemukan</p>
            <p className="mt-1 text-xs text-muted">
              Coba sesuaikan kata kunci pencarian atau ubah filter peran.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line/60 bg-paper/70 text-[11px] font-extrabold uppercase tracking-wider text-muted">
                  <th className="py-3.5 px-4 sm:px-6">NAMA PENGGUNA</th>
                  <th className="py-3.5 px-4">EMAIL</th>
                  <th className="py-3.5 px-4">NIS / NIP</th>
                  <th className="py-3.5 px-4">PERAN</th>
                  <th className="py-3.5 px-4">STATUS</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40 text-xs">
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="transition-colors hover:bg-paper/40"
                  >
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-bold text-ink text-sm">
                        {u.name}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-muted text-[11px]">
                      {u.email}
                    </td>
                    <td className="py-4 px-4 font-mono text-ink text-[11px]">
                      {u.identifier ?? "—"}
                    </td>
                    <td className="py-4 px-4">
                      {u.role === "admin" ? (
                        <span className="inline-block rounded-md border border-purple-300 bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-900">
                          Admin
                        </span>
                      ) : u.role === "teacher" ? (
                        <span className="inline-block rounded-md border border-bleu-ciel bg-bleu-ciel/25 px-2.5 py-0.5 text-[10px] font-bold text-brand">
                          Teacher
                        </span>
                      ) : (
                        <span className="inline-block rounded-md border border-orange-pastel bg-butter-yellow px-2.5 py-0.5 text-[10px] font-bold text-brand">
                          Student
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                        AKTIF
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg border-line px-3 text-xs font-bold text-brand hover:border-brand hover:bg-white"
                      >
                        Ubah
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
