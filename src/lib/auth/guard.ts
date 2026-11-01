import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiError, forbidden, notFound, unauthorized } from "@/lib/api-error";
import type { SessionUser } from "@/lib/auth/types";

export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) throw unauthorized();
  return session.user as any;
}

export async function requireTeacher(): Promise<SessionUser> {
  const user = await requireUser();
  const r = String(user.role).toUpperCase();
  if (r !== "TEACHER" && r !== "ADMIN") throw forbidden();
  return user;
}

export async function requireStudent(): Promise<SessionUser> {
  const user = await requireUser();
  const r = String(user.role).toUpperCase();
  if (r !== "STUDENT") throw forbidden();
  return user;
}

/** Guru pemilik kelas; ID valid tanpa kepemilikan tetap ditolak. */
export async function requireClassOwner(classId: string, user: SessionUser) {
  const klas = await prisma.class.findUnique({ where: { id: classId } });
  if (!klas) throw notFound("Kelas");
  if (klas.teacherId !== user.id && String(user.role).toUpperCase() !== "ADMIN") throw forbidden();
  return klas;
}

/** Siswa anggota kelas; menolak non-anggota. */
export async function requireClassMember(classId: string, user: SessionUser) {
  const membership = await prisma.classMembership.findUnique({
    where: { classId_studentId: { classId, studentId: user.id } },
  });
  if (!membership) throw forbidden();
  return membership;
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return new Response(
      JSON.stringify({
        error: error.code,
        message: error.message,
        details: error.details,
      }),
      {
        status: error.status,
        headers: { "content-type": "application/json" },
      }
    );
  }
  return new Response(
    JSON.stringify({ error: "internal_error", message: "Terjadi kesalahan internal server." }),
    {
      status: 500,
      headers: { "content-type": "application/json" },
    }
  );
}

export function route<TArgs extends unknown[] = []>(
  handler: (req: Request, ...args: TArgs) => Promise<Response>
) {
  return async (req: Request, ...args: TArgs) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      if (error instanceof ApiError) return error.toResponse();
      console.error("[route unhandled]", error);
      return errorResponse(error);
    }
  };
}
