"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

const newRubric = (): RubricDraft => ({
  id: generateId(),
  name: "",
  maxScore: 10,
});

const newQuestion = (): QuestionDraft => ({
  id: generateId(),
  prompt: "",
  referenceAnswer: "",
  maxScore: 25,
  keywords: "",
  rubric: [newRubric()],
});

export function NewAssessmentView({ classes }: { classes: ClassItem[] }) {
  const router = useRouter();
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(classes[0]?.subject ?? "");
  const [duration, setDuration] = useState(60);
  const [dueDate, setDueDate] = useState("");
  const [raterCount, setRaterCount] = useState(1);
  const [instructions, setInstructions] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    newQuestion(),
  ]);
  const [expanded, setExpanded] = useState<string | null>(
    questions[0]?.id ?? null
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateQuestion = (id: string, patch: Partial<QuestionDraft>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q))
    );
  };

  const addQuestion = () => {
    const q = newQuestion();
    setQuestions((prev) => [...prev, q]);
    setExpanded(q.id);
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const addRubric = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, rubric: [...q.rubric, newRubric()] } : q
      )
    );
  };

  const updateRubric = (
    questionId: string,
    rubricId: string,
    patch: Partial<RubricDraft>
  ) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
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

  const removeRubric = (questionId: string, rubricId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, rubric: q.rubric.filter((r) => r.id !== rubricId) }
          : q
      )
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      setError("Mohon lengkapi judul dan tanggal tenggat asesmen.");
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
          raterCount,
          instructions,
          questions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan asesmen");
        setSaving(false);
        return;
      }

      setSaved(true);
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
      <Card className="p-12 text-center">
        <BookOpen className="mx-auto mb-3 h-10 w-10 text-line" />
        <p className="text-sm font-semibold text-ink">Belum ada kelas</p>
        <p className="mt-1 text-xs text-muted">
          Buat kelas terlebih dahulu sebelum membuat asesmen.
        </p>
        <Link href="/classes" className="mt-4 inline-block">
          <Button>Buka Daftar Kelas</Button>
        </Link>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSave} className="animate-fade-up space-y-6">
      {/* Header */}
      <div className="glass-panel flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-pastel bg-butter-yellow px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand">
            <Plus className="h-3.5 w-3.5" />
            <span>Asesmen Baru</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-brand sm:text-2xl">
            Buat Asesmen Esai & Rubrik
          </h1>
          <p className="text-xs text-muted sm:text-sm">
            Susun soal esai, kunci jawaban, dan kriteria rubrik penilaian.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/assessments">
            <Button type="button" variant="outline">
              <X className="h-4 w-4" />
              Batal
            </Button>
          </Link>
          <Button type="submit" loading={saving}>
            <Save className="h-4 w-4" />
            Simpan Asesmen
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-xs font-bold text-rose-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="cursor-pointer text-xs underline"
          >
            Tutup
          </button>
        </div>
      )}

      {saved && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-brand bg-bleu-ciel/35 p-3.5 text-xs font-bold text-brand">
          <span>
            ✅ Asesmen berhasil disimpan dan dibuka untuk siswa.
          </span>
          <button
            type="button"
            onClick={() => setSaved(false)}
            className="cursor-pointer text-xs underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Metadata */}
      <Card className="space-y-4">
        <h2 className="text-sm font-bold text-brand">Informasi Asesmen</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Kelas" required>
            <Select
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                const cls = classes.find((c) => c.id === e.target.value);
                if (cls) setSubject(cls.subject);
              }}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.grade}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Mata Pelajaran" required>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Contoh: Biologi"
            />
          </Field>

          <Field label="Judul Asesmen" required className="md:col-span-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Ulangan Harian Fotosintesis"
            />
          </Field>

          <Field label="Durasi (menit)" required>
            <Input
              type="number"
              min={5}
              max={300}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </Field>

          <Field label="Tenggat" required>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Field>

          <Field
            label="Jumlah Penilai (Rater)"
            hint="Jumlah guru yang menilai setiap jawaban"
          >
            <Select
              value={raterCount}
              onChange={(e) => setRaterCount(Number(e.target.value))}
            >
              <option value={1}>1 Rater (Guru tunggal)</option>
              <option value={2}>2 Rater (Multi-rater)</option>
              <option value={3}>3 Rater (Multi-rater)</option>
            </Select>
          </Field>

          <Field label="Total Skor Maksimal">
            <div className="flex h-10 items-center rounded-xl border border-line-2 bg-paper px-3">
              <span className="nums text-sm font-extrabold text-brand">
                {totalMax} poin
              </span>
            </div>
          </Field>

          <Field label="Petunjuk Pengerjaan" className="md:col-span-2">
            <Textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Jawab seluruh soal dengan kalimat Anda sendiri..."
            />
          </Field>
        </div>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-brand">
            Soal Esai ({questions.length})
          </h2>
          <Button type="button" variant="secondary" size="sm" onClick={addQuestion}>
            <Plus className="h-3.5 w-3.5" />
            Tambah Soal
          </Button>
        </div>

        {questions.map((q, idx) => {
          const isOpen = expanded === q.id;
          const rubricTotal = q.rubric.reduce(
            (sum, r) => sum + (Number(r.maxScore) || 0),
            0
          );
          const mismatch = rubricTotal !== Number(q.maxScore);

          return (
            <Card key={q.id} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : q.id)}
                  className="flex flex-1 cursor-pointer items-center gap-2 text-left"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-brand">
                      {q.prompt || "(Soal belum diisi)"}
                    </span>
                    <span className="block text-[11px] text-muted">
                      {q.maxScore} poin • {q.rubric.length} kriteria
                      {mismatch && (
                        <span className="ml-1 font-semibold text-orange-600">
                          ⚠ Rubrik {rubricTotal}p ≠ {q.maxScore}p
                        </span>
                      )}
                    </span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-muted" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
                  )}
                </button>

                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(q.id)}
                    className="cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-rose-50 hover:text-rose-600"
                    title="Hapus soal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {isOpen && (
                <div className="space-y-4 border-t border-line/60 pt-4">
                  <Field label="Pertanyaan Esai" required>
                    <Textarea
                      rows={3}
                      value={q.prompt}
                      onChange={(e) =>
                        updateQuestion(q.id, { prompt: e.target.value })
                      }
                      placeholder="Tulis pertanyaan esai di sini..."
                    />
                  </Field>

                  <Field label="Kunci Jawaban / Referensi">
                    <Textarea
                      rows={3}
                      value={q.referenceAnswer}
                      onChange={(e) =>
                        updateQuestion(q.id, {
                          referenceAnswer: e.target.value,
                        })
                      }
                      placeholder="Uraian jawaban yang diharapkan..."
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Skor Maksimal Soal" required>
                      <Input
                        type="number"
                        min={1}
                        value={q.maxScore}
                        onChange={(e) =>
                          updateQuestion(q.id, {
                            maxScore: Number(e.target.value),
                          })
                        }
                      />
                    </Field>

                    <Field
                      label="Kata Kunci (pisahkan dengan koma)"
                      hint="Digunakan AI untuk deteksi konsep"
                    >
                      <Input
                        value={q.keywords}
                        onChange={(e) =>
                          updateQuestion(q.id, { keywords: e.target.value })
                        }
                        placeholder="Klorofil, fotolisis, glukosa"
                      />
                    </Field>
                  </div>

                  {/* Rubric */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand">
                        Kriteria Rubrik ({q.rubric.length})
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addRubric(q.id)}
                      >
                        <Plus className="h-3 w-3" />
                        Tambah
                      </Button>
                    </div>

                    {q.rubric.map((r, rIdx) => (
                      <div
                        key={r.id}
                        className="flex items-end gap-2 rounded-xl border border-line bg-white/60 p-2.5"
                      >
                        <Field
                          label={`Kriteria ${rIdx + 1}`}
                          className="flex-1"
                        >
                          <Input
                            value={r.name}
                            onChange={(e) =>
                              updateRubric(q.id, r.id, {
                                name: e.target.value,
                              })
                            }
                            placeholder="Nama kriteria"
                          />
                        </Field>
                        <Field label="Poin" className="w-24">
                          <Input
                            type="number"
                            min={1}
                            value={r.maxScore}
                            onChange={(e) =>
                              updateRubric(q.id, r.id, {
                                maxScore: Number(e.target.value),
                              })
                            }
                          />
                        </Field>
                        {q.rubric.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRubric(q.id, r.id)}
                            className="mb-1 cursor-pointer rounded-lg p-2 text-muted transition-colors hover:bg-rose-50 hover:text-rose-600"
                            title="Hapus kriteria"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}

                    {mismatch && (
                      <p className="text-[11px] font-semibold text-orange-600">
                        ⚠ Total poin rubrik ({rubricTotal}) berbeda dari skor
                        maksimal soal ({q.maxScore}).
                      </p>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end gap-2">
        <Link href="/assessments">
          <Button type="button" variant="outline">
            Batal
          </Button>
        </Link>
        <Button type="submit">
          <Save className="h-4 w-4" />
          Simpan Asesmen ({totalMax} poin)
        </Button>
      </div>
    </form>
  );
}
