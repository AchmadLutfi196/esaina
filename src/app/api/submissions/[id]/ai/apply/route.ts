import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTeacher, route } from "@/lib/auth/guard";
import { conflict, notFound, validationError } from "@/lib/api-error";
import { ok, readJson } from "@/lib/http";
import { teacherSubmission } from "@/lib/grading";

type Ctx = { params: Promise<{ id: string }> };
type Item = { questionId: string; criterionId: string; score: number; feedback: string };
const schema = z.object({ aiResultId: z.string(), version: z.number().int().positive() });

export function mergeAiItems(
  existing: { questionId: string; criterionId: string; score: number | null; source: "MANUAL" | "AI" }[],
  aiItems: Item[],
) {
  const manual = existing.filter((i) => i.source === "MANUAL");
  const manualKeys = new Set(manual.map((i) => `${i.questionId}:${i.criterionId}`));
  const items = aiItems.filter((i) => !manualKeys.has(`${i.questionId}:${i.criterionId}`));
  const manualTotal = manual.reduce((sum, i) => sum + (i.score ?? 0), 0);
  return { items, totalScore: manualTotal + items.reduce((sum, i) => sum + i.score, 0) };
}

export const POST = route(async (req, ctx: Ctx) => {
  const teacher = await requireTeacher();
  const { id } = await ctx.params;
  const submission = await teacherSubmission(id, teacher);
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) throw validationError(parsed.error.flatten());
  if (parsed.data.version !== submission.version) throw conflict("LJK berubah. Muat ulang sebelum menerapkan AI.");
  const ai = await prisma.aIResult.findFirst({ where: { id: parsed.data.aiResultId, submissionId: id, validationOk: true }, select: { payload: true, sourceVersion: true } });
  if (!ai) throw notFound("Hasil AI");
  if (ai.sourceVersion !== submission.version) throw conflict("Jawaban berubah sejak saran AI dibuat.");
  const payload = ai.payload as { items?: Item[] };
  if (!payload.items?.length) throw validationError({ ai: "Payload AI kosong." });
  const result = await prisma.$transaction(async (tx) => {
    const current = await tx.gradeRevision.findFirst({ where: { submissionId: id, status: "DRAFT" }, orderBy: { version: "desc" }, select: { id: true, items: { select: { questionId: true, criterionId: true, score: true, source: true } } } });
    const { items: aiItems, totalScore } = mergeAiItems(current?.items ?? [], payload.items!);
    const data = { totalScore, items: { deleteMany: { source: "AI" as const }, create: aiItems.map((i) => ({ questionId: i.questionId, criterionId: i.criterionId, score: i.score, feedback: i.feedback, source: "AI" as const, aiResultId: parsed.data.aiResultId })) } };
    return current ? tx.gradeRevision.update({ where: { id: current.id }, data: { ...data, version: { increment: 1 } }, select: { id: true, version: true, status: true, totalScore: true } }) : tx.gradeRevision.create({ data: { ...data, submissionId: id, authorId: teacher.id }, select: { id: true, version: true, status: true, totalScore: true } });
  });
  return ok({ revision: result });
});
