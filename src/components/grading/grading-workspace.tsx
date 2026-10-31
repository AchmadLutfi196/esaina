"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Bot,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  History,
  Lightbulb,
  MessageSquareQuote,
  Quote,
  Save,
  Scale,
  Sliders,
  Sparkles,
  UserCheck,
  Wand2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  GRADING_STATUS_LABEL,
  WORK_STATUS_LABEL,
  type AiExplanation,
  type Assessment,
} from "@/types";
import {
  calculateQuestionScore,
  calculateSubmissionTotalScore,
} from "@/lib/scoring";

export function GradingWorkspace({
  assessment,
}: {
  assessment: Assessment;
}) {
  const submittedSubs = assessment.submissions.filter(
    (s) => s.statusWork === "submitted"
  );

  const [currentSubIdx, setCurrentSubIdx] = useState(0);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [localScores, setLocalScores] = useState<
    Record<string, Record<string, number>>
  >({});
  const [localFeedback, setLocalFeedback] = useState<
    Record<string, Record<number, string>>
  >({});

  const sub = submittedSubs[currentSubIdx] ?? assessment.submissions[0];
  const q = assessment.questions[currentQIdx] ?? assessment.questions[0];

  if (!sub) {
    return (
      <div className="space-y-4">
        <Link
          href={`/assessments/${assessment.id}`}
          className="flex items-center gap-2 text-xs font-bold text-muted hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
        <Card className="p-12 text-center">
          <p className="text-sm font-semibold text-ink">
            Belum ada jawaban siswa yang terkumpul.
          </p>
        </Card>
      </div>
    );
  }

  const answer = sub.answers[q.id];
  const scores = localScores[`${sub.id}-${q.id}`] ?? answer?.scores ?? {};
  const feedback =
    localFeedback[sub.id]?.[q.id] ?? answer?.teacherFeedback ?? "";

  const qScore = calculateQuestionScore(scores);
  const totalScore = calculateSubmissionTotalScore(sub);

  const handleScoreChange = (criterionId: string, value: number) => {
    const key = `${sub.id}-${q.id}`;
    setLocalScores((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? scores), [criterionId]: value },
    }));
  };

  const handleFeedbackChange = (text: string) => {
    setLocalFeedback((prev) => ({
      ...prev,
      [sub.id]: { ...(prev[sub.id] ?? {}), [q.id]: text },
    }));
  };

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const [localAiSuggestions, setLocalAiSuggestions] = useState<
    Record<string, AiExplanation>
  >({});
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiAppliedSuccess, setAiAppliedSuccess] = useState(false);

  const currentKey = `${sub.id}-${q.id}`;
  const currentAiSuggestion =
    localAiSuggestions[currentKey] ?? answer?.aiSuggestion;

  const fetchAiRecommendation = async () => {
    setLoadingAi(true);
    setAiError(null);
    setAiAppliedSuccess(false);
    try {
      const res = await fetch(
        `/api/assessments/${assessment.id}/recommendation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submissionId: sub.id,
            questionId: q.id,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mendapatkan rekomendasi AI");
      }
      setLocalAiSuggestions((prev) => ({
        ...prev,
        [currentKey]: data.aiSuggestion,
      }));
    } catch (err: any) {
      setAiError(err.message || "Gagal menghubungi mesin IndoBERT");
    } finally {
      setLoadingAi(false);
    }
  };

  const applyAiRecommendation = (suggestion: AiExplanation) => {
    if (suggestion.suggestedScores) {
      setLocalScores((prev) => ({
        ...prev,
        [currentKey]: {
          ...(prev[currentKey] ?? scores),
          ...suggestion.suggestedScores,
        },
      }));
    }
    const tipsText =
      suggestion.improvementTips.length > 0
        ? `\n\nSaran Pengembangan:\n• ${suggestion.improvementTips.join("\n• ")}`
        : "";
    const compiledFeedback = `${suggestion.overallAssessment}${tipsText}`;
    handleFeedbackChange(compiledFeedback);
    setAiAppliedSuccess(true);
    setTimeout(() => setAiAppliedSuccess(false), 3000);
  };

  const saveGrade = async (isFinal: boolean) => {
    setSaving(true);
    setSaveSuccess(null);
    try {
      const res = await fetch(`/api/assessments/${assessment.id}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: sub.id,
          questionId: q.id,
          scores,
          feedback,
          isFinal,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveSuccess(
          isFinal
            ? `Nilai soal ${q.id} berhasil difinalisasi (${data.score} poin).`
            : `Draf nilai soal ${q.id} berhasil disimpan.`
        );
        setTimeout(() => setSaveSuccess(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-up space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/assessments/${assessment.id}`}
          className="flex items-center gap-2 text-xs font-bold text-muted transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Detail Asesmen</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge status={GRADING_STATUS_LABEL[sub.statusGrading]} />
          <span className="rounded-full border border-line bg-white/80 px-3 py-1 text-[11px] font-bold text-muted">
            {sub.studentName}
          </span>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Student Queue */}
        <div className="space-y-2 lg:col-span-2">
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
            Antrean Siswa ({submittedSubs.length})
          </h3>
          <div className="max-h-[70vh] space-y-1 overflow-y-auto">
            {submittedSubs.map((s, idx) => {
              const isCurrent = idx === currentSubIdx;
              const score = calculateSubmissionTotalScore(s);
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentSubIdx(idx);
                    setCurrentQIdx(0);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl p-2.5 text-left text-xs transition-all",
                    isCurrent
                      ? "border border-brand bg-brand-tint font-bold text-brand"
                      : "border border-transparent text-muted hover:bg-white/70"
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{s.studentName}</p>
                    <p className="text-[10px]">{s.studentNis}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {s.statusGrading === "final" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <span className="nums text-[11px] font-bold">
                        {score > 0 ? score : "—"}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Essay + Evidence */}
        <div className="space-y-4 lg:col-span-5">
          {/* Question nav */}
          <div className="flex items-center gap-2">
            {assessment.questions.map((question, idx) => (
              <button
                key={question.id}
                onClick={() => setCurrentQIdx(idx)}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                  idx === currentQIdx
                    ? "bg-brand text-white shadow-xs"
                    : "border border-line bg-white/80 text-muted hover:text-brand"
                )}
              >
                Soal {idx + 1}
              </button>
            ))}
          </div>

          {/* Question prompt */}
          <Card className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Soal {currentQIdx + 1}
                </span>
                <h3 className="mt-1 text-sm font-bold leading-relaxed text-brand">
                  {q.prompt}
                </h3>
              </div>
              <span className="nums shrink-0 rounded-lg border border-orange-pastel bg-butter-yellow px-2.5 py-1 text-xs font-bold text-brand">
                {q.maxScore}p
              </span>
            </div>

            {/* Keywords */}
            <div className="flex flex-wrap gap-1.5">
              {q.expectedKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="rounded-md border border-bleu-ciel bg-bleu-ciel/25 px-2 py-0.5 text-[11px] font-bold text-brand"
                >
                  {kw}
                </span>
              ))}
            </div>
          </Card>

          {/* Student answer */}
          <Card className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-brand">
                <FileText className="h-3.5 w-3.5" />
                Jawaban {sub.studentName}
              </h4>
              <span className="nums text-[11px] font-bold text-muted">
                {answer?.wordCount ?? 0} kata
              </span>
            </div>
            <div className="max-h-80 overflow-y-auto whitespace-pre-line rounded-xl border border-line bg-paper p-4 text-xs leading-relaxed text-brand">
              {answer?.studentAnswer || "(Tidak ada jawaban)"}
            </div>
          </Card>

          {/* Reference answer */}
          {q.referenceAnswer && (
            <Card className="space-y-2 border-bleu-ciel/30 bg-bleu-ciel/10 p-4">
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-brand">
                <BookOpen className="h-3.5 w-3.5" />
                Kunci Jawaban (Referensi)
              </h4>
              <p className="text-xs leading-relaxed text-muted">
                {q.referenceAnswer}
              </p>
            </Card>
          )}
        </div>

        {/* Right: Rubric + Score + Feedback */}
        <div className="space-y-4 lg:col-span-5">
          {/* AI IndoBERT Recommendation Card */}
          <div className="glass-card relative overflow-hidden rounded-2xl border border-bleu-ciel/50 bg-gradient-to-br from-white/90 via-bleu-ciel/15 to-butter-yellow/20 p-5 shadow-[0_8px_30px_rgba(10,22,128,0.06),inset_0_1px_2px_rgba(255,255,255,0.95)]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest text-bleu-ciel shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">
                    Asisten AI IndoBERT
                  </h4>
                  <p className="text-[10px] text-muted">
                    Explainable AI • Penilaian Semantik
                  </p>
                </div>
              </div>
              <Badge status="IndoBERT v2" />
            </div>

            {loadingAi ? (
              <div className="mt-4 flex flex-col items-center justify-center space-y-2 py-6 text-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent"></div>
                <p className="text-xs font-semibold text-brand">
                  Menganalisis koherensi semantik & mencocokkan rubrik...
                </p>
                <p className="text-[11px] text-muted">
                  Memproses representasi vektor jawaban siswa
                </p>
              </div>
            ) : currentAiSuggestion ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-brand-line/40 bg-white/80 p-3 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-bold text-brand">
                    <span>Ringkasan Evaluasi Mesin:</span>
                    <span className="nums rounded-md bg-forest px-2 py-0.5 text-[11px] text-bleu-ciel">
                      Saran:{" "}
                      {Object.values(
                        currentAiSuggestion.suggestedScores
                      ).reduce((a, b) => a + Number(b), 0)}{" "}
                      / {q.maxScore}p
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-2">
                    {currentAiSuggestion.overallAssessment}
                  </p>
                </div>

                {currentAiSuggestion.keyEvidenceQuotes.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      Kutipan Bukti dari Teks Siswa:
                    </span>
                    <div className="space-y-1.5">
                      {currentAiSuggestion.keyEvidenceQuotes.map(
                        (quote, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "rounded-lg border p-2 text-[11px] leading-relaxed",
                              quote.sentiment === "strength"
                                ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
                                : "border-amber-200 bg-amber-50/80 text-amber-950"
                            )}
                          >
                            <p className="italic font-medium">
                              &ldquo;{quote.text}&rdquo;
                            </p>
                            <p className="mt-1 text-[10px] opacity-80">
                              ℹ️ {quote.note}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() => applyAiRecommendation(currentAiSuggestion)}
                    className="gap-1.5 text-xs"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Terapkan Rekomendasi ke Rubrik</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchAiRecommendation}
                    className="gap-1 text-xs"
                  >
                    <Wand2 className="h-3.5 w-3.5 text-brand" />
                    <span>Analisis Ulang</span>
                  </Button>
                </div>

                {aiAppliedSuccess && (
                  <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-2 text-center text-xs font-bold text-emerald-800">
                    ✨ Rekomendasi skor dan umpan balik berhasil diterapkan ke formulir!
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="text-xs leading-relaxed text-ink-2">
                  Dapatkan rekomendasi skor per kriteria rubrik, kutipan bukti tekstual, dan draf umpan balik otomatis yang dapat Anda sesuaikan.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAiRecommendation}
                  className="w-full gap-2 border-brand-line/60 bg-white/80 font-bold text-brand hover:bg-white shadow-xs"
                >
                  <Sparkles className="h-4 w-4 text-brand" />
                  <span>Minta Rekomendasi AI IndoBERT</span>
                </Button>
              </div>
            )}

            {aiError && (
              <div className="mt-2 rounded-lg border border-rose-300 bg-rose-50 p-2 text-xs text-rose-700">
                ⚠️ {aiError}
              </div>
            )}
          </div>

          <Card className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-brand">
                <Sliders className="h-3.5 w-3.5" />
                Penilaian Rubrik — Soal {currentQIdx + 1}
              </h4>
              <span className="nums rounded-full border border-brand-line bg-brand-tint px-2.5 py-0.5 text-xs font-bold text-brand">
                {qScore} / {q.maxScore}
              </span>
            </div>

            {/* Criteria */}
            <div className="space-y-3">
              {q.rubric.map((crit) => {
                const value = scores[crit.id] ?? 0;
                return (
                  <div
                    key={crit.id}
                    className="space-y-2 rounded-xl border border-line bg-white/60 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand">
                        {crit.name}
                      </span>
                      <span className="nums text-[11px] font-bold text-muted">
                        Maks {crit.maxScore}p
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted">
                      {crit.description}
                    </p>

                    {/* Level buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      {crit.levels.map((level) => (
                        <button
                          key={level.score}
                          type="button"
                          onClick={() =>
                            handleScoreChange(crit.id, level.score)
                          }
                          className={cn(
                            "cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all",
                            value === level.score
                              ? "bg-brand text-white shadow-xs"
                              : "border border-line bg-white text-muted hover:border-brand hover:text-brand"
                          )}
                          title={level.description}
                        >
                          {level.score}p — {level.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Feedback */}
          <Card className="space-y-3 p-5">
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-brand">
              <MessageSquareQuote className="h-3.5 w-3.5" />
              Umpan Balik Guru
            </h4>
            <Textarea
              rows={4}
              value={feedback}
              onChange={(e) => handleFeedbackChange(e.target.value)}
              placeholder="Tulis umpan balik untuk jawaban siswa pada soal ini..."
            />
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentSubIdx === 0}
                onClick={() => {
                  setCurrentSubIdx((p) => Math.max(0, p - 1));
                  setCurrentQIdx(0);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentSubIdx >= submittedSubs.length - 1}
                onClick={() => {
                  setCurrentSubIdx((p) =>
                    Math.min(submittedSubs.length - 1, p + 1)
                  );
                  setCurrentQIdx(0);
                }}
              >
                Berikutnya
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                loading={saving}
                onClick={() => saveGrade(false)}
              >
                <Save className="h-3.5 w-3.5" />
                Simpan Draf
              </Button>
              <Button
                size="sm"
                loading={saving}
                onClick={() => saveGrade(true)}
              >
                <Check className="h-3.5 w-3.5" />
                Finalkan
              </Button>
            </div>
          </div>

          {saveSuccess && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-2.5 text-[11px] font-bold text-emerald-800">
              ✅ {saveSuccess}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
