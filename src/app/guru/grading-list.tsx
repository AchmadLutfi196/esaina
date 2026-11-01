"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import { api } from "@/lib/api-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Assessment = {
  id: string;
  title: string;
  status: string;
  questionCount: number;
};

type Kelas = { id: string; name: string };

const STATUS_BADGE: Record<
  string,
  { label: string; variant: "success" | "warning" | "soft" }
> = {
  OPEN: { label: "Dibuka", variant: "success" },
  CLOSED: { label: "Ditutup", variant: "warning" },
};

function statusBadge(status: string) {
  const meta = STATUS_BADGE[status];
  return (
    <Badge variant={meta?.variant ?? "soft"}>{meta?.label ?? status}</Badge>
  );
}

export function GradingList() {
  const [classId, setClassId] = useState("");
  const classes = useQuery({
    queryKey: ["classes"],
    queryFn: () => api.get<{ classes: Kelas[] }>("/api/classes"),
  });
  const assessments = useQuery({
    queryKey: ["grading-assessments", classId],
    queryFn: () =>
      api.get<{ assessments: Assessment[] }>(
        `/api/assessments?classId=${classId}`,
      ),
    enabled: !!classId,
  });

  const graded = assessments.data?.assessments.filter(
    (a) => a.status !== "DRAFT",
  );

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold text-[var(--primary)]">
          Penilaian manual
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Pilih kelas, lalu buka daftar LJK atau publikasi hasil.
        </p>
      </header>

      <div className="flex flex-col gap-2 sm:max-w-xs">
        <Label htmlFor="grading-class">Kelas</Label>
        <Select
          id="grading-class"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
        >
          <SelectItem value="" disabled>
            Pilih kelas
          </SelectItem>
          {classes.data?.classes.map((k) => (
            <SelectItem key={k.id} value={k.id}>
              {k.name}
            </SelectItem>
          ))}
        </Select>
      </div>

      {classes.isPending ? (
        <p role="status" className="text-sm text-[var(--muted-foreground)]">
          Memuat kelas…
        </p>
      ) : null}

      {classes.isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            <p>{classes.error.message}</p>
            <Button
              size="sm"
              variant="soft"
              onClick={() => void classes.refetch()}
            >
              Coba lagi
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {!classId && !classes.isPending ? (
        <EmptyState
          icon={Filter}
          title="Belum ada kelas dipilih"
          description="Pilih kelas untuk melihat daftar asesmen yang siap dinilai."
        />
      ) : null}

      {classId && assessments.isPending ? (
        <p role="status" className="text-sm text-[var(--muted-foreground)]">
          Memuat asesmen…
        </p>
      ) : null}

      {classId && assessments.isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            <p>{assessments.error.message}</p>
            <Button
              size="sm"
              variant="soft"
              onClick={() => void assessments.refetch()}
            >
              Coba lagi
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {classId && graded && graded.length === 0 ? (
        <EmptyState
          title="Belum ada asesmen"
          description="Asesmen yang sudah dibuka akan muncul di sini."
        />
      ) : null}

      {graded && graded.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asesmen</TableHead>
              <TableHead>Soal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {graded.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.title}</TableCell>
                <TableCell>{a.questionCount} soal</TableCell>
                <TableCell>{statusBadge(a.status)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="default" asChild>
                      <Link href={`/guru/assessments/${a.id}/submissions`}>
                        Buka LJK
                      </Link>
                    </Button>
                    <Button size="sm" variant="soft" asChild>
                      <Link href={`/guru/assessments/${a.id}/publication`}>
                        Publikasi
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </section>
  );
}
