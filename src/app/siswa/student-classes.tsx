"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

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
    <div className="flex flex-col gap-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
        {join.isError ? (
          <Alert variant="destructive" role="alert">
            <AlertDescription>
              {join.error instanceof Error ? join.error.message : "Gagal bergabung ke kelas."}
            </AlertDescription>
          </Alert>
        ) : null}
        {joined ? (
          <Alert role="status">
            <AlertDescription>
              Berhasil bergabung ke kelas <strong>{joined}</strong>.
            </AlertDescription>
          </Alert>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="joinCode">Kode kelas</Label>
            <Input
              id="joinCode"
              name="joinCode"
              required
              disabled={join.isPending}
              placeholder="XIIA01"
              className="uppercase tracking-widest"
            />
          </div>
          <Button type="submit" variant="default" disabled={join.isPending}>
            {join.isPending ? "Bergabung…" : "Gabung kelas"}
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-primary">Kelas diikuti</h2>
        {mineQuery.isPending ? (
          <p className="text-sm text-muted-foreground" role="status">
            Memuat kelas…
          </p>
        ) : null}
        {mineQuery.isError ? (
          <Alert variant="destructive" role="alert">
            <AlertDescription className="flex items-center justify-between gap-3">
              <span>
                {mineQuery.error instanceof Error ? mineQuery.error.message : "Gagal memuat kelas."}
              </span>
              <Button size="sm" variant="outline" onClick={() => void mineQuery.refetch()}>
                Coba lagi
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}
        {mineQuery.data?.classes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Anda belum bergabung ke kelas mana pun. Masukkan kode kelas dari guru.
          </p>
        ) : null}
        {mineQuery.data && mineQuery.data.classes.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {mineQuery.data.classes.map((k) => (
              <li key={k.id}>
                <Badge variant="secondary">{k.name}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
