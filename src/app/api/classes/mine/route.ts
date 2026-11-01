import { prisma } from "@/lib/prisma";
import { requireStudent, route } from "@/lib/auth/guard";
import { ok } from "@/lib/http";

export const GET = route(async () => {
  const student = await requireStudent();
  const memberships = await prisma.classMembership.findMany({
    where: { studentId: student.id },
    orderBy: { joinedAt: "desc" },
    select: { class: { select: { id: true, name: true } } },
  });
  return ok({ classes: memberships.map((m) => m.class) });
});
