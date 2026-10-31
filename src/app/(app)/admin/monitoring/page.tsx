import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAssessmentsForUser } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { AdminMonitoringView } from "@/components/admin/admin-monitoring-view";

export const metadata = { title: "Monitoring Konsensus" };

export default async function AdminMonitoringPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const [assessments, raters] = await Promise.all([
    getAssessmentsForUser(session.user.id, session.user.role),
    prisma.assessmentRater.findMany({
      include: {
        rater: { select: { id: true, name: true } },
        assessment: { select: { id: true, title: true } },
      },
    }),
  ]);

  return (
    <AdminMonitoringView
      assessments={assessments}
      raterAssignments={raters.map((r) => ({
        assessmentId: r.assessment.id,
        assessmentTitle: r.assessment.title,
        raterId: r.rater.id,
        raterName: r.rater.name,
      }))}
    />
  );
}
