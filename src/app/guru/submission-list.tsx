"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Inbox } from "lucide-react";
import { api } from "@/lib/api-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Submission = {
  id: string;
  anonCode: string;
  status: string;
  totalScore: number | null;
};

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "Terkumpul",
  UNGRADED: "Terkumpul",
  GRADED: "Dinilai",
};

export function SubmissionList({ assessmentId }: { assessmentId: string }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const query = useQuery({
    queryKey: ["submissions", assessmentId, search, status],
    queryFn: () =>
      api.get<{ submissions: Submission[] }>(
        `/api/assessments/${assessmentId}/submissions?status=${status}&search=${encodeURIComponent(search)}`,
      ),
  });

  const submissions = query.data?.submissions ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="submission-search">Cari kode anonim</Label>
          <Input
            id="submission-search"
            placeholder="Cari kode anonim…"
            aria-label="Cari kode anonim LJK"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 sm:w-44">
          <Label htmlFor="submission-status">Status</Label>
          <Select
            id="submission-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <SelectItem value="ALL">Semua</SelectItem>
            <SelectItem value="SUBMITTED">Terkumpul</SelectItem>
            <SelectItem value="GRADED">Dinilai</SelectItem>
          </Select>
        </div>
      </div>

      {query.isPending ? (
        <p role="status" className="text-sm text-[var(--muted-foreground)]">
          Memuat LJK…
        </p>
      ) : null}

      {query.isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            <p>{query.error.message}</p>
            <Button
              size="sm"
              variant="soft"
              onClick={() => void query.refetch()}
            >
              Coba lagi
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {query.data ? (
        submissions.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Belum ada LJK"
            description="LJK yang dikumpulkan siswa akan muncul di sini."
          />
        ) : (
          <>
            <p className="text-sm text-[var(--muted-foreground)]">
              {submissions.length} LJK
            </p>
            <Table>
              <TableCaption>
                Daftar lembar kerja siswa yang sudah dikumpulkan.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode anonim</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total skor</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.anonCode}</TableCell>
                    <TableCell>
                      <Badge variant="soft">
                        {STATUS_LABEL[s.status] ?? s.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {s.totalScore === null ? (
                        <span className="text-[var(--muted-foreground)]">
                          Belum dinilai
                        </span>
                      ) : (
                        s.totalScore
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="default" asChild>
                        <Link href={`/guru/submissions/${s.id}/grade`}>
                          Nilai
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )
      ) : null}
    </div>
  );
}
