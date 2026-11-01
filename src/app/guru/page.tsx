import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Building2, ClipboardList, FileText } from "lucide-react";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { ClassList } from "./class-list";
import { AssessmentBuilder } from "./assessment-builder";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";

export const metadata = { title: "Ruang kerja guru — ESAINA" };

export default async function TeacherHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") redirect("/siswa");

  const [classCount, assessmentCount, pendingSubmissions] = await Promise.all([
    prisma.class.count({ where: { teacherId: session.user.id } }),
    prisma.assessment.count({ where: { class: { teacherId: session.user.id } } }),
    prisma.submission.count({
      where: { status: "SUBMITTED", assessment: { class: { teacherId: session.user.id } }, gradeRevisions: { none: { status: "FINAL" } } },
    }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold text-primary">Ruang kerja guru</h1>
          <p className="text-sm text-muted-foreground">Halo, {session.user.name}. Kelola kelas dan nilai esai siswa di sini.</p>
        </div>
        <Button asChild variant="solid">
          <Link href="/guru/grading">Buka penilaian</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Kelas" value={classCount} icon={Building2} />
        <StatCard label="Asesmen" value={assessmentCount} icon={FileText} />
        <StatCard
          label="LJK menunggu"
          value={pendingSubmissions}
          icon={ClipboardList}
          tone={pendingSubmissions > 0 ? "warning" : "default"}
        />
      </div>

      {pendingSubmissions > 0 ? (
        <Card className="gap-3 px-5 py-4">
          <p className="text-base font-semibold">Tugas menunggu penilaian</p>
          <p className="text-sm text-muted-foreground">
            Ada {pendingSubmissions} LJK yang sudah dikumpulkan dan belum disahkan.
          </p>
          <div>
            <Button asChild variant="soft" size="sm">
              <Link href="/guru/grading">Proses penilaian</Link>
            </Button>
          </div>
        </Card>
      ) : null}

      <ClassList />
      <AssessmentBuilder />
    </main>
  );
}
