import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role === "student") {
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
    // Find the question by orderNumber
    const question = await prisma.question.findUnique({
      where: {
        assessmentId_orderNumber: {
          assessmentId,
          orderNumber: questionId,
        },
      },
      include: { rubric: true },
    });

    if (!question) {
      return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });
    }

    // Upsert the Answer record
    const totalQScore = Object.values(scores).reduce((a, b) => a + Number(b), 0);

    const answer = await prisma.answer.upsert({
      where: {
        submissionId_questionId: {
          submissionId,
          questionId: question.id,
        },
      },
      create: {
        submissionId,
        questionId: question.id,
        teacherFeedback: feedback,
        finalScore: isFinal ? totalQScore : null,
        finalScoreBy: isFinal ? session.user.id : null,
        finalScoreAt: isFinal ? new Date() : null,
        status: isFinal ? "completed" : "ready_for_review",
      },
      update: {
        teacherFeedback: feedback,
        finalScore: isFinal ? totalQScore : undefined,
        finalScoreBy: isFinal ? session.user.id : undefined,
        finalScoreAt: isFinal ? new Date() : undefined,
        status: isFinal ? "completed" : "ready_for_review",
      },
    });

    // Upsert Rating for the current rater
    await prisma.rating.upsert({
      where: {
        answerId_raterId: {
          answerId: answer.id,
          raterId: session.user.id,
        },
      },
      create: {
        answerId: answer.id,
        raterId: session.user.id,
        score: totalQScore,
      },
      update: {
        score: totalQScore,
      },
    });

    // Save per-criterion scores
    for (const [criterionId, scoreVal] of Object.entries(scores)) {
      await prisma.criterionScore.upsert({
        where: {
          answerId_criterionId: {
            answerId: answer.id,
            criterionId,
          },
        },
        create: {
          answerId: answer.id,
          criterionId,
          score: Number(scoreVal),
        },
        update: {
          score: Number(scoreVal),
        },
      });
    }

    // Audit trail: GradeHistory
    await prisma.gradeHistory.create({
      data: {
        submissionId,
        questionId: question.id,
        raterId: session.user.id,
        action: isFinal ? "finalized" : "score_adjustment",
        actionLabel: isFinal ? "Nilai difinalisasi" : "Penyesuaian skor",
        newScore: totalQScore,
        note: `Penilaian soal #${questionId} disimpan oleh ${session.user.name}.`,
      },
    });

    // Update submission status if all questions are scored
    if (isFinal) {
      const allAnswers = await prisma.answer.findMany({
        where: { submissionId },
      });
      const allDone = allAnswers.every((a) => a.status === "completed");
      const overallFinalScore = allAnswers.reduce(
        (sum, a) => sum + (a.finalScore ?? 0),
        0
      );

      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          statusGrading: allDone ? "final" : "draft_graded",
          overallFinalScore: allDone ? overallFinalScore : undefined,
          finalizedBy: allDone ? session.user.id : undefined,
          finalizedAt: allDone ? new Date() : undefined,
        },
      });
    }

    return NextResponse.json({ success: true, score: totalQScore });
  } catch (err: any) {
    console.error("Grading save error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal menyimpan penilaian" },
      { status: 500 }
    );
  }
}
