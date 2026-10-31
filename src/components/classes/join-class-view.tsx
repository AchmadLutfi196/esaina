"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, KeyRound, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Field } from "@/components/ui/input";

export function JoinClassView() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Masukkan kode kelas terlebih dahulu.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classCode: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal bergabung ke kelas.");
        setLoading(false);
        return;
      }
      router.push(`/classes/${data.classId}`);
      router.refresh();
    } catch (err: any) {
      setError("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up mx-auto max-w-lg space-y-6 pt-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand shadow-md">
          <GraduationCap className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-brand">
          Gabung Kelas
        </h1>
        <p className="mt-1 text-sm text-muted">
          Masukkan kode kelas yang diberikan oleh guru Anda untuk bergabung
          ke ruang kelas.
        </p>
      </div>

      <Card className="space-y-5 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Kode Kelas"
            htmlFor="class-code"
            required
            hint="Contoh: BIO-XI-882"
            error={error ?? undefined}
          >
            <div className="relative">
              <KeyRound className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                id="class-code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="Masukkan kode kelas..."
                className="pl-10 font-mono text-base tracking-wider"
                autoFocus
              />
            </div>
          </Field>

          <Button type="submit" className="w-full" loading={loading}>
            <span>Gabung Kelas</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-start gap-2 rounded-xl border border-brand-line/40 bg-brand-tint/60 p-3 text-[11px] font-semibold text-brand">
          <Info className="h-4 w-4 shrink-0 text-brand mt-0.5" />
          <p>
            Kode kelas dapat berbeda dari kode asesmen. Jika Anda tidak
            yakin, tanyakan kepada guru Anda.
          </p>
        </div>
      </Card>
    </div>
  );
}
