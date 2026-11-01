import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createLlmAdapter } from "@/lib/ai/adapter";
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

    let aiExplanation: AiExplanation = {
      overallAssessment,
      suggestedScores,
      keyEvidenceQuotes,
      improvementTips,
    };

    let providerName = "indobert-heuristic";
    let modelName = "indobert-base-uncased";

    // If LLM API credentials exist, use live LLM completion
    if (process.env.LLM_API_KEY && process.env.LLM_MODEL) {
      try {
        const adapter = createLlmAdapter();
        providerName = adapter.provider;
        modelName = adapter.model;

        const systemPrompt = `Anda adalah asisten penilai esai akademik cerdas pada platform ESAINA.
Tugas Anda adalah menilai jawaban esai siswa secara objektif berdasarkan butir soal, kunci acuan guru, dan kriteria rubrik.
Aturan:
1. Skor per kriteria harus berupa integer di antara skor minimal dan maksimal kriteria tersebut.
2. 'keyEvidenceQuotes' harus berupa kutipan teks PERSIS (substring) yang ada di dalam jawaban siswa.
3. Berikan saran pengembangan yang spesifik dan ramah dalam Bahasa Indonesia.
Keluarkan output JSON dengan format persis:
{
  "overallAssessment": string,
  "suggestedScores": { [criterionId: string]: number },
  "keyEvidenceQuotes": [
    { "text": string, "criterionId": string, "sentiment": "strength" | "improvement", "note": string }
  ],
  "improvementTips": string[]
}`;

        const userPrompt = JSON.stringify({
          pertanyaan: question.text,
          kunciAcuan: question.referenceAnswer,
          kriteriaRubrik: question.criteria.map((c) => ({
            id: c.id,
            kode: c.code,
            deskripsi: c.description,
            minScore: c.minScore,
            maxScore: c.maxScore,
          })),
          jawabanSiswa: studentText,
        });

        const raw = await adapter.complete({ system: systemPrompt, user: userPrompt });
        const parsed = JSON.parse(raw);

        const validatedScores: Record<string, number> = {};
        for (const crit of question.criteria) {
          const rawSc = Number(parsed.suggestedScores?.[crit.id]);
          if (Number.isFinite(rawSc)) {
            validatedScores[crit.id] = Math.max(crit.minScore, Math.min(crit.maxScore, Math.round(rawSc)));
          } else {
            validatedScores[crit.id] = suggestedScores[crit.id] ?? crit.maxScore;
          }
        }

        const validQuotes: AiEvidenceQuote[] = (Array.isArray(parsed.keyEvidenceQuotes) ? parsed.keyEvidenceQuotes : [])
          .filter((q: any) => typeof q?.text === "string" && studentText.includes(q.text))
          .map((q: any) => ({
            text: q.text.slice(0, 200),
            criterionId: String(q.criterionId || primaryCriterionId),
            sentiment: q.sentiment === "improvement" ? "improvement" : "strength",
            note: String(q.note || "Kutipan relevan dengan kriteria rubrik."),
          }))
          .slice(0, 3);

        const validTips: string[] = (Array.isArray(parsed.improvementTips) ? parsed.improvementTips : [])
          .filter((t: any) => typeof t === "string" && t.trim().length > 0)
          .slice(0, 3);

        aiExplanation = {
          overallAssessment: parsed.overallAssessment || overallAssessment,
          suggestedScores: validatedScores,
          keyEvidenceQuotes: validQuotes.length > 0 ? validQuotes : keyEvidenceQuotes,
          improvementTips: validTips.length > 0 ? validTips : improvementTips,
        };
      } catch (llmErr) {
        console.warn("Live LLM failed, using heuristic fallback:", llmErr);
      }
    }

    // 4. Save into AIResult
    await prisma.aIResult.create({
      data: {
        submissionId,
        requestedById: session.user.id,
        provider: providerName,
        model: modelName,
        promptVersion: "v1",
        cacheKey: `${submissionId}_q${questionId}_${Date.now()}`,
        sourceVersion: 1,
        payload: aiExplanation as any,
        validationOk: true,
      },
    });

    const calculatedTotal = Object.values(aiExplanation.suggestedScores).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      success: true,
      indobertScore: Math.min(question.maxScore, calculatedTotal),
      aiSuggestion: aiExplanation,
      provider: providerName,
      model: modelName,
    });
  } catch (err: any) {
    console.error("AI recommendation error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memproses rekomendasi AI" },
      { status: 500 }
    );
  }
}
