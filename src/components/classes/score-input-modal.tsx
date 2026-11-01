"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Save, Sparkles } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { maxScoreOf } from "@/lib/class-analytics";
import { cn } from "@/lib/utils";
import type { Assessment, StudentSubmission } from "@/types";

interface ScoreInputModalProps {
  open: boolean;
  onClose: () => void;
  assessment: Assessment;
  submission: StudentSubmission;
}

type ScoreMap = Record<string, number>;

export function ScoreInputModal({
  open,
  onClose,
  assessment,
  submission,
}: ScoreInputModalProps) {
  const router = useRouter();
  const questions = assessment.questions;

  const [activeOrder, setActiveOrder] = useState<number>(questions[0]?.id ?? 1);
  const [scoresByQuestion, setScoresByQuestion] = useState<Record<number, ScoreMap>>({});
  const [feedbackByQuestion, setFeedbackByQuestion] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<"draft" | "final" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const nextScores: Record<number, ScoreMap> = {};
    const nextFeedback: Record<number, string> = {};
    for (const question of questions) {
      const answer = submission.answers[question.id];
      nextScores[question.id] = { ...(answer?.scores ?? {}) };
      nextFeedback[question.id] = answer?.teacherFeedback ?? "";
    }
    setScoresByQuestion(nextScores);
    setFeedbackByQuestion(nextFeedback);
    setActiveOrder(questions[0]?.id ?? 1);
    setError(null);
  }, [open, submission.id, questions]);

  const maxTotal = useMemo(() => maxScoreOf(assessment), [assessment]);

  const total = useMemo(
    () =>
      Object.values(scoresByQuestion).reduce(
        (sum, map) => sum + Object.values(map).reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0),
        0
      ),
    [scoresByQuestion]
  );

  const activeQuestion =
    questions.find((q) => q.id === activeOrder) ?? questions[0];

  const questionSubtotal = (order: number) =>
    Object.values(scoresByQuestion[order] ?? {}).reduce(
      (sum, value) => sum + (Number.isFinite(value) ? value : 0),
      0
    );

  const setScore = (questionId: number, criterionId: string, value: number, max: number) => {
    const clamped = Math.max(0, Math.min(max, value));
    setScoresByQuestion((prev) => ({
      ...prev,
      [questionId]: { ...(prev[questionId] ?? {}), [criterionId]: clamped },
    }));
  };

  const persist = async (finalize: boolean) => {
    setSaving(finalize ? "final" : "draft");
    setError(null);
    try {
      for (let index = 0; index < questions.length; index += 1) {
        const question = questions[index];
        const isLast = index === questions.length - 1;
        const response = await fetch(`/api/assessments/${assessment.id}/grade`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submissionId: submission.id,
            questionId: question.id,
            scores: scoresByQuestion[question.id] ?? {},
            feedback: feedbackByQuestion[question.id] ?? "",
            isFinal: finalize && isLast,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(payload?.error ?? "Gagal menyimpan nilai.");
        }
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan nilai.");
    } finally {
      setSaving(null);
    }
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!saving) onClose();
      }}
      title={`Penilaian LJK: ${submission.studentName}`}
      description={`${assessment.title} · NIS ${submission.studentNis}`}
      className="max-h-[90vh] max-w-3xl overflow-y-auto"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-muted">
            Total{" "}
            <strong className="nums text-sm text-brand">
              {total}/{maxTotal}
            </strong>{" "}
            ·{" "}
            <span className="nums">
              {maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0}
            </span>
            /100
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={Boolean(saving)}
              onClick={() => persist(false)}
            >
              {saving === "draft" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>Simpan Draf</span>
            </Button>
            <Button size="sm" disabled={Boolean(saving)} onClick={() => persist(true)}>
              {saving === "final" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              <span>Finalkan Nilai</span>
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-900"
          >
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {questions.map((question, index) => {
            const active = question.id === (activeQuestion?.id ?? 0);
            return (
              <button
                key={question.id}
                type="button"
                onClick={() => setActiveOrder(question.id)}
                aria-pressed={active}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
                  active
                    ? "bg-brand text-white shadow-xs"
                    : "border border-line bg-white text-muted hover:text-brand"
                )}
              >
                <span>Soal {index + 1}</span>
                <span
                  className={cn(
                    "nums rounded px-1.5 py-0.5 text-[10px]",
                    active ? "bg-butter-yellow text-brand" : "bg-paper text-brand"
                  )}
                >
                  {questionSubtotal(question.id)}/{question.maxScore}p
                </span>
              </button>
            );
          })}
        </div>

        {activeQuestion && (
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-line/70 bg-paper/70 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Jawaban siswa
              </p>
              <p className="mt-1 max-h-56 overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed text-ink-2">
                {submission.answers[activeQuestion.id]?.studentAnswer || "(jawaban kosong)"}
              </p>
              <p className="mt-2 text-[10px] text-muted">
                {submission.answers[activeQuestion.id]?.wordCount ?? 0} kata ·{" "}
                {activeQuestion.maxScore} poin maksimum
              </p>
            </div>

            <div className="space-y-2.5">
              {activeQuestion.rubric.length === 0 && (
                <p className="rounded-xl border border-dashed border-line bg-white/70 px-3 py-4 text-[11px] text-muted">
                  Asesmen ini belum memiliki kriteria rubrik. Skor tidak dapat dipecah per
                  kriteria.
                </p>
              )}
              {activeQuestion.rubric.map((criterion) => {
                const current =
                  scoresByQuestion[activeQuestion.id]?.[criterion.id] ?? 0;
                return (
                  <div
                    key={criterion.id}
                    className="rounded-xl border border-line/70 bg-white/80 p-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-bold text-brand">{criterion.name}</p>
                      <span className="nums shrink-0 text-[10px] text-muted">
                        maks {criterion.maxScore}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      {Array.from({ length: criterion.maxScore + 1 }, (_, value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setScore(
                              activeQuestion.id,
                              criterion.id,
                              value,
                              criterion.maxScore
                            )
                          }
                          aria-pressed={current === value}
                          aria-label={`${criterion.name} skor ${value}`}
                          className={cn(
                            "nums h-8 flex-1 cursor-pointer rounded-lg border text-[11px] font-bold transition-all",
                            current === value
                              ? "border-brand bg-brand text-white"
                              : "border-line bg-white text-muted hover:border-brand hover:text-brand"
                          )}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              <label className="block space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Umpan balik guru untuk soal ini
                </span>
                <Textarea
                  rows={3}
                  value={feedbackByQuestion[activeQuestion.id] ?? ""}
                  onChange={(event) =>
                    setFeedbackByQuestion((prev) => ({
                      ...prev,
                      [activeQuestion.id]: event.target.value,
                    }))
                  }
                  placeholder="Tuliskan apresiasi dan saran perbaikan yang spesifik…"
                  className="text-xs"
                />
              </label>
            </div>
          </div>
        )}

        <p className="flex items-start gap-1.5 text-[10px] text-muted">
          <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-brand" aria-hidden />
          Nilai total dihitung ulang di server dari item rubrik. Finalisasi mengunci nilai untuk
          diterbitkan ke siswa.
        </p>
      </div>
    </Dialog>
  );
}
