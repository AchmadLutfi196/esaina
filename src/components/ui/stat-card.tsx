import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardTone = "default" | "success" | "warning";

const toneClassName: Record<StatCardTone, string> = {
  default: "text-[var(--foreground)]",
  success: "text-[color:var(--success)]",
  warning: "text-[color:var(--warning)]",
};

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: LucideIcon;
  tone?: StatCardTone;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: StatCardProps): React.ReactElement {
  return (
    <Card
      variant="raised"
      role="group"
      aria-label={label}
      className="gap-1 px-5 py-4"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          {label}
        </span>
        {Icon && (
          <Icon
            className="size-4 shrink-0 text-[var(--muted-foreground)]"
            aria-hidden
          />
        )}
      </div>
      <p
        className={cn(
          "text-2xl font-semibold leading-tight tabular-nums",
          toneClassName[tone],
        )}
      >
        {value}
      </p>
      {hint && (
        <p className="text-xs leading-snug text-[var(--muted-foreground)]">
          {hint}
        </p>
      )}
    </Card>
  );
}
