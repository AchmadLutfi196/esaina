import { prisma } from "@/lib/prisma";
import { requireClassOwner, requireTeacher, route } from "@/lib/auth/guard";
import { conflict, notFound } from "@/lib/api-error";
import { ok } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

export const POST = route(async (_req, ctx: Ctx) => {
  const teacher = await requireTeacher();
  const { id } = await ctx.params;
  const assessment = await prisma.assessment.findUnique({ where: { id } });
  if (!assessment) throw notFound("Asesmen");
  await requireClassOwner(assessment.classId, teacher);
  if (assessment.status !== "DRAFT") throw conflict("Asesmen sudah dibuka atau ditutup.");

  const opened = await prisma.assessment.update({
    where: { id, status: "DRAFT" },
    data: { status: "OPEN", openedAt: new Date(), version: { increment: 1 } },
    select: { id: true, status: true, version: true, openedAt: true },
  });
  return ok(opened);
});
