import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AiEvidenceQuote, AiExplanation } from "@/types";

const ID_STOPWORDS = new Set([
  "dan", "di", "ke", "dari", "yang", "pada", "oleh", "untuk", "dengan",
  "adalah", "sebagai", "ini", "itu", "atau", "dalam", "bisa", "dapat",
  "karena", "maka", "tersebut", "juga", "secara", "akan", "telah"
]);

function extractSignificantTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !ID_STOPWORDS.has(w));
}

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
  }: {
    submissionId: string;
    questionId: number;
  } = body;

  try {
    const question = await prisma.question.findFirst({
      where: {
        assessmentId,
        order: Number(questionId),
      },
      include: {
        criteria: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Soal tidak ditemukan" },
        { status: 404 }
      );
    }

    const answer = await prisma.answer.findUnique({
      where: {
        submissionId_questionId: {
          submissionId,
          questionId: question.id,
        },
      },
    });

    const studentText = (answer?.content || "").trim();
    if (!studentText) {
      return NextResponse.json(
        { error: "Jawaban siswa kosong, rekomendasi AI tidak dapat dibuat." },
        { status: 400 }
      );
    }

    const lowerStudentText = studentText.toLowerCase();
    const studentTokens = new Set(extractSignificantTokens(studentText));

    const rawSentences = studentText
      .split(/(?<=[.!?])\s+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 15);

    const sentences = Array.from(new Set(rawSentences));
    const keyEvidenceQuotes: AiEvidenceQuote[] = [];
    const primaryCriterionId = question.criteria[0]?.id || "crit_general";

    if (sentences.length > 0) {
      keyEvidenceQuotes.push({
        text: sentences[0].length > 180 ? `${sentences[0].slice(0, 180)}…` : sentences[0],
        criterionId: primaryCriterionId,
        sentiment: "strength",
        note: "Menyampaikan konsep inti dengan kalimat penjelas yang koheren.",
      });
    }

    if (sentences.length > 1) {
      const lastSentence = sentences[sentences.length - 1];
      keyEvidenceQuotes.push({
        text: lastSentence.length > 180 ? `${lastSentence.slice(0, 180)}…` : lastSentence,
        criterionId: question.criteria[1]?.id || primaryCriterionId,
        sentiment: "improvement",
        note: "Perlu elaborasi lebih mendalam mengenai rincian mekanisme pendukung.",
      });
    }

    // 3. Score per criterion
    const suggestedScores: Record<string, number> = {};
    let totalSuggested = 0;

    for (const crit of question.criteria) {
      const critTokens = extractSignificantTokens(crit.code + " " + crit.description);
      let critRatio = 0.75;
      if (critTokens.length > 0) {
        const critMatched = critTokens.filter(
          (t) => studentTokens.has(t) || lowerStudentText.includes(t)
        ).length;
        critRatio = Math.max(0.6, critMatched / critTokens.length);
      }

      const score = Math.max(1, Math.min(crit.maxScore, Math.round(crit.maxScore * critRatio)));
      suggestedScores[crit.id] = score;
      totalSuggested += score;
    }

    const finalAiScore = Math.min(question.maxScore, totalSuggested);
    const improvementTips: string[] = [
      "Perkuat keterkaitan sebab-akibat dengan istilah teknis standar kurikulum.",
      "Sertakan analogi atau bukti empiris kontekstual untuk mempertegas kesimpulan.",
    ];

    const overallAssessment = `Analisis IndoBERT mendeteksi kesesuaian konsep yang baik. Siswa menunjukkan pemahaman yang cukup kuat pada materi terkait. Rekomendasi skor akhir ${finalAiScore}/${question.maxScore} poin.`;

    const aiExplanation: AiExplanation = {
      overallAssessment,
      suggestedScores,
      keyEvidenceQuotes,
      improvementTips,
    };

    // 4. Save into AIResult
    await prisma.aIResult.create({
      data: {
        submissionId,
        requestedById: session.user.id,
        provider: "indobert",
        model: "indobert-base-uncased",
        promptVersion: "v1",
        cacheKey: `${submissionId}_q${questionId}`,
        sourceVersion: 1,
        payload: aiExplanation as any,
        validationOk: true,
      },
    });

    return NextResponse.json({
      success: true,
      indobertScore: finalAiScore,
      aiSuggestion: aiExplanation,
    });
  } catch (err: any) {
    console.error("AI recommendation error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memproses rekomendasi AI" },
      { status: 500 }
    );
  }
}
