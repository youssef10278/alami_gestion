import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 shadow-sm",
        destructive:
          "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive))]/90 shadow-sm",
        outline:
          "border border-[hsl(var(--input))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] shadow-sm",
        secondary:
          "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary))]/80 shadow-sm",
        ghost: "hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]",
        link: "text-[hsl(var(--primary))] underline-offset-4 hover:underline",

        // === VARIANTES MÉTIER BUSINESS MODERNE ===
        sales: "bg-[var(--color-sales)] text-white hover:bg-[var(--color-success-green-dark)] shadow-sm transition-all duration-200",
        invoices: "bg-[var(--color-invoices)] text-white hover:bg-[var(--color-business-blue-dark)] shadow-sm transition-all duration-200",
        quotes: "bg-[var(--color-quotes)] text-white hover:opacity-90 shadow-sm transition-all duration-200",
        stock: "bg-[var(--color-stock)] text-white hover:opacity-90 shadow-sm transition-all duration-200",
        customers: "bg-[var(--color-customers)] text-white hover:opacity-90 shadow-sm transition-all duration-200",

        // Variantes outline pour modules
        "sales-outline": "border-2 border-[var(--color-sales)] text-[var(--color-sales)] bg-transparent hover:bg-[var(--color-sales)] hover:text-white transition-all duration-200",
        "invoices-outline": "border-2 border-[var(--color-invoices)] text-[var(--color-invoices)] bg-transparent hover:bg-[var(--color-invoices)] hover:text-white transition-all duration-200",
        "quotes-outline": "border-2 border-[var(--color-quotes)] text-[var(--color-quotes)] bg-transparent hover:bg-[var(--color-quotes)] hover:text-white transition-all duration-200",
        "stock-outline": "border-2 border-[var(--color-stock)] text-[var(--color-stock)] bg-transparent hover:bg-[var(--color-stock)] hover:text-white transition-all duration-200",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

