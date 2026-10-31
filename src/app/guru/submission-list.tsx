"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
export function SubmissionList({ assessmentId }: { assessmentId: string }) {
  const [search, setSearch] = useState(""); const [status, setStatus] = useState("ALL");
  const query = useQuery({ queryKey: ["submissions", assessmentId, search, status], queryFn: () => api.get<{ submissions: { id: string; anonCode: string; status: string; totalScore: number | null }[] }>(`/api/assessments/${assessmentId}/submissions?status=${status}&search=${encodeURIComponent(search)}`) });
  return <div className="flex flex-col gap-4"><div className="flex gap-2"><input className="h-10 flex-1 rounded-md border border-input bg-transparent px-3" placeholder="Cari kode anonim…" value={search} onChange={(e) => setSearch(e.target.value)} /><select className="rounded-md border border-input bg-transparent px-3" value={status} onChange={(e) => setStatus(e.target.value)}><option>ALL</option><option>SUBMITTED</option><option>GRADED</option></select></div>{query.isPending ? <p role="status">Memuat LJK…</p> : null}{query.data?.submissions.map((s) => <div className="lg lg-regular lg-surface flex items-center justify-between px-5 py-4" key={s.id}><div><p className="font-medium">{s.anonCode}</p><p className="text-sm text-muted-foreground">{s.totalScore === null ? "Belum dinilai" : `${s.totalScore} poin`}</p></div><div className="flex items-center gap-2"><Badge variant="secondary">{s.status}</Badge><Button asChild size="sm"><Link href={`/guru/submissions/${s.id}/grade`}>Nilai</Link></Button></div></div>)}</div>;
}
