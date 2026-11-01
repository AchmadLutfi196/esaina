"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api, HttpError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SubmitDialog({
  assessmentId,
  version,
  unanswered,
}: {
  assessmentId: string;
  version: number;
  unanswered: number;
}) {
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
      <DialogTrigger render={<Button size="lg" variant="solid" />}>Kumpulkan</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kumpulkan jawaban?</DialogTitle>
          <DialogDescription>
            Setelah dikumpulkan, jawaban tidak bisa diubah lagi.
          </DialogDescription>
        </DialogHeader>

        {unanswered > 0 ? (
          <Alert variant="destructive">
            <AlertDescription>
              Masih ada {unanswered} soal kosong. Soal kosong tidak dihitung nol, tetapi tidak bisa diisi lagi.
            </AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <DialogFooter>
          <Button
            variant="soft"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Periksa lagi
          </Button>
          <Button
            variant="solid"
            onClick={submit}
            disabled={pending}
          >
            {pending ? "Mengumpulkan…" : "Ya, kumpulkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
