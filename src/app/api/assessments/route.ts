import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAssessmentCode } from "@/lib/utils";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role === "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    classId,
    title,
    subject,
    durationMinutes,
    dueDate,
    raterCount,
    instructions,
    questions,
  } = body;

  if (!classId || !title || !subject || !dueDate) {
    return NextResponse.json(
      { error: "Mohon lengkapi semua field yang diperlukan" },
      { status: 400 }
    );
  }

  try {
    const code = generateAssessmentCode(subject);

    const assessment = await prisma.assessment.create({
      data: {
        classId,
        creatorId: session.user.id,
        title: title.trim(),
        code,
        subject: subject.trim(),
        dueDate: new Date(dueDate),
        durationMinutes: Number(durationMinutes) || 60,
        raterCount: Number(raterCount) || 1,
        targetRaters: Number(raterCount) || 1,
        instructions: instructions || "",
        status: "active",
        publicationStatus: "unpublished",
      },
    });

    // Add creator as default rater
    await prisma.assessmentRater.create({
      data: {
        assessmentId: assessment.id,
        raterId: session.user.id,
      },
    });

    // Create questions and rubrics
    if (Array.isArray(questions) && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const keywords = Array.isArray(q.expectedKeywords)
          ? q.expectedKeywords
          : typeof q.keywords === "string"
            ? q.keywords.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [];

        const question = await prisma.question.create({
          data: {
            assessmentId: assessment.id,
            orderNumber: i + 1,
            prompt: q.prompt,
            referenceAnswer: q.referenceAnswer || "",
            maxScore: Number(q.maxScore) || 25,
            expectedKeywords: JSON.stringify(keywords),
          },
        });

        // Rubrics
        if (Array.isArray(q.rubric) && q.rubric.length > 0) {
          for (const r of q.rubric) {
            const critMax = Number(r.maxScore) || 10;
            const levels = JSON.stringify([
              { score: critMax, label: "Sangat Baik", description: "Lengkap dan runtut" },
              { score: Math.round(critMax * 0.75), label: "Baik", description: "Cukup tepat" },
              { score: Math.round(critMax * 0.5), label: "Cukup", description: "Sebagian tepat" },
              { score: 0, label: "Kurang", description: "Belum terjawab" },
            ]);

            await prisma.rubricCriterion.create({
              data: {
                questionId: question.id,
                name: r.name || "Kriteria",
                weight: Math.round((critMax / question.maxScore) * 100),
                maxScore: critMax,
                description: `Pencapaian kriteria ${r.name}`,
                levels,
              },
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      assessmentId: assessment.id,
      code: assessment.code,
    });
  } catch (err: any) {
    console.error("Create assessment error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal membuat asesmen" },
      { status: 500 }
    );
  }
}
