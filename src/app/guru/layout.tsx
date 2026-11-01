import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { AppSidebar } from "@/components/app-sidebar";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/siswa");
  return (
    <AppSidebar role="TEACHER" name={session.user.name}>
      {children}
    </AppSidebar>
  );
}
