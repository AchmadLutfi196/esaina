import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getAssessmentById } from "@/lib/data";
import { StudentExamView } from "@/components/assessments/student-exam-view";

export const metadata = { title: "Kerjakan Asesmen" };

export default async function TakeAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: userId, role, name, identifier } = session.user;
  if (role !== "student") redirect("/dashboard");

  const { id: assessmentId } = await params;
  const assessment = await getAssessmentById(assessmentId, userId, role);
  if (!assessment) notFound();

  const mySubmission = assessment.submissions.find(
    (s) => s.studentId === userId
  );
  const isSubmitted = mySubmission?.statusWork === "submitted";

  return (
    <StudentExamView
      assessment={assessment}
      studentName={name ?? "Siswa"}
      studentNis={identifier ?? "—"}
      isAlreadySubmitted={isSubmitted}
    />
  );
}
