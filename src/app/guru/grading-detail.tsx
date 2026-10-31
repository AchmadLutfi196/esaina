"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, HttpError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Criterion = { id: string; code: string; description: string; minScore: number; maxScore: number };
type Question = { id: string; order: number; text: string; referenceAnswer: string; criteria: Criterion[] };
type Detail = { id: string; version: number; student: { anonCode: string }; assessment: { title: string; questions: Question[] }; answers: { questionId: string; content: string }[]; gradeRevisions: { id: string; version: number; status: string; totalScore: number; items: { questionId: string; criterionId: string; score: number | null; feedback: string }[] }[] };

type Item = { questionId: string; criterionId: string; score: number | null; feedback: string };
export function GradingDetail({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const query = useQuery({ queryKey: ["submission", submissionId], queryFn: () => api.get<Detail>(`/api/submissions/${submissionId}`) });
  const revision = query.data?.gradeRevisions[0];
  const [items, setItems] = useState<Item[]>([]);
  const currentItems = items.length > 0 ? items : revision?.items ?? query.data?.assessment.questions.flatMap((q) => q.criteria.map((c) => ({ questionId: q.id, criterionId: c.id, score: null, feedback: "" }))) ?? [];
  const save = useMutation({ mutationFn: () => api.put(`/api/submissions/${submissionId}/grade`, { version: query.data?.version, items: currentItems }), onSuccess: () => void query.refetch() });
  const finalize = useMutation({ mutationFn: () => api.post<{ nextSubmissionId: string | null }>(`/api/submissions/${submissionId}/grade/finalize`), onSuccess: (data) => { if (data.nextSubmissionId) router.push(`/guru/submissions/${data.nextSubmissionId}/grade`); else void query.refetch(); } });
  const ai = useMutation({ mutationFn: () => api.post<{ aiResult: { id: string; payload: unknown }; cached: boolean }>(`/api/submissions/${submissionId}/ai`), onSuccess: (data) => applyAi.mutate(data.aiResult.id) });
  const applyAi = useMutation({ mutationFn: (aiResultId: string) => api.post(`/api/submissions/${submissionId}/ai/apply`, { aiResultId, version: query.data?.version }), onSuccess: () => void query.refetch() });
  if (query.isPending) return <p role="status">Memuat LJK…</p>;
  if (query.isError) return <Alert variant="destructive"><AlertDescription>{query.error.message}</AlertDescription></Alert>;
  const detail = query.data;
  const answer = new Map(detail.answers.map((a) => [a.questionId, a.content]));
  const update = (criterionId: string, patch: Partial<Item>) => setItems((all) => (all.length ? all : currentItems).map((x) => x.criterionId === criterionId ? { ...x, ...patch } : x));
  const total = currentItems.reduce((sum, x) => sum + (x.score ?? 0), 0);
  const final = detail.gradeRevisions[0]?.status === "FINAL";
  return <div className="flex flex-col gap-5"><header className="lg lg-regular lg-surface flex items-center justify-between px-6 py-5"><div><h1 className="text-2xl font-semibold text-primary">{detail.assessment.title}</h1><p className="text-sm text-muted-foreground">Kode anonim: {detail.student.anonCode}</p></div><div className="text-right"><p className="text-2xl font-semibold">{total}</p><p className="text-xs text-muted-foreground">Total skor</p></div></header>{detail.assessment.questions.map((q) => <section className="grid gap-4 lg:grid-cols-2" key={q.id}><article className="lg lg-regular lg-surface flex flex-col gap-3 px-5 py-4"><h2 className="font-medium text-primary">{q.order}. {q.text}</h2><p className="whitespace-pre-wrap text-sm">{answer.get(q.id) || <span className="text-muted-foreground">(kosong)</span>}</p><details><summary className="cursor-pointer text-sm text-muted-foreground">Lihat jawaban acuan</summary><p className="mt-2 text-sm text-muted-foreground">{q.referenceAnswer}</p></details></article><article className="lg lg-regular lg-surface flex flex-col gap-3 px-5 py-4">{q.criteria.map((c) => { const item = items.find((x) => x.criterionId === c.id); return <div className="grid gap-2 sm:grid-cols-[1fr_100px]" key={c.id}><div><p className="font-medium">{c.code} · {c.description}</p><Textarea disabled={final} value={item?.feedback ?? ""} onChange={(e) => update(c.id, { feedback: e.target.value })} placeholder="Feedback…" rows={2} /></div><Input disabled={final} type="number" min={c.minScore} max={c.maxScore} value={item?.score ?? ""} onChange={(e) => update(c.id, { score: e.target.value === "" ? null : Number(e.target.value) })} aria-label={`Skor ${c.code}`} /></div>; })}</article></section>)}<div className="flex justify-end gap-2"><Button variant="outline" disabled={final || ai.isPending} onClick={() => ai.mutate()}>{ai.isPending ? "Meminta saran AI…" : "Sarankan skor AI"}</Button><Button variant="outline" disabled={final || save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Menyimpan…" : "Simpan draf"}</Button><Button disabled={final || finalize.isPending || currentItems.some((x) => x.score === null)} onClick={() => finalize.mutate()}>{finalize.isPending ? "Mengesahkan…" : final ? "Sudah final" : "Sahkan & siswa berikutnya"}</Button></div>{save.isError || finalize.isError ? <Alert variant="destructive"><AlertDescription>{(save.error ?? finalize.error) instanceof HttpError ? (save.error ?? finalize.error)?.message : "Gagal menyimpan nilai."}</AlertDescription></Alert> : null}</div>;
}
