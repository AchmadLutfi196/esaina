import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClassesForUser } from "@/lib/data";
import { NewAssessmentView } from "@/components/assessments/new-assessment-view";

export const metadata = { title: "Buat Asesmen Baru" };

export default async function NewAssessmentPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "student") redirect("/dashboard");

  const classes = await getClassesForUser(session.user.id, session.user.role);

  return <NewAssessmentView classes={classes} />;
}
