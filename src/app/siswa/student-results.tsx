"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
export function StudentResults() { const q = useQuery({ queryKey: ["student-results"], queryFn: () => api.get<{ results: { id: string; assessment: { title: string }; totalScore: number; publishedAt: string }[] }>("/api/student/results") }); if (q.isPending) return <p role="status">Memuat hasil…</p>; if (q.isError) return <p role="alert">{q.error.message}</p>; if (!q.data.results.length) return <p className="text-muted-foreground">Belum ada hasil yang diterbitkan.</p>; return <ul className="grid gap-3">{q.data.results.map((r) => <li key={r.id}><Card className="flex flex-row items-center justify-between gap-4 px-5"><div><p className="font-medium">{r.assessment.title}</p><p className="text-sm text-muted-foreground">Terbit {new Date(r.publishedAt).toLocaleDateString("id-ID")}</p></div><Button asChild size="sm"><Link href={`/siswa/results/${r.id}`}>{r.totalScore} poin</Link></Button></Card></li>)}</ul>; }
