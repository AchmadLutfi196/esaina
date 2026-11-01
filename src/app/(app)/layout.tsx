import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const roleStr = String(session.user.role).toLowerCase() as any;

  return (
    <AppShell
      user={{
        id: session.user.id,
        name: session.user.name ?? "Pengguna",
        role: roleStr,
        identifier: (session.user as any).identifier ?? null,
      }}
    >
      {children}
    </AppShell>
  );
}
