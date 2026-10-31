import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getAdminStats,
  getAssessmentsForUser,
  getClassesForUser,
  getRaterAssignments,
  getTeacherStats,
} from "@/lib/data";
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";

export const metadata = { title: "Beranda" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id, name, role } = session.user;

  const [classes, assessments] = await Promise.all([
    getClassesForUser(id, role),
    getAssessmentsForUser(id, role),
  ]);

  if (role === "admin") {
    const stats = await getAdminStats();
    return (
      <AdminDashboard
        user={{ name: name ?? "Administrator", role }}
        stats={stats}
        assessments={assessments}
      />
    );
  }

  if (role === "teacher") {
    const [stats, raterAssignments] = await Promise.all([
      getTeacherStats(id),
      getRaterAssignments(id),
    ]);
    return (
      <TeacherDashboard
        user={{ name: name ?? "Guru", role }}
        stats={stats}
        classes={classes}
        assessments={assessments}
        raterAssignments={raterAssignments.map((a) => ({
          id: a.id,
          title: a.title,
          subject: a.subject,
          className: a.class.name,
          submissionCount: a._count.submissions,
          dueDate: a.dueDate.toISOString(),
        }))}
      />
    );
  }

  return (
    <StudentDashboard
      user={{ name: name ?? "Siswa", role }}
      classes={classes}
      assessments={assessments}
    />
  );
}
