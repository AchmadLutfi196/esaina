import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { ClassList } from "./class-list";
import { AssessmentBuilder } from "./assessment-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const kpis = [
    { label: "Kelas", value: classCount },
    { label: "Asesmen", value: assessmentCount },
    { label: "LJK menunggu", value: pendingSubmissions },
  ];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-primary">Ruang kerja guru</h1>
        <p className="text-sm text-muted-foreground">Halo, {session.user.name}.</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="gap-1 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{k.label}</p>
            <p className="text-2xl font-bold text-primary">{k.value}</p>
          </Card>
        ))}
      </div>
      {pendingSubmissions > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-primary">Tugas menunggu penilaian</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Ada <span className="font-medium text-foreground">{pendingSubmissions} LJK</span> menunggu disahkan. Buka daftar penilaian untuk memprosesnya.
          </CardContent>
        </Card>
      ) : null}
      <ClassList />
      <AssessmentBuilder />
    </main>
  );
}
