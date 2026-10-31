import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStudent, route } from "@/lib/auth/guard";
import { ok, readJson } from "@/lib/http";
import { notFound, validationError } from "@/lib/api-error";

const joinSchema = z.object({
  joinCode: z.string().trim().min(1, "Kode kelas wajib diisi.").toUpperCase(),
});

export const POST = route(async (req) => {
  const student = await requireStudent();
  const parsed = joinSchema.safeParse(await readJson(req));
  if (!parsed.success) throw validationError(parsed.error.flatten());

  const klas = await prisma.class.findUnique({
    where: { joinCode: parsed.data.joinCode },
    select: { id: true, name: true },
  });
  if (!klas) throw notFound("Kode kelas");

  // Idempotent: unik (classId, studentId) mencegah anggota ganda.
  await prisma.classMembership.upsert({
    where: { classId_studentId: { classId: klas.id, studentId: student.id } },
    update: {},
    create: { classId: klas.id, studentId: student.id },
  });

  return ok({ id: klas.id, name: klas.name });
});
