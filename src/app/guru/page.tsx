import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { LogoutButton } from "../logout-button";
import { ClassList } from "./class-list";
import { AssessmentBuilder } from "./assessment-builder";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Ruang kerja guru — ESAINA" };

export default async function TeacherHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/siswa");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <header className="lg lg-regular lg-surface flex items-center justify-between gap-4 px-6 py-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold text-primary">Ruang kerja guru</h1>
          <p className="text-sm text-muted-foreground">Halo, {session.user.name}.</p>
        </div>
          <div className="flex items-center gap-2"><Button asChild variant="outline" size="sm"><Link href="/guru/grading">Penilaian</Link></Button><LogoutButton /></div>
      </header>
      <ClassList />
      <AssessmentBuilder />
    </div>
  );
}
