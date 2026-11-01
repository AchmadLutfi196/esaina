"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Kelas = { id: string; name: string };

export function StudentClasses() {
  const qc = useQueryClient();
  const [joined, setJoined] = useState<string | null>(null);

  const mineQuery = useQuery({
    queryKey: ["my-classes"],
    queryFn: () => api.get<{ classes: Kelas[] }>("/api/classes/mine"),
  });

  const join = useMutation({
    mutationFn: (joinCode: string) => api.post<{ name: string }>("/api/classes/join", { joinCode }),
    onSuccess: (data) => {
      setJoined(data.name);
      void qc.invalidateQueries({ queryKey: ["my-classes"] });
    },
  });

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setJoined(null);
    const form = new FormData(event.currentTarget);
    join.mutate(String(form.get("joinCode") ?? ""));
    event.currentTarget.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kelas saya</CardTitle>
        <CardDescription>
          Gabung dengan kode dari guru, lalu kerjakan asesmen yang dibuka.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-2 sm:flex-row sm:items-end"
          noValidate
        >
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="joinCode">Kode kelas</Label>
            <Input
              id="joinCode"
              name="joinCode"
              required
              disabled={join.isPending}
              placeholder="Contoh: XIIA01"
              className="uppercase tracking-widest"
            />
          </div>
          <Button
            type="submit"
            variant="solid"
            disabled={join.isPending}
          >
            {join.isPending ? "Bergabung…" : "Gabung"}
          </Button>
        </form>

        {join.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Gagal bergabung</AlertTitle>
            <AlertDescription>
              {join.error instanceof Error ? join.error.message : "Gagal bergabung ke kelas."}
            </AlertDescription>
          </Alert>
        ) : null}

        {joined ? (
          <Alert variant="success">
            <AlertTitle>Berhasil bergabung</AlertTitle>
            <AlertDescription>
              Anda sekarang anggota kelas {joined}.
            </AlertDescription>
          </Alert>
        ) : null}

        {mineQuery.isPending ? (
          <p
            className="text-sm text-muted-foreground"
            role="status"
          >
            Memuat kelas…
          </p>
        ) : null}

        {mineQuery.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Gagal memuat kelas</AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-2">
              <span>{mineQuery.error.message}</span>
              <Button
                size="sm"
                variant="soft"
                onClick={() => void mineQuery.refetch()}
              >
                Coba lagi
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        {mineQuery.data?.classes.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Belum mengikuti kelas"
            description="Masukkan kode gabung dari guru untuk mulai."
          />
        ) : null}

        {mineQuery.data && mineQuery.data.classes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kelas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mineQuery.data.classes.map((k) => (
                <TableRow key={k.id}>
                  <TableCell className="font-medium">{k.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </CardContent>
    </Card>
  );
}
