"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
export function StudentResults() { const q = useQuery({ queryKey: ["student-results"], queryFn: () => api.get<{ results: { id: string; assessment: { title: string }; totalScore: number; publishedAt: string }[] }>("/api/student/results") }); if (q.isPending) return <p role="status">Memuat hasil…</p>; if (q.isError) return <p role="alert">{q.error.message}</p>; if (!q.data.results.length) return <p className="text-muted-foreground">Belum ada hasil yang diterbitkan.</p>; return <ul className="grid gap-3">{q.data.results.map((r) => <li className="lg lg-regular lg-surface flex items-center justify-between px-5 py-4" key={r.id}><div><p className="font-medium">{r.assessment.title}</p><p className="text-sm text-muted-foreground">Terbit {new Date(r.publishedAt).toLocaleDateString("id-ID")}</p></div><Button asChild size="sm"><Link href={`/siswa/results/${r.id}`}>{r.totalScore} poin</Link></Button></li>)}</ul>; }
