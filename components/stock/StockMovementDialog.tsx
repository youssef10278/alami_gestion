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

interface Product {
  id: string
  name: string
}

interface StockMovementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onSuccess: () => void
}

export default function StockMovementDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: StockMovementDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    quantity: '',
    type: 'IN',
    reason: '',
  })

  useEffect(() => {
    if (product && open) {
      setFormData({
        quantity: '',
        type: 'IN',
        reason: '',
      })
    }
    setError('')
  }, [product, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!product) return

    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/stock/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          ...formData,
          quantity: parseInt(formData.quantity),
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
      setError("Erreur lors de l'enregistrement du mouvement")
      setLoading(false)
    }
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mouvement de Stock</DialogTitle>
          <DialogDescription>
            Enregistrez un mouvement de stock pour {product.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type de mouvement */}
          <div className="space-y-2">
            <Label htmlFor="type">Type de mouvement</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">Entrée (Ajout)</SelectItem>
                <SelectItem value="OUT">Sortie (Retrait)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantité */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantité <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              placeholder="0"
              required
            />
          </div>

          {/* Raison */}
          <div className="space-y-2">
            <Label htmlFor="reason">Raison</Label>
            <Select
              value={formData.reason}
              onValueChange={(value) =>
                setFormData({ ...formData, reason: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une raison" />
              </SelectTrigger>
              <SelectContent>
                {formData.type === 'IN' ? (
                  <>
                    <SelectItem value="Réapprovisionnement">
                      Réapprovisionnement
                    </SelectItem>
                    <SelectItem value="Retour client">Retour client</SelectItem>
                    <SelectItem value="Correction inventaire">
                      Correction inventaire
                    </SelectItem>
                    <SelectItem value="Ajout manuel">Ajout manuel</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="Vente">Vente</SelectItem>
                    <SelectItem value="Perte">Perte</SelectItem>
                    <SelectItem value="Casse">Casse</SelectItem>
                    <SelectItem value="Retour fournisseur">
                      Retour fournisseur
                    </SelectItem>
                    <SelectItem value="Correction inventaire">
                      Correction inventaire
                    </SelectItem>
                    <SelectItem value="Retrait manuel">Retrait manuel</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
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
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

