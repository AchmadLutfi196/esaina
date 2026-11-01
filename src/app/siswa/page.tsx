import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { BadgeCheck, BookOpen, FileText } from "lucide-react";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { StudentClasses } from "./student-classes";
import { AssessmentList } from "./assessment-list";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";

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

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold text-primary">Kelas saya</h1>
          <p className="text-sm text-muted-foreground">Halo, {session.user.name}. Kerjakan asesmen dan lihat hasil yang sudah diterbitkan.</p>
        </div>
        {publishedResults > 0 ? (
          <Button asChild variant="soft">
            <Link href="/siswa/results">Lihat hasil</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Kelas diikuti" value={classCount} icon={BookOpen} />
        <StatCard label="Asesmen terbuka" value={openAssessments} icon={FileText} />
        <StatCard
          label="Hasil terbit"
          value={publishedResults}
          icon={BadgeCheck}
          tone={publishedResults > 0 ? "success" : "default"}
        />
      </div>

      <StudentClasses />

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold text-primary">Asesmen terbuka</h2>
        <AssessmentList />
      </section>
    </main>
  );
}
