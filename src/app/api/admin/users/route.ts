import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin, route } from "@/lib/auth/guard";
import { badRequest, notFound } from "@/lib/api-error";
import type { Role } from "@/generated/prisma/enums";

const createUserSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(100),
  role: z.enum(["TEACHER", "STUDENT", "ADMIN"]),
  identifier: z.string().max(40).optional().nullable(),
});

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  identifier: string | null;
  isActive: boolean;
  createdAt: Date;
  _count: { submissions: number; taughtClasses: number; memberships: number };
};

function toRow(u: AdminUserRow) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    identifier: u.identifier,
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
    submissionCount: u._count.submissions,
    classCount: u.role === "TEACHER" ? u._count.taughtClasses : u._count.memberships,
  };
}

export const GET = route(async () => {
  await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { submissions: true, taughtClasses: true, memberships: true } } },
  });
  return Response.json({ users: users.map(toRow) });
});

export const POST = route(async (req: Request) => {
  await requireAdmin();
  const parsed = createUserSchema.safeParse(await req.json());
  if (!parsed.success) {
    throw badRequest("Data pengguna tidak valid", parsed.error.flatten().fieldErrors);
  }
  const { name, email, password, role, identifier } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw badRequest("Email sudah terdaftar.");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role,
      identifier: identifier || null,
      // kode anonim unik; bentrok P2002 nyaris mustahil (cuid) tapi tetap ditangani.
      anonCode: `${role[0]}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    },
  });

  return Response.json({ user: toRow({ ...user, _count: { submissions: 0, taughtClasses: 0, memberships: 0 } } as AdminUserRow) }, { status: 201 });
});

const patchSchema = z.object({ id: z.string().min(1), isActive: z.boolean() });

export const PATCH = route(async (req: Request) => {
  const me = await requireAdmin();
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) throw badRequest("Payload tidak valid");

  const { id, isActive } = parsed.data;
  // Admin tidak boleh menonaktifkan akunnya sendiri.
  if (id === me.id && !isActive) throw badRequest("Tidak bisa menonaktifkan akun sendiri.");

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw notFound("Pengguna");

  const updated = await prisma.user.update({ where: { id }, data: { isActive } });
  return Response.json({ user: { id: updated.id, isActive: updated.isActive } });
});
