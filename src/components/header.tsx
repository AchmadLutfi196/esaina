"use client";

import React from "react";
import { Search, Bell, Sparkles } from "lucide-react";
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
          <p className="text-[11px] font-medium text-[#52697C]">
            Selamat datang kembali,
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <h1 className="truncate text-[15px] font-semibold text-[#0A1680]">
              {userName} {role === "teacher" && "(Fisika)"}
            </h1>
            {identifier ? (
              <span className="rounded-[6px] border border-[#EEF4FF] bg-[#EEF4FF] px-2 py-0.5 text-[11px] font-semibold text-[#0A1680]">
                {identifier}
              </span>
            ) : (
              <span className="rounded-[6px] border border-[#EEF4FF] bg-[#EEF4FF] px-2 py-0.5 text-[11px] font-semibold text-[#0A1680]">
                {roleLabel}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-[220px] sm:flex-none">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#8A9BAF]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari asesmen..."
              aria-label="Cari"
              className="h-[34px] w-full rounded-[8px] border border-[#D8E3EF] bg-[#F4F7FC] pr-3 pl-8 text-[12px] font-medium text-[#0A1680] shadow-none transition-all placeholder:text-[#8A9BAF] focus:bg-white focus:border-[#0A1680] focus:ring-1 focus:ring-[#0A1680] focus:outline-none"
            />
          </div>

          <button
            onClick={onOpenHelp}
            aria-label="Notifikasi"
            className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[8px] border border-[#D8E3EF] bg-[#F4F7FC] text-[#0A1680] transition-colors hover:bg-white hover:border-[#0A1680]"
          >
            <Bell className="h-4 w-4" />
          </button>

          <div
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-br from-brand to-forest-dark text-xs font-bold text-white shadow-xs"
            aria-label={`Avatar ${userName}`}
          >
            {initials(userName)}
          </div>
        </div>
      </div>
    </header>
  );
}
