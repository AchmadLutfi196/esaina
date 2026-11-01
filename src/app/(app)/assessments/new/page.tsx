import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClassesForUser } from "@/lib/data";
import { NewAssessmentView } from "@/components/assessments/new-assessment-view";

export const metadata = { title: "Buat Asesmen Baru" };

export default async function NewAssessmentPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = String(session.user.role).toLowerCase() as any;
  if (role === "student") redirect("/dashboard");

  const classes = await getClassesForUser(session.user.id, role);

  return <NewAssessmentView classes={classes} />;
}
export const dynamic = "force-dynamic";
