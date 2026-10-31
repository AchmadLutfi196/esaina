import { prisma } from "@/lib/prisma";
import { requireTeacher, route } from "@/lib/auth/guard";
import { notFound } from "@/lib/api-error";
import { ok } from "@/lib/http";
import { teacherSubmission } from "@/lib/grading";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_req, ctx: Ctx) => {
  const teacher = await requireTeacher();
  const { id } = await ctx.params;
  const submission = await teacherSubmission(id, teacher);
  if (submission.status !== "SUBMITTED") throw notFound("Lembar kerja terkumpul");
  const detail = await prisma.submission.findUnique({
    where: { id },
    select: {
      id: true, version: true, status: true, submittedAt: true,
      student: { select: { anonCode: true } },
      assessment: {
        select: {
          id: true, title: true,
          questions: { orderBy: { order: "asc" }, select: {
            id: true, order: true, text: true, referenceAnswer: true, maxScore: true,
            criteria: { orderBy: { order: "asc" }, select: { id: true, code: true, description: true, minScore: true, maxScore: true, levels: true } },
          } },
        },
      },
      answers: { select: { questionId: true, content: true } },
      gradeRevisions: { orderBy: { version: "desc" }, take: 1, select: { id: true, version: true, status: true, totalScore: true, publications: { select: { id: true } }, items: { select: { questionId: true, criterionId: true, score: true, feedback: true } } } },
    },
  });
  if (!detail) throw notFound("Lembar kerja");
  return ok(detail);
});
