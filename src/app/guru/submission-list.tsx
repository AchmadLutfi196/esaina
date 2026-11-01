"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "Terkumpul",
  GRADED: "Dinilai",
};
export function SubmissionList({ assessmentId }: { assessmentId: string }) {
  const [search, setSearch] = useState(""); const [status, setStatus] = useState("ALL");
  const query = useQuery({ queryKey: ["submissions", assessmentId, search, status], queryFn: () => api.get<{ submissions: { id: string; anonCode: string; status: string; totalScore: number | null }[] }>(`/api/assessments/${assessmentId}/submissions?status=${status}&search=${encodeURIComponent(search)}`) });
  return <div className="flex flex-col gap-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-end"><div className="flex flex-1 flex-col gap-2"><Label htmlFor="submission-search">Cari</Label><Input id="submission-search" placeholder="Kode anonim…" value={search} onChange={(e) => setSearch(e.target.value)} /></div><div className="flex flex-col gap-2 sm:w-44"><Label htmlFor="submission-status">Status</Label><Select value={status} onValueChange={setStatus}><SelectTrigger id="submission-status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">Semua</SelectItem><SelectItem value="SUBMITTED">Terkumpul</SelectItem><SelectItem value="GRADED">Dinilai</SelectItem></SelectContent></Select></div></div>{query.isPending ? <p role="status">Memuat LJK…</p> : null}{query.data?.submissions.map((s) => <Card className="flex flex-row items-center justify-between gap-3 px-5" key={s.id}><div><p className="font-medium">{s.anonCode}</p><p className="text-sm text-muted-foreground">{s.totalScore === null ? "Belum dinilai" : `${s.totalScore} poin`}</p></div><div className="flex items-center gap-2"><Badge variant="secondary">{STATUS_LABEL[s.status] ?? s.status}</Badge><Button asChild size="sm"><Link href={`/guru/submissions/${s.id}/grade`}>Nilai</Link></Button></div></Card>)}</div>;
}
