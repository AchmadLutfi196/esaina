import { prisma } from "@/lib/prisma";
import { requireTeacher, route } from "@/lib/auth/guard";
import { notFound } from "@/lib/api-error";

function csv(value: unknown) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

type Ctx = { params: Promise<{ id: string }> };
export const GET = route<[Ctx]>(async (_req, ctx) => {
  const teacher = await requireTeacher();
  const { id } = await ctx.params;
  const assessment = await prisma.assessment.findUnique({ where: { id }, select: { title: true, class: { select: { teacherId: true } }, questions: { orderBy: { order: "asc" }, select: { id: true, order: true } } } });
  if (!assessment || assessment.class.teacherId !== teacher.id) throw notFound("Asesmen");
  const rows = await prisma.publication.findMany({ where: { assessmentId: id }, orderBy: { publishedAt: "asc" }, select: { publishedAt: true, revision: { select: { totalScore: true, items: { select: { questionId: true, score: true } }, submission: { select: { student: { select: { anonCode: true } } } } } } } });
  const header = ["anon_code", "total_score", ...assessment.questions.map((q) => `question_${q.order}_score`), "published_at"];
  const body = rows.map((p) => { const scores = new Map(p.revision.items.map((i) => [i.questionId, i.score])); return [p.revision.submission.student.anonCode, p.revision.totalScore, ...assessment.questions.map((q) => scores.get(q.id) ?? ""), p.publishedAt.toISOString()].map(csv).join(","); });
  return new Response([header.map(csv).join(","), ...body].join("\n") + "\n", { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${assessment.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.csv"` } });
});
