import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTeacher, route } from "@/lib/auth/guard";
import { conflict, notFound, validationError } from "@/lib/api-error";
import { ok, readJson } from "@/lib/http";
import { teacherSubmission } from "@/lib/grading";

type Ctx = { params: Promise<{ id: string }> };
const schema = z.object({ aiResultId: z.string(), version: z.number().int().positive() });
export const POST = route(async (req, ctx: Ctx) => {
  const teacher = await requireTeacher();
  const { id } = await ctx.params;
  const submission = await teacherSubmission(id, teacher);
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) throw validationError(parsed.error.flatten());
  if (parsed.data.version !== submission.version) throw conflict("LJK berubah. Muat ulang sebelum menerapkan AI.");
  const ai = await prisma.aIResult.findFirst({ where: { id: parsed.data.aiResultId, submissionId: id, validationOk: true }, select: { payload: true } });
  if (!ai) throw notFound("Hasil AI");
  const payload = ai.payload as { items?: { questionId: string; criterionId: string; score: number; feedback: string }[] };
  if (!payload.items?.length) throw validationError({ ai: "Payload AI kosong." });
  const result = await prisma.$transaction(async (tx) => {
    const current = await tx.gradeRevision.findFirst({ where: { submissionId: id, status: "DRAFT" }, orderBy: { version: "desc" } });
    const data = { totalScore: payload.items!.reduce((sum, i) => sum + i.score, 0), items: { deleteMany: {}, create: payload.items!.map((i) => ({ questionId: i.questionId, criterionId: i.criterionId, score: i.score, feedback: i.feedback, source: "AI" as const, aiResultId: parsed.data.aiResultId })) } };
    return current ? tx.gradeRevision.update({ where: { id: current.id }, data: { ...data, version: { increment: 1 } }, select: { id: true, version: true, status: true, totalScore: true } }) : tx.gradeRevision.create({ data: { ...data, submissionId: id, authorId: teacher.id }, select: { id: true, version: true, status: true, totalScore: true } });
  });
  return ok({ revision: result });
});
