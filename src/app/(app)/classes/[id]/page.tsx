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

  const { id: userId, role } = session.user;
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
