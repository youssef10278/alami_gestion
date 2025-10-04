'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Customer {
  id: string
  name: string
  company: string | null
  creditUsed: number
}

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  onSuccess: () => void
}

export default function PaymentDialog({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: PaymentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'CASH',
    notes: '',
  })

  useEffect(() => {
    if (customer && open) {
      setFormData({
        amount: Number(customer.creditUsed).toFixed(2),
        paymentMethod: 'CASH',
        notes: '',
      })
    }
    setError('')
  }, [customer, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customer) return

    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/credit/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customer.id,
          ...formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue')
        setLoading(false)
        return
      }

      onSuccess()
    } catch (err) {
      setError('Erreur lors de l\'enregistrement du paiement')
      setLoading(false)
    }
  }

  if (!customer) return null

  const maxAmount = Number(customer.creditUsed)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enregistrer un paiement</DialogTitle>
          <DialogDescription>
            Enregistrez un paiement de crédit pour {customer.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Info client */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Client</span>
              <span className="font-semibold">{customer.name}</span>
            </div>
            {customer.company && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Entreprise</span>
                <span className="text-sm text-gray-600">{customer.company}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Crédit actuel</span>
              <span className="font-bold text-orange-600">
                {maxAmount.toFixed(2)} DH
              </span>
            </div>
          </div>

          {/* Montant */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Montant du paiement (DH) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={maxAmount}
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0.00"
              required
            />
            <p className="text-xs text-gray-500">
              Maximum: {maxAmount.toFixed(2)} DH
            </p>
          </div>

          {/* Méthode de paiement */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Méthode de paiement</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) =>
                setFormData({ ...formData, paymentMethod: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Espèces</SelectItem>
                <SelectItem value="CARD">Carte</SelectItem>
                <SelectItem value="TRANSFER">Virement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Notes sur le paiement..."
              className="flex min-h-[80px] w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer le paiement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

