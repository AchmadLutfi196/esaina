"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CornerUpLeft,
  FileText,
  History,
  MessageSquareQuote,
  RotateCcw,
  Save,
  Scale,
  Sliders,
  Sparkles,
  UserCheck,
  Wand2,
  AlertTriangle,
  CheckCircle2,
  Info,
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
  const [previousFeedback, setPreviousFeedback] = useState<string | null>(null);

  const sub = submittedSubs[currentSubIdx] ?? assessment.submissions[0];
  const q = assessment.questions[currentQIdx] ?? assessment.questions[0];

  const answer = sub?.answers[q?.id];
  const scores = localScores[`${sub?.id}-${q?.id}`] ?? answer?.scores ?? {};
  const feedback =
    localFeedback[sub?.id]?.[q?.id] ?? answer?.teacherFeedback ?? "";

  const qScore = calculateQuestionScore(scores);
  const totalScore = sub ? calculateSubmissionTotalScore(sub) : 0;

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [localAiSuggestions, setLocalAiSuggestions] = useState<
    Record<string, AiExplanation>
  >({});
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiAppliedSuccess, setAiAppliedSuccess] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(true);

  const currentKey = `${sub?.id}-${q?.id}`;
  const currentAiSuggestion =
    localAiSuggestions[currentKey] ?? answer?.aiSuggestion;

  const totalQuestions = assessment.questions.length;
  const hasNextQuestion = currentQIdx < totalQuestions - 1;
  const hasPrevQuestion = currentQIdx > 0;
  const hasNextStudent = currentSubIdx < submittedSubs.length - 1;
  const hasPrevStudent = currentSubIdx > 0;

  const handleScoreChange = (criterionId: string, value: number) => {
    if (!sub || !q) return;
    const key = `${sub.id}-${q.id}`;
    setLocalScores((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? scores), [criterionId]: value },
    }));
  };

  const handleFeedbackChange = (text: string) => {
    if (!sub || !q) return;
    setLocalFeedback((prev) => ({
      ...prev,
      [sub.id]: { ...(prev[sub.id] ?? {}), [q.id]: text },
    }));
  };

  const handleNextStep = () => {
    if (hasNextQuestion) {
      setCurrentQIdx((prev) => prev + 1);
    } else if (hasNextStudent) {
      setCurrentSubIdx((prev) => prev + 1);
      setCurrentQIdx(0);
    }
  };

  const handlePrevStep = () => {
    if (hasPrevQuestion) {
      setCurrentQIdx((prev) => prev - 1);
    } else if (hasPrevStudent) {
      setCurrentSubIdx((prev) => prev - 1);
      setCurrentQIdx(totalQuestions - 1);
    }
  };

  const fetchAiRecommendation = async () => {
    if (!sub || !q) return;
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
      setAiExpanded(true);
    } catch (err: any) {
      setAiError(err.message || "Gagal menghubungi mesin IndoBERT");
    } finally {
      setLoadingAi(false);
    }
  };

  const applyAiRecommendation = (suggestion: AiExplanation) => {
    if (!sub || !q) return;
    // Save backup of current feedback before applying
    setPreviousFeedback(feedback);

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
    const aiText = `${suggestion.overallAssessment}${tipsText}`;
    
    // If teacher already wrote custom feedback, append gracefully instead of destroying
    const mergedFeedback = feedback.trim().length > 0
      ? `${feedback}\n\n[Rekomendasi IndoBERT]:\n${aiText}`
      : aiText;

    handleFeedbackChange(mergedFeedback);
    setAiAppliedSuccess(true);
    setTimeout(() => setAiAppliedSuccess(false), 4000);
  };

  const undoAiFeedback = () => {
    if (previousFeedback !== null) {
      handleFeedbackChange(previousFeedback);
      setPreviousFeedback(null);
    }
  };

  const saveGrade = async (isFinal: boolean) => {
    if (!sub || !q) return;
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);
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
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan nilai ke server.");
      }

      // Reactive update: update in-memory student submission answers & status
      sub.answers[q.id] = {
        ...(sub.answers[q.id] ?? {}),
        questionId: q.id,
        scores,
        teacherFeedback: feedback,
        lastUpdated: new Date().toISOString(),
        studentAnswer: answer?.studentAnswer ?? "",
        wordCount: answer?.wordCount ?? 0,
      };

      if (isFinal) {
        // Check if all questions are scored
        const allQuestionsScored = assessment.questions.every((qst) => {
          const ans = sub.answers[qst.id];
          return ans && calculateQuestionScore(ans.scores) > 0;
        });
        sub.statusGrading = allQuestionsScored ? "final" : "draft_graded";
      } else if (sub.statusGrading === "ungraded") {
        sub.statusGrading = "draft_graded";
      }

      setSaveSuccess(
        isFinal
          ? `Nilai soal ${currentQIdx + 1} berhasil difinalisasi (${data.score ?? qScore} poin).`
          : `Draf nilai soal ${currentQIdx + 1} berhasil disimpan.`
      );
      setTimeout(() => setSaveSuccess(null), 3500);
    } catch (err: any) {
      setSaveError(err.message || "Gagal menyimpan penilaian.");
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Keyboard navigation & quick save shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        (e.target as HTMLElement)?.tagName === "TEXTAREA" ||
        (e.target as HTMLElement)?.tagName === "INPUT";

      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        saveGrade(true);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveGrade(false);
        return;
      }

      if (!isInput && e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        handleNextStep();
      } else if (!isInput && e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQIdx, currentSubIdx, scores, feedback, hasNextQuestion, hasNextStudent, hasPrevQuestion, hasPrevStudent]);

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

  return (
    <div className="animate-fade-up space-y-4 pb-8">
      {/* Workspace Header */}
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
          <span className="rounded-full border border-line bg-white/80 px-3 py-1 text-xs font-bold text-brand shadow-xs">
            {sub.studentName}
          </span>
          <span className="hidden sm:inline text-xs text-muted">
            NIS: {sub.studentNis}
          </span>
        </div>
      </div>

      {/* 3-Column Responsive Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Student Queue */}
        <div className="space-y-2 lg:col-span-3 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted">
              Antrean Siswa ({submittedSubs.length})
            </h2>
            <span className="text-[10px] font-bold text-muted">
              {currentSubIdx + 1} dari {submittedSubs.length}
            </span>
          </div>

          <div
            tabIndex={0}
            role="region"
            aria-label="Daftar antrean siswa"
            className="max-h-[75vh] space-y-1.5 overflow-y-auto rounded-xl border border-line/60 bg-white/40 p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {submittedSubs.map((s, idx) => {
              const isCurrent = idx === currentSubIdx;
              const studentTotal = calculateSubmissionTotalScore(s);
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={isCurrent}
                  onClick={() => {
                    setCurrentSubIdx(idx);
                    setCurrentQIdx(0);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl p-2.5 text-left text-xs transition-all",
                    isCurrent
                      ? "border border-brand bg-brand-tint font-bold text-brand shadow-xs"
                      : "border border-transparent text-muted hover:border-line hover:bg-white/80"
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">
                      {s.studentName}
                    </p>
                    <p className="text-[11px] text-muted">{s.studentNis}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {s.statusGrading === "final" ? (
                      <span
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
                        title="Nilai Final"
                        aria-label="Nilai Final"
                      >
                        <Check className="h-3 w-3 stroke-[2.5]" />
                      </span>
                    ) : (
                      <span className="nums text-xs font-bold text-brand">
                        {studentTotal > 0 ? studentTotal : "—"}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Essay & Evidence */}
        <div className="space-y-4 lg:col-span-4 xl:col-span-5">
          {/* Question Selector Tabs */}
          <div
            role="tablist"
            aria-label="Pilihan Soal Asesmen"
            className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
          >
            {assessment.questions.map((question, idx) => (
              <button
                key={question.id}
                type="button"
                role="tab"
                aria-selected={idx === currentQIdx}
                onClick={() => setCurrentQIdx(idx)}
                className={cn(
                  "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all",
                  idx === currentQIdx
                    ? "bg-brand text-white shadow-xs"
                    : "border border-line bg-white/80 text-muted hover:border-brand-line hover:text-brand"
                )}
              >
                <span>Soal {idx + 1}</span>
                <span className="nums opacity-80">({question.maxScore}p)</span>
              </button>
            ))}
          </div>

          {/* Question Prompt */}
          <Card className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Pertanyaan #{currentQIdx + 1}
                </span>
                <h3 className="mt-1 text-sm font-bold leading-relaxed text-brand sm:text-base">
                  {q.prompt}
                </h3>
              </div>
              <span className="nums shrink-0 rounded-lg border border-orange-pastel bg-butter-yellow px-2.5 py-1 text-xs font-extrabold text-brand">
                {q.maxScore} poin
              </span>
            </div>

            {/* Expected Keywords */}
            {q.expectedKeywords.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t border-line/60">
                <span className="text-[11px] font-bold text-muted">
                  Kata Kunci Konsep Acuan:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {q.expectedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="rounded-md border border-bleu-ciel/60 bg-bleu-ciel/20 px-2 py-0.5 text-xs font-bold text-brand"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Student Answer Box */}
          <Card className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-sm font-bold text-brand">
                <FileText className="h-4 w-4" />
                Jawaban: {sub.studentName}
              </h4>
              <span className="nums text-xs font-bold text-muted">
                {answer?.wordCount ?? 0} kata
              </span>
            </div>
            <div
              tabIndex={0}
              role="region"
              aria-label="Teks jawaban siswa"
              className="max-h-96 overflow-y-auto whitespace-pre-line rounded-xl border border-line bg-paper p-4 text-xs leading-relaxed text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {answer?.studentAnswer || "(Siswa tidak mengisi jawaban untuk nomor ini)"}
            </div>
          </Card>

          {/* Reference Answer */}
          {q.referenceAnswer && (
            <Card className="space-y-2 border-bleu-ciel/40 bg-bleu-ciel/15 p-4">
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-brand">
                <BookOpen className="h-3.5 w-3.5" />
                Kunci Jawaban Guru (Pedoman Telaah)
              </h4>
              <p className="text-xs leading-relaxed text-ink-2">
                {q.referenceAnswer}
              </p>
            </Card>
          )}
        </div>

        {/* Right: Rubric Scoring, IndoBERT AI & Feedback */}
        <div className="space-y-4 lg:col-span-5">
          {/* AI IndoBERT Collapsible Assistant Card */}
          <div className="glass-card relative overflow-hidden rounded-2xl border border-bleu-ciel/50 bg-gradient-to-br from-white/95 via-bleu-ciel/15 to-butter-yellow/20 p-4 shadow-[0_8px_30px_rgba(10,22,128,0.06),inset_0_1px_2px_rgba(255,255,255,0.95)]">
            <div
              className="flex cursor-pointer items-center justify-between gap-2"
              onClick={() => setAiExpanded(!aiExpanded)}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest text-bleu-ciel shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-ink sm:text-sm">
                    Asisten AI IndoBERT
                  </h3>
                  <p className="text-[11px] text-muted">
                    Analisis Semantik & Rekomendasi Rubrik
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge status="IndoBERT v2" />
                <button
                  type="button"
                  aria-label={aiExpanded ? "Kecilkan panel AI" : "Buka panel AI"}
                  className="rounded-lg p-1 text-muted hover:bg-white/60"
                >
                  {aiExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {loadingAi ? (
              <div
                role="status"
                aria-live="polite"
                className="mt-4 flex flex-col items-center justify-center space-y-2 py-6 text-center"
              >
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent"></div>
                <p className="text-xs font-semibold text-brand">
                  Menganalisis koherensi semantik & mencocokkan rubrik...
                </p>
                <p className="text-[11px] text-muted">
                  Memproses representasi vektor jawaban siswa
                </p>
              </div>
            ) : aiExpanded ? (
              currentAiSuggestion ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-brand-line/50 bg-white/90 p-3 shadow-xs">
                    <div className="flex items-center justify-between text-xs font-bold text-brand">
                      <span>Evaluasi Mesin:</span>
                      <span className="nums rounded-md bg-forest px-2.5 py-0.5 text-xs font-extrabold text-bleu-ciel">
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
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                        Kutipan Bukti dari Teks Siswa:
                      </span>
                      <div className="space-y-1.5">
                        {currentAiSuggestion.keyEvidenceQuotes.map(
                          (quote, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "rounded-xl border p-2.5 text-xs leading-relaxed",
                                quote.sentiment === "strength"
                                  ? "border-emerald-300 bg-emerald-50/90 text-emerald-950"
                                  : "border-amber-300 bg-amber-50/90 text-amber-950"
                              )}
                            >
                              <p className="italic font-medium">
                                &ldquo;{quote.text}&rdquo;
                              </p>
                              <p className="mt-1 flex items-center gap-1.5 text-[11px] opacity-85">
                                <Info className="h-3 w-3 shrink-0" />
                                <span>{quote.note}</span>
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
                      variant="secondary"
                      onClick={() => applyAiRecommendation(currentAiSuggestion)}
                      className="gap-1.5 border border-brand-line bg-brand-tint text-brand hover:bg-brand hover:text-white"
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
                    <div
                      role="status"
                      aria-live="polite"
                      className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 p-2.5 text-xs font-bold text-emerald-800"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
                        <span>Rekomendasi berhasil diterapkan ke rubrik!</span>
                      </span>
                      {previousFeedback !== null && (
                        <button
                          type="button"
                          onClick={undoAiFeedback}
                          className="flex items-center gap-1 text-[11px] underline hover:text-emerald-950"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Urungkan Umpan Balik</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <p className="text-xs leading-relaxed text-ink-2">
                    Dapatkan analisis semantik, pencocokan bukti tekstual, dan rekomendasi nilai rubrik berbasis IndoBERT yang dapat Anda sesuaikan.
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
              )
            ) : null}

            {aiError && (
              <div
                role="alert"
                className="mt-2 flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 p-2.5 text-xs font-semibold text-rose-700"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{aiError}</span>
              </div>
            )}
          </div>

          {/* Rubric Criteria Evaluation Card */}
          <Card className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-brand">
                <Sliders className="h-4 w-4" />
                Penilaian Rubrik — Soal #{currentQIdx + 1}
              </h3>
              <span className="nums rounded-full border border-brand-line bg-brand-tint px-3 py-0.5 text-xs font-extrabold text-brand">
                Skor Soal: {qScore} / {q.maxScore}
              </span>
            </div>

            {/* Criteria List */}
            <div className="space-y-3">
              {q.rubric.map((crit) => {
                const value = scores[crit.id] ?? 0;
                const activeLevel = crit.levels.find((l) => l.score === value);

                return (
                  <div
                    key={crit.id}
                    className="space-y-2 rounded-xl border border-line bg-white/70 p-3.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand">
                        {crit.name}
                      </span>
                      <span className="nums text-xs font-bold text-muted">
                        Maks {crit.maxScore}p
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted">
                      {crit.description}
                    </p>

                    {/* Accessible Level Buttons (Radio Group Pattern) */}
                    <div
                      role="radiogroup"
                      aria-label={`Skor rubrik untuk ${crit.name}`}
                      className="grid grid-cols-2 gap-1.5 sm:grid-cols-4"
                    >
                      {crit.levels.map((level) => {
                        const isSelected = value === level.score;
                        return (
                          <button
                            key={level.score}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() =>
                              handleScoreChange(crit.id, level.score)
                            }
                            className={cn(
                              "flex cursor-pointer flex-col items-center justify-center rounded-xl p-2 text-center text-xs transition-all border",
                              isSelected
                                ? "border-brand bg-brand text-white shadow-xs font-bold"
                                : "border-line bg-white text-muted hover:border-brand-line hover:bg-brand-tint/40 hover:text-brand"
                            )}
                          >
                            <span className="nums text-sm font-extrabold">
                              {level.score}p
                            </span>
                            <span className="truncate text-[10px] opacity-90 max-w-full">
                              {level.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Selected Descriptor */}
                    {activeLevel && (
                      <div className="mt-1.5 flex items-start gap-1.5 rounded-lg border border-brand-line/40 bg-brand-tint/40 p-2 text-[11px] leading-relaxed text-brand">
                        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <div>
                          <strong>{activeLevel.label}:</strong>{" "}
                          {activeLevel.description}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Teacher Feedback Card */}
          <Card className="space-y-3 p-5">
            <label
              htmlFor="teacher-feedback"
              className="flex items-center gap-1.5 text-sm font-bold text-brand"
            >
              <MessageSquareQuote className="h-4 w-4" />
              Umpan Balik Guru untuk Soal #{currentQIdx + 1}
            </label>
            <Textarea
              id="teacher-feedback"
              aria-label={`Umpan balik guru untuk soal ${currentQIdx + 1}`}
              rows={4}
              value={feedback}
              onChange={(e) => handleFeedbackChange(e.target.value)}
              placeholder="Tulis ulasan pembinaan atau apresiasi jawaban siswa..."
            />
          </Card>

          {/* Sticky Bottom Action Toolbar */}
          <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/95 p-3.5 shadow-[0_12px_40px_rgba(10,22,128,0.12),inset_0_1px_2px_rgba(255,255,255,0.95)] backdrop-blur-md">
            {/* Step Navigation */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPrevQuestion && !hasPrevStudent}
                onClick={handlePrevStep}
                title="Alt + Panah Kiri"
                className="text-xs"
              >
                <ChevronLeft className="h-4 w-4 mr-0.5" />
                <span>Sebelumnya</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasNextQuestion && !hasNextStudent}
                onClick={handleNextStep}
                title="Alt + Panah Kanan"
                className="text-xs font-bold"
              >
                {hasNextQuestion ? (
                  <>
                    <span>Soal #{currentQIdx + 2}</span>
                    <ChevronRight className="h-4 w-4 ml-0.5" />
                  </>
                ) : (
                  <>
                    <span>Siswa Berikutnya</span>
                    <ChevronRight className="h-4 w-4 ml-0.5" />
                  </>
                )}
              </Button>
            </div>

            {/* Save & Finalize CTAs */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                loading={saving}
                onClick={() => saveGrade(false)}
                title="Shortcut: Ctrl+S"
                className="text-xs font-bold"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Simpan Draf</span>
              </Button>
              <Button
                size="sm"
                loading={saving}
                onClick={() => saveGrade(true)}
                title="Shortcut: Ctrl+Enter"
                className="text-xs font-bold"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Finalkan Nilai</span>
              </Button>
            </div>
          </div>

          {/* Toast / Notification Banners */}
          {saveSuccess && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-2.5 text-xs font-bold text-emerald-800 shadow-xs"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{saveSuccess}</span>
            </div>
          )}
          {saveError && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 p-2.5 text-xs font-bold text-rose-800 shadow-xs"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{saveError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
