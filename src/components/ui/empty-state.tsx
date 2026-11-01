import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps): React.ReactElement {
  return (
    <Card
      variant="inset"
      className={cn("items-center gap-2 px-6 py-10 text-center", className)}
    >
      {Icon && (
        <Icon
          className="size-8 text-[var(--muted-foreground)]"
          aria-hidden
        />
      )}
      <p className="text-base font-semibold">{title}</p>
      {description && (
        <p className="max-w-md text-sm text-[var(--muted-foreground)]">
          {description}
        </p>
      )}
      {action}
    </Card>
  );
}
