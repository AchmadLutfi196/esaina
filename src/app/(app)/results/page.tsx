import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAssessmentsForUser } from "@/lib/data";
import { StudentResultsListView } from "@/components/assessments/student-results-list-view";

export const metadata = { title: "Hasil & Nilai" };

export default async function ResultsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "student") redirect("/dashboard");

  const assessments = await getAssessmentsForUser(
    session.user.id,
    session.user.role
  );

  return (
    <StudentResultsListView
      userId={session.user.id}
      assessments={assessments}
    />
  );
}
