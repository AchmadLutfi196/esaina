import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTeacher, route } from "@/lib/auth/guard";
import { ok, readJson } from "@/lib/http";
import { uniqueJoinCode } from "@/lib/join-code";
import { validationError } from "@/lib/api-error";

const createSchema = z.object({
  name: z.string().trim().min(1, "Nama kelas wajib diisi.").max(100),
});

export const POST = route(async (req) => {
  const teacher = await requireTeacher();
  const parsed = createSchema.safeParse(await readJson(req));
  if (!parsed.success) throw validationError(parsed.error.flatten());

  const joinCode = await uniqueJoinCode(async (code) => {
    const found = await prisma.class.findUnique({ where: { joinCode: code }, select: { id: true } });
    return Boolean(found);
  });

  const created = await prisma.class.create({
    data: { name: parsed.data.name, joinCode, teacherId: teacher.id },
  });

  return ok({ id: created.id, name: created.name, joinCode: created.joinCode }, 201);
});

export const GET = route(async () => {
  const teacher = await requireTeacher();
  const classes = await prisma.class.findMany({
    where: { teacherId: teacher.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      joinCode: true,
      _count: { select: { memberships: true, assessments: true } },
    },
  });
  return ok({
    classes: classes.map((c) => ({
      id: c.id,
      name: c.name,
      joinCode: c.joinCode,
      memberCount: c._count.memberships,
      assessmentCount: c._count.assessments,
    })),
  });
});
