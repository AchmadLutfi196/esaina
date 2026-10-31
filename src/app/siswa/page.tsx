import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { LogoutButton } from "../logout-button";
import { StudentClasses } from "./student-classes";
import { AssessmentList } from "./assessment-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

export const metadata = { title: "Kelas saya — ESAINA" };

export default async function StudentHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/guru");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold text-primary">Kelas saya</h1>
            <p className="text-sm text-muted-foreground">Halo, {session.user.name}.</p>
          </div>
          <div className="flex items-center gap-2"><Button asChild variant="outline" size="sm"><Link href="/siswa/results">Hasil</Link></Button><LogoutButton /></div>
        </CardHeader>
      </Card>
      <StudentClasses />
      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold text-primary">Asesmen terbuka</h2>
        <AssessmentList />
      </section>
    </div>
  );
}
