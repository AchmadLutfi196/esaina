"use client";

import React, { useActionState } from "react";
import { ArrowRight, GraduationCap, Lock, Mail, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { loginWithCredentials } from "@/app/(auth)/login/actions";

const DEMO_ACCOUNTS = [
  {
    email: "teacher1@example.com",
    label: "Guru 1 (Lead)",
    icon: User,
    tone: "text-emerald-600",
  },
  {
    email: "student1@example.com",
    label: "Siswa (Peserta)",
    icon: GraduationCap,
    tone: "text-amber-600",
  },
  {
    email: "admin@example.com",
    label: "Admin",
    icon: Shield,
    tone: "text-purple-500",
  },
] as const;

export function LoginForm() {
  const [email, setEmail] = React.useState("teacher1@example.com");
  const [password, setPassword] = React.useState("password");
  const [state, formAction, isPending] = useActionState(loginWithCredentials, null);

  const handleDemoSelect = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password");
  };

  return (
    <div className="glass-panel flex w-full max-w-4xl flex-col overflow-hidden rounded-[24px] border border-white/85 shadow-[0_24px_80px_rgba(10,22,128,0.14),inset_0_1px_2px_rgba(255,255,255,0.95)] md:flex-row">
      {/* Hero panel */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-forest p-8 text-white sm:p-10 md:w-5/12">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-bleu-ciel/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-butter-yellow/20 blur-3xl"
        />

        <div className="relative z-10 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-md">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-7 w-7"
              aria-hidden="true"
            >
              <rect x="4" y="4" width="7" height="7" rx="3" fill="#93B2F8" />
              <rect x="13" y="4" width="7" height="7" rx="3" fill="#FBEDB0" />
              <rect x="4" y="13" width="7" height="7" rx="3" fill="#F1B94C" />
              <rect x="13" y="13" width="7" height="7" rx="3" fill="#FCFDFF" />
            </svg>
          </div>

          <h1 className="font-heading text-2xl leading-snug font-extrabold tracking-tight sm:text-3xl">
            Platform Penilaian Esai Multi-Rater
          </h1>
          <p className="text-sm leading-relaxed text-mist">
            Sistem asesmen esai kolaboratif terintegrasi dengan rubrik transparan,
            verifikasi konsensus multi-penilai, dan analitik AI IndoBERT.
          </p>
        </div>

        <div className="relative z-10 mt-10 space-y-3">
          <div className="rounded-xl border border-white/15 bg-white/5 p-3">
            <p className="text-[11px] leading-relaxed text-mist">
              <span className="font-bold text-white">Explainable by design.</span>{" "}
              Setiap skor dapat ditelusuri: kriteria rubrik, kutipan bukti, dan
              rekomendasi mesin tersimpan bersama nilainya.
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-8 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-mist">
          <span>Kurikulum &amp; Penilaian Mandiri</span>
          <span className="font-semibold text-emerald-300">Versi 2.0</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col justify-between gap-6 p-6 sm:p-10 md:w-7/12">
        <div className="space-y-2">
          <span className="inline-block rounded-full border border-brand-line/70 bg-brand-tint px-3 py-1 text-xs font-semibold text-brand">
            Masuk Akun
          </span>
          <h2 className="text-2xl font-bold text-ink">Pilih Akun Sesuai Peran</h2>
          <p className="text-xs text-muted">
            Silakan masukkan kredensial atau klik salah satu akun demo untuk
            mengisi formulir secara otomatis.
          </p>
        </div>

        <div className="space-y-2">
          <span className="block text-xs font-bold tracking-wider text-muted uppercase">
            Pilih Cepat Akun Demo
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {DEMO_ACCOUNTS.map(({ email: demoEmail, label, icon: Icon, tone }) => {
              const selected = email === demoEmail;
              return (
                <button
                  key={demoEmail}
                  type="button"
                  onClick={() => handleDemoSelect(demoEmail)}
                  aria-pressed={selected}
                  className={cn(
                    "flex cursor-pointer flex-col justify-between rounded-2xl border p-3 text-left transition-all duration-200",
                    selected
                      ? "border-forest bg-forest text-white shadow-md shadow-forest/20"
                      : "border-white/80 bg-white/70 text-ink-2 hover:bg-white hover:border-brand-line/50 hover:shadow-xs backdrop-blur-sm"
                  )}
                >
                  <span className="mb-1 flex items-center gap-1.5 text-xs font-bold">
                    <Icon className={cn("h-3.5 w-3.5", selected ? "text-white" : tone)} />
                    <span>{label}</span>
                  </span>
                  <span
                    className={cn(
                      "truncate text-[11px]",
                      selected ? "text-emerald-200" : "text-muted"
                    )}
                  >
                    {demoEmail}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {state?.error && (
          <div
            role="alert"
            className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2.5 text-[11px] font-medium text-rose-700"
          >
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <Field label="Email" htmlFor="email" required>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan alamat email…"
                className="pl-10 text-base"
              />
            </div>
          </Field>

          <Field label="Password" htmlFor="password" required>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password…"
                className="pl-10 text-base"
              />
            </div>
          </Field>

          <Button
            type="submit"
            size="lg"
            loading={isPending}
            className="w-full"
          >
            <span>Masuk ke Dasbor</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="pt-2 text-center text-xs text-muted">
          SMP / SMA Negeri • Sistem Penilaian Mandiri &amp; Kolaboratif
        </p>
      </div>
    </div>
  );
}
