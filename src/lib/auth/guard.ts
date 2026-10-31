import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { ApiError, forbidden, notFound, unauthorized } from "@/lib/api-error";
import type { SessionUser } from "@/lib/auth/types";

export async function requireUser(): Promise<SessionUser> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw unauthorized();
  return session.user;
}

export async function requireTeacher(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "TEACHER") throw forbidden();
  return user;
}

export async function requireStudent(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "STUDENT") throw forbidden();
  return user;
}

/** Guru pemilik kelas; ID valid tanpa kepemilikan tetap ditolak. */
export async function requireClassOwner(classId: string, user: SessionUser) {
  const klas = await prisma.class.findUnique({ where: { id: classId } });
  if (!klas) throw notFound("Kelas");
  if (klas.teacherId !== user.id) throw forbidden();
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

export function errorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(
      { error: error.code, message: error.message, details: error.details },
      { status: error.status }
    );
  }
  console.error("[api] unhandled error", error instanceof Error ? error.message : "unknown");
  return Response.json(
    { error: "internal_error", message: "Terjadi kesalahan pada server." },
    { status: 500 }
  );
}

/** Bungkus route handler: menyeragamkan penanganan ApiError -> JSON status. */
export function route<Args extends unknown[]>(
  handler: (req: Request, ...args: Args) => Promise<Response>
) {
  return async (req: Request, ...args: Args) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
