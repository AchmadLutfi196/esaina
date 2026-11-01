import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getClassesForUser,
  getAssessmentsForUser,
  getTeacherStats,
  getPendingGradingAssessments,
  getAdminStats,
} from "@/lib/data";
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";

export const metadata: Metadata = { title: "Dasbor" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id, name, role } = session.user;
  const roleStr = String(role).toLowerCase();

  const [classes, assessments] = await Promise.all([
    getClassesForUser(id, roleStr),
    getAssessmentsForUser(id, roleStr),
  ]);

  if (roleStr === "admin") {
    const stats = await getAdminStats();
    return (
      <AdminDashboard
        user={{ name: name ?? "Administrator", role: "admin" }}
        stats={stats}
        assessments={assessments}
      />
    );
  }

  if (roleStr === "teacher") {
    const [stats, pendingTasks] = await Promise.all([
      getTeacherStats(id),
      getPendingGradingAssessments(id),
    ]);
    return (
      <TeacherDashboard
        user={{ name: name ?? "Guru", role: "teacher" }}
        stats={stats}
        classes={classes}
        assessments={assessments}
        pendingTasks={pendingTasks.map((a) => ({
          id: a.id,
          title: a.title,
          subject: a.class?.name.includes("—") ? a.class.name.split("—")[1]?.trim() : a.class?.name || "Mata Pelajaran",
          className: a.class?.name || "Kelas",
          submissionCount: a._count.submissions,
          dueDate: a.closedAt?.toISOString() || new Date().toISOString(),
        }))}
      />
    );
  }

  return (
    <StudentDashboard
      user={{ name: name ?? "Siswa", role: "student" }}
      classes={classes}
      assessments={assessments}
    />
  );
}
