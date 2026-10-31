import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

export const metadata = { title: "Daftar asesmen — ESAINA" };

export default async function StudentHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/guru");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <header className="lg lg-regular lg-surface flex flex-col gap-1 px-6 py-5">
        <h1 className="text-3xl font-semibold text-primary">Daftar asesmen</h1>
        <p className="text-sm text-muted-foreground">
          Halo, {session.user.name}. Bergabung ke kelas lalu kerjakan asesmen.
        </p>
      </header>
    </div>
  );
}
