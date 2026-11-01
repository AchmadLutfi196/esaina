import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const code = String(body.classCode || body.joinCode || "").trim().toUpperCase();

    if (!code) {
      return NextResponse.json(
        { error: "Kode kelas wajib diisi" },
        { status: 400 }
      );
    }

    const cls = await prisma.class.findUnique({
      where: { joinCode: code },
      include: { teacher: { select: { name: true } } },
    });

    if (!cls) {
      return NextResponse.json(
        { error: "Kelas dengan kode tersebut tidak ditemukan" },
        { status: 404 }
      );
    }

    // Idempotent join membership
    await prisma.classMembership.upsert({
      where: {
        classId_studentId: {
          classId: cls.id,
          studentId: session.user.id,
        },
      },
      update: {},
      create: {
        classId: cls.id,
        studentId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      classId: cls.id,
      className: cls.name,
      teacherName: cls.teacher.name,
    });
  } catch (err: any) {
    console.error("Join class error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal bergabung ke kelas" },
      { status: 500 }
    );
  }
}
