import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId");

  try {
    const where = classId ? { classId } : {};
    const assessments = await prisma.assessment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        class: { select: { id: true, name: true } },
        questions: { select: { id: true, maxScore: true } },
        _count: { select: { submissions: true } },
      },
    });

    return NextResponse.json({
      assessments: assessments.map((a) => ({
        id: a.id,
        title: a.title,
        status: a.status,
        version: a.version,
        openedAt: a.openedAt,
        className: a.class?.name,
        questionCount: a.questions.length,
        submissionCount: a._count.submissions,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const role = String(session?.user?.role || "").toLowerCase();
  if (!session?.user || role === "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const classId = body.classId;
    const title = (body.title || "").trim();
    const instruction = body.instruction || body.instructions || "";
    const questions = body.questions || [];

    if (!classId || !title) {
      return NextResponse.json(
        { error: "Field classId dan title wajib diisi" },
        { status: 400 }
      );
    }

    const created = await prisma.assessment.create({
      data: {
        classId,
        title,
        instruction,
        status: "OPEN",
        openedAt: new Date(),
        questions: {
          create: questions.map((q: any, i: number) => {
            const criteria = q.criteria || q.rubric || [];
            return {
              order: q.order ?? (i + 1),
              text: q.text ?? q.prompt ?? `Soal ${i + 1}`,
              referenceAnswer: q.referenceAnswer ?? "",
              maxScore: Number(q.maxScore) || 20,
              criteria: {
                create: criteria.map((c: any, ci: number) => ({
                  code: c.code || `C${ci + 1}`,
                  description: c.description || c.name || `Kriteria ${ci + 1}`,
                  minScore: c.minScore ?? 0,
                  maxScore: Number(c.maxScore) || 5,
                  levels: c.levels ?? {},
                  order: ci + 1,
                })),
              },
            };
          }),
        },
      },
      select: { id: true, title: true, status: true, version: true },
    });

    return NextResponse.json({
      success: true,
      assessmentId: created.id,
      ...created,
    }, { status: 201 });
  } catch (err: any) {
    console.error("Create assessment error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal membuat asesmen" },
      { status: 500 }
    );
  }
}
