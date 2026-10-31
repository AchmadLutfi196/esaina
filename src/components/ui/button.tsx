import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "accent"
  | "outline"
  | "glass";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-brand to-[#0e1d96] text-white shadow-sm shadow-brand/25 hover:from-brand-dark hover:to-brand hover:shadow-md hover:shadow-brand/35 active:scale-[0.98] disabled:opacity-50",
  secondary:
    "bg-brand-tint/80 text-brand border border-brand-line/60 hover:bg-brand-tint backdrop-blur-sm active:scale-[0.98]",
  glass:
    "glass-button text-brand hover:text-brand-dark active:scale-[0.98]",
  ghost:
    "text-muted hover:bg-white/70 hover:text-ink active:scale-[0.98]",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20 active:scale-[0.98]",
  accent:
    "bg-accent text-accent-ink shadow-sm shadow-accent/30 hover:bg-accent-dark hover:text-white active:scale-[0.98]",
  outline:
    "border border-line-2/80 bg-white/70 backdrop-blur-sm text-ink-2 hover:bg-white hover:border-brand-line active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-xs gap-2 rounded-xl",
  lg: "h-12 px-6 text-sm gap-2 rounded-xl",
  icon: "h-9 w-9 rounded-lg",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, children, disabled, ...props },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center font-bold transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  )
);
Button.displayName = "Button";
