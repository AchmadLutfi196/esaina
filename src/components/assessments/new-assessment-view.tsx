"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  Save,
  Send,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea, Field } from "@/components/ui/input";
import { cn, generateId } from "@/lib/utils";
import type { ClassItem } from "@/types";

interface RubricDraft {
  id: string;
  name: string;
  maxScore: number;
}

interface QuestionDraft {
  id: string;
  prompt: string;
  referenceAnswer: string;
  maxScore: number;
  keywords: string;
  rubric: RubricDraft[];
}

const newRubric = (name = "Pemahaman Konsep & Argumen", maxScore = 15): RubricDraft => ({
  id: generateId(),
  name,
  maxScore,
});

const newQuestion = (index = 1): QuestionDraft => ({
  id: generateId(),
  prompt: "",
  referenceAnswer: "",
  maxScore: 25,
  keywords: "",
  rubric: [newRubric("Pemahaman Konsep", 15), newRubric("Kelengkapan Argumen & Istilah", 10)],
});

export function NewAssessmentView({ classes }: { classes: ClassItem[] }) {
  const router = useRouter();
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(classes[0]?.subject ?? "Biologi");
  const [duration, setDuration] = useState(60);
  const [dueDate, setDueDate] = useState("2026-11-05T23:59");
  const [instructions, setInstructions] = useState(
    "Jawablah seluruh pertanyaan dengan uraian ilmiah, jelas, dan menyertakan mekanisme biokimia secara runtut."
  );
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    newQuestion(1),
  ]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQ = questions[activeQuestionIdx] ?? questions[0];

  const updateQuestion = (index: number, patch: Partial<QuestionDraft>) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === index ? { ...q, ...patch } : q))
    );
  };

  const addQuestion = () => {
    const q = newQuestion(questions.length + 1);
    setQuestions((prev) => [...prev, q]);
    setActiveQuestionIdx(questions.length);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, idx) => idx !== index));
    setActiveQuestionIdx((prev) => Math.max(0, prev - 1));
  };

  const addRubric = (qIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIdx
          ? { ...q, rubric: [...q.rubric, newRubric("Kriteria Penilaian Tambahan", 10)] }
          : q
      )
    );
  };

  const updateRubric = (
    qIdx: number,
    rubricId: string,
    patch: Partial<RubricDraft>
  ) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIdx
          ? {
              ...q,
              rubric: q.rubric.map((r) =>
                r.id === rubricId ? { ...r, ...patch } : r
              ),
            }
          : q
      )
    );
  };

  const removeRubric = (qIdx: number, rubricId: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIdx
          ? { ...q, rubric: q.rubric.filter((r) => r.id !== rubricId) }
          : q
      )
    );
  };

  const handleSave = async (status: "draft" | "active") => {
    if (!title.trim() || !dueDate) {
      setError("Mohon lengkapi judul dan batas waktu asesmen.");
      return;
    }
    setError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          title,
          subject,
          durationMinutes: duration,
          dueDate,
          instructions,
          status,
          questions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan asesmen");
        setSaving(false);
        return;
      }

      router.push(`/assessments/${data.assessmentId}`);
      router.refresh();
    } catch (err: any) {
      setError("Terjadi kesalahan jaringan.");
      setSaving(false);
    }
  };

  const totalMax = questions.reduce(
    (sum, q) => sum + (Number(q.maxScore) || 0),
    0
  );

  if (classes.length === 0) {
    return (
      <div className="rounded-2xl border border-white/80 bg-white p-12 text-center shadow-xs">
        <BookOpen className="mx-auto mb-3 h-10 w-10 text-line" />
        <h2 className="text-base font-bold text-ink">Belum Ada Kelas</h2>
        <p className="mt-1 text-xs text-muted">
          Buat kelas terlebih dahulu sebelum membuat asesmen.
        </p>
        <Link href="/classes" className="mt-4 inline-block">
          <Button>Buka Daftar Kelas</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
      {/* Top Header matching 04 · Guru buat asesmen.png */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/80 bg-white/85 p-6 shadow-[0_4px_24px_rgba(10,22,128,0.04)] backdrop-blur-md sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-extrabold tracking-wide text-brand sm:text-3xl">
            BUAT ASESMEN BARU
          </h1>
          <p className="text-xs text-muted sm:text-sm">
            Susun soal esai beserta kunci jawaban dan kriteria rubrik penilaian ganda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => handleSave("draft")}
            className="rounded-xl border-line text-xs font-bold text-brand hover:bg-paper"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Simpan Draf</span>
          </Button>

          <Button
            type="button"
            disabled={saving}
            onClick={() => handleSave("active")}
            className="rounded-xl bg-brand text-xs font-bold text-white shadow-md hover:bg-brand-dark"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Terbitkan Asesmen →</span>
          </Button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs font-semibold text-rose-800"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Column: Form Info & Question Editor (8 cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Card: INFORMASI ASESMEN */}
          <div className="rounded-2xl border border-white/90 bg-white p-6 shadow-[0_4px_24px_rgba(10,22,128,0.04)] space-y-4">
            <h2 className="font-heading text-base font-extrabold tracking-wider text-brand uppercase border-b border-line/50 pb-2">
              INFORMASI ASESMEN
            </h2>

            <Field label="Judul Asesmen *">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Ulangan Harian Fotosintesis & Reaksi Terang"
                className="bg-paper/40"
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Mata Pelajaran *">
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Biologi"
                  className="bg-paper/40"
                />
              </Field>

              <Field label="Kelas Sasaran *">
                <Select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="bg-paper/40"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.grade})
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Durasi (menit) *">
                <Input
                  type="number"
                  min={15}
                  max={180}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value) || 60)}
                  className="bg-paper/40"
                />
              </Field>

              <Field label="Batas Waktu Pengumpulan *">
                <Input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-paper/40"
                />
              </Field>

              <Field label="Model Penilaian">
                <Input
                  disabled
                  value="Guru Pengampu + Asistensi AI IndoBERT"
                  className="bg-paper/40 font-semibold text-brand"
                />
              </Field>
            </div>

            <Field label="Petunjuk Pengerjaan untuk Siswa">
              <Textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Tuliskan petunjuk pengerjaan esai di sini..."
                className="bg-paper/40 text-xs"
              />
            </Field>
          </div>

          {/* Card: SOAL & KUNCI JAWABAN */}
          {currentQ && (
            <div className="rounded-2xl border border-white/90 bg-white p-6 shadow-[0_4px_24px_rgba(10,22,128,0.04)] space-y-4">
              <div className="flex items-center justify-between border-b border-line/50 pb-2">
                <h2 className="font-heading text-base font-extrabold tracking-wider text-brand uppercase">
                  SOAL {activeQuestionIdx + 1}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted">
                    Bobot: {currentQ.maxScore} Poin
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(activeQuestionIdx)}
                      className="cursor-pointer text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Hapus
                    </button>
                  )}
                </div>
              </div>

              <Field label="Pertanyaan Soal Esai *">
                <Textarea
                  rows={3}
                  value={currentQ.prompt}
                  onChange={(e) =>
                    updateQuestion(activeQuestionIdx, { prompt: e.target.value })
                  }
                  placeholder="Tuliskan pertanyaan esai secara jelas..."
                  className="bg-paper/40 text-xs"
                />
              </Field>

              <Field label="Kunci Jawaban Acuan (Reference Answer untuk AI & Guru) *">
                <Textarea
                  rows={4}
                  value={currentQ.referenceAnswer}
                  onChange={(e) =>
                    updateQuestion(activeQuestionIdx, {
                      referenceAnswer: e.target.value,
                    })
                  }
                  placeholder="Kunci jawaban acuan komprehensif yang memuat seluruh kata kunci dan konsep ilmiah..."
                  className="bg-paper/40 text-xs"
                />
              </Field>

              {/* Rubric Criteria List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand">
                    Kriteria Rubrik Penilaian
                  </h3>
                  <button
                    type="button"
                    onClick={() => addRubric(activeQuestionIdx)}
                    className="flex cursor-pointer items-center gap-1 text-xs font-bold text-brand hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Tambah Kriteria
                  </button>
                </div>

                <div className="space-y-2">
                  {currentQ.rubric.map((r, rIdx) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 rounded-xl border border-line/60 bg-paper/40 p-3"
                    >
                      <span className="font-mono text-xs font-bold text-brand">
                        K{rIdx + 1}
                      </span>
                      <Input
                        value={r.name}
                        onChange={(e) =>
                          updateRubric(activeQuestionIdx, r.id, {
                            name: e.target.value,
                          })
                        }
                        placeholder="Nama kriteria rubrik (misal: Ketepatan Konsep)"
                        className="flex-1 bg-white text-xs"
                      />
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Input
                          type="number"
                          min={1}
                          max={50}
                          value={r.maxScore}
                          onChange={(e) =>
                            updateRubric(activeQuestionIdx, r.id, {
                              maxScore: Number(e.target.value) || 5,
                            })
                          }
                          className="w-16 bg-white text-center text-xs font-mono font-bold"
                        />
                        <span className="text-xs text-muted">Poin</span>
                      </div>
                      {currentQ.rubric.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRubric(activeQuestionIdx, r.id)}
                          className="cursor-pointer text-muted hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Structure & Questions Sidebar (4 cols) */}
        <aside className="space-y-4 lg:col-span-4">
          <div className="rounded-2xl border border-white/90 bg-white p-5 shadow-[0_4px_24px_rgba(10,22,128,0.04)] space-y-4">
            <h2 className="font-heading text-base font-extrabold tracking-wider text-brand uppercase">
              STRUKTUR ASESMEN
            </h2>

            {/* Questions Tabs */}
            <div className="space-y-2">
              {questions.map((q, idx) => {
                const isSelected = idx === activeQuestionIdx;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setActiveQuestionIdx(idx)}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between rounded-xl p-3 text-left transition-all",
                      isSelected
                        ? "bg-brand text-white shadow-md"
                        : "border border-line bg-paper text-ink hover:border-brand-line hover:bg-white"
                    )}
                  >
                    <span className="text-xs font-bold">
                      Soal {idx + 1}
                    </span>
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 font-mono text-[11px] font-bold",
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-white border border-line text-brand"
                      )}
                    >
                      {q.maxScore} Poin
                    </span>
                  </button>
                );
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addQuestion}
              className="w-full gap-2 rounded-xl border-dashed border-brand-line text-xs font-bold text-brand hover:bg-brand-tint/40"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Soal Baru</span>
            </Button>

            {/* Total Score Summary */}
            <div className="border-t border-line/60 pt-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-muted">Total Skor Maksimal:</span>
              <span className="font-mono text-base font-extrabold text-brand">
                {totalMax} Poin
              </span>
            </div>
          </div>

          {/* Quick Publish Card */}
          <div className="rounded-2xl border border-bleu-ciel/40 bg-[#F0F5FF] p-5 space-y-3">
            <h3 className="font-heading text-sm font-extrabold text-brand uppercase">
              Panduan Pembuatan
            </h3>
            <p className="text-xs leading-relaxed text-muted">
              Sistem ESAINA menggunakan kunci acuan dan kriteria rubrik ini untuk memandu model IndoBERT dan guru pengampu dalam memberikan skor yang konsisten, objektif, dan akurat.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
