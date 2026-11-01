import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAssessmentsForUser } from "@/lib/data";
import { AdminMonitoringView } from "@/components/admin/admin-monitoring-view";

export const metadata = { title: "Monitoring Asesmen & Evaluasi" };

export default async function AdminMonitoringPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const roleStr = String(session.user.role).toLowerCase();
  if (roleStr !== "admin") redirect("/dashboard");

  const assessments = await getAssessmentsForUser(
    session.user.id,
    roleStr
  );

  return <AdminMonitoringView assessments={assessments} />;
}
export const dynamic = "force-dynamic";
