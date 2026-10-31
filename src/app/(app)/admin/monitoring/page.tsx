import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAssessmentsForUser } from "@/lib/data";
import { AdminMonitoringView } from "@/components/admin/admin-monitoring-view";

export const metadata = { title: "Monitoring Asesmen & Evaluasi" };

export default async function AdminMonitoringPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const assessments = await getAssessmentsForUser(
    session.user.id,
    session.user.role
  );

  return <AdminMonitoringView assessments={assessments} />;
}
