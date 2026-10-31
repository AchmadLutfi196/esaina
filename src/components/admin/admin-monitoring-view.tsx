"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  FileText,
  Scale,
  UserCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ASSESSMENT_STATUS_LABEL,
  GRADING_STATUS_LABEL,
  type Assessment,
} from "@/types";
import {
  CONSENSUS_WARNING_THRESHOLD,
  aggregateRaterScores,
  calculateSubmissionTotalScore,
} from "@/lib/scoring";

interface RaterAssignment {
  assessmentId: string;
  assessmentTitle: string;
  raterId: string;
  raterName: string;
}

export function AdminMonitoringView({
  assessments,
  raterAssignments,
}: {
  assessments: Assessment[];
  raterAssignments: RaterAssignment[];
}) {
  const [selectedId, setSelectedId] = useState(assessments[0]?.id ?? "");

  const selected =
    assessments.find((a) => a.id === selectedId) ?? assessments[0];

  // For MVP (single rater seed), derive per-answer spread from any ratings.
  const flagged = selected
    ? selected.submissions
        .map((sub) => {
          const totals = Object.values(sub.answers)
            .map((ans) => Object.values(ans.scores).reduce((a, b) => a + b, 0))
            .filter((v) => v >= 0);
          const agg = aggregateRaterScores(totals);
          return {
            sub,
            total: calculateSubmissionTotalScore(sub),
            spread: agg.range,
          };
        })
        .filter((row) => row.spread > CONSENSUS_WARNING_THRESHOLD)
    : [];

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div className="glass-panel flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-pastel bg-butter-yellow px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Monitoring Konsensus</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-brand sm:text-2xl">
            Monitoring Multi-Rater
          </h1>
          <p className="text-xs text-muted sm:text-sm">
            Pantau progres penilaian dan selisih skor antar penilai.
          </p>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="space-y-2">
          <span className="flex items-center gap-2 text-xs font-semibold text-muted">
            <FileText className="h-4 w-4" /> Total Asesmen
          </span>
          <span className="nums block text-3xl font-extrabold text-brand">
            {assessments.length}
          </span>
        </Card>
        <Card className="space-y-2">
          <span className="flex items-center gap-2 text-xs font-semibold text-muted">
            <Users className="h-4 w-4" /> Total Submission
          </span>
          <span className="nums block text-3xl font-extrabold text-brand">
            {assessments.reduce((s, a) => s + a.submissions.length, 0)}
          </span>
        </Card>
        <Card className="space-y-2">
          <span className="flex items-center gap-2 text-xs font-semibold text-muted">
            <UserCheck className="h-4 w-4" /> Penugasan Rater
          </span>
          <span className="nums block text-3xl font-extrabold text-brand">
            {raterAssignments.length}
          </span>
        </Card>
        <Card className="space-y-2 border-orange-pastel/40 bg-butter-yellow/40">
          <span className="flex items-center gap-2 text-xs font-semibold text-[#7A4C05]">
            <AlertTriangle className="h-4 w-4" /> Perlu Tinjauan
          </span>
          <span className="nums block text-3xl font-extrabold text-[#7A4C05]">
            {flagged.length}
          </span>
        </Card>
      </div>

      {/* Assessment selector */}
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-brand">
            Progres Penilaian per Asesmen
          </h2>
          <span className="rounded-full border border-brand-line/50 bg-brand-tint px-2.5 py-0.5 text-[11px] font-bold text-brand">
            Ambang selisih: {CONSENSUS_WARNING_THRESHOLD} poin
          </span>
        </div>

        <Table>
          <THead>
            <TR>
              <TH className="p-3">Asesmen</TH>
              <TH className="p-3">Kelas</TH>
              <TH className="p-3">Status</TH>
              <TH className="p-3 text-center">Rater</TH>
              <TH className="p-3 text-center">Terkumpul</TH>
              <TH className="p-3 text-center">Final</TH>
              <TH className="p-3">Progres</TH>
            </TR>
          </THead>
          <TBody>
            {assessments.map((a) => {
              const submitted = a.submissions.filter(
                (s) => s.statusWork === "submitted"
              ).length;
              const final_ = a.submissions.filter(
                (s) => s.statusGrading === "final"
              ).length;
              const progress =
                a.submissions.length > 0
                  ? Math.round((final_ / a.submissions.length) * 100)
                  : 0;
              const raters = raterAssignments.filter(
                (r) => r.assessmentId === a.id
              );

              return (
                <TR
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className={cn(
                    "cursor-pointer transition-colors",
                    a.id === selectedId && "bg-brand-tint/60"
                  )}
                >
                  <TD className="p-3">
                    <Link
                      href={`/assessments/${a.id}`}
                      className="font-semibold text-brand hover:underline"
                    >
                      {a.title}
                    </Link>
                    <span className="block text-[10px] text-muted">
                      {a.code} • {a.subject}
                    </span>
                  </TD>
                  <TD className="p-3 text-muted">{a.className}</TD>
                  <TD className="p-3">
                    <Badge status={ASSESSMENT_STATUS_LABEL[a.status]} />
                  </TD>
                  <TD className="nums p-3 text-center">
                    {raters.length || a.raterCount}
                  </TD>
                  <TD className="nums p-3 text-center">{submitted}</TD>
                  <TD className="nums p-3 text-center">{final_}</TD>
                  <TD className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="nums text-[10px] font-bold text-muted">
                        {progress}%
                      </span>
                    </div>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </Card>

      {/* Rater assignments for the selected assessment */}
      {selected && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-brand">
              Penilai — {selected.title}
            </h2>
            <Badge status={GRADING_STATUS_LABEL["final"]} />
          </div>

          {raterAssignments.filter((r) => r.assessmentId === selected.id)
            .length === 0 ? (
            <p className="py-4 text-center text-xs text-muted">
              Belum ada penilai tambahan yang ditugaskan.
            </p>
          ) : (
            <ul className="divide-y divide-line/30">
              {raterAssignments
                .filter((r) => r.assessmentId === selected.id)
                .map((r) => (
                  <li
                    key={`${r.assessmentId}-${r.raterId}`}
                    className="flex items-center justify-between py-2.5"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold text-brand">
                      <UserCheck className="h-3.5 w-3.5" />
                      {r.raterName}
                    </span>
                    <span className="text-[11px] text-muted">
                      Ditugaskan sebagai penilai
                    </span>
                  </li>
                ))}
            </ul>
          )}

          {flagged.length > 0 && (
            <div className="rounded-xl border border-orange-pastel/50 bg-butter-yellow/40 p-3">
              <p className="text-[11px] font-bold text-[#7A4C05]">
                ⚠ {flagged.length} jawaban memiliki selisih skor internal
                melebihi {CONSENSUS_WARNING_THRESHOLD} poin antara soal — perlu
                ditinjau.
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
