"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Sparkles,
  GraduationCap,
  Users,
  ChartColumn,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import type { Role } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match: string[];
}

const teacherNav: NavItem[] = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard, match: ["/dashboard"] },
  { href: "/classes", label: "Daftar Kelas", icon: BookOpen, match: ["/classes"] },
  {
    href: "/assessments",
    label: "Daftar Asesmen",
    icon: FileText,
    match: ["/assessments"],
  },
  { href: "/grading", label: "Ruang Penilaian", icon: Sparkles, match: ["/grading"] },
];

const studentNav: NavItem[] = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard, match: ["/dashboard"] },
  { href: "/classes", label: "Daftar Kelas", icon: BookOpen, match: ["/classes"] },
  { href: "/results", label: "Hasil & Nilai", icon: CheckCircle2, match: ["/results"] },
  { href: "/join", label: "Gabung Kelas", icon: GraduationCap, match: ["/join"] },
];

const adminNav: NavItem[] = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard, match: ["/dashboard"] },
  { href: "/classes", label: "Daftar Kelas", icon: BookOpen, match: ["/classes"] },
  {
    href: "/assessments",
    label: "Daftar Asesmen",
    icon: FileText,
    match: ["/assessments"],
  },
  { href: "/admin/users", label: "Kelola Pengguna", icon: Users, match: ["/admin/users"] },
  {
    href: "/admin/monitoring",
    label: "Monitoring",
    icon: ChartColumn,
    match: ["/admin/monitoring"],
  },
];

export function Sidebar({
  role,
  userName,
  onOpenHelp,
  onSignOut,
}: {
  role: Role;
  userName: string;
  onOpenHelp: () => void;
  onSignOut: () => void;
}) {
  const pathname = usePathname();
  const navItems =
    role === "admin" ? adminNav : role === "teacher" ? teacherNav : studentNav;

  const roleLabel =
    role === "admin" ? "Admin" : role === "teacher" ? "Guru" : "Siswa";

  return (
    <aside className="sticky top-0 z-30 flex h-screen w-16 shrink-0 select-none flex-col justify-between border-r border-white/80 bg-white/70 py-5 shadow-[4px_0_30px_rgba(10,22,128,0.04),inset_-1px_0_0_rgba(255,255,255,0.85)] backdrop-blur-2xl sm:w-20 lg:w-60">
      <div className="w-full px-2 sm:px-3 lg:px-4">
        {/* Brand */}
        <Link
          href="/dashboard"
          className="mb-8 flex flex-col items-center gap-1.5 lg:items-start"
        >
          {/* Compact mark on collapsed sidebar */}
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line/60 bg-white p-2 shadow-[0_4px_16px_rgba(10,22,128,0.08)] lg:hidden">
            <img
              src="/brand/esaina-mark.png"
              alt="ESAINA"
              className="h-8 w-8 object-contain"
            />
          </div>

          {/* Full logo on wide sidebar */}
          <div className="hidden lg:flex lg:flex-col lg:items-start lg:gap-1">
            <img
              src="/brand/esaina-logo.png"
              alt="ESAINA"
              className="h-8 w-auto object-contain"
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Ruang {roleLabel}
            </span>
          </div>
        </Link>

        {/* Nav */}
        <nav aria-label="Navigasi utama" className="space-y-1.5">
          {navItems.map((item) => {
            const active = item.match.some(
              (m) => pathname === m || pathname.startsWith(`${m}/`)
            );
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 lg:w-full lg:justify-start lg:gap-3 lg:px-3.5",
                  active
                    ? "bg-white/80 text-brand shadow-[0_4px_16px_rgba(10,22,128,0.06),inset_0_1px_1px_rgba(255,255,255,1)] border border-brand-line/40 font-bold"
                    : "text-muted hover:bg-white/70 hover:text-ink hover:shadow-xs"
                )}
              >
                {active && (
                  <span className="absolute left-0 h-6 w-1 rounded-r-full bg-brand shadow-sm shadow-brand/40" />
                )}
                <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105", active ? "text-brand" : "text-muted")} />
                <span className="hidden text-xs font-semibold lg:inline">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="w-full space-y-1.5 px-2 sm:px-3 lg:px-4">
        <button
          onClick={onOpenHelp}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-muted transition-all duration-200 hover:bg-white/70 hover:text-ink hover:shadow-xs lg:w-full lg:justify-start lg:gap-3 lg:px-3.5"
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          <span className="hidden text-xs font-semibold lg:inline">Bantuan</span>
        </button>

        <button
          onClick={onSignOut}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-muted transition-all duration-200 hover:bg-rose-50/80 hover:text-rose-600 hover:shadow-xs lg:w-full lg:justify-start lg:gap-3 lg:px-3.5"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="hidden text-xs font-semibold lg:inline">Keluar</span>
        </button>

        <div className="mt-3 hidden items-center gap-2.5 rounded-2xl border border-white/85 bg-white/75 p-2.5 shadow-[0_4px_16px_rgba(10,22,128,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)] backdrop-blur-md lg:flex">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-[11px] font-bold text-white shadow-xs">
            {initials(userName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold text-ink">{userName}</p>
            <p className="truncate text-[10px] font-medium text-muted">{roleLabel}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
