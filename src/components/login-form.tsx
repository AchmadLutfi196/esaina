"use client";

import React, { useActionState, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { loginWithCredentials } from "@/app/(auth)/login/actions";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(loginWithCredentials, null);

  return (
    <div className="glass-panel flex w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/85 shadow-[0_24px_80px_rgba(10,22,128,0.16),inset_0_1px_2px_rgba(255,255,255,0.95)] md:flex-row">
      {/* Hero Branding Panel (Left) */}
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
          <div className="inline-flex items-center rounded-2xl border border-white/20 bg-white/95 p-2.5 shadow-lg backdrop-blur-md">
            <img
              src="/brand/esaina-logo.png"
              alt="ESAINA"
              className="h-8 w-auto object-contain"
            />
          </div>

          <div>
            <span className="inline-block rounded-full border border-bleu-ciel/40 bg-white/10 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-bleu-ciel">
              Platform Asesmen Esai Cerdas
            </span>
            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-bleu-ciel">
              Explainable Essay Assessment Platform
            </p>
          </div>

          <p className="text-xs leading-relaxed text-mist/90 sm:text-sm">
            Sistem evaluasi esai akademik yang memadukan objektivitas rubrik kriteria ganda dengan analisis semantik NLP IndoBERT untuk penilaian yang adil, cepat, dan transparan.
          </p>
        </div>

        <div className="relative z-10 mt-8 space-y-2.5">
          <div className="rounded-xl border border-white/15 bg-white/5 p-3 backdrop-blur-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Sparkles className="h-3.5 w-3.5 text-butter-yellow" />
              <span>Explainable AI by Design</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-mist">
              Setiap rekomendasi nilai menyertakan kutipan bukti teks siswa, pemetaan rubrik, serta transparansi jejak audit bagi guru.
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-mist">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              <span>Enkripsi Sesi TLS 1.3</span>
            </span>
            <span className="font-bold text-emerald-300">Standar Aksesibilitas WCAG</span>
          </div>
        </div>
      </div>

      {/* Production Form Panel (Right) */}
      <div className="flex flex-1 flex-col justify-between gap-6 bg-white/95 p-6 backdrop-blur-xl sm:p-10 md:w-7/12">
        <div className="space-y-4">
          <div>
            <span className="inline-block rounded-full border border-brand-line bg-brand-tint px-3 py-0.5 text-xs font-extrabold text-brand">
              Portal Akses Pengguna
            </span>
            <h1 className="mt-2 text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Masuk ke Ruang Kerja
            </h1>
            <p className="text-xs text-muted">
              Masukkan alamat email terdaftar dan kata sandi institusi Anda untuk memulai.
            </p>
          </div>

          {/* Form Login */}
          <form action={formAction} className="space-y-3.5 pt-1">
            {state?.error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-semibold text-rose-800"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{state.error}</span>
              </div>
            )}

            <Field label="Alamat Email">
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@sekolah.sch.id"
                  className="pl-9 text-xs"
                />
              </div>
            </Field>

            <Field label="Kata Sandi">
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="pl-9 pr-9 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted transition-colors hover:text-brand"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Field>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-muted select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-line text-brand focus:ring-brand"
                />
                <span>Ingat saya di perangkat ini</span>
              </label>

              <button
                type="button"
                onClick={() => setForgotPasswordOpen(true)}
                className="font-bold text-brand transition-colors hover:underline"
              >
                Lupa kata sandi?
              </button>
            </div>

            <Button
              type="submit"
              loading={isPending}
              className="mt-3 w-full gap-2 font-bold shadow-md cursor-pointer"
            >
              <span>Masuk ke Akun</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Help & Support Info */}
          <div className="pt-4 border-t border-line/60 flex items-center justify-between text-[11px] text-muted">
            <span>Mengalami kendala masuk?</span>
            <button
              type="button"
              onClick={() => setForgotPasswordOpen(true)}
              className="font-semibold text-brand hover:underline cursor-pointer"
            >
              Bantuan Masuk
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <p className="text-center text-[10px] text-muted">
          Platform ESAINA © 2026 · Hak Cipta Dilindungi Undang-Undang
        </p>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        title="Lupa Kata Sandi Akun"
        description="Tata cara pemulihan akses akun institusi."
      >
        <div className="space-y-3 py-2 text-xs leading-relaxed text-muted">
          <p>
            Untuk menjaga integritas dan keamanan penilaian esai, pemulihan akun dilakukan secara terpusat oleh institusi pendidikan.
          </p>
          <div className="rounded-xl border border-line/70 bg-paper/80 p-3 space-y-1.5 text-[11px]">
            <p className="font-bold text-brand">Langkah Pemulihan Akses:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Hubungi Staf IT atau Administrator Sekolah Anda.</li>
              <li>Sertakan alamat email resmi dan Nomor Induk Pegawai/Siswa (NIP/NISN).</li>
              <li>Administrator akan menerbitkan tautan pemulihan kata sandi baru ke email Anda.</li>
            </ol>
          </div>
          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => setForgotPasswordOpen(false)}>
              Mengerti
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
