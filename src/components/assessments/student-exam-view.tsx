"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  Save,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Assessment } from "@/types";

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
  const [lastSavedTime, setLastSavedTime] = useState<string>("Baru saja");
  const [submitOpen, setSubmitOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(assessment.durationMinutes * 60);

  useEffect(() => {
    // Set initial formatted time
    const now = new Date();
    setLastSavedTime(
      `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    );
  }, []);

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
  const currentChars = currentText.length;
  const maxChars = 5000;
  const totalQ = assessment.questions.length;
  const answeredCount = assessment.questions.filter(
    (item) => (answers[item.id] || "").trim().length > 0
  ).length;
  const emptyCount = totalQ - answeredCount;

  const handleTextChange = useCallback(
    (text: string) => {
      if (text.length > maxChars) return;
      setAnswers((prev) => ({ ...prev, [q.id]: text }));
      setSaveStatus("Menyimpan");
      const timer = setTimeout(() => {
        setSaveStatus("Tersimpan");
        const now = new Date();
        setLastSavedTime(
          `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
        );
      }, 600);
      return () => clearTimeout(timer);
    },
    [q.id, maxChars]
  );

  const handleManualSave = () => {
    setSaveStatus("Menyimpan");
    setTimeout(() => {
      setSaveStatus("Tersimpan");
      const now = new Date();
      setLastSavedTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
      );
    }, 300);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-up space-y-4 pb-20">
      {/* Top Bar / Header Card */}
      <header className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_4px_24px_rgba(10,22,128,0.04)] backdrop-blur-md sm:p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-heading text-lg font-extrabold tracking-wider text-brand">
                ESAINA
              </span>
              <span className="text-muted" aria-hidden>
                ·
              </span>
              <h1 className="truncate text-sm font-bold text-ink sm:text-base">
                {assessment.title}
              </h1>
              <span className="text-muted" aria-hidden>
                ·
              </span>
              <span className="text-xs font-medium text-muted">
                {assessment.subject} ({studentName})
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Live Autosave Badge */}
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200",
                saveStatus === "Tersimpan"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-amber-200 bg-amber-50 text-amber-800 animate-pulse"
              )}
            >
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span>
                {saveStatus === "Tersimpan"
                  ? `Tersimpan Otomatis di Server (${lastSavedTime})`
                  : "Menyimpan ke Server..."}
              </span>
            </div>

            {/* Countdown Timer */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-bleu-ciel/60 bg-bleu-ciel/20 px-3 py-1 text-xs font-bold text-brand">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-mono text-xs">{formatTimer(timeLeft)}</span>
            </div>

            {/* Quick Submit Button */}
            <Button
              onClick={() => setSubmitOpen(true)}
              disabled={isAlreadySubmitted}
              size="sm"
              className="gap-1.5 rounded-xl bg-brand text-xs font-bold text-white shadow-sm hover:bg-brand-dark"
            >
              <span>Kumpulkan Jawaban</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Work Area: 2 Columns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Column: Question Prompt & Essay Editor (8 of 12 cols) */}
        <section className="space-y-4 lg:col-span-8">
          <div className="rounded-2xl border border-white/90 bg-white p-5 shadow-[0_4px_24px_rgba(10,22,128,0.04)] sm:p-6">
            {/* Badge & Points */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-3">
              <span className="inline-block rounded-md bg-brand px-3 py-1 font-heading text-xs font-extrabold uppercase tracking-wider text-white">
                SOAL {currentIdx + 1} DARI {totalQ} · {q.maxScore} POIN
              </span>
              <span className="text-xs font-semibold text-muted">
                Bobot Nilai: {q.maxScore} Poin
              </span>
            </div>

            {/* Question Text */}
            <div className="mt-4">
              <h2 className="text-base font-bold leading-relaxed text-brand sm:text-lg">
                {q.prompt}
              </h2>
            </div>

            {/* Essay Input Area */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted">
                <label htmlFor="student-answer" className="font-semibold text-ink">
                  Tuliskan Jawaban Esai Anda:
                </label>
                <span className="font-mono text-xs text-muted">
                  Batas: 5.000 karakter
                </span>
              </div>

              <textarea
                id="student-answer"
                rows={13}
                value={currentText}
                onChange={(e) => handleTextChange(e.target.value)}
                disabled={isAlreadySubmitted}
                placeholder="Tuliskan uraian esai Anda di sini. Jelaskan mekanisme, konsep, dan argumen secara terstruktur..."
                className="w-full resize-y rounded-xl border border-line bg-[#FCFDFF] p-4 text-xs leading-relaxed text-ink shadow-inner outline-none transition-all placeholder:text-muted/60 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 sm:text-sm"
              />
            </div>

            {/* Bottom Bar inside Editor Box */}
            <div className="mt-4 flex flex-col justify-between gap-3 border-t border-line/60 pt-4 sm:flex-row sm:items-center">
              <div className="text-xs text-muted">
                <span className="font-mono font-bold text-ink">
                  {currentChars}
                </span>{" "}
                / 5.000 karakter · Autosave aktif setelah jeda 1 detik
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleManualSave}
                  className="gap-1.5 rounded-xl border-line text-xs font-semibold text-ink hover:bg-paper"
                >
                  <Save className="h-3.5 w-3.5 text-muted" />
                  <span>Simpan Draf Sekarang</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => setSubmitOpen(true)}
                  disabled={isAlreadySubmitted}
                  className="gap-1.5 rounded-xl bg-brand text-xs font-bold text-white shadow-xs hover:bg-brand-dark"
                >
                  <span>Kumpulkan Seluruh Jawaban →</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Previous / Next Question Navigation */}
          <div className="flex items-center justify-between rounded-xl border border-white/80 bg-white/70 p-3 shadow-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="gap-1 text-xs"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Soal Sebelumnya</span>
            </Button>

            <span className="text-xs font-semibold text-muted">
              Soal {currentIdx + 1} dari {totalQ}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentIdx((prev) => Math.min(totalQ - 1, prev + 1))
              }
              disabled={currentIdx === totalQ - 1}
              className="gap-1 text-xs"
            >
              <span>Soal Berikutnya</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Right Column: Question Navigator Sidebar (4 of 12 cols) */}
        <aside className="space-y-4 lg:col-span-4">
          <div className="rounded-2xl border border-white/90 bg-white/90 p-5 shadow-[0_4px_24px_rgba(10,22,128,0.04)]">
            <div className="space-y-1">
              <h3 className="font-heading text-sm font-extrabold tracking-wider text-brand uppercase">
                NAVIGASI SOAL
              </h3>
              <p className="text-xs text-muted">
                Pindah nomor soal tanpa kehilangan draf yang sudah kamu ketik.
              </p>
            </div>

            {/* Questions Grid */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
              {assessment.questions.map((question, idx) => {
                const filled = (answers[question.id] || "").trim().length > 0;
                const isCurrent = idx === currentIdx;
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-xl p-3 text-xs font-bold transition-all duration-200",
                      isCurrent
                        ? "bg-brand text-white shadow-md ring-2 ring-brand/30"
                        : filled
                          ? "border border-bleu-ciel bg-bleu-ciel/20 text-brand hover:bg-bleu-ciel/30"
                          : "border border-line bg-paper text-muted hover:border-brand-line hover:text-ink"
                    )}
                  >
                    <span>No {idx + 1}</span>
                    {filled && (
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-full text-[10px]",
                          isCurrent ? "bg-white/20 text-white" : "text-brand"
                        )}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Progress summary */}
            <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-xs text-muted">
              <span>Status Pengerjaan:</span>
              <span className="font-bold text-ink">
                {answeredCount} / {totalQ} Terjawab
              </span>
            </div>
          </div>

          {/* Answer Locking Notice Box (matching 11 · Siswa mengerjakan.png) */}
          <div className="rounded-xl border border-bleu-ciel/60 bg-[#F0F5FF] p-4 text-xs text-brand">
            <div className="flex items-center gap-1.5 font-bold">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span>Penguncian Jawaban:</span>
            </div>
            <p className="mt-1.5 leading-relaxed text-muted">
              Setelah kamu menekan &apos;Kumpulkan Jawaban&apos;, seluruh LJK
              akan dikunci dan dinilai oleh tim penilai.
            </p>
          </div>
        </aside>
      </div>

      {/* Confirmation Modal (matching 13 · Dialog kumpulkan.png) */}
      {submitOpen && (
        <div className="fixed inset-0 z-50 flex animate-fade-up items-center justify-center bg-[#060E59]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg space-y-5 rounded-2xl border border-white/80 bg-white p-6 shadow-2xl sm:p-7">
            {/* Header */}
            <div className="flex items-center gap-2.5">
              <span className="inline-block rounded-md border border-[#F5E2A0] bg-[#FFF7D9] px-2.5 py-1 text-xs font-bold text-[#8C6200]">
                Konfirmasi Akhir
              </span>
              <h2 className="font-heading text-xl font-extrabold tracking-wide text-brand sm:text-2xl">
                KUMPULKAN SELURUH JAWABAN?
              </h2>
            </div>

            {/* Explanatory text */}
            <p className="text-xs leading-relaxed text-muted sm:text-sm">
              Apakah Anda yakin ingin mengumpulkan LJK ini? Setelah
              dikonfirmasi, seluruh teks jawaban Anda akan dikunci permanen di
              server.
            </p>

            {/* Stats Breakdown Box */}
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-bleu-ciel/40 bg-[#F0F5FF] p-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  SOAL TERISI
                </span>
                <p className="mt-0.5 text-base font-extrabold text-brand sm:text-lg">
                  {answeredCount} dari {totalQ} Soal
                </p>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6200]">
                  SOAL KOSONG
                </span>
                <p className="mt-0.5 text-base font-extrabold text-[#8C6200] sm:text-lg">
                  {emptyCount} Soal Kosong
                </p>
              </div>
            </div>

            {/* Warning Note */}
            {emptyCount > 0 && (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#8C6200]">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Jawaban kosong dapat dinilai 0 oleh tim penilai.</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse items-center justify-end gap-3 pt-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSubmitOpen(false)}
                className="w-full rounded-xl border-line py-2.5 text-xs font-bold text-brand hover:bg-paper sm:w-auto"
              >
                Batal, Lanjut Kerjakan
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                loading={isSubmitting}
                className="w-full rounded-xl bg-brand py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-dark sm:w-auto"
              >
                Ya, Kumpulkan Sekarang
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
