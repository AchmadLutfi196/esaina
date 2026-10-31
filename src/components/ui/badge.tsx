import * as React from "react";
import { cn } from "@/lib/utils";

type Tone =
  | "neutral"
  | "draft"
  | "active"
  | "submitted"
  | "final"
  | "ai"
  | "warning"
  | "success"
  | "danger";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-[#FCFDFF] text-muted border-line",
  draft: "bg-paper text-muted border-line",
  active: "bg-brand-line/30 text-brand border-brand-line",
  submitted: "bg-butter-yellow text-brand border-orange-pastel",
  final: "bg-brand-line/40 text-brand border-brand/30 font-semibold",
  ai: "bg-butter-yellow text-brand border-orange-pastel font-semibold",
  warning: "bg-orange-pastel/25 text-brand border-orange-pastel",
  success: "bg-ok-bg text-ok-ink border-ok-ink/30",
  danger: "bg-rose-50 text-rose-700 border-rose-300",
};

/** Maps any domain status string to a visual tone. */
export function toneForStatus(status: string): Tone {
  const s = status.toLowerCase();
  if (s.includes("aktif") || s.includes("dibuka") || s.includes("terbit") || s.includes("memeriksa"))
    return "active";
  if (s.includes("kumpul") || s.includes("submitted")) return "submitted";
  if (s.includes("final") || s.includes("selesai") || s.includes("completed")) return "final";
  if (s.includes("ai") || s.includes("indobert")) return "ai";
  if (s.includes("tutup") || s.includes("inactive") || s.includes("terlambat")) return "warning";
  if (s.includes("draf") || s.includes("belum") || s.includes("draft")) return "draft";
  return "neutral";
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  status?: string;
}

export function Badge({ className, tone, status, children, ...props }: BadgeProps) {
  const resolvedTone = tone ?? (status ? toneForStatus(status) : "neutral");
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        toneStyles[resolvedTone],
        className
      )}
      {...props}
    >
      {children ?? status}
    </span>
  );
}
