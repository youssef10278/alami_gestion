import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckCircle, Clock, XCircle, AlertTriangle, Circle, Pause } from "lucide-react"

import { cn } from "@/lib/utils"

// === INDICATEURS DE STATUT BUSINESS MODERNE ===

const statusIndicatorVariants = cva(
  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
  {
    variants: {
      status: {
        // === STATUTS GÉNÉRIQUES ===
        completed: "bg-[var(--color-success-green)]/10 text-[var(--color-success-green)] border border-[var(--color-success-green)]/20",
        pending: "bg-[var(--color-quotes)]/10 text-[var(--color-quotes)] border border-[var(--color-quotes)]/20",
        cancelled: "bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border border-[var(--color-alert-red)]/20",
        draft: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]",
        active: "bg-[var(--color-business-blue)]/10 text-[var(--color-business-blue)] border border-[var(--color-business-blue)]/20",
        inactive: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]",
        
        // === STATUTS DE VENTE ===
        "sale-completed": "bg-[var(--color-sales)]/10 text-[var(--color-sales)] border border-[var(--color-sales)]/20",
        "sale-pending": "bg-[var(--color-quotes)]/10 text-[var(--color-quotes)] border border-[var(--color-quotes)]/20",
        "sale-cancelled": "bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border border-[var(--color-alert-red)]/20",
        
        // === STATUTS DE FACTURE ===
        "invoice-paid": "bg-[var(--color-success-green)]/10 text-[var(--color-success-green)] border border-[var(--color-success-green)]/20",
        "invoice-pending": "bg-[var(--color-quotes)]/10 text-[var(--color-quotes)] border border-[var(--color-quotes)]/20",
        "invoice-overdue": "bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border border-[var(--color-alert-red)]/20",
        "invoice-draft": "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]",
        
        // === STATUTS DE DEVIS ===
        "quote-sent": "bg-[var(--color-business-blue)]/10 text-[var(--color-business-blue)] border border-[var(--color-business-blue)]/20",
        "quote-accepted": "bg-[var(--color-success-green)]/10 text-[var(--color-success-green)] border border-[var(--color-success-green)]/20",
        "quote-rejected": "bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border border-[var(--color-alert-red)]/20",
        "quote-expired": "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]",
        
        // === STATUTS DE STOCK ===
        "stock-available": "bg-[var(--color-success-green)]/10 text-[var(--color-success-green)] border border-[var(--color-success-green)]/20",
        "stock-low": "bg-[var(--color-quotes)]/10 text-[var(--color-quotes)] border border-[var(--color-quotes)]/20",
        "stock-out": "bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border border-[var(--color-alert-red)]/20",
        
        // === STATUTS DE PAIEMENT ===
        "payment-completed": "bg-[var(--color-success-green)]/10 text-[var(--color-success-green)] border border-[var(--color-success-green)]/20",
        "payment-pending": "bg-[var(--color-quotes)]/10 text-[var(--color-quotes)] border border-[var(--color-quotes)]/20",
        "payment-failed": "bg-[var(--color-alert-red)]/10 text-[var(--color-alert-red)] border border-[var(--color-alert-red)]/20",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        default: "px-3 py-1.5 text-xs",
        lg: "px-4 py-2 text-sm",
      },
    },
    defaultVariants: {
      status: "draft",
      size: "default",
    },
  }
)

// === ICÔNES PAR STATUT ===
const statusIcons = {
  completed: CheckCircle,
  pending: Clock,
  cancelled: XCircle,
  draft: Circle,
  active: CheckCircle,
  inactive: Pause,
  
  "sale-completed": CheckCircle,
  "sale-pending": Clock,
  "sale-cancelled": XCircle,
  
  "invoice-paid": CheckCircle,
  "invoice-pending": Clock,
  "invoice-overdue": AlertTriangle,
  "invoice-draft": Circle,
  
  "quote-sent": Clock,
  "quote-accepted": CheckCircle,
  "quote-rejected": XCircle,
  "quote-expired": AlertTriangle,
  
  "stock-available": CheckCircle,
  "stock-low": AlertTriangle,
  "stock-out": XCircle,
  
  "payment-completed": CheckCircle,
  "payment-pending": Clock,
  "payment-failed": XCircle,
}

