"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button variant="soft" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
      Keluar
    </Button>
  );
}
