"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Award } from "lucide-react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Result = {
  id: string;
  assessment: { id: string; title: string };
  totalScore: number;
  publishedAt: string;
};

export function StudentResults() {
  const query = useQuery({
    queryKey: ["student-results"],
    queryFn: () => api.get<{ results: Result[] }>("/api/student/results"),
  });

  if (query.isPending) {
    return (
      <p
        className="text-sm text-muted-foreground"
        role="status"
      >
        Memuat hasil…
      </p>
    );
  }

  if (query.isError) {
    return (
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
    );
  }

  if (query.data.results.length === 0) {
    return (
      <EmptyState
        icon={Award}
        title="Belum ada hasil terbit"
        description="Nilai akan muncul setelah guru menerbitkannya."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asesmen</TableHead>
          <TableHead>Terbit</TableHead>
          <TableHead className="text-right">Nilai</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {query.data.results.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="font-medium">{r.assessment.title}</TableCell>
            <TableCell className="whitespace-nowrap">
              {new Date(r.publishedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </TableCell>
            <TableCell className="text-right font-semibold tabular-nums">
              {r.totalScore}
            </TableCell>
            <TableCell className="text-right">
              <Button
                asChild
                size="sm"
                variant="soft"
              >
                <Link href={`/siswa/results/${r.id}`}>Lihat detail</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
