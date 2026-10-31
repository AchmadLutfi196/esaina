"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { countWords, cn } from "@/lib/utils";
import type { Assessment, Question } from "@/types";

export function StudentExamView({
  assessment,
  studentName,
  studentNis,
  isAlreadySubmitted = false,
}: {
  assessment: Assessment;
  studentName: string;
  studentNis: string;
  isAlreadySubmitted?: boolean;
}) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    assessment.questions.forEach((q) => {
      init[q.id] = "";
    });
    return init;
  });
  const [saveStatus, setSaveStatus] = useState<"Tersimpan" | "Menyimpan">(
    "Tersimpan"
  );
  const [submitOpen, setSubmitOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(assessment.durationMinutes * 60);

  useEffect(() => {
    if (isAlreadySubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isAlreadySubmitted]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const q = assessment.questions[currentIdx] ?? assessment.questions[0];
  const currentText = answers[q.id] || "";
  const currentWordCount = countWords(currentText);
  const totalQ = assessment.questions.length;
  const answeredCount = assessment.questions.filter(
    (q) => (answers[q.id] || "").trim().length > 0
  ).length;
  const emptyCount = totalQ - answeredCount;

  const handleTextChange = useCallback(
    (text: string) => {
      setAnswers((prev) => ({ ...prev, [q.id]: text }));
      setSaveStatus("Menyimpan");
      setTimeout(() => setSaveStatus("Tersimpan"), 400);
    },
    [q.id]
  );

  const handleSubmit = async () => {
    try {
      const res = await fetch(`/api/assessments/${assessment.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (res.ok) {
        setSubmitOpen(false);
        router.push(`/assessments/${assessment.id}/result`);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-up space-y-5 pb-20">
      {/* Header */}
      <div className="work-surface p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="font-bold text-brand">{assessment.subject}</span>
              <span aria-hidden>·</span>
              <span className="rounded border border-line bg-paper px-2 py-0.5 font-mono font-bold text-brand">
                {assessment.code}
              </span>
              <span aria-hidden>·</span>
              <span>
                {studentName} ({studentNis})
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-brand">
              {assessment.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-bleu-ciel bg-bleu-ciel/25 px-3.5 py-1.5 text-brand">
              <Clock className="h-4 w-4" />
              <div>
                <span className="block text-[10px] font-bold uppercase">
                  Sisa Waktu
                </span>
                <span
                  className={cn(
                    "nums text-base font-extrabold leading-none",
                    timeLeft < 300 && "text-rose-600"
                  )}
                >
                  {formatTimer(timeLeft)}
                </span>
              </div>
            </div>
            <Badge status={saveStatus} />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-orange-pastel bg-butter-yellow p-3 text-xs text-brand">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="leading-relaxed">
            <strong>Petunjuk:</strong> {assessment.instructions}. Jawaban
            disimpan otomatis setiap kali Anda mengetik.
          </p>
        </div>

        {/* Question selector */}
        <div className="mt-5 flex items-center justify-between gap-4 overflow-x-auto border-t border-line/60 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted">Nomor Soal:</span>
            {assessment.questions.map((question, idx) => {
              const filled = (answers[question.id] || "").trim().length > 0;
              const isCurrent = idx === currentIdx;
              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                    isCurrent
                      ? "bg-brand text-white shadow-xs"
                      : filled
                        ? "border border-bleu-ciel bg-bleu-ciel/30 text-brand"
                        : "border border-line bg-paper text-muted hover:text-brand"
                  )}
                >
                  <span>{idx + 1}</span>
                  {filled && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>

          <div className="whitespace-nowrap text-xs text-muted">
            Terjawab:{" "}
            <strong className="nums text-brand">{answeredCount}</strong> dari{" "}
            {totalQ}
          </div>
        </div>
      </div>

      {/* Question + Answer */}
      <div className="work-surface space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-line/60 pb-3">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand">
              Soal {currentIdx + 1} dari {totalQ}
            </span>
            <h2 className="text-base font-bold leading-snug text-brand">
              {q.prompt}
            </h2>
          </div>
          <div className="shrink-0 whitespace-nowrap rounded-lg border border-orange-pastel bg-butter-yellow px-3 py-1 text-xs font-bold text-brand">
            Bobot: {q.maxScore} Poin
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted">
            <label htmlFor="student-answer" className="font-bold text-brand">
              Tuliskan Jawaban Esai Anda:
            </label>
            <span className="nums font-bold text-brand">
              {currentWordCount} Kata
            </span>
          </div>

          <textarea
            id="student-answer"
            rows={11}
            value={currentText}
            onChange={(e) => handleTextChange(e.target.value)}
            disabled={isAlreadySubmitted}
            placeholder="Tuliskan uraian esai Anda di sini. Jelaskan mekanisme dan argumen secara terstruktur..."
            className="w-full rounded-xl border border-line bg-white p-4 text-xs leading-relaxed text-brand shadow-xs outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand sm:text-sm"
          />
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between border-t border-line/60 pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Sebelumnya</span>
          </Button>

          <div className="flex items-center gap-3">
            {currentIdx < totalQ - 1 ? (
              <Button
                onClick={() =>
                  setCurrentIdx((prev) => Math.min(totalQ - 1, prev + 1))
                }
              >
                <span>Berikutnya</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => setSubmitOpen(true)}>
                <Send className="h-4 w-4" />
                <span>Kumpulkan LJK</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Submit Confirmation */}
      {submitOpen && (
        <div className="fixed inset-0 z-50 flex animate-fade-up items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg space-y-5 rounded-xl border border-white bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl border border-orange-pastel bg-butter-yellow p-2.5 text-brand">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-brand">
                    KONFIRMASI PENGUMPULAN
                  </h2>
                  <span className="text-xs text-muted">
                    LJK akan dikunci setelah dikumpulkan
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSubmitOpen(false)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-brand hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 rounded-xl border border-line bg-paper p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted">Soal Terjawab:</span>
                <span className="nums font-bold text-brand">
                  {answeredCount} dari {totalQ}
                </span>
              </div>
              {emptyCount > 0 ? (
                <div className="flex items-center gap-2 rounded-lg border border-orange-pastel bg-butter-yellow p-2.5 font-semibold text-brand">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    Masih ada <strong>{emptyCount} soal</strong> belum terisi!
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-bleu-ciel bg-bleu-ciel/30 p-2.5 font-semibold text-brand">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Semua pertanyaan telah dijawab.</span>
                </div>
              )}
            </div>

            <p className="text-xs leading-relaxed text-muted">
              Setelah dikumpulkan, lembar jawaban akan terkunci permanen dan
              diperiksa oleh Guru dengan bantuan AI.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setSubmitOpen(false)}>
                Kembali Periksa
              </Button>
              <Button onClick={handleSubmit}>Ya, Kumpulkan Sekarang</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
