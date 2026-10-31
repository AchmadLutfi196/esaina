import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getAssessmentById } from "@/lib/data";
import { StudentResultView } from "@/components/assessments/student-result-view";

export const metadata = { title: "Hasil Asesmen" };

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: userId, role } = session.user;
  if (role !== "student") redirect("/dashboard");

  const { id: assessmentId } = await params;
  const assessment = await getAssessmentById(assessmentId, userId, role);
  if (!assessment) notFound();

  const mySubmission = assessment.submissions.find(
    (s) => s.studentId === userId
  );
  if (!mySubmission) notFound();

  return (
    <StudentResultView assessment={assessment} submission={mySubmission} />
  );
}
