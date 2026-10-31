"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        aria-label="Tutup dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#060E59]/40 backdrop-blur-md transition-opacity duration-300"
      />
      <div
        className={cn(
          "animate-fade-up relative z-10 w-full max-w-lg rounded-[22px] border border-white/95 bg-white/92 p-6 shadow-[0_24px_80px_rgba(10,22,128,0.22),inset_0_1px_2px_rgba(255,255,255,1)] backdrop-blur-2xl",
          className
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight text-ink">{title}</h2>
            {description && (
              <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="cursor-pointer rounded-xl p-1.5 text-muted transition-colors hover:bg-white hover:text-ink hover:shadow-xs"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="text-xs">{children}</div>

        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
