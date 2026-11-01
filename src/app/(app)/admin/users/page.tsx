import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminUsersView } from "@/components/admin/admin-users-view";

export const metadata = { title: "Kelola Pengguna" };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const roleStr = String(session.user.role).toLowerCase();
  if (roleStr !== "admin") redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      identifier: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          submissions: true,
          taughtClasses: true,
        },
      },
    },
  });

  return (
    <AdminUsersView
      users={users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: String(u.role).toLowerCase() as "admin" | "teacher" | "student",
        identifier: u.identifier,
        isActive: u.isActive,
        createdAt: u.createdAt.toISOString(),
        submissionCount: u._count.submissions,
        assessmentCount: 0,
        classCount: u._count.taughtClasses,
      }))}
    />
  );
}
export const dynamic = "force-dynamic";
