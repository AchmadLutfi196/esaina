"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AmbientBackdrop } from "@/components/ambient-backdrop";
import { HelpDialog } from "@/components/help-dialog";
import type { Role } from "@/types";

export function AppShell({
  user,
  children,
}: {
  user: { id: string; name: string; role: Role; identifier?: string | null };
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [helpOpen, setHelpOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#EBF2FD] via-[#F2F6FD] to-[#FCFDFF]">
      <AmbientBackdrop />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar
          role={user.role}
          userName={user.name}
          onOpenHelp={() => setHelpOpen(true)}
          onSignOut={handleSignOut}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            role={user.role}
            userName={user.name}
            identifier={user.identifier}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenHelp={() => setHelpOpen(true)}
          />

          <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 pt-5 pb-10 sm:px-6">
            {children}
          </main>
        </div>
      </div>

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} role={user.role} />
    </div>
  );
}
