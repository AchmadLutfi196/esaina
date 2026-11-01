import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const role = String(session?.user?.role || "").toUpperCase();
  if (!session?.user || role === "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: assessmentId } = await params;
  const body = await request.json();
  const {
    submissionId,
    questionId,
    scores,
    feedback,
    isFinal,
  }: {
    submissionId: string;
    questionId: number;
    scores: Record<string, number>;
    feedback: string;
    isFinal: boolean;
  } = body;

  try {
    const question = await prisma.question.findFirst({
      where: {
        assessmentId,
        order: questionId,
      },
      include: { criteria: true },
    });

    if (!question) {
      return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });
    }

    const teacherId = session.user.id;

    // Find or create active grade revision for this submission
    let revision = await prisma.gradeRevision.findFirst({
      where: { submissionId, status: "DRAFT" },
      orderBy: { version: "desc" },
    });

    if (!revision) {
      const lastRev = await prisma.gradeRevision.findFirst({
        where: { submissionId },
        orderBy: { version: "desc" },
      });
      const nextVer = (lastRev?.version ?? 0) + 1;

      revision = await prisma.gradeRevision.create({
        data: {
          submissionId,
          authorId: teacherId,
          status: isFinal ? "FINAL" : "DRAFT",
          version: nextVer,
          totalScore: 0,
        },
      });
    }

    // Save GradeItem per criterion
    for (const [criterionId, scoreVal] of Object.entries(scores)) {
      await prisma.gradeItem.upsert({
        where: {
          revisionId_questionId_criterionId: {
            revisionId: revision.id,
            questionId: question.id,
            criterionId,
          },
        },
        create: {
          revisionId: revision.id,
          questionId: question.id,
          criterionId,
          score: Number(scoreVal),
          feedback: feedback || "",
          source: "MANUAL",
        },
        update: {
          score: Number(scoreVal),
          feedback: feedback || "",
        },
      });
    }

    // Recalculate revision total score
    const allItems = await prisma.gradeItem.findMany({
      where: { revisionId: revision.id },
    });
    const totalScore = allItems.reduce((sum, item) => sum + (item.score ?? 0), 0);

    await prisma.gradeRevision.update({
      where: { id: revision.id },
      data: {
        totalScore,
        status: isFinal ? "FINAL" : "DRAFT",
        approvedById: isFinal ? teacherId : null,
        approvedAt: isFinal ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      revisionId: revision.id,
      totalScore,
      isFinal,
    });
  } catch (err: any) {
    console.error("Save grade error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal menyimpan nilai" },
      { status: 500 }
    );
  }
}
