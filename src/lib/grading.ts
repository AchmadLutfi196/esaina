import { prisma } from "@/lib/prisma";
import { forbidden, notFound } from "@/lib/api-error";
import type { SessionUser } from "@/lib/auth/types";

export async function teacherSubmission(id: string, teacher: SessionUser) {
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      assessment: { select: { id: true, title: true, class: { select: { teacherId: true } } } },
    },
  });
  if (!submission) throw notFound("Lembar kerja");
  if (submission.assessment.class.teacherId !== teacher.id) throw forbidden();
  return submission;
}

export function gradeStatus(revision: { status: "DRAFT" | "FINAL" } | null) {
  return revision?.status ?? "UNGRADED";
}
