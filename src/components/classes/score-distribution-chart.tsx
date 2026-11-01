"use client";

import React, { useMemo, useState } from "react";
import { BarChart2, Info, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildDistribution,
  buildTrends,
  classStats,
  maxScoreOf,
  rawScoreOf,
  type DistributionBin,
  type TrendPoint,
} from "@/lib/class-analytics";
import type { Assessment, StudentSubmission } from "@/types";

type ChartView = "distribution" | "trend";

/** Angka desimal mengikuti kaidah Indonesia (koma). */
function formatDecimal(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");
}

function percentOf(submission: StudentSubmission, assessment: Assessment): number | null {
  const raw = rawScoreOf(submission);
  if (raw === null) return null;
  const max = maxScoreOf(assessment) || 100;
  return Math.round((raw / max) * 100);
}

export function ScoreDistributionChart({
  assessments,
  className,
}: {
  assessments: Assessment[];
  className?: string;
}) {
  const [view, setView] = useState<ChartView>("distribution");
  const [assessmentId, setAssessmentId] = useState<string>("all");
  const [activeBin, setActiveBin] = useState<DistributionBin | null>(null);

  const scoped = useMemo(
    () =>
      assessmentId === "all"
        ? assessments
        : assessments.filter((a) => a.id === assessmentId),
    [assessments, assessmentId]
  );

  const points = useMemo(() => {
    const rows: { name: string; percent: number }[] = [];
    for (const assessment of scoped) {
      for (const submission of assessment.submissions) {
        const percent = percentOf(submission, assessment);
        if (percent === null) continue;
        rows.push({
          name: assessmentId === "all" ? `${submission.studentName}` : submission.studentName,
          percent,
        });
      }
    }
    return rows;
  }, [scoped, assessmentId]);

  const bins = useMemo(() => buildDistribution(points), [points]);
  const stats = useMemo(() => classStats(points.map((p) => p.percent)), [points]);
  const trends = useMemo(() => buildTrends(scoped, percentOf), [scoped]);

  const maxCount = Math.max(1, ...bins.map((b) => b.count));
  const chartEmpty = points.length === 0;

  return (
    <section
      aria-labelledby="distribusi-skor-heading"
      className={cn("glass-panel space-y-4 p-5 sm:p-6", className)}
    >
      <header className="flex flex-col justify-between gap-3 border-b border-line/60 pb-3 sm:flex-row sm:items-center">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-bleu-ciel/30 p-1.5 text-brand">
              <BarChart2 className="h-4 w-4" aria-hidden />
            </span>
            <h3
              id="distribusi-skor-heading"
              className="text-sm font-bold uppercase tracking-wider text-brand"
            >
              Distribusi & Tren Skor Kelas
            </h3>
          </div>
          <p className="text-xs text-muted">
            Sebaran nilai esai siswa dan pergerakan antar-asesmen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="pilih-asesmen-analitik">
            Pilih asesmen untuk analitik
          </label>
          <select
            id="pilih-asesmen-analitik"
            value={assessmentId}
            onChange={(event) => {
              setAssessmentId(event.target.value);
              setActiveBin(null);
            }}
            className="max-w-[15rem] cursor-pointer rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-bold text-brand shadow-xs outline-none focus:border-brand"
          >
            <option value="all">Semua asesmen</option>
            {assessments.map((assessment) => (
              <option key={assessment.id} value={assessment.id}>
                {assessment.title}
              </option>
            ))}
          </select>

          <div
            role="group"
            aria-label="Mode grafik"
            className="flex items-center rounded-xl border border-line bg-paper p-0.5 text-xs"
          >
            {(
              [
                ["distribution", "Distribusi"],
                ["trend", "Tren Waktu"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={view === value}
                onClick={() => setView(value)}
                className={cn(
                  "cursor-pointer rounded-lg px-2.5 py-1 font-bold transition-all",
                  view === value
                    ? "bg-brand text-white shadow-xs"
                    : "text-muted hover:text-brand"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-2.5 rounded-xl border border-line/70 bg-white/75 p-3 sm:grid-cols-4">
        {[
          ["Rata-rata Kelas", stats.mean === null ? "—" : formatDecimal(stats.mean)],
          ["Ketuntasan (≥70)", stats.passRate === null ? "—" : `${stats.passRate}%`],
          ["Skor Tertinggi", stats.highest ?? "—"],
          ["Skor Terendah", stats.lowest ?? "—"],
        ].map(([label, value], index) => (
          <div
            key={label as string}
            className={cn(
              "px-2",
              index < 3 && "sm:border-r sm:border-line/50",
              index === 0 && "border-r border-line/50"
            )}
          >
            <dt className="block text-[11px] text-muted">{label}</dt>
            <dd className="nums text-lg font-extrabold text-brand">{value}</dd>
          </div>
        ))}
      </dl>

      {chartEmpty ? (
        <div
          role="status"
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-white/60 px-4 py-10 text-center"
        >
          <BarChart2 className="h-6 w-6 text-brand/40" aria-hidden />
          <p className="text-xs font-bold text-brand">Belum ada nilai untuk dianalisis</p>
          <p className="max-w-sm text-[11px] text-muted">
            Sebaran akan muncul otomatis setelah guru menyimpan draf atau memfinalkan nilai LJK
            siswa pada asesmen kelas ini.
          </p>
        </div>
      ) : view === "distribution" ? (
        <div className="space-y-3">
          <div
            className="flex h-52 items-end justify-between gap-2 sm:gap-4"
            role="img"
            aria-label={`Grafik distribusi skor, ${stats.gradedCount} nilai dari ${points.length} data`}
          >
            {bins.map((bin) => {
              const height = bin.count === 0 ? 4 : Math.max(12, (bin.count / maxCount) * 100);
              const isActive = activeBin?.range === bin.range;
              return (
                <button
                  key={bin.range}
                  type="button"
                  onMouseEnter={() => setActiveBin(bin)}
                  onMouseLeave={() => setActiveBin(null)}
                  onFocus={() => setActiveBin(bin)}
                  onBlur={() => setActiveBin(null)}
                  aria-label={`Rentang ${bin.range}: ${bin.count} siswa`}
                  className="group flex h-full flex-1 cursor-pointer flex-col justify-end gap-1.5 rounded-lg outline-none"
                >
                  <span className="nums text-center text-[11px] font-bold text-brand">
                    {bin.count}
                  </span>
                  <span
                    style={{ height: `${height}%` }}
                    className={cn(
                      "w-full rounded-t-md border transition-all group-focus-visible:ring-2 group-focus-visible:ring-brand/50 group-focus-visible:ring-offset-2",
                      isActive
                        ? "border-accent bg-accent"
                        : "border-brand bg-gradient-to-b from-brand to-bleu-ciel/80 group-focus-visible:border-accent group-focus-visible:from-accent group-focus-visible:to-accent"
                    )}
                  />
                  <span className="nums text-center text-[10px] font-semibold text-muted">
                    {bin.range}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="min-h-[3.25rem] rounded-xl border border-line/60 bg-white/70 p-2.5 text-[11px]">
            {activeBin ? (
              <div className="space-y-1">
                <p className="font-bold text-brand">
                  Rentang {activeBin.range} · {activeBin.count} siswa
                </p>
                {activeBin.count === 0 ? (
                  <p className="text-muted">Tidak ada siswa pada rentang ini.</p>
                ) : (
                  <ul className="flex flex-wrap gap-1">
                    {activeBin.students.map((student, index) => (
                      <li
                        key={`${student.name}-${index}`}
                        className="rounded border border-line bg-paper px-1.5 py-0.5 text-[10px] text-brand"
                      >
                        {student.name} ({student.score})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="text-muted">
                Arahkan kursor atau fokuskan salah satu balok untuk melihat daftar siswa per
                rentang skor.
              </p>
            )}
          </div>
        </div>
      ) : (
        <TrendChart trends={trends} />
      )}

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-2 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden />
          <span>
            {view === "distribution"
              ? "Skor dinormalisasi ke 0–100 berdasarkan total skor maksimum rubrik."
              : "Garis menampilkan rerata kelas; titik menandai nilai terendah & tertinggi."}
          </span>
        </span>
      </footer>
    </section>
  );
}

function TrendChart({ trends }: { trends: TrendPoint[] }) {
  if (trends.length === 0) {
    return (
      <p
        role="status"
        className="rounded-xl border border-dashed border-line bg-white/60 px-4 py-10 text-center text-xs text-muted"
      >
        Belum ada asesmen dengan nilai untuk membentuk tren.
      </p>
    );
  }

  const width = 320;
  const height = 150;
  const padX = 24;
  const padY = 18;
  const stepX = trends.length > 1 ? (width - padX * 2) / (trends.length - 1) : 0;
  const toY = (value: number) =>
    height - padY - (Math.min(100, Math.max(0, value)) / 100) * (height - padY * 2);
  const coords = trends.map((trend, index) => ({
    ...trend,
    x: trends.length > 1 ? padX + index * stepX : width / 2,
    y: toY(trend.average),
    yHigh: toY(trend.highest),
    yLow: toY(trend.lowest),
  }));
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-48 w-full"
        role="img"
        aria-label="Grafik tren rerata nilai per asesmen"
      >
        {[0, 25, 50, 75, 100].map((tick) => (
          <g key={tick}>
            <line
              x1={padX}
              x2={width - padX}
              y1={toY(tick)}
              y2={toY(tick)}
              stroke="currentColor"
              className="text-line/70"
              strokeDasharray="3 3"
            />
            <text
              x={4}
              y={toY(tick) + 3}
              className="fill-current text-[8px] text-muted"
              style={{ fill: "var(--color-muted)" }}
            >
              {tick}
            </text>
          </g>
        ))}

        <path d={path} fill="none" stroke="var(--color-brand)" strokeWidth={2.5} />

        {coords.map((c) => (
          <g key={c.label}>
            <line
              x1={c.x}
              x2={c.x}
              y1={c.yHigh}
              y2={c.yLow}
              stroke="var(--color-bleu-ciel)"
              strokeWidth={2}
              strokeDasharray="2 2"
            />
            <circle cx={c.x} cy={c.yLow} r={3} fill="var(--color-bleu-ciel)" />
            <circle cx={c.x} cy={c.yHigh} r={3} fill="var(--color-accent)" />
            <circle
              cx={c.x}
              cy={c.y}
              r={5}
              fill="var(--color-brand)"
              stroke="var(--color-surface)"
              strokeWidth={2}
            />
            <text
              x={c.x}
              y={c.y - 9}
              textAnchor="middle"
              className="nums text-[9px] font-bold"
              style={{ fill: "var(--color-brand)" }}
            >
              {formatDecimal(c.average)}
            </text>
          </g>
        ))}
      </svg>

      <ul className="grid gap-1 sm:grid-cols-2">
        {coords.map((c) => (
          <li
            key={`legend-${c.label}`}
            className="flex items-center justify-between gap-2 rounded-lg border border-line/60 bg-white/70 px-2 py-1 text-[10px] text-muted"
          >
            <span className="line-clamp-1 font-semibold text-brand">{c.label}</span>
            <span className="nums shrink-0">
              {c.lowest}–{c.highest} · {c.count} LJK
            </span>
          </li>
        ))}
      </ul>

      <p className="flex items-center gap-1.5 text-[11px] text-muted">
        <TrendingUp className="h-3.5 w-3.5 text-brand" aria-hidden />
        Rerata kelas bergerak dari asesmen terlama ke terbaru.
      </p>
    </div>
  );
}
