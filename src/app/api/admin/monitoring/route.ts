import { prisma } from "@/lib/prisma";
import { requireAdmin, route } from "@/lib/auth/guard";

/** Progres penilaian (%); null jika belum ada LJK terkumpul (bukan 0%). */
export function progressOf(graded: number, total: number): number | null {
  if (total <= 0) return null;
  return Math.round((graded / total) * 100);
}

/** Monitoring: progres penilaian per asesmen (jumlah soal, terkumpul, disahkan). */
export const GET = route(async () => {
  await requireAdmin();

  const assessments = await prisma.assessment.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      class: { select: { name: true, teacher: { select: { name: true } } } },
      questions: { select: { id: true } },
      submissions: {
        select: {
          id: true,
          status: true,
          // revisi FINAL = nilai yang sudah disahkan guru.
          gradeRevisions: { where: { status: "FINAL" }, select: { id: true }, take: 1 },
        },
      },
    },
  });

  const monitoring = assessments.map((a) => {
    const submitted = a.submissions.filter((s) => s.status === "SUBMITTED");
    const graded = submitted.filter((s) => s.gradeRevisions.length > 0);
    const total = submitted.length;
    return {
      id: a.id,
      title: a.title,
      className: a.class.name,
      teacherName: a.class.teacher.name,
      status: a.status,
      questionCount: a.questions.length,
      submittedCount: total,
      gradedCount: graded.length,
      progressPercent: progressOf(graded.length, total),
    };
  });

  return Response.json({ monitoring });
});
