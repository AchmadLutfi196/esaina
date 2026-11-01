import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { StudentClasses } from "./student-classes";
import { AssessmentList } from "./assessment-list";

export const metadata = { title: "Kelas saya — ESAINA" };

export default async function StudentHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/guru");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-primary">Kelas saya</h1>
        <p className="text-sm text-muted-foreground">Halo, {session.user.name}.</p>
      </div>
      <StudentClasses />
      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold text-primary">Asesmen terbuka</h2>
        <AssessmentList />
      </section>
    </main>
  );
}
