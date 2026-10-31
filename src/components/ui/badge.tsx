import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { liquidProps, resolveVariant, type LiquidProps } from "@/lib/liquid-glass/material"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        liquid: "text-foreground",
        default:
          "border border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "border text-foreground",
        success: "border border-transparent bg-emerald-100/80 text-emerald-900 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-200",
        warning: "border border-transparent bg-amber-100/80 text-amber-900 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-200",
      },
    },
    defaultVariants: {
      variant: "liquid",
    },
  }
)

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, LiquidProps {
  variant?: BadgeVariant | null
}

function Badge({ className, variant, material, tint, glass, webgl, style, ...props }: BadgeProps) {
  const v = resolveVariant<BadgeVariant>(variant ?? undefined, material)
  const lg = v.variant === "liquid" ? liquidProps({ role: "inline", material: v.material, tint, glass, webgl }) : null
  return (
    <div
      {...lg}
      className={cn(badgeVariants({ variant: v.variant }), lg?.className, className)}
      style={{ ...lg?.style, ...style }}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

