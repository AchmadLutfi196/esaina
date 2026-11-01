import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClassesForUser, getAssessmentsForUser } from "@/lib/data";
import { ClassesView } from "@/components/classes/classes-view";

export const metadata = { title: "Daftar Kelas" };

export default async function ClassesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const id = session.user.id;
  const role = String(session.user.role).toLowerCase() as any;
  const [classes, assessments] = await Promise.all([
    getClassesForUser(id, role),
    getAssessmentsForUser(id, role),
  ]);

  return (
    <ClassesView
      role={role}
      classes={classes}
      assessments={assessments}
    />
  );
}
export const dynamic = "force-dynamic";
