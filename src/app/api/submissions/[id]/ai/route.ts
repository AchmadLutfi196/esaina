import { prisma } from "@/lib/prisma";
import { requireTeacher, route } from "@/lib/auth/guard";
import { conflict, notFound, validationError } from "@/lib/api-error";
import { ok } from "@/lib/http";
import { teacherSubmission } from "@/lib/grading";
import { createLlmAdapter } from "@/lib/ai/adapter";
import { buildPrompt, cacheKey, PROMPT_VERSION, validateAiPayload } from "@/lib/ai/prompt";

type Ctx = { params: Promise<{ id: string }> };

export const POST = route(async (_req, ctx: Ctx) => {
  const teacher = await requireTeacher();
  const { id } = await ctx.params;
  const submission = await teacherSubmission(id, teacher);
  if (submission.status !== "SUBMITTED") throw conflict("LJK belum dikumpulkan.");

  const data = await prisma.submission.findUnique({ where: { id }, select: { version: true, student: { select: { anonCode: true } }, assessment: { select: { questions: { orderBy: { order: "asc" }, select: { id: true, text: true, referenceAnswer: true, criteria: { orderBy: { order: "asc" }, select: { id: true, code: true, description: true, minScore: true, maxScore: true } } } } } }, answers: { select: { questionId: true, content: true } } } });
  if (!data) throw notFound("LJK");
  const answers = new Map(data.answers.map((a) => [a.questionId, a.content]));
  const questions = data.assessment.questions.map((q) => ({ ...q, answer: answers.get(q.id) ?? "" }));
  const key = cacheKey({ submissionId: id, version: data.version, questions });
  const cached = await prisma.aIResult.findFirst({ where: { submissionId: id, cacheKey: key, validationOk: true }, orderBy: { createdAt: "desc" }, select: { id: true, payload: true, provider: true, model: true, promptVersion: true } });
  if (cached) return ok({ aiResult: cached, cached: true });

  let raw = "";
  let provider = "";
  let model = "";
  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const adapter = createLlmAdapter();
      provider = adapter.provider; model = adapter.model;
      const prompts = questions.flatMap((q) => [buildPrompt(q)]);
      raw = await adapter.complete({ system: prompts[0].system, user: JSON.stringify({ questions: questions.map((q) => ({ ...q, referenceAnswer: q.referenceAnswer, answer: q.answer })) }) });
      const payload = validateAiPayload(JSON.parse(raw), questions);
      const aiResult = await prisma.aIResult.create({ data: { submissionId: id, requestedById: teacher.id, provider, model, promptVersion: PROMPT_VERSION, cacheKey: key, sourceVersion: data.version, payload: payload as never, validationOk: true }, select: { id: true, payload: true, provider: true, model: true, promptVersion: true } });
      return ok({ aiResult, cached: false });
    } catch (error) {
      lastError = error instanceof Error ? error.message : "AI gagal.";
    }
  }
  await prisma.aIResult.create({ data: { submissionId: id, requestedById: teacher.id, provider: provider || "unknown", model: model || "unknown", promptVersion: PROMPT_VERSION, cacheKey: key, sourceVersion: data.version, payload: { error: lastError } as never, validationOk: false, validationMsg: lastError } });
  throw validationError({ ai: "Saran AI gagal divalidasi. Jalur penilaian manual tetap tersedia." });
});
