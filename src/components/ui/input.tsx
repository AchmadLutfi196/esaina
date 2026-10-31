import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-xl border border-line-2 bg-white/85 px-3 py-2.5 text-xs font-medium text-ink shadow-[0_2px_6px_rgba(10,22,128,0.02)] backdrop-blur-sm transition-all duration-200 placeholder:text-muted/70 hover:border-brand-line/60 focus:bg-white focus:shadow-[0_4px_16px_rgba(10,22,128,0.06)] focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand-line/50 focus-visible:outline-none disabled:bg-paper/70 disabled:text-muted";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(base, className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(base, "leading-relaxed", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn(base, "cursor-pointer", className)} {...props} />
));
Select.displayName = "Select";

export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold text-ink-2"
      >
        {label}
        {required && <span className="ml-0.5 text-rose-600">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-muted">{hint}</p>}
      {error && (
        <p role="alert" className="text-[11px] font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