// === TEXTES PAR STATUT ===
const statusTexts = {
  completed: "Terminé",
  pending: "En attente",
  cancelled: "Annulé",
  draft: "Brouillon",
  active: "Actif",
  inactive: "Inactif",
  
  "sale-completed": "Vente finalisée",
  "sale-pending": "Vente en cours",
  "sale-cancelled": "Vente annulée",
  
  "invoice-paid": "Payée",
  "invoice-pending": "En attente",
  "invoice-overdue": "En retard",
  "invoice-draft": "Brouillon",
  
  "quote-sent": "Envoyé",
  "quote-accepted": "Accepté",
  "quote-rejected": "Refusé",
  "quote-expired": "Expiré",
  
  "stock-available": "Disponible",
  "stock-low": "Stock faible",
  "stock-out": "Rupture",
  
  "payment-completed": "Payé",
  "payment-pending": "En attente",
  "payment-failed": "Échec",
}

interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusIndicatorVariants> {
  status: keyof typeof statusIcons
  showIcon?: boolean
  customText?: string
}

const StatusIndicator = React.forwardRef<HTMLDivElement, StatusIndicatorProps>(
  ({ className, status, size, showIcon = true, customText, ...props }, ref) => {
    const Icon = statusIcons[status]
    const text = customText || statusTexts[status]

    return (
      <div
        ref={ref}
        className={cn(statusIndicatorVariants({ status, size }), className)}
        {...props}
      >
        {showIcon && Icon && <Icon className="w-3 h-3" />}
        <span>{text}</span>
      </div>
    )
  }
)
StatusIndicator.displayName = "StatusIndicator"

// === COMPOSANTS PRÉDÉFINIS ===

interface StatusProps {
  className?: string
  showIcon?: boolean
  customText?: string
}

// Statuts de vente
export const SaleStatus = ({ status, ...props }: { status: 'COMPLETED' | 'PENDING' | 'CANCELLED' } & StatusProps) => {
  const statusMap = {
    COMPLETED: 'sale-completed' as const,
    PENDING: 'sale-pending' as const,
    CANCELLED: 'sale-cancelled' as const,
  }
  return <StatusIndicator status={statusMap[status]} {...props} />
}

// Statuts de facture
export const InvoiceStatus = ({ status, ...props }: { status: 'PAID' | 'PENDING' | 'OVERDUE' | 'DRAFT' } & StatusProps) => {
  const statusMap = {
    PAID: 'invoice-paid' as const,
    PENDING: 'invoice-pending' as const,
    OVERDUE: 'invoice-overdue' as const,
    DRAFT: 'invoice-draft' as const,
  }
  return <StatusIndicator status={statusMap[status]} {...props} />
}

// Statuts de devis
export const QuoteStatus = ({ status, ...props }: { status: 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'DRAFT' } & StatusProps) => {
  const statusMap = {
    SENT: 'quote-sent' as const,
    ACCEPTED: 'quote-accepted' as const,
    REJECTED: 'quote-rejected' as const,
    EXPIRED: 'quote-expired' as const,
    DRAFT: 'draft' as const,
  }
  return <StatusIndicator status={statusMap[status]} {...props} />
}

// Statuts de stock
export const StockStatus = ({ quantity, minStock, ...props }: { quantity: number; minStock: number } & StatusProps) => {
  let status: 'stock-available' | 'stock-low' | 'stock-out'
  
  if (quantity <= 0) {
    status = 'stock-out'
  } else if (quantity <= minStock) {
    status = 'stock-low'
  } else {
    status = 'stock-available'
  }
  
  return <StatusIndicator status={status} customText={`${quantity} en stock`} {...props} />
}

// Statuts de paiement
export const PaymentStatus = ({ status, ...props }: { status: 'COMPLETED' | 'PENDING' | 'FAILED' } & StatusProps) => {
  const statusMap = {
    COMPLETED: 'payment-completed' as const,
    PENDING: 'payment-pending' as const,
    FAILED: 'payment-failed' as const,
  }
  return <StatusIndicator status={statusMap[status]} {...props} />
}

export { StatusIndicator, statusIndicatorVariants }
