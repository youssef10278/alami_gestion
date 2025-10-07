import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/80",
        secondary:
          "border-transparent bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary))]/80",
        destructive:
          "border-transparent bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive))]/80",
        outline: "text-[hsl(var(--foreground))] border-[hsl(var(--border))]",

        // === BADGES SÉMANTIQUES BUSINESS MODERNE ===
        success:
          "border-transparent bg-[var(--color-success-green)] text-white hover:bg-[var(--color-success-green-dark)]",
        warning:
          "border-transparent bg-[var(--color-quotes)] text-white hover:opacity-90",
        error:
          "border-transparent bg-[var(--color-alert-red)] text-white hover:bg-[var(--color-alert-red-dark)]",
        info:
          "border-transparent bg-[var(--color-business-blue)] text-white hover:bg-[var(--color-business-blue-dark)]",

        // === BADGES DE STATUT MÉTIER ===
        completed:
          "border-transparent bg-[var(--color-success-green)]/10 text-[var(--color-success-green)] border-[var(--color-success-green)]/20 font-medium",
        pending:
          "border-transparent bg-[var(--color-quotes)]/10 text-[var(--color-quotes)] border-[var(--color-quotes)]/20 font-medium",
        cancelled:
          "border-transparent bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border-[var(--color-alert-red)]/20 font-medium",
        draft:
          "border-transparent bg-[var(--color-neutral-medium)]/10 text-[var(--color-neutral-medium)] border-[var(--color-neutral-medium)]/20 font-medium",

        // === BADGES PAR MODULE ===
        sales:
          "border-transparent bg-[var(--color-sales)]/10 text-[var(--color-sales)] border-[var(--color-sales)]/20",
        invoices:
          "border-transparent bg-[var(--color-invoices)]/10 text-[var(--color-invoices)] border-[var(--color-invoices)]/20",
        quotes:
          "border-transparent bg-[var(--color-quotes)]/10 text-[var(--color-quotes)] border-[var(--color-quotes)]/20",
        stock:
          "border-transparent bg-[var(--color-stock)]/10 text-[var(--color-stock)] border-[var(--color-stock)]/20",
        customers:
          "border-transparent bg-[var(--color-customers)]/10 text-[var(--color-customers)] border-[var(--color-customers)]/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

