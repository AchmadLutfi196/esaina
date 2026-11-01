import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { AppSidebar } from "@/components/app-sidebar";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/guru");
  return (
    <div className="flex min-h-screen">
      <AppSidebar role="STUDENT" name={session.user.name} />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
