"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn, formatDueDate } from "@/lib/utils";
import {
  ASSESSMENT_STATUS_LABEL,
  type Assessment,
} from "@/types";

export function GradingIndexView({
  assessments = [],
}: {
  assessments: Assessment[];
}) {
  const pending = (assessments || [])
    .map((a) => {
      const submissions = Array.isArray(a?.submissions) ? a.submissions : [];
      const submitted = submissions.filter(
        (s) => s?.statusWork === "submitted"
      );
      const ungraded = submitted.filter(
        (s) => s?.statusGrading !== "final"
      );
      return {
        assessment: a,
        submitted: submitted.length,
        ungraded: ungraded.length,
        totalStudents: submissions.length,
      };
    })
    .sort((a, b) => b.ungraded - a.ungraded);

  const totalPending = pending.reduce((s, p) => s + p.ungraded, 0);

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div className="glass-panel flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-pastel bg-butter-yellow px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ruang Penilaian</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-brand sm:text-2xl">
            Penilaian Esai
          </h1>
          <p className="text-xs text-muted sm:text-sm">
            Pilih asesmen untuk mulai menilai jawaban siswa dengan rubrik
            transparan dan rekomendasi AI.
          </p>
        </div>

        <div className="shrink-0 rounded-2xl border border-brand-line/50 bg-brand-tint px-4 py-3 text-center">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">
            Menunggu Dinilai
          </span>
          <span className="nums block text-2xl font-extrabold text-brand">
            {totalPending}
          </span>
        </div>
      </div>

      {/* Pending queue */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-brand">Antrean Penilaian</h2>

        {pending.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-line" />
            <p className="text-sm font-semibold text-ink">
              Tidak ada jawaban menunggu penilaian
            </p>
            <p className="mt-1 text-xs text-muted">
              Semua jawaban siswa telah dinilai atau belum ada yang terkumpul.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pending.map(({ assessment: a, submitted, ungraded, totalStudents }) => (
              <Card key={a.id} className="flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md border border-brand-line/70 bg-brand-tint px-2 py-0.5 font-mono text-[10px] font-bold text-brand">
                      {a.code}
                    </span>
                    <Badge status={a?.status ? ASSESSMENT_STATUS_LABEL[a.status] : "Aktif"} />
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-brand">
                    {a.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted">
                    {a.subject} • {a.className}
                  </p>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="rounded-lg bg-paper p-2">
                      <span className="block font-bold text-brand">
                        {totalStudents}
                      </span>
                      <span className="text-muted">Siswa</span>
                    </div>
                    <div className="rounded-lg bg-bleu-ciel/20 p-2">
                      <span className="block font-bold text-brand">
                        {submitted}
                      </span>
                      <span className="text-muted">Terkumpul</span>
                    </div>
                    <div
                      className={cn(
                        "rounded-lg p-2",
                        ungraded > 0 ? "bg-butter-yellow" : "bg-emerald-50"
                      )}
                    >
                      <span className="block font-bold text-brand">
                        {ungraded}
                      </span>
                      <span className="text-muted">Pending</span>
                    </div>
                  </div>

                  <p className="mt-2.5 flex items-center gap-1 text-[11px] text-muted">
                    <Clock className="h-3 w-3" /> Tenggat:{" "}
                    {formatDueDate(a.dueDate)}
                  </p>
                </div>

                <Link href={`/grading/${a.id}`}>
                  <span className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-dark">
                    <Sparkles className="h-3.5 w-3.5 text-butter-yellow" />
                    Buka Ruang Penilaian
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
