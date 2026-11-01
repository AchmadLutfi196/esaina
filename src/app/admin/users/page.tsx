import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { AdminUsers } from "./admin-users";

export const metadata = { title: "Manajemen pengguna — ESAINA" };

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/guru");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-primary">Manajemen pengguna</h1>
        <p className="text-sm text-muted-foreground">Kelola akun guru dan siswa peserta asesmen esai.</p>
      </div>
      <AdminUsers currentUserId={session.user.id} />
    </main>
  );
}
