import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { classCode } = await request.json();
  if (!classCode) {
    return NextResponse.json(
      { error: "Kode kelas wajib diisi" },
      { status: 400 }
    );
  }

  try {
    const cls = await prisma.class.findUnique({
      where: { classCode: classCode.trim().toUpperCase() },
      include: { creator: { select: { name: true } } },
    });

    if (!cls) {
      return NextResponse.json(
        { error: "Kelas dengan kode tersebut tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: {
        classId_studentId: {
          classId: cls.id,
          studentId: session.user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        classId: cls.id,
        message: "Anda sudah terdaftar di kelas ini",
      });
    }

    // Enroll student
    await prisma.enrollment.create({
      data: {
        classId: cls.id,
        studentId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      classId: cls.id,
      className: cls.name,
      teacherName: cls.creator.name,
    });
  } catch (err: any) {
    console.error("Join class error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal bergabung ke kelas" },
      { status: 500 }
    );
  }
}
