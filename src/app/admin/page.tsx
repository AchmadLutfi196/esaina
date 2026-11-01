import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Beranda admin — ESAINA" };

export default async function AdminHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect(session.user.role === "TEACHER" ? "/guru" : "/siswa");

  const [teachers, students, admins, active, assessments, submissions] = await Promise.all([
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.assessment.count(),
    prisma.submission.count({ where: { status: "SUBMITTED" } }),
  ]);

  const kpis = [
    { label: "Guru", value: teachers },
    { label: "Siswa", value: students },
    { label: "Admin", value: admins },
    { label: "Pengguna aktif", value: active },
    { label: "Asesmen", value: assessments },
    { label: "LJK terkumpul", value: submissions },
  ];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-primary">Beranda admin</h1>
        <p className="text-sm text-muted-foreground">Halo, {session.user.name}. Ringkasan platform ESAINA.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.label} className="gap-1 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{k.label}</p>
            <p className="text-2xl font-bold text-primary">{k.value}</p>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-primary">Pintasan</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>Kelola akun di <span className="font-medium text-foreground">Manajemen pengguna</span>, atau pantau progres penilaian di <span className="font-medium text-foreground">Monitoring asesmen</span>.</p>
        </CardContent>
      </Card>
    </main>
  );
}
