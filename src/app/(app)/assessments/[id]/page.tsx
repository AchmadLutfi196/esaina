import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getAssessmentById } from "@/lib/data";
import { AssessmentDetailView } from "@/components/assessments/assessment-detail-view";

export const metadata = { title: "Detail Asesmen" };

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const role = String(session.user.role).toLowerCase() as any;
  const { id: assessmentId } = await params;

  const assessment = await getAssessmentById(assessmentId, userId, role);
  if (!assessment) notFound();

  return (
    <AssessmentDetailView
      role={role}
      assessment={assessment}
    />
  );
}
