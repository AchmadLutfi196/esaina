"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Keluar dari akun"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOut aria-hidden />
      Keluar
    </Button>
  );
}
