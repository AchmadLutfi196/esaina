import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAssessmentsForUser, getClassesForUser } from "@/lib/data";
import { AssessmentsListView } from "@/components/assessments/assessments-list-view";

export const metadata = { title: "Daftar Asesmen" };

export default async function AssessmentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const id = session.user.id;
  const role = String(session.user.role).toLowerCase() as any;
  const [assessments, classes] = await Promise.all([
    getAssessmentsForUser(id, role),
    getClassesForUser(id, role),
  ]);

  return (
    <AssessmentsListView
      role={role}
      assessments={assessments}
      classes={classes}
    />
  );
}
export const dynamic = "force-dynamic";
