"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api, HttpError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export function SubmitDialog({ assessmentId, version, unanswered }: { assessmentId: string; version: number; unanswered: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Kunci dibuat sekali per sesi dialog: klik ganda = satu hasil.
  const key = useRef<string | null>(null);

  async function submit() {
    setPending(true);
    setError(null);
    key.current ??= crypto.randomUUID();
    try {
      await api.post(`/api/assessments/${assessmentId}/submit`, { version, idempotencyKey: key.current });
      router.push("/siswa");
      router.refresh();
    } catch (e) {
      setError(e instanceof HttpError ? e.message : "Gagal mengumpulkan. Coba lagi.");
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="lg" variant="default">Kumpulkan</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kumpulkan pekerjaan?</DialogTitle>
          <DialogDescription>
            Setelah dikumpulkan, jawaban terkunci dan tidak bisa diubah.
            {unanswered > 0 ? ` Masih ada ${unanswered} soal tanpa jawaban.` : ""}
          </DialogDescription>
        </DialogHeader>
        {error ? <Alert variant="destructive" role="alert"><AlertDescription>{error}</AlertDescription></Alert> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>Batal</Button>
          <Button variant="default" onClick={submit} disabled={pending || unanswered > 0}>{pending ? "Mengumpulkan…" : "Ya, kumpulkan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
