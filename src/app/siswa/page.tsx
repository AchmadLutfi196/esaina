import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { StudentClasses } from "./student-classes";
import { AssessmentList } from "./assessment-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const metadata = { title: "Kelas saya — ESAINA" };

export default async function StudentHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect(session.user.role === "ADMIN" ? "/admin" : "/guru");

  const [classCount, openAssessments, publishedResults] = await Promise.all([
    prisma.classMembership.count({ where: { studentId: session.user.id } }),
    prisma.assessment.count({ where: { status: "OPEN", class: { memberships: { some: { studentId: session.user.id } } } } }),
    prisma.assessment.count({
      where: {
        class: { memberships: { some: { studentId: session.user.id } } },
        publications: { some: { revision: { submission: { studentId: session.user.id } } } },
      },
    }),
  ]);

  const stats = [
    { label: "Kelas diikuti", value: classCount },
    { label: "Asesmen terbuka", value: openAssessments },
    { label: "Hasil terbit", value: publishedResults },
  ];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-primary">Kelas saya</h1>
        <p className="text-sm text-muted-foreground">Halo, {session.user.name}.</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((k) => (
          <Card key={k.label} className="gap-1 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{k.label}</p>
            <p className="text-2xl font-bold text-primary">{k.value}</p>
          </Card>
        ))}
      </div>
      {publishedResults > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-primary">Hasil penilaian</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <Link href="/siswa/results" className="font-medium text-foreground underline-offset-4 hover:underline">
              Lihat {publishedResults} hasil yang sudah diterbitkan
            </Link>
          </CardContent>
        </Card>
      ) : null}
      <StudentClasses />
      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold text-primary">Asesmen terbuka</h2>
        <AssessmentList />
      </section>
    </main>
  );
}
