import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAssessmentsForUser } from "@/lib/data";
import { GradingIndexView } from "@/components/grading/grading-index-view";

export const metadata = { title: "Ruang Penilaian" };

export default async function GradingIndexPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "student") redirect("/dashboard");

  const { id, role } = session.user;
  const assessments = await getAssessmentsForUser(id, role);

  return (
    <GradingIndexView
      assessments={assessments.filter((a) => a.submissions.length > 0)}
    />
  );
}
