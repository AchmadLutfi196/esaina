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
          <p className="text-[11px] font-medium text-muted">
            Selamat datang kembali,
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <h1 className="truncate text-sm font-bold tracking-tight text-ink sm:text-base">
              {userName}
            </h1>
            <span className="glass-pill rounded-full border border-brand-line/50 bg-brand-tint/90 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-brand">
              {roleLabel}
            </span>
            {identifier && (
              <span className="nums glass-pill hidden rounded-full border border-line-2/80 bg-white/70 px-2.5 py-0.5 text-[10px] font-semibold text-muted sm:inline">
                {identifier}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 md:w-64 md:flex-none">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari asesmen, kelas, siswa…"
              aria-label="Cari"
              className="h-9 w-full rounded-xl border border-white/90 bg-white/70 pr-3 pl-9 text-xs font-medium text-ink shadow-xs backdrop-blur-md transition-all duration-200 placeholder:text-muted/70 focus:bg-white focus:shadow-sm focus-visible:border-brand-line focus-visible:ring-2 focus-visible:ring-brand-line/40 focus-visible:outline-none"
            />
          </div>

          <button
            onClick={onOpenHelp}
            aria-label="Bantuan"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/85 bg-white/70 text-muted shadow-xs backdrop-blur-md transition-all duration-200 hover:bg-white hover:text-brand hover:shadow-sm"
          >
            <Bell className="h-4 w-4" />
          </button>

          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/85 bg-gradient-to-br from-brand to-forest-dark text-xs font-bold text-white shadow-xs"
            aria-label={`Avatar ${userName}`}
          >
            {initials(userName)}
          </div>
        </div>
      </div>
    </header>
  );
}
