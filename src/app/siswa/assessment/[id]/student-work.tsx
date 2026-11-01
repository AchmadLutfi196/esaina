"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, HttpError } from "@/lib/api-client";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitDialog } from "./submit-dialog";

type Work = {
  assessment: { id: string; title: string; instruction: string; questions: { id: string; order: number; text: string; maxScore: number }[] };
  submission: { id: string; version: number; status: string; answers: { questionId: string; content: string }[] };
};

type SaveState = "idle" | "saving" | "saved" | "failed" | "conflict";

const saveLabel: Record<SaveState, string> = {
  idle: "Draf",
  saving: "Menyimpan…",
  saved: "Tersimpan",
  failed: "Gagal simpan",
  conflict: "Konflik versi",
};

const saveVariant = {
  idle: "soft",
  saving: "soft",
  saved: "success",
  failed: "destructive",
  conflict: "warning",
} as const satisfies Record<SaveState, "soft" | "success" | "destructive" | "warning">;

const MAX_CHARS = 5000;

export function StudentWork({ assessmentId }: { assessmentId: string }) {
  const query = useQuery({ queryKey: ["work", assessmentId], queryFn: () => api.get<Work>(`/api/assessments/${assessmentId}/work`) });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [version, setVersion] = useState(1);
  const [saveState, setSaveState] = useState<SaveState>("idle");
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

  if (query.isPending) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p role="status">Memuat lembar kerja…</p>
      </main>
    );
  }

  if (query.isError) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col items-start gap-2">
            <span>{query.error.message}</span>
            <Button
              size="sm"
              variant="soft"
              onClick={() => void query.refetch()}
            >
              Coba lagi
            </Button>
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  const { assessment } = query.data;
  const total = assessment.questions.length;
  const filled = assessment.questions.filter((q) => (answers[q.id] ?? "").trim().length > 0).length;
  const unanswered = total - filled;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <Card>
        <CardHeader className="gap-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-primary">{assessment.title}</h1>
            <div aria-live="polite" className="w-fit">
              <Badge variant={saveVariant[saveState]}>{saveLabel[saveState]}</Badge>
            </div>
          </div>
          {assessment.instruction ? (
            <p className="text-sm text-muted-foreground">{assessment.instruction}</p>
          ) : null}
        </CardHeader>
      </Card>

      {saveState === "conflict" ? (
        <Alert variant="destructive">
          <AlertDescription>
            Jawaban berubah di tab lain. Muat ulang halaman agar aman.
          </AlertDescription>
        </Alert>
      ) : null}

      <p
        className="text-sm text-muted-foreground"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={filled}
        aria-valuetext={`${filled} dari ${total} soal terisi`}
      >
        {filled} dari {total} soal terisi
      </p>

      {assessment.questions.map((q) => {
        const value = answers[q.id] ?? "";
        return (
          <Card key={q.id}>
            <CardHeader>
              <CardTitle>Soal {q.order}</CardTitle>
              <CardDescription className="text-foreground">{q.text}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Label htmlFor={`answer-${q.id}`}>Jawaban Anda</Label>
              <Textarea
                id={`answer-${q.id}`}
                value={value}
                onChange={(e) => change(q.id, e.target.value)}
                placeholder="Tulis jawaban…"
                rows={7}
                maxLength={MAX_CHARS}
              />
              <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <p>Tersimpan otomatis setelah Anda berhenti mengetik.</p>
                <p className="tabular-nums sm:text-right">
                  {value.length} / {MAX_CHARS}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="sticky bottom-0 z-10 flex flex-col gap-2 border-t border-[color:var(--border)] bg-[var(--background)]/95 px-1 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {saveState === "saving"
            ? "Menyimpan sebelum mengumpulkan…"
            : unanswered > 0
              ? `${unanswered} soal belum dijawab.`
              : "Semua soal sudah dijawab."}
        </p>
        <SubmitDialog
          assessmentId={assessmentId}
          version={version}
          unanswered={unanswered}
        />
      </div>
    </main>
  );
}
