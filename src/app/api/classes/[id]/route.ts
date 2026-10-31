import { prisma } from "@/lib/prisma";
import { requireClassMember, requireClassOwner, requireUser, route } from "@/lib/auth/guard";
import { ok } from "@/lib/http";
import { forbidden } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_req, ctx: Ctx) => {
  const { id } = await ctx.params;
  const user = await requireUser();

  if (user.role === "TEACHER") {
    await requireClassOwner(id, user);
    const klas = await prisma.class.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        joinCode: true,
        _count: { select: { memberships: true, assessments: true } },
      },
    });
    return ok({
      id: klas!.id,
      name: klas!.name,
      joinCode: klas!.joinCode,
      memberCount: klas!._count.memberships,
      assessmentCount: klas!._count.assessments,
    });
  }

  // Siswa: hanya anggota; jangan bocorkan joinCode/pemilik ke siswa non-anggota.
  await requireClassMember(id, user);
  const klas = await prisma.class.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!klas) throw forbidden();
  return ok({ id: klas.id, name: klas.name });
});
