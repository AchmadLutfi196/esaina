"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

type Kelas = { id: string; name: string };
type Assessment = { id: string; title: string; status: string; questionCount: number };

type DraftQuestion = {
  order: number;
  text: string;
  referenceAnswer: string;
  maxScore: number;
  criteria: { code: string; description: string; minScore: number; maxScore: number }[];
};

const blankQuestion = (order: number): DraftQuestion => ({
  order,
  text: "",
  referenceAnswer: "",
  maxScore: 10,
  criteria: [{ code: "C1", description: "", minScore: 0, maxScore: 10 }],
});

export function AssessmentBuilder() {
  const qc = useQueryClient();
  const classes = useQuery({
    queryKey: ["classes"],
    queryFn: () => api.get<{ classes: Kelas[] }>("/api/classes"),
  });
  const [classId, setClassId] = useState("");
  const assessments = useQuery({
    queryKey: ["assessments", classId],
    queryFn: () => api.get<{ assessments: Assessment[] }>(`/api/assessments?classId=${classId}`),
    enabled: Boolean(classId),
  });
  const [title, setTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([blankQuestion(1)]);
  const create = useMutation({
    mutationFn: () =>
      api.post<{ id: string }>("/api/assessments", { classId, title, instruction, questions }),
    onSuccess: () => {
      setTitle("");
      setInstruction("");
      setQuestions([blankQuestion(1)]);
      void qc.invalidateQueries({ queryKey: ["assessments", classId] });
    },
  });
  const open = useMutation({
    mutationFn: (id: string) => api.post(`/api/assessments/${id}/open`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["assessments", classId] }),
  });

  function updateQuestion(index: number, patch: Partial<DraftQuestion>) {
    setQuestions((items) => items.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="lg lg-regular lg-surface flex flex-col gap-4 px-6 py-5">
        <h2 className="text-2xl font-semibold text-primary">Buat asesmen</h2>
        {create.isError ? <Alert variant="destructive"><AlertDescription>{create.error.message}</AlertDescription></Alert> : null}
        <div className="flex flex-col gap-2">
          <Label htmlFor="assessment-class">Kelas</Label>
          <select id="assessment-class" className="h-10 rounded-md border border-input bg-transparent px-3" value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">Pilih kelas</option>
            {classes.data?.classes.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-2"><Label htmlFor="assessment-title">Judul</Label><Input id="assessment-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="UTS IPA" /></div>
        <div className="flex flex-col gap-2"><Label htmlFor="assessment-instruction">Instruksi</Label><Textarea id="assessment-instruction" value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="Jawab dengan bahasa sendiri." /></div>
        {questions.map((q, index) => (
          <div className="flex flex-col gap-3 rounded-2xl border border-border/60 p-4" key={q.order}>
            <div className="flex items-center justify-between"><h3 className="font-medium">Soal {q.order}</h3>{questions.length > 1 ? <Button type="button" variant="ghost" size="sm" onClick={() => setQuestions((items) => items.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i + 1 })))}>Hapus</Button> : null}</div>
            <Textarea value={q.text} onChange={(e) => updateQuestion(index, { text: e.target.value })} placeholder="Tulis pertanyaan…" aria-label={`Teks soal ${q.order}`} />
            <Textarea value={q.referenceAnswer} onChange={(e) => updateQuestion(index, { referenceAnswer: e.target.value })} placeholder="Jawaban acuan (tidak dikirim ke siswa)…" aria-label={`Jawaban acuan ${q.order}`} />
            <div className="flex flex-col gap-2"><Label>Skor maksimum</Label><Input type="number" min={1} value={q.maxScore} onChange={(e) => updateQuestion(index, { maxScore: Number(e.target.value) })} /></div>
            <div className="flex flex-col gap-2"><Label>Rubrik C1</Label><Input value={q.criteria[0]?.description ?? ""} onChange={(e) => updateQuestion(index, { criteria: [{ ...q.criteria[0], description: e.target.value }] })} placeholder="Aspek yang dinilai…" /></div>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setQuestions((items) => [...items, blankQuestion(items.length + 1)])}>Tambah soal</Button>
          <Button type="button" disabled={!classId || create.isPending} onClick={() => create.mutate()}>{create.isPending ? "Menyimpan…" : "Simpan asesmen"}</Button>
        </div>
      </section>
      {classId ? <section className="flex flex-col gap-3"><h2 className="text-2xl font-semibold text-primary">Asesmen kelas</h2>{assessments.data?.assessments.map((a) => <div className="lg lg-regular lg-surface flex items-center justify-between gap-3 px-5 py-4" key={a.id}><div><p className="font-medium">{a.title}</p><p className="text-sm text-muted-foreground">{a.questionCount} soal</p></div><div className="flex items-center gap-2"><Badge variant="secondary">{a.status}</Badge>{a.status === "DRAFT" ? <Button size="sm" onClick={() => open.mutate(a.id)}>Buka</Button> : null}</div></div>)}</section> : null}
    </div>
  );
}
