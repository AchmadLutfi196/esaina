"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, ClipboardList, Home, ChartColumn } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
} from "@/components/ui/sidebar";
import { LogoutButton } from "@/app/logout-button";

type Role = "TEACHER" | "STUDENT";

const NAV: Record<Role, { href: string; label: string; icon: React.ElementType }[]> = {
  TEACHER: [
    { href: "/guru", label: "Beranda", icon: Home },
    { href: "/guru/grading", label: "Penilaian", icon: ClipboardList },
  ],
  STUDENT: [
    { href: "/siswa", label: "Beranda", icon: Home },
    { href: "/siswa/results", label: "Hasil", icon: ChartColumn },
  ],
};

export function AppSidebar({ role, name }: { role: Role; name: string }) {
  const pathname = usePathname();

  return (
    <Sidebar className="hidden lg:flex" aria-label="Navigasi utama">
      <SidebarHeader className="border-b-0 px-5">
        <Link href={role === "TEACHER" ? "/guru" : "/siswa"} className="flex items-center gap-2">
          <GraduationCap className="size-6 text-primary" aria-hidden />
          <span className="font-heading text-lg font-bold tracking-tight text-primary">ESAINA</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <nav className="flex flex-col gap-1" aria-label={role === "TEACHER" ? "Menu guru" : "Menu siswa"}>
          {NAV[role].map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <SidebarItem
                key={item.href}
                active={active}
                aria-current={active ? "page" : undefined}
                className="p-0"
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active && "font-semibold"
                  )}
                >
                  <item.icon className="size-5 shrink-0" aria-hidden />
                  <span>{item.label}</span>
                </Link>
              </SidebarItem>
            );
          })}
        </nav>
      </SidebarContent>
      <SidebarFooter className="h-auto flex-col items-stretch gap-2 border-t-0 py-3">
        <p className="truncate text-xs text-muted-foreground" title={name}>
          {name}
        </p>
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
