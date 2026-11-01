import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: assessmentId } = await params;
  const body = await request.json();

  try {
    const studentId = session.user.id;

    // 1. Direct answer submission (from Bleu Océan take view)
    if (body.answers) {
      const submission = await prisma.submission.upsert({
        where: {
          assessmentId_studentId: {
            assessmentId,
            studentId,
          },
        },
        create: {
          assessmentId,
          studentId,
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
        update: {
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
      });

      const questions = await prisma.question.findMany({
        where: { assessmentId },
        orderBy: { order: "asc" },
      });

      for (const q of questions) {
        const text = String(body.answers[q.order] || body.answers[q.id] || "");
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
            content: text,
          },
          update: {
            content: text,
          },
        });
      }

      return NextResponse.json({ success: true, submissionId: submission.id, status: "SUBMITTED" });
    }

    // 2. Transactional submit with idempotency key (Upstream autosave flow)
    const idempotencyKey = body.idempotencyKey || `submit_${studentId}_${assessmentId}_${Date.now()}`;
    const version = Number(body.version) || 1;

    const submission = await prisma.submission.findUnique({
      where: { assessmentId_studentId: { assessmentId, studentId } },
    });

    if (!submission) {
      return NextResponse.json({ error: "Pekerjaan belum dimulai" }, { status: 404 });
    }

    if (submission.status === "SUBMITTED") {
      return NextResponse.json({ status: "SUBMITTED", submittedAt: submission.submittedAt, replayed: true });
    }

    const updated = await prisma.$transaction(async (tx) => {
      try {
        await tx.idempotencyKey.create({
          data: { key: idempotencyKey, userId: studentId, scope: "submit" },
        });
      } catch {}

      return tx.submission.update({
        where: { id: submission.id },
        data: { status: "SUBMITTED", submittedAt: new Date(), version: { increment: 1 } },
      });
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Submit error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal mengumpulkan asesmen" },
      { status: 500 }
    );
  }
}
