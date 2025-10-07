import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-[hsl(var(--foreground))]",
  {
    variants: {
      variant: {
        default: "bg-[hsl(var(--background))] text-[hsl(var(--foreground))] border-[hsl(var(--border))]",
        
        // === ALERTES SÉMANTIQUES BUSINESS MODERNE ===
        success: 
          "border-[var(--color-success-green)]/20 bg-[var(--color-success-green)]/5 text-[var(--color-success-green)] [&>svg]:text-[var(--color-success-green)]",
        warning: 
          "border-[var(--color-quotes)]/20 bg-[var(--color-quotes)]/5 text-[var(--color-quotes)] [&>svg]:text-[var(--color-quotes)]",
        error: 
          "border-[var(--color-alert-red)]/20 bg-[var(--color-alert-red)]/5 text-[var(--color-alert-red)] [&>svg]:text-[var(--color-alert-red)]",
        info: 
          "border-[var(--color-business-blue)]/20 bg-[var(--color-business-blue)]/5 text-[var(--color-business-blue)] [&>svg]:text-[var(--color-business-blue)]",
        
        // === ALERTES PAR MODULE ===
        sales: 
          "border-[var(--color-sales)]/20 bg-[var(--color-sales)]/5 text-[var(--color-sales)] [&>svg]:text-[var(--color-sales)]",
        invoices: 
          "border-[var(--color-invoices)]/20 bg-[var(--color-invoices)]/5 text-[var(--color-invoices)] [&>svg]:text-[var(--color-invoices)]",
        quotes: 
          "border-[var(--color-quotes)]/20 bg-[var(--color-quotes)]/5 text-[var(--color-quotes)] [&>svg]:text-[var(--color-quotes)]",
        stock: 
          "border-[var(--color-stock)]/20 bg-[var(--color-stock)]/5 text-[var(--color-stock)] [&>svg]:text-[var(--color-stock)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

// === COMPOSANTS D'ALERTE PRÉDÉFINIS ===

interface AlertWithIconProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  variant?: VariantProps<typeof alertVariants>["variant"]
}

const SuccessAlert = React.forwardRef<HTMLDivElement, AlertWithIconProps>(
  ({ title = "Succès", description, className, ...props }, ref) => (
    <Alert ref={ref} variant="success" className={className} {...props}>
      <CheckCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  )
)
SuccessAlert.displayName = "SuccessAlert"

const ErrorAlert = React.forwardRef<HTMLDivElement, AlertWithIconProps>(
  ({ title = "Erreur", description, className, ...props }, ref) => (
    <Alert ref={ref} variant="error" className={className} {...props}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  )
)
ErrorAlert.displayName = "ErrorAlert"

const WarningAlert = React.forwardRef<HTMLDivElement, AlertWithIconProps>(
  ({ title = "Attention", description, className, ...props }, ref) => (
    <Alert ref={ref} variant="warning" className={className} {...props}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  )
)
WarningAlert.displayName = "WarningAlert"

const InfoAlert = React.forwardRef<HTMLDivElement, AlertWithIconProps>(
  ({ title = "Information", description, className, ...props }, ref) => (
    <Alert ref={ref} variant="info" className={className} {...props}>
      <Info className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  )
)
InfoAlert.displayName = "InfoAlert"

export { 
  Alert, 
  AlertTitle, 
  AlertDescription,
  SuccessAlert,
  ErrorAlert,
  WarningAlert,
  InfoAlert,
  alertVariants 
}
