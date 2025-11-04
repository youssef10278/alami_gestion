'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'

interface ExpenseCategory {
  id: string
  name: string
  icon?: string
  color?: string
}

interface Expense {
  id: string
  amount: number
  description: string
  date: string
  categoryId: string
  paymentMethod: string
  reference?: string
  receipt?: string
  notes?: string
}

interface ExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  categories: ExpenseCategory[]
  expense?: Expense | null
}

export function ExpenseDialog({
  open,
  onOpenChange,
  onSuccess,
  categories,
  expense
}: ExpenseDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    paymentMethod: 'CASH',
    reference: '',
    receipt: '',
    notes: ''
  })

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount.toString(),
        description: expense.description,
        date: new Date(expense.date).toISOString().split('T')[0],
        categoryId: expense.categoryId,
        paymentMethod: expense.paymentMethod,
        reference: expense.reference || '',
        receipt: expense.receipt || '',
        notes: expense.notes || ''
      })
    } else {
      setFormData({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        categoryId: '',
        paymentMethod: 'CASH',
        reference: '',
        receipt: '',
        notes: ''
      })
    }
  }, [expense, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = expense ? '/api/expenses' : '/api/expenses'
      const method = expense ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(expense && { id: expense.id }),
          amount: parseFloat(formData.amount),
          description: formData.description,
          date: formData.date,
          categoryId: formData.categoryId,
          paymentMethod: formData.paymentMethod,
          reference: formData.reference || null,
          receipt: formData.receipt || null,
          notes: formData.notes || null
        })
      })

      if (response.ok) {
        toast.success(expense ? 'Dépense modifiée' : 'Dépense créée')
        onSuccess()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, receipt: data.url }))
        toast.success('Reçu téléchargé')
      } else {
        toast.error('Erreur lors du téléchargement')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du téléchargement')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {expense ? 'Modifier la dépense' : 'Nouvelle dépense'}
          </DialogTitle>
          <DialogDescription>
            {expense ? 'Modifiez les informations de la dépense' : 'Enregistrez une nouvelle dépense'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (DH) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Loyer du mois de janvier"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Mode de paiement *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">💵 Espèces</SelectItem>
                  <SelectItem value="CARD">💳 Carte</SelectItem>
                  <SelectItem value="TRANSFER">🏦 Virement</SelectItem>
                  <SelectItem value="CHECK">📝 Chèque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Référence (Facture, Reçu...)</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              placeholder="Ex: FAC-2024-001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Reçu / Facture (Image)</Label>
            <div className="flex gap-2">
              <Input
                id="receipt-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('receipt-upload')?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Télécharger un reçu
              </Button>
            </div>
            {formData.receipt && (
              <div className="mt-2">
                <img
                  src={formData.receipt}
                  alt="Reçu"
                  className="max-h-40 rounded border"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes additionnelles..."
              rows={3}
            />
          </div>

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
              {loading ? 'Enregistrement...' : expense ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

