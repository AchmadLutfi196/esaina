"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, HttpError } from "@/lib/api-client";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SubmitDialog } from "./submit-dialog";

type Work = {
  assessment: { id: string; title: string; instruction: string; questions: { id: string; order: number; text: string; maxScore: number }[] };
  submission: { id: string; version: number; status: string; answers: { questionId: string; content: string }[] };
};

export function StudentWork({ assessmentId }: { assessmentId: string }) {
  const query = useQuery({ queryKey: ["work", assessmentId], queryFn: () => api.get<Work>(`/api/assessments/${assessmentId}/work`) });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [version, setVersion] = useState(1);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "failed" | "conflict">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!query.data || initialized.current) return;
    initialized.current = true;
    setVersion(query.data.submission.version);
    setAnswers(Object.fromEntries(query.data.submission.answers.map((a) => [a.questionId, a.content])));
  }, [query.data]);

  function change(questionId: string, content: string) {
    setAnswers((current) => ({ ...current, [questionId]: content }));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaveState("saving");
      try {
        const result = await api.patch<{ version: number }>(`/api/assessments/${assessmentId}/work`, { version, questionId, content });
        setVersion(result.version);
        setSaveState("saved");
      } catch (e) {
        setSaveState(e instanceof HttpError && e.status === 409 ? "conflict" : "failed");
      }
    }, 1000);
  }

  if (query.isPending) return <main className="mx-auto max-w-3xl px-4 py-10"><p role="status">Memuat lembar kerja…</p></main>;
  if (query.isError) return <main className="mx-auto max-w-3xl px-4 py-10"><Alert variant="destructive"><AlertDescription>{query.error.message}</AlertDescription></Alert></main>;
  const { assessment } = query.data;

  return <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
    <Card>
      <CardHeader className="flex-col gap-2">
        <div className="flex items-center justify-between gap-3"><h1 className="text-3xl font-semibold text-primary">{assessment.title}</h1><Badge variant={saveState === "failed" || saveState === "conflict" ? "warning" : "soft"}>{saveState === "saving" ? "Menyimpan…" : saveState === "saved" ? "Tersimpan" : saveState === "failed" ? "Gagal simpan" : saveState === "conflict" ? "Konflik versi" : "Draf"}</Badge></div>
        <p className="text-sm text-muted-foreground">{assessment.instruction}</p>
      </CardHeader>
    </Card>
    {saveState === "conflict" ? <Alert variant="destructive"><AlertDescription>Jawaban berubah di tab lain. Muat ulang halaman agar aman.</AlertDescription></Alert> : null}
    {assessment.questions.map((q) => <Card className="gap-3" key={q.id}><CardHeader className="text-base font-medium text-primary">{q.order}. {q.text}</CardHeader><CardContent className="flex flex-col gap-3"><Label htmlFor={`answer-${q.id}`}>Jawaban Anda</Label><Textarea id={`answer-${q.id}`} value={answers[q.id] ?? ""} onChange={(e) => change(q.id, e.target.value)} placeholder="Tulis jawaban…" rows={7} /><p className="text-xs text-muted-foreground">Maksimum {q.maxScore} poin · tersimpan otomatis setelah berhenti mengetik.</p></CardContent></Card>)}
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">{saveState === "saving" ? "Menyimpan sebelum mengumpulkan…" : "Pastikan semua jawaban sudah selesai."}</p>
      <SubmitDialog assessmentId={assessmentId} version={version} unanswered={assessment.questions.filter((q) => !(answers[q.id] ?? "").trim()).length} />
    </div>
  </main>;
}
