import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    select: { id: true, title: true, class: { select: { teacherId: true } } },
  });

  if (!assessment) {
    return NextResponse.json({ error: "Asesmen tidak ditemukan" }, { status: 404 });
  }

  const rows = await prisma.submission.findMany({
    where: { assessmentId: id, status: "SUBMITTED" },
    orderBy: { submittedAt: "asc" },
    select: {
      id: true,
      student: { select: { id: true, name: true, anonCode: true } },
      submittedAt: true,
      gradeRevisions: {
        where: { status: "FINAL" },
        orderBy: { version: "desc" },
        take: 1,
        select: {
          id: true,
          totalScore: true,
          version: true,
          publications: { select: { id: true, publishedAt: true } },
        },
      },
    },
  });

  return NextResponse.json({
    assessment: { id: assessment.id, title: assessment.title },
    submissions: rows.map((s) => {
      const r = s.gradeRevisions[0];
      return {
        id: s.id,
        name: s.student.name,
        anonCode: s.student.anonCode,
        submittedAt: s.submittedAt,
        revisionId: r?.id ?? null,
        totalScore: r?.totalScore ?? null,
        published: Boolean(r?.publications.length),
        publishedAt: r?.publications[0]?.publishedAt ?? null,
      };
    }),
  });
}

export async function POST(request: Request, ctx: Ctx) {
  const session = await auth();
  const role = String(session?.user?.role || "").toLowerCase();
  if (!session?.user || role === "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: assessmentId } = await ctx.params;

  try {
    const teacherId = session.user.id;
    const body = await request.json().catch(() => ({}));

    // Find all final grade revisions for this assessment
    const finalRevisions = await prisma.gradeRevision.findMany({
      where: {
        submission: { assessmentId },
        status: "FINAL",
      },
      select: { id: true, submissionId: true },
    });

    let publishedCount = 0;
    for (const rev of finalRevisions) {
      const existing = await prisma.publication.findUnique({
        where: { revisionId: rev.id },
      });
      if (!existing) {
        await prisma.publication.create({
          data: {
            assessmentId,
            revisionId: rev.id,
            publishedById: teacherId,
          },
        });
        publishedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      publishedCount,
    });
  } catch (err: any) {
    console.error("Publish assessment error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal menerbitkan nilai" },
      { status: 500 }
    );
  }
}
