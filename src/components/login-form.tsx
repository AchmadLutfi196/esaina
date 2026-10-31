"use client";

import React, { useActionState, useState } from "react";
import { ArrowRight, Check, GraduationCap, Lock, Mail, Shield, User, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { loginWithCredentials } from "@/app/(auth)/login/actions";

const DEMO_ACCOUNTS = [
  {
    email: "teacher1@example.com",
    name: "Dra. Sri Wahyuni, M.Pd.",
    role: "Guru Biologi",
    desc: "Biologi & Kimia (Guru Pengampu)",
    icon: User,
    badge: "Guru Pengampu",
    badgeClass: "bg-bleu-ciel/25 text-brand border-bleu-ciel/60",
  },
  {
    email: "teacher2@example.com",
    name: "Budi Santoso, S.Pd.",
    role: "Guru Fisika",
    desc: "Fisika & Matematika (Guru Pengampu)",
    icon: User,
    badge: "Guru Pengampu",
    badgeClass: "bg-brand-tint text-brand border-brand-line/60",
  },
  {
    email: "student1@example.com",
    name: "Aisyah Putri Rahmadani",
    role: "Siswa Peserta",
    desc: "XI MIPA 1 (Mengerjakan Ujian)",
    icon: GraduationCap,
    badge: "Siswa Ujian",
    badgeClass: "bg-butter-yellow text-brand border-orange-pastel",
  },
  {
    email: "admin@example.com",
    name: "Administrator Sekolah",
    role: "Admin Sekolah",
    desc: "Manajemen Akun & Monitoring",
    icon: Shield,
    badge: "Admin",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-300",
  },
] as const;

export function LoginForm() {
  const [email, setEmail] = useState("teacher1@example.com");
  const [password, setPassword] = useState("password");
  const [activeTab, setActiveTab] = useState<string>("teacher1@example.com");
  const [state, formAction, isPending] = useActionState(loginWithCredentials, null);

  const handleSelectDemo = (accEmail: string) => {
    setActiveTab(accEmail);
    setEmail(accEmail);
    setPassword("password");
  };

  return (
    <div className="glass-panel flex w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/85 shadow-[0_24px_80px_rgba(10,22,128,0.16),inset_0_1px_2px_rgba(255,255,255,0.95)] md:flex-row">
      {/* Hero Panel (Left) */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#060E59] via-[#0A1680] to-[#0A1680] p-8 text-white sm:p-10 md:w-5/12">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-bleu-ciel/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-12 h-60 w-60 rounded-full bg-butter-yellow/15 blur-3xl"
        />

        <div className="relative z-10 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-md">
            <span className="font-heading text-xl font-extrabold text-white">E</span>
          </div>

          <div>
            <span className="inline-block rounded-full border border-bleu-ciel/40 bg-white/10 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-bleu-ciel">
              INCEPTION 2026 • Kopsudomar
            </span>
            <h1 className="mt-2 font-heading text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl">
              ESAINA
            </h1>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-bleu-ciel">
              Explainable Essay Assessment Platform
            </p>
          </div>

          <p className="text-xs leading-relaxed text-mist/90 sm:text-sm">
            Platform evaluasi esai akademik yang memadukan objektivitas rubrik kriteria ganda dengan analisis semantik NLP IndoBERT.
          </p>
        </div>

        <div className="relative z-10 mt-8 space-y-2.5">
          <div className="rounded-xl border border-white/15 bg-white/5 p-3 backdrop-blur-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Sparkles className="h-3.5 w-3.5 text-butter-yellow" />
              <span>Explainable by Design</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-mist">
              Rekomendasi nilai mesin selalu menyertakan kutipan bukti teks siswa, pemetaan rubrik, dan transparansi jejak audit.
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-mist">
            <span>Standar Desain Bleu Océan</span>
            <span className="font-bold text-emerald-300">WCAG AAA Compliance</span>
          </div>
        </div>
      </div>

      {/* Form Panel (Right) */}
      <div className="flex flex-1 flex-col justify-between gap-6 p-6 sm:p-10 md:w-7/12 bg-white/95 backdrop-blur-xl">
        <div className="space-y-4">
          <div>
            <span className="inline-block rounded-full border border-brand-line bg-brand-tint px-3 py-0.5 text-xs font-extrabold text-brand">
              Akses Cepat Demo
            </span>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Pilih Akun Sesuai Peran
            </h2>
            <p className="text-xs text-muted">
              Pilih salah satu profil di bawah untuk mengisi kredensial demo secara instan.
            </p>
          </div>

          {/* Quick Demo Role Cards Grid */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              const isSelected = activeTab === acc.email;
              return (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelectDemo(acc.email)}
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-xl border p-2.5 text-left transition-all",
                    isSelected
                      ? "border-brand bg-brand-tint/60 ring-2 ring-brand/20 shadow-xs"
                      : "border-line bg-white/70 hover:border-brand-line hover:bg-white"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                    isSelected ? "bg-brand text-white" : "bg-paper text-muted"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate text-xs font-bold text-ink">
                        {acc.role}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-brand shrink-0" />}
                    </div>
                    <p className="truncate text-[11px] font-medium text-brand">
                      {acc.name}
                    </p>
                    <p className="truncate text-[10px] text-muted">
                      {acc.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form action={formAction} className="space-y-3.5 pt-2 border-t border-line/60">
            {state?.error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 p-2.5 text-xs font-semibold text-rose-800"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{state.error}</span>
              </div>
            )}

            <Field label="Alamat Email Terdaftar">
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@sekolah.sch.id"
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="Kata Sandi">
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  type="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kata sandi akun"
                  className="pl-9"
                />
              </div>
            </Field>

            <Button
              type="submit"
              loading={isPending}
              className="mt-2 w-full gap-2 font-bold shadow-md"
            >
              <span>Masuk ke Ruang Kerja</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="rounded-xl border border-line/60 bg-paper/60 p-2.5 text-center text-[11px] text-muted">
          Kata sandi seluruh akun demo disetel ke:{" "}
          <strong className="text-brand font-mono font-bold">password</strong>
        </div>
      </div>
    </div>
  );
}
