"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Assessment = { id: string; title: string; status: string; questionCount: number };
type Kelas = { id: string; name: string };
export function GradingList() {
  const classes = useQuery({ queryKey: ["classes"], queryFn: () => api.get<{ classes: Kelas[] }>("/api/classes") });
  const [classId, setClassId] = useState("");
  const assessments = useQuery({ queryKey: ["grading-assessments", classId], queryFn: async () => { const x = await api.get<{ assessments: Assessment[] }>(`/api/assessments?classId=${classId}`); return x; }, enabled: !!classId });
  return <section className="flex flex-col gap-3"><h2 className="text-2xl font-semibold text-primary">Penilaian manual</h2><select className="h-10 rounded-md border border-input bg-transparent px-3" value={classId} onChange={(e) => setClassId(e.target.value)}><option value="">Pilih kelas</option>{classes.data?.classes.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}</select>{assessments.data?.assessments.filter((a) => a.status !== "DRAFT").map((a) => <div className="lg lg-regular lg-surface flex items-center justify-between px-5 py-4" key={a.id}><div><p className="font-medium">{a.title}</p><p className="text-sm text-muted-foreground">{a.questionCount} soal</p></div><div className="flex gap-2"><Button asChild size="sm"><Link href={`/guru/assessments/${a.id}/submissions`}>Buka LJK</Link></Button><Button asChild size="sm" variant="outline"><Link href={`/guru/assessments/${a.id}/publication`}>Publikasi</Link></Button></div></div>)}{assessments.isError ? <Alert variant="destructive"><AlertDescription>{assessments.error.message}</AlertDescription></Alert> : null}</section>;
}
