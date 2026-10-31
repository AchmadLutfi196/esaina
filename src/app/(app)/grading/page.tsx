import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAssessmentsForUser, getRaterAssignments } from "@/lib/data";
import { GradingIndexView } from "@/components/grading/grading-index-view";

export const metadata = { title: "Ruang Penilaian" };

export default async function GradingIndexPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "student") redirect("/dashboard");

  const { id, role } = session.user;
  const [assessments, raterAssignments] = await Promise.all([
    getAssessmentsForUser(id, role),
    role === "teacher" ? getRaterAssignments(id) : Promise.resolve([]),
  ]);

  return (
    <GradingIndexView
      assessments={assessments.filter((a) => a.submissions.length > 0)}
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
