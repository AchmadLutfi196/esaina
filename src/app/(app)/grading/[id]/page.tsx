import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getAssessmentById } from "@/lib/data";
import { GradingWorkspace } from "@/components/grading/grading-workspace";

export const metadata = { title: "Ruang Penilaian" };

export default async function GradingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const role = String(session.user.role).toLowerCase() as any;
  if (role === "student") redirect("/dashboard");

  const { id: assessmentId } = await params;
  const assessment = await getAssessmentById(assessmentId, userId, role);
  if (!assessment) notFound();

  return <GradingWorkspace assessment={assessment} />;
}
