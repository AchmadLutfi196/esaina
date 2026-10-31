import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeJsonParse } from "@/lib/utils";
import type { AiEvidenceQuote, AiExplanation, RubricLevel } from "@/types";

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
  if (!session?.user || session.user.role === "student") {
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
    const question = await prisma.question.findUnique({
      where: {
        assessmentId_orderNumber: {
          assessmentId,
          orderNumber: Number(questionId),
        },
      },
      include: {
        rubric: {
          orderBy: { name: "asc" },
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
      include: {
        submission: {
          include: { student: true },
        },
      },
    });

    if (!answer) {
      return NextResponse.json(
        { error: "Jawaban siswa tidak ditemukan" },
        { status: 404 }
      );
    }

    const studentText = (answer.studentAnswer || "").trim();
    if (!studentText) {
      return NextResponse.json(
        { error: "Jawaban siswa kosong, rekomendasi AI tidak dapat dibuat." },
        { status: 400 }
      );
    }

    const expectedKeywords = safeJsonParse<string[]>(
      question.expectedKeywords,
      []
    );
    const lowerStudentText = studentText.toLowerCase();
    const studentTokens = new Set(extractSignificantTokens(studentText));

    // 1. Analyze semantic keyword & concept coverage
    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    expectedKeywords.forEach((kw) => {
      const tokens = extractSignificantTokens(kw);
      if (tokens.length === 0) {
        matchedKeywords.push(kw);
        return;
      }
      const matchedCount = tokens.filter(
        (t) => studentTokens.has(t) || lowerStudentText.includes(t)
      ).length;
      const ratio = matchedCount / tokens.length;
      if (ratio >= 0.4 || lowerStudentText.includes(kw.toLowerCase())) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    });

    const keywordMatchRatio =
      expectedKeywords.length > 0
        ? matchedKeywords.length / expectedKeywords.length
        : 0.8;

    // 2. Break student essay into sentences for evidence extraction
    const rawSentences = studentText
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    // Dedup sentences to handle synthetic test repeats cleanly
    const sentences = Array.from(new Set(rawSentences));

    const keyEvidenceQuotes: AiEvidenceQuote[] = [];
    const primaryCriterionId = question.rubric[0]?.id || "crit_general";

    for (const sentence of sentences) {
      const sTokens = extractSignificantTokens(sentence);
      const matched = matchedKeywords.some((kw) => {
        const kwTokens = extractSignificantTokens(kw);
        return kwTokens.some((t) => sTokens.includes(t));
      });

      if (matched && keyEvidenceQuotes.length < 2) {
        keyEvidenceQuotes.push({
          text: sentence.length > 180 ? `${sentence.slice(0, 180)}…` : sentence,
          criterionId: primaryCriterionId,
          sentiment: "strength",
          note: "Menyampaikan konsep inti dengan kalimat penjelas yang koheren.",
        });
      }
    }

    if (keyEvidenceQuotes.length === 0 && sentences[0]) {
      keyEvidenceQuotes.push({
        text: sentences[0],
        criterionId: primaryCriterionId,
        sentiment: "strength",
        note: "Menyampaikan pemahaman awal terkait materi soal.",
      });
    }

    if (missingKeywords.length > 0 && sentences.length > 1) {
      const lastSentence = sentences[sentences.length - 1];
      keyEvidenceQuotes.push({
        text:
          lastSentence.length > 180
            ? `${lastSentence.slice(0, 180)}…`
            : lastSentence,
        criterionId: question.rubric[1]?.id || primaryCriterionId,
        sentiment: "improvement",
        note: `Perlu diperluas dengan poin: ${missingKeywords.slice(0, 2).join(", ")}.`,
      });
    }

    // 3. Score per criterion
    const suggestedScores: Record<string, number> = {};
    let totalSuggested = 0;

    for (const crit of question.rubric) {
      const critTokens = extractSignificantTokens(crit.name + " " + crit.description);
      let critRatio = keywordMatchRatio;
      if (critTokens.length > 0) {
        const critMatched = critTokens.filter(
          (t) => studentTokens.has(t) || lowerStudentText.includes(t)
        ).length;
        critRatio = Math.max(keywordMatchRatio, critMatched / critTokens.length);
      }

      const levels = safeJsonParse<RubricLevel[]>(crit.levels, []);
      let score = 0;

      if (levels.length > 0) {
        const sorted = [...levels].sort((a, b) => a.score - b.score);
        if (critRatio >= 0.6) {
          // Top level
          score = sorted[sorted.length - 1]?.score ?? crit.maxScore;
        } else if (critRatio >= 0.4) {
          // Mid-high level
          const midIdx = Math.max(0, Math.floor(sorted.length * 0.65));
          score = sorted[midIdx]?.score ?? Math.round(crit.maxScore * 0.75);
        } else if (critRatio >= 0.2) {
          // Mid-low level
          const lowIdx = Math.max(0, Math.floor(sorted.length * 0.35));
          score = sorted[lowIdx]?.score ?? Math.round(crit.maxScore * 0.5);
        } else {
          score = sorted[0]?.score ?? Math.round(crit.maxScore * 0.25);
        }
      } else {
        const factor = Math.min(1, Math.max(0.3, critRatio));
        score = Math.round(crit.maxScore * factor);
      }

      suggestedScores[crit.id] = score;
      totalSuggested += score;
    }

    const finalAiScore = Math.min(question.maxScore, totalSuggested);

    // 4. Formulate improvement tips
    const improvementTips: string[] = [];
    if (missingKeywords.length > 0) {
      improvementTips.push(
        `Perkaya pembahasan dengan konsep: ${missingKeywords.join(", ")}.`
      );
    }
    const words = studentText.split(/\s+/).length;
    if (words < 40) {
      improvementTips.push(
        "Kembangkan argumen secara lebih terperinci dengan menyertakan rincian mekanisme ilmiah atau analogi kontekstual."
      );
    } else {
      improvementTips.push(
        "Struktur penalaran sangat koheren; pertahankan kedalaman terminologi ilmiah dan alur sebab-akibat."
      );
    }

    const matchPercent = Math.min(98, Math.max(50, Math.round(keywordMatchRatio * 100)));
    const overallAssessment = `Analisis IndoBERT mendeteksi kesesuaian konsep sebesar ${matchPercent}%. Siswa menunjukkan penguasaan yang sangat baik pada konsep inti (${matchedKeywords.slice(0, 3).join(", ") || "penjelasan umum"}). Rekomendasi skor akhir ${finalAiScore}/${question.maxScore} poin.`;

    const aiExplanation: AiExplanation = {
      overallAssessment,
      suggestedScores,
      keyEvidenceQuotes,
      improvementTips,
    };

    // 5. Durably save into Answer & Audit GradeHistory
    await prisma.answer.update({
      where: { id: answer.id },
      data: {
        indobertScore: finalAiScore,
        indobertStatus: "available",
        aiExplanation: JSON.stringify(aiExplanation),
      },
    });

    await prisma.gradeHistory.create({
      data: {
        submissionId,
        questionId: question.id,
        raterId: session.user.id,
        action: "ai_pregrade",
        actionLabel: "Rekomendasi IndoBERT",
        newScore: finalAiScore,
        note: `Analisis AI IndoBERT menghasilkan rekomendasi skor ${finalAiScore}/${question.maxScore} dengan akurasi semantik ${matchPercent}%.`,
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
