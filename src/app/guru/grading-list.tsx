"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Assessment = { id: string; title: string; status: string; questionCount: number };
type Kelas = { id: string; name: string };
export function GradingList() {
  const classes = useQuery({ queryKey: ["classes"], queryFn: () => api.get<{ classes: Kelas[] }>("/api/classes") });
  const [classId, setClassId] = useState("");
  const assessments = useQuery({ queryKey: ["grading-assessments", classId], queryFn: async () => { const x = await api.get<{ assessments: Assessment[] }>(`/api/assessments?classId=${classId}`); return x; }, enabled: !!classId });
  return <section className="flex flex-col gap-3"><h2 className="text-2xl font-semibold text-primary">Penilaian manual</h2><div className="flex flex-col gap-2 sm:max-w-xs"><Label htmlFor="grading-class">Kelas</Label><Select value={classId} onValueChange={setClassId}><SelectTrigger id="grading-class" aria-label="Pilih kelas"><SelectValue placeholder="Pilih kelas" /></SelectTrigger><SelectContent>{classes.data?.classes.map((k) => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}</SelectContent></Select></div>{assessments.data?.assessments.filter((a) => a.status !== "DRAFT").map((a) => <Card className="flex flex-row items-center justify-between gap-3 px-5" key={a.id}><div><p className="font-medium">{a.title}</p><p className="text-sm text-muted-foreground">{a.questionCount} soal</p></div><div className="flex gap-2"><Button asChild size="sm"><Link href={`/guru/assessments/${a.id}/submissions`}>Buka LJK</Link></Button><Button asChild size="sm" variant="outline"><Link href={`/guru/assessments/${a.id}/publication`}>Publikasi</Link></Button></div></Card>)}{assessments.isError ? <Alert variant="destructive"><AlertDescription>{assessments.error.message}</AlertDescription></Alert> : null}</section>;
}
