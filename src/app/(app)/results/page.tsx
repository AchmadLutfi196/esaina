import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAssessmentsForUser } from "@/lib/data";
import { StudentResultsListView } from "@/components/assessments/student-results-list-view";

export const metadata = { title: "Hasil & Nilai" };

export default async function ResultsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = String(session.user.role).toLowerCase() as any;
  if (role !== "student") redirect("/dashboard");

  const assessments = await getAssessmentsForUser(
    session.user.id,
    role
  );

  return (
    <StudentResultsListView
      userId={session.user.id}
      assessments={assessments}
    />
  );
}
export const dynamic = "force-dynamic";
