import { toast } from 'sonner'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

// === NOTIFICATIONS STANDARDISÉES BUSINESS MODERNE ===

interface NotificationOptions {
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// === NOTIFICATIONS DE SUCCÈS ===
export const notifySuccess = (message: string, options?: NotificationOptions) => {
  return toast.success(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    icon: <CheckCircle className="w-4 h-4" />,
    style: {
      background: 'hsl(var(--card))',
      border: '1px solid var(--color-success-green)',
      color: 'var(--color-success-green)',
    },
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  })
}

// === NOTIFICATIONS D'ERREUR ===
export const notifyError = (message: string, options?: NotificationOptions) => {
  return toast.error(message, {
    description: options?.description,
    duration: options?.duration || 6000,
    icon: <AlertCircle className="w-4 h-4" />,
    style: {
      background: 'hsl(var(--card))',
      border: '1px solid var(--color-alert-red)',
      color: 'var(--color-alert-red)',
    },
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  })
}

// === NOTIFICATIONS D'ATTENTION ===
export const notifyWarning = (message: string, options?: NotificationOptions) => {
  return toast.warning(message, {
    description: options?.description,
    duration: options?.duration || 5000,
    icon: <AlertTriangle className="w-4 h-4" />,
    style: {
      background: 'hsl(var(--card))',
      border: '1px solid var(--color-quotes)',
      color: 'var(--color-quotes)',
    },
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  })
}

// === NOTIFICATIONS D'INFORMATION ===
export const notifyInfo = (message: string, options?: NotificationOptions) => {
  return toast.info(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    icon: <Info className="w-4 h-4" />,
    style: {
      background: 'hsl(var(--card))',
      border: '1px solid var(--color-business-blue)',
      color: 'var(--color-business-blue)',
    },
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  })
}

// === NOTIFICATIONS PAR MODULE ===

// Notifications pour les ventes
export const notifySales = {
  success: (message: string, options?: NotificationOptions) => 
    notifySuccess(message, { ...options, description: options?.description || '✅ Vente' }),
  error: (message: string, options?: NotificationOptions) => 
    notifyError(message, { ...options, description: options?.description || '❌ Vente' }),
  info: (message: string, options?: NotificationOptions) => 
    notifyInfo(message, { ...options, description: options?.description || 'ℹ️ Vente' }),
}

// Notifications pour les factures
export const notifyInvoices = {
  success: (message: string, options?: NotificationOptions) => 
    notifySuccess(message, { ...options, description: options?.description || '📄 Facture' }),
  error: (message: string, options?: NotificationOptions) => 
    notifyError(message, { ...options, description: options?.description || '❌ Facture' }),
  info: (message: string, options?: NotificationOptions) => 
    notifyInfo(message, { ...options, description: options?.description || 'ℹ️ Facture' }),
}

// Notifications pour les devis
export const notifyQuotes = {
  success: (message: string, options?: NotificationOptions) => 
    notifySuccess(message, { ...options, description: options?.description || '📋 Devis' }),
  error: (message: string, options?: NotificationOptions) => 
    notifyError(message, { ...options, description: options?.description || '❌ Devis' }),
  info: (message: string, options?: NotificationOptions) => 
    notifyInfo(message, { ...options, description: options?.description || 'ℹ️ Devis' }),
}

// Notifications pour le stock/produits
export const notifyStock = {
  success: (message: string, options?: NotificationOptions) => 
    notifySuccess(message, { ...options, description: options?.description || '📦 Stock' }),
  error: (message: string, options?: NotificationOptions) => 
    notifyError(message, { ...options, description: options?.description || '❌ Stock' }),
  warning: (message: string, options?: NotificationOptions) => 
    notifyWarning(message, { ...options, description: options?.description || '⚠️ Stock faible' }),
  info: (message: string, options?: NotificationOptions) => 
    notifyInfo(message, { ...options, description: options?.description || 'ℹ️ Stock' }),
}

// Notifications pour les clients
export const notifyCustomers = {
  success: (message: string, options?: NotificationOptions) => 
    notifySuccess(message, { ...options, description: options?.description || '👥 Client' }),
  error: (message: string, options?: NotificationOptions) => 
    notifyError(message, { ...options, description: options?.description || '❌ Client' }),
  info: (message: string, options?: NotificationOptions) => 
    notifyInfo(message, { ...options, description: options?.description || 'ℹ️ Client' }),
}

// === NOTIFICATIONS SPÉCIALISÉES ===

// Notification de sauvegarde
export const notifySave = (entity: string, isEdit: boolean = false) => {
  const action = isEdit ? 'modifié' : 'créé'
  return notifySuccess(`${entity} ${action} avec succès`, {
    description: `✅ ${entity} sauvegardé`,
    duration: 3000,
  })
}

// Notification de suppression
export const notifyDelete = (entity: string) => {
  return notifySuccess(`${entity} supprimé avec succès`, {
    description: `🗑️ ${entity} retiré`,
    duration: 3000,
  })
}

// Notification de chargement
export const notifyLoading = (message: string) => {
  return toast.loading(message, {
    style: {
      background: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      color: 'hsl(var(--foreground))',
    },
  })
}

// Notification personnalisée avec action
export const notifyWithAction = (
  message: string, 
  actionLabel: string, 
  actionCallback: () => void,
  type: 'success' | 'error' | 'warning' | 'info' = 'info'
) => {
  const notifyFn = {
    success: notifySuccess,
    error: notifyError,
    warning: notifyWarning,
    info: notifyInfo,
  }[type]

  return notifyFn(message, {
    action: {
      label: actionLabel,
      onClick: actionCallback,
    },
    duration: 8000, // Plus long pour laisser le temps d'agir
  })
}

// Notification de confirmation
export const notifyConfirm = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  return toast.custom((t) => (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-4 shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <AlertTriangle className="w-5 h-5 text-[var(--color-quotes)]" />
        <p className="text-[hsl(var(--foreground))] font-medium">{message}</p>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => {
            onCancel?.()
            toast.dismiss(t)
          }}
          className="px-3 py-1 text-sm bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] rounded hover:bg-[hsl(var(--muted))]/80"
        >
          Annuler
        </button>
        <button
          onClick={() => {
            onConfirm()
            toast.dismiss(t)
          }}
          className="px-3 py-1 text-sm bg-[var(--color-alert-red)] text-white rounded hover:bg-[var(--color-alert-red)]/90"
        >
          Confirmer
        </button>
      </div>
    </div>
  ), {
    duration: Infinity, // Ne se ferme pas automatiquement
  })
}
