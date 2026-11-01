import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import {
  getClassById,
  getClassesForUser,
  getAssessmentsForClass,
} from "@/lib/data";
import { ClassDetailView } from "@/components/classes/class-detail-view";

export const metadata = { title: "Detail Kelas" };

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const role = String(session.user.role).toLowerCase() as any;
  const { id: classId } = await params;

  const [cls, allClasses, assessments] = await Promise.all([
    getClassById(classId, userId, role),
    getClassesForUser(userId, role),
    getAssessmentsForClass(classId, userId, role),
  ]);

  if (!cls) notFound();

  return (
    <ClassDetailView
      role={role}
      classItem={cls}
      allClasses={allClasses}
      assessments={assessments}
    />
  );
}
