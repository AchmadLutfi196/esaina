import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStudent, route } from "@/lib/auth/guard";
import { conflict, notFound, validationError } from "@/lib/api-error";
import { ok, readJson } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };
const submitSchema = z.object({
  version: z.number().int().positive(),
  idempotencyKey: z.string().min(8).max(100),
});

export const POST = route<[Ctx]>(async (req, ctx) => {
  const student = await requireStudent();
  const { id } = await ctx.params;
  const parsed = submitSchema.safeParse(await readJson(req));
  if (!parsed.success) throw validationError(parsed.error.flatten());
  const { version, idempotencyKey } = parsed.data;

  const assessment = await prisma.assessment.findFirst({
    where: { id, status: "OPEN", class: { memberships: { some: { studentId: student.id } } } },
    select: { id: true, questions: { select: { id: true, order: true } } },
  });
  if (!assessment) throw notFound("Asesmen");

  const submission = await prisma.submission.findUnique({
    where: { assessmentId_studentId: { assessmentId: id, studentId: student.id } },
    include: { answers: { select: { questionId: true, content: true } } },
  });
  if (!submission) throw notFound("Pekerjaan");

  // Idempotent: kunci sama -> kembalikan hasil yang sudah ada, bukan submit ganda.
  const existing = await prisma.idempotencyKey.findUnique({ where: { key: idempotencyKey } });
  if (existing) {
    if (existing.userId !== student.id || existing.scope !== "submit") throw conflict("Kunci idempotensi tidak valid.");
    return ok({ status: "SUBMITTED", submittedAt: submission.submittedAt, replayed: true });
  }

  if (submission.status === "SUBMITTED") {
    return ok({ status: "SUBMITTED", submittedAt: submission.submittedAt, replayed: true });
  }
  if (submission.version !== version) throw conflict("Draf berubah sebelum dikumpulkan. Muat ulang.");
  if (submission.answers.length < assessment.questions.length) throw conflict("Masih ada soal yang belum dijawab.");

  const submittedAt = new Date();
  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.idempotencyKey.create({ data: { key: idempotencyKey, userId: student.id, scope: "submit" } });
      const updated = await tx.submission.update({
        where: { id: submission.id, version, status: "IN_PROGRESS" },
        data: { status: "SUBMITTED", submittedAt, version: { increment: 1 } },
        select: { id: true, status: true, version: true, submittedAt: true },
      });
      await tx.auditEvent.create({
        data: { actorId: student.id, action: "SUBMIT", entityType: "Submission", entityId: submission.id, versionBefore: version, versionAfter: updated.version },
      });
      return updated;
    });
    return ok(result);
  } catch (error) {
    // Klik ganda balapan: kunci sudah dibuat transaksi lain -> anggap sukses.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const replay = await prisma.submission.findUnique({ where: { id: submission.id }, select: { submittedAt: true } });
      return ok({ status: "SUBMITTED", submittedAt: replay?.submittedAt, replayed: true });
    }
    throw error;
  }
});
