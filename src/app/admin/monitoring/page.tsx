import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { AdminMonitoring } from "./admin-monitoring";

export const metadata = { title: "Monitoring asesmen — ESAINA" };

export default async function AdminMonitoringPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/guru");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-primary">Monitoring asesmen</h1>
        <p className="text-sm text-muted-foreground">Pemantauan progres penyelesaian penilaian guru per asesmen.</p>
      </div>
      <AdminMonitoring />
    </main>
  );
}
