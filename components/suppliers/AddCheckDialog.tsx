'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { FileText } from 'lucide-react'

interface Supplier {
  id: string
  name: string
  company: string | null
}

interface AddCheckDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: Supplier | null
  onSuccess: () => void
}

export default function AddCheckDialog({
  open,
  onOpenChange,
  supplier,
  onSuccess
}: AddCheckDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    checkNumber: '',
    amount: '',
    bankName: '',
    accountNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!supplier) return

    // Validation
    if (!formData.checkNumber || !formData.amount || !formData.bankName || !formData.dueDate) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (parseFloat(formData.amount) <= 0) {
      toast.error('Le montant doit être supérieur à 0')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/suppliers/checks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplierId: supplier.id,
          checkNumber: formData.checkNumber,
          amount: parseFloat(formData.amount),
          bankName: formData.bankName,
          accountNumber: formData.accountNumber || null,
          issueDate: formData.issueDate,
          dueDate: formData.dueDate,
          notes: formData.notes || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Erreur lors de la création du chèque')
        setLoading(false)
        return
      }

      toast.success('Chèque créé avec succès', {
        description: `Chèque N° ${formData.checkNumber} pour ${formData.amount} DH`,
      })

      // Réinitialiser le formulaire
      setFormData({
        checkNumber: '',
        amount: '',
        bankName: '',
        accountNumber: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        notes: '',
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la création du chèque')
    } finally {
      setLoading(false)
    }
  }

  if (!supplier) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-6 h-6 text-violet-600" />
            Nouveau Chèque pour {supplier.name}
          </DialogTitle>
          {supplier.company && (
            <p className="text-sm text-gray-500">{supplier.company}</p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Numéro du chèque */}
          <div className="space-y-2">
            <Label htmlFor="checkNumber">
              Numéro du Chèque <span className="text-red-500">*</span>
            </Label>
            <Input
              id="checkNumber"
              value={formData.checkNumber}
              onChange={(e) => setFormData({ ...formData, checkNumber: e.target.value })}
              placeholder="CHK-001234"
              required
            />
          </div>

          {/* Montant */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Montant (DH) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          {/* Banque */}
          <div className="space-y-2">
            <Label htmlFor="bankName">
              Nom de la Banque <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bankName"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="Banque Populaire"
              required
            />
          </div>

          {/* Numéro de compte */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber">
              Numéro de Compte (optionnel)
            </Label>
            <Input
              id="accountNumber"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              placeholder="123456789"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">
                Date d'Émission <span className="text-red-500">*</span>
              </Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">
                Date d'Échéance <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                min={formData.issueDate}
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes supplémentaires..."
              className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Résumé */}
          <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
            <h4 className="font-semibold text-violet-900 mb-2">📋 Résumé</h4>
            <div className="space-y-1 text-sm">
              <p className="text-gray-700">
                <span className="font-medium">Fournisseur :</span> {supplier.name}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Montant :</span>{' '}
                {formData.amount ? `${parseFloat(formData.amount).toFixed(2)} DH` : '0.00 DH'}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Banque :</span> {formData.bankName || '-'}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Échéance :</span>{' '}
                {formData.dueDate
                  ? new Date(formData.dueDate).toLocaleDateString('fr-FR')
                  : '-'}
              </p>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-violet-600 hover:bg-violet-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Création...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Créer le Chèque
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

