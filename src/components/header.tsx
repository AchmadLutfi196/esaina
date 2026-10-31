"use client";

import React from "react";
import { Search, Bell, Sparkles, User } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import type { Role } from "@/types";

export function Header({
  role,
  userName,
  identifier,
  searchQuery,
  onSearchChange,
  onOpenHelp,
}: {
  role: Role;
  userName: string;
  identifier?: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenHelp: () => void;
}) {
  const roleLabel =
    role === "admin" ? "Administrator" : role === "teacher" ? "Guru" : "Siswa";

  return (
    <header className="sticky top-0 z-20 border-b border-white/80 bg-white/75 backdrop-blur-2xl shadow-[0_4px_30px_rgba(10,22,128,0.03),inset_0_-1px_0_rgba(255,255,255,0.75)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3.5 sm:px-6 md:flex-row md:items-center md:justify-between">
        {/* Identity */}
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted">
            Selamat datang kembali,
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <h1 className="truncate text-base font-bold tracking-tight text-ink">
              {userName} {role === "teacher" && "(Fisika)"}
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B8E2D8] bg-[#E6F4F1] px-2.5 py-0.5 text-[11px] font-bold text-[#0D523C]">
              <User className="h-3 w-3 shrink-0" />
              <span>{roleLabel} {identifier ? `(${identifier})` : ""}</span>
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Ringkasan asesmen dan tugas penilaian Anda
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-60 sm:flex-none">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari asesmen..."
              aria-label="Cari"
              className="h-9 w-full rounded-xl border border-gray-200 bg-white pr-3 pl-9 text-xs font-medium text-ink shadow-2xs transition-all placeholder:text-muted focus:bg-white focus:border-[#1E3A2F] focus:outline-none"
            />
          </div>

          <button
            onClick={onOpenHelp}
            aria-label="Bantuan"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-muted shadow-2xs transition-colors hover:text-[#1E3A2F] hover:border-[#1E3A2F]"
          >
            <Bell className="h-4 w-4" />
          </button>

          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1E3A2F] text-xs font-bold text-white shadow-2xs"
            aria-label={`Avatar ${userName}`}
          >
            {initials(userName)}
          </div>
        </div>
      </div>
    </header>
  );
}
