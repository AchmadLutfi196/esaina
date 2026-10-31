import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass-card p-5",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  actions,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { actions?: React.ReactNode }) {
  return (
    <div
      className={cn("mb-4 flex items-start justify-between gap-3", className)}
      {...props}
    >
      <div className="min-w-0">{children}</div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-sm font-bold tracking-tight text-ink", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-xs text-muted", className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-xs", className)} {...props} />;
}
