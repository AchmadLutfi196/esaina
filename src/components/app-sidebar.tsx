"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, ClipboardList, Home, ChartColumn } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
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

export function AppSidebar({ role, name, children }: { role: Role; name: string; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider className="min-h-screen">
      <Sidebar
        aria-label="Navigasi utama"
        mobileTitle={role === "TEACHER" ? "Menu guru" : "Menu siswa"}
        mobileDescription="Navigasi utama aplikasi ESAINA"
      >
        <SidebarHeader className="border-b-0 px-5">
          <Link href={role === "TEACHER" ? "/guru" : "/siswa"} className="flex items-center gap-2">
            <GraduationCap className="size-6 text-primary" aria-hidden />
            <span className="font-heading text-lg font-bold tracking-tight text-primary">ESAINA</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <nav aria-label={role === "TEACHER" ? "Menu guru" : "Menu siswa"}>
                <SidebarMenu>
                  {NAV[role].map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuLink
                          href={item.href}
                          isActive={active}
                          aria-current={active ? "page" : undefined}
                        >
                          <item.icon className="size-5 shrink-0" aria-hidden />
                          <span>{item.label}</span>
                        </SidebarMenuLink>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </nav>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="h-auto flex-col items-stretch gap-2 border-t-0 py-3">
          <p className="truncate text-xs text-muted-foreground" title={name}>
            {name}
          </p>
          <LogoutButton />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-border px-4 md:hidden">
          <SidebarTrigger label="Buka menu" />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
