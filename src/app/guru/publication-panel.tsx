"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Inbox } from "lucide-react";
import { api } from "@/lib/api-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PublicationRow = {
  id: string;
  anonCode: string;
  totalScore: number | null;
  published: boolean;
};

export function PublicationPanel({ assessmentId }: { assessmentId: string }) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["publication", assessmentId],
    queryFn: () =>
      api.get<{ submissions: PublicationRow[] }>(
        `/api/assessments/${assessmentId}/publish`,
      ),
  });

  const publish = useMutation({
    mutationFn: () =>
      api.post(`/api/assessments/${assessmentId}/publish`, {
        submissionIds: selected,
        idempotencyKey: crypto.randomUUID(),
      }),
    onSuccess: () => {
      setSuccessMessage(`${selected.length} LJK diterbitkan.`);
      setSelected([]);
      void qc.invalidateQueries({ queryKey: ["publication", assessmentId] });
    },
  });

  const rows = q.data?.submissions ?? [];
  const readyIds = rows.filter((s) => !s.published).map((s) => s.id);
  const allReadySelected =
    readyIds.length > 0 && readyIds.every((id) => selected.includes(id));

  const toggle = (id: string, checked: boolean) => {
    setSuccessMessage(null);
    setSelected((all) =>
      checked ? [...all, id] : all.filter((x) => x !== id),
    );
  };

  const toggleAll = (checked: boolean) => {
    setSuccessMessage(null);
    setSelected(checked ? readyIds : []);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-[var(--primary)]">
          Publikasi hasil
        </CardTitle>
        <CardDescription>
          Pilih LJK yang sudah disahkan untuk diterbitkan ke siswa.
        </CardDescription>
        <CardAction className="flex flex-wrap gap-2">
          <Button asChild variant="soft" size="sm">
            <a href={`/api/assessments/${assessmentId}/export`}>Ekspor CSV</a>
          </Button>
          <Button
            size="sm"
            variant="solid"
            disabled={selected.length === 0 || publish.isPending}
            onClick={() => publish.mutate()}
          >
            {publish.isPending
              ? "Menerbitkan…"
              : `Terbitkan (${selected.length})`}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {q.isPending ? (
          <p role="status" className="text-sm text-[var(--muted-foreground)]">
            Memuat rekap…
          </p>
        ) : null}

        {q.isError ? (
          <Alert variant="destructive">
            <AlertDescription>
              <p>{q.error.message}</p>
              <Button
                size="sm"
                variant="soft"
                onClick={() => void q.refetch()}
              >
                Coba lagi
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        {publish.isError ? (
          <Alert variant="destructive">
            <AlertDescription>
              <p>{publish.error.message}</p>
              <Button
                size="sm"
                variant="soft"
                disabled={publish.isPending}
                onClick={() => publish.mutate()}
              >
                Coba lagi
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        {successMessage ? (
          <Alert variant="success">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        ) : null}

        {q.data ? (
          rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
              <Inbox
                className="size-8 text-[var(--muted-foreground)]"
                aria-hidden
              />
              <p className="text-base font-semibold">Belum ada LJK</p>
              <p className="max-w-md text-sm text-[var(--muted-foreground)]">
                LJK yang sudah dikumpulkan akan muncul di sini.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <input
                  id="publication-select-all"
                  type="checkbox"
                  className="size-4 accent-[var(--primary)]"
                  checked={allReadySelected}
                  disabled={readyIds.length === 0}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
                <Label htmlFor="publication-select-all">
                  Pilih semua yang siap
                </Label>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode anonim</TableHead>
                    <TableHead>Total skor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pilih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        {s.anonCode}
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
                        <Badge variant={s.published ? "success" : "soft"}>
                          {s.published ? "Terbit" : "Siap"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="size-4 accent-[var(--primary)]"
                          aria-label={`Pilih LJK ${s.anonCode}`}
                          disabled={s.published}
                          checked={selected.includes(s.id)}
                          onChange={(e) => toggle(s.id, e.target.checked)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )
        ) : null}
      </CardContent>
    </Card>
  );
}
