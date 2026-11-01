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

  const userId = session.user.id;
  const role = String(session.user.role).toLowerCase() as any;
  const name = session.user.name;
  const identifier = (session.user as any).identifier ?? "—";
  if (role !== "student") redirect("/dashboard");

  const { id: assessmentId } = await params;
  const assessment = await getAssessmentById(assessmentId, userId, role);
  if (!assessment) notFound();

  const mySubmission = assessment.submissions.find(
    (s) => s.studentId === userId
  );
  const isSubmitted = mySubmission?.statusWork === "submitted";

  // Allowlist ketat untuk payload siswa saat mengerjakan (PRD FR05–FR08):
  // tanpa jawaban acuan, rubrik internal, maupun data siswa lain.
  const examAssessment = {
    ...assessment,
    questions: assessment.questions.map((q) => ({
      ...q,
      referenceAnswer: undefined,
      expectedKeywords: [],
      rubric: [],
    })),
    submissions: mySubmission ? [mySubmission] : [],
  };

  return (
    <StudentExamView
      assessment={examAssessment}
      studentName={name ?? "Siswa"}
      studentNis={identifier ?? "—"}
      isAlreadySubmitted={isSubmitted}
    />
  );
}
