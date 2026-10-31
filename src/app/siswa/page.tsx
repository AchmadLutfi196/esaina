import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { LogoutButton } from "../logout-button";
import { StudentClasses } from "./student-classes";

export const metadata = { title: "Kelas saya — ESAINA" };

export default async function StudentHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/guru");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <header className="lg lg-regular lg-surface flex items-center justify-between gap-4 px-6 py-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold text-primary">Kelas saya</h1>
          <p className="text-sm text-muted-foreground">Halo, {session.user.name}.</p>
        </div>
        <LogoutButton />
      </header>
      <StudentClasses />
    </div>
  );
}
