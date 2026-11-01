"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

type Assessment = {
  id: string;
  title: string;
  instruction: string;
  class: { id: string; name: string };
  questionCount: number;
  submission: { status: string; version: number; submittedAt: string | null } | null;
};

export function AssessmentList() {
  const query = useQuery({
    queryKey: ["my-assessments"],
    queryFn: () => api.get<{ assessments: Assessment[] }>("/api/assessments/mine"),
  });
  if (query.isPending) return <p className="text-sm text-muted-foreground" role="status">Memuat asesmen…</p>;
  if (query.isError) return <Alert variant="destructive"><AlertDescription>{query.error.message}</AlertDescription></Alert>;
  if (query.data.assessments.length === 0) return <p className="text-sm text-muted-foreground">Belum ada asesmen terbuka.</p>;

  return <ul className="grid gap-3">{query.data.assessments.map((a) => (
    <li key={a.id}>
      <Card className="flex flex-row items-center justify-between gap-4 px-5">
        <div><p className="font-medium text-primary">{a.title}</p><p className="text-sm text-muted-foreground">{a.class.name} · {a.questionCount} soal</p></div>
        {a.submission?.status === "SUBMITTED" ? <Badge variant="soft">Terkumpul</Badge> : <Button asChild size="sm" variant="solid"><Link href={`/siswa/assessment/${a.id}`}>{a.submission ? "Lanjutkan" : "Mulai"}</Link></Button>}
      </Card>
    </li>
  ))}</ul>;
}
