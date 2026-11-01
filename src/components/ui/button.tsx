import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "default"
  | "secondary"
  | "ghost"
  | "danger"
  | "destructive"
  | "accent"
  | "outline"
  | "glass"
  | "liquid"
  | "link";

export type ButtonSize = "sm" | "md" | "default" | "lg" | "icon";

const variantStyles: Record<string, string> = {
  primary:
    "bg-gradient-to-r from-brand to-[#0e1d96] text-white shadow-sm shadow-brand/25 hover:from-brand-dark hover:to-brand hover:shadow-md hover:shadow-brand/35 active:scale-[0.98] disabled:opacity-50",
  default:
    "bg-gradient-to-r from-brand to-[#0e1d96] text-white shadow-sm shadow-brand/25 hover:from-brand-dark hover:to-brand hover:shadow-md hover:shadow-brand/35 active:scale-[0.98] disabled:opacity-50",
  secondary:
    "bg-brand-tint/80 text-brand border border-brand-line/60 hover:bg-brand-tint backdrop-blur-sm active:scale-[0.98]",
  glass:
    "glass-panel text-brand border border-brand-line/50 hover:bg-white active:scale-[0.98]",
  liquid:
    "glass-panel text-brand border border-brand-line/50 hover:bg-white active:scale-[0.98]",
  ghost:
    "text-muted hover:bg-white/70 hover:text-ink active:scale-[0.98]",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20 active:scale-[0.98]",
  destructive:
    "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20 active:scale-[0.98]",
  accent:
    "bg-accent text-accent-ink shadow-sm shadow-accent/30 hover:bg-accent-dark hover:text-white active:scale-[0.98]",
  outline:
    "border border-line-2/80 bg-white/70 backdrop-blur-sm text-ink-2 hover:bg-white hover:border-brand-line active:scale-[0.98]",
  link:
    "text-primary underline-offset-4 hover:underline",
};

const sizeStyles: Record<string, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-xs gap-2 rounded-xl",
  default: "h-10 px-4 text-xs gap-2 rounded-xl",
  lg: "h-12 px-6 text-sm gap-2 rounded-xl",
  icon: "h-9 w-9 rounded-lg p-0",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      asChild = false,
      loading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const vKey = variant || "primary";
    const sKey = size || "md";

    return (
      <Comp
        ref={ref as any}
        disabled={disabled || loading}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center font-bold transition-all duration-200",
          "disabled:cursor-not-allowed disabled:opacity-60",
          variantStyles[vKey] || variantStyles.primary,
          sizeStyles[sKey] || sizeStyles.default,
          className
        )}
        {...props}
      >
        {loading && (
          <span
            aria-hidden
            className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        )}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export const buttonVariants = () => "";
