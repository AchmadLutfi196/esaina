import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { countWords } from "@/lib/utils";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: assessmentId } = await params;
  const { answers }: { answers: Record<number, string> } = await request.json();

  try {
    // Upsert Submission
    const submission = await prisma.submission.upsert({
      where: {
        assessmentId_studentId: {
          assessmentId,
          studentId: session.user.id,
        },
      },
      create: {
        assessmentId,
        studentId: session.user.id,
        statusWork: "submitted",
        statusGrading: "ungraded",
        submittedAt: new Date(),
      },
      update: {
        statusWork: "submitted",
        submittedAt: new Date(),
      },
    });

    // Save each answer
    const questions = await prisma.question.findMany({
      where: { assessmentId },
    });

    for (const q of questions) {
      const text = answers[q.orderNumber] || "";
      await prisma.answer.upsert({
        where: {
          submissionId_questionId: {
            submissionId: submission.id,
            questionId: q.id,
          },
        },
        create: {
          submissionId: submission.id,
          questionId: q.id,
          studentAnswer: text,
          charCount: text.length,
          wordCount: countWords(text),
          status: "waiting_raters",
        },
        update: {
          studentAnswer: text,
          charCount: text.length,
          wordCount: countWords(text),
        },
      });
    }

    return NextResponse.json({ success: true, submissionId: submission.id });
  } catch (err: any) {
    console.error("Submit exam error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal mengumpulkan lembar jawaban" },
      { status: 500 }
    );
  }
}
