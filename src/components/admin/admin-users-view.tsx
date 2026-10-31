"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Search,
  Shield,
  User,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { cn, formatDate, initials } from "@/lib/utils";
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

const roleIcon: Record<Role, React.ComponentType<{ className?: string }>> = {
  admin: Shield,
  teacher: User,
  student: GraduationCap,
};

const roleTone: Record<Role, string> = {
  admin: "bg-[#F0EAFE] text-[#4C1D95] border-[#4C1D95]/25",
  teacher: "bg-brand-tint text-brand border-brand-line/50",
  student: "bg-[#FDF2E0] text-[#7A4C05] border-[#7A4C05]/25",
};

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

  const counts = {
    all: users.length,
    teacher: users.filter((u) => u.role === "teacher").length,
    student: users.filter((u) => u.role === "student").length,
    admin: users.filter((u) => u.role === "admin").length,
  };

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div className="glass-panel flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-pastel bg-butter-yellow px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand">
            <Users className="h-3.5 w-3.5" />
            <span>Manajemen Pengguna</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-brand sm:text-2xl">
            Kelola Pengguna
          </h1>
          <p className="text-xs text-muted sm:text-sm">
            Lihat seluruh akun guru, siswa, dan administrator sekolah.
          </p>
        </div>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {(
          [
            ["all", "Semua", counts.all, "bg-white/85"],
            ["teacher", "Guru", counts.teacher, "bg-brand-tint/70"],
            ["student", "Siswa", counts.student, "bg-[#FDF2E0]"],
            ["admin", "Admin", counts.admin, "bg-[#F0EAFE]"],
          ] as const
        ).map(([role, label, count, bg]) => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={cn(
              "cursor-pointer rounded-2xl border p-4 text-left transition-all",
              bg,
              roleFilter === role
                ? "border-brand shadow-sm"
                : "border-white hover:border-brand-line"
            )}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              {label}
            </span>
            <p className="nums mt-1 text-2xl font-extrabold text-brand">
              {count}
            </p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, atau NIP/NIS..."
            className="pl-9"
          />
        </div>
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "all" | Role)}
          className="sm:w-44"
        >
          <option value="all">Semua Peran</option>
          <option value="teacher">Guru</option>
          <option value="student">Siswa</option>
          <option value="admin">Admin</option>
        </Select>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <Table>
          <THead>
            <TR>
              <TH className="p-4">Pengguna</TH>
              <TH className="p-4">Peran</TH>
              <TH className="p-4">NIP / NIS</TH>
              <TH className="p-4 text-center">Kelas</TH>
              <TH className="p-4 text-center">Asesmen</TH>
              <TH className="p-4 text-center">Submission</TH>
              <TH className="p-4">Status</TH>
              <TH className="p-4">Terdaftar</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((u) => {
              const Icon = roleIcon[u.role];
              return (
                <TR key={u.id}>
                  <TD className="p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                        {initials(u.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-brand">
                          {u.name}
                        </p>
                        <p className="truncate text-[11px] text-muted">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </TD>
                  <TD className="p-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        roleTone[u.role]
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {ROLE_LABEL[u.role]}
                    </span>
                  </TD>
                  <TD className="nums p-4 text-[11px] text-muted">
                    {u.identifier ?? "—"}
                  </TD>
                  <TD className="nums p-4 text-center">
                    {u.role === "teacher" ? u.classCount : "—"}
                  </TD>
                  <TD className="nums p-4 text-center">
                    {u.role === "teacher" ? u.assessmentCount : "—"}
                  </TD>
                  <TD className="nums p-4 text-center">
                    {u.role === "student" ? u.submissionCount : "—"}
                  </TD>
                  <TD className="p-4">
                    <Badge
                      tone={u.isActive ? "success" : "danger"}
                    >
                      {u.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TD>
                  <TD className="p-4 text-[11px] text-muted">
                    {formatDate(u.createdAt)}
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>

        {filtered.length === 0 && (
          <p className="py-10 text-center text-xs text-muted">
            Tidak ada pengguna yang cocok dengan filter.
          </p>
        )}
      </Card>

      <p className="text-[11px] text-muted">
        💡 Fitur tambah/ubah/nonaktifkan pengguna akan tersedia setelah API
        route manajemen pengguna ditambahkan.
      </p>
    </div>
  );
}
