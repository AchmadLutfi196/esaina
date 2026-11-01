import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { AppSidebar } from "@/components/app-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect(session.user.role === "TEACHER" ? "/guru" : "/siswa");
  return (
    <AppSidebar role="ADMIN" name={session.user.name}>
      {children}
    </AppSidebar>
  );
}
