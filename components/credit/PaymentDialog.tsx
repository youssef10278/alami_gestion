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
import { Checkbox } from '@/components/ui/checkbox'
import { DollarSign, Zap, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Customer {
  id: string
  name: string
  company: string | null
  creditUsed: number
}

interface Sale {
  id: string
  saleNumber: string
  totalAmount: number
  paidAmount: number
  balance: number
  createdAt: string
  status: string
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
  const [loadingSales, setLoadingSales] = useState(false)
  const [error, setError] = useState('')
  const [unpaidSales, setUnpaidSales] = useState<Sale[]>([])
  const [selectedSaleIds, setSelectedSaleIds] = useState<string[]>([])
  const [mode, setMode] = useState<'auto' | 'manual'>('auto')
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'CASH',
    notes: '',
  })
  const [checkData, setCheckData] = useState({
    checkNumber: '',
    issuer: '',
    beneficiary: '',
    checkDate: '',
    notes: '',
  })

  // Charger les ventes impayées
  useEffect(() => {
    if (customer && open) {
      setFormData({
        amount: Number(customer.creditUsed).toFixed(2),
        paymentMethod: 'CASH',
        notes: '',
      })
      setCheckData({
        checkNumber: '',
        issuer: customer.name,
        beneficiary: '',
        checkDate: new Date().toISOString().split('T')[0],
        notes: '',
      })
      setError('')
      setSelectedSaleIds([])
      setMode('auto')
      fetchUnpaidSales()
    }
  }, [customer, open])

  const fetchUnpaidSales = async () => {
    if (!customer) return

    setLoadingSales(true)
    try {
      const response = await fetch(`/api/sales/unpaid?customerId=${customer.id}`)
      const data = await response.json()

      if (response.ok) {
        setUnpaidSales(data.sales || [])
      }
    } catch (error) {
      console.error('Error fetching unpaid sales:', error)
    } finally {
      setLoadingSales(false)
    }
  }

  const toggleSale = (saleId: string) => {
    setMode('manual')
    setSelectedSaleIds((prev) =>
      prev.includes(saleId)
        ? prev.filter((id) => id !== saleId)
        : [...prev, saleId]
    )
  }

  const selectAllSales = () => {
    setMode('manual')
    setSelectedSaleIds(unpaidSales.map((sale) => sale.id))
  }

  const useAutoMode = () => {
    setMode('auto')
    setSelectedSaleIds([])
  }

  const calculateSelectedAmount = () => {
    if (mode === 'auto') {
      return Number(customer?.creditUsed || 0)
    }

    const selectedSales = unpaidSales.filter((sale) =>
      selectedSaleIds.includes(sale.id)
    )
    return selectedSales.reduce((sum, sale) => sum + sale.balance, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customer) return

    // Validation pour le chèque
    if (formData.paymentMethod === 'CHECK') {
      if (!checkData.checkNumber || !checkData.issuer || !checkData.beneficiary || !checkData.checkDate) {
        setError('Veuillez remplir tous les champs du chèque')
        return
      }
    }

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
          amount: formData.amount,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          saleIds: mode === 'manual' ? selectedSaleIds : undefined,
          mode,
          checkData: formData.paymentMethod === 'CHECK' ? checkData : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue')
        setLoading(false)
        return
      }

      const paymentsCount = data.payments?.length || 0
      toast.success('Paiement enregistré avec succès', {
        description: `${parseFloat(formData.amount).toFixed(2)} DH encaissé pour ${
          customer.name
        } (${paymentsCount} vente${paymentsCount > 1 ? 's' : ''} mise${
          paymentsCount > 1 ? 's' : ''
        } à jour)`,
      })
      onSuccess()
    } catch (err) {
      setError("Erreur lors de l'enregistrement du paiement")
      setLoading(false)
    }
  }

  if (!customer) return null

  const maxAmount = Number(customer.creditUsed)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            Encaisser le crédit
          </DialogTitle>
          <DialogDescription>
            Enregistrez un paiement de crédit pour{' '}
            <span className="font-semibold text-gray-900">{customer.name}</span>
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
              <span className="text-sm font-medium">Crédit total</span>
              <span className="font-bold text-orange-600">
                {maxAmount.toFixed(2)} DH
              </span>
            </div>
          </div>

          {/* Mode de paiement */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Mode de paiement</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={mode === 'auto' ? 'default' : 'outline'}
                className={`h-auto py-4 ${
                  mode === 'auto'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    : ''
                }`}
                onClick={useAutoMode}
              >
                <div className="flex flex-col items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <div className="text-center">
                    <div className="font-semibold">Automatique (FIFO)</div>
                    <div className="text-xs opacity-80">
                      Ventes les plus anciennes
                    </div>
                  </div>
                </div>
              </Button>

              <Button
                type="button"
                variant={mode === 'manual' ? 'default' : 'outline'}
                className={`h-auto py-4 ${
                  mode === 'manual'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                    : ''
                }`}
                onClick={() => setMode('manual')}
              >
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <div className="text-center">
                    <div className="font-semibold">Manuel</div>
                    <div className="text-xs opacity-80">Sélectionner les ventes</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* Liste des ventes impayées (mode manuel) */}
          {mode === 'manual' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Ventes en attente ({unpaidSales.length})
                </Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={selectAllSales}
                  className="h-auto p-0"
                >
                  Tout sélectionner
                </Button>
              </div>

              {loadingSales ? (
                <div className="text-center py-4 text-gray-500">
                  Chargement des ventes...
                </div>
              ) : unpaidSales.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Aucune vente en attente
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-lg p-3">
                  {unpaidSales.map((sale) => (
                    <div
                      key={sale.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        selectedSaleIds.includes(sale.id)
                          ? 'bg-purple-50 border-purple-300'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedSaleIds.includes(sale.id)}
                        onCheckedChange={() => toggleSale(sale.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">
                            Vente #{sale.saleNumber}
                          </span>
                          <span className="font-bold text-orange-600">
                            {sale.balance.toFixed(2)} DH
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            {format(new Date(sale.createdAt), 'dd MMM yyyy', {
                              locale: fr,
                            })}
                          </span>
                          <span>
                            Payé: {Number(sale.paidAmount).toFixed(2)} /{' '}
                            {Number(sale.totalAmount).toFixed(2)} DH
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Maximum: {maxAmount.toFixed(2)} DH</span>
              {mode === 'manual' && selectedSaleIds.length > 0 && (
                <span className="text-purple-600 font-medium">
                  Sélection: {calculateSelectedAmount().toFixed(2)} DH
                </span>
              )}
            </div>
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
                <SelectItem value="CHECK">Chèque</SelectItem>
                <SelectItem value="TRANSFER">Virement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Informations du chèque (si méthode = CHECK) */}
          {formData.paymentMethod === 'CHECK' && (
            <div className="space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-sm text-yellow-900 flex items-center gap-2">
                📝 Informations du chèque
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="checkNumber">
                    N° Chèque <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="checkNumber"
                    value={checkData.checkNumber}
                    onChange={(e) =>
                      setCheckData({ ...checkData, checkNumber: e.target.value })
                    }
                    placeholder="123456"
                    required={formData.paymentMethod === 'CHECK'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkDate">
                    Date du chèque <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="checkDate"
                    type="date"
                    value={checkData.checkDate}
                    onChange={(e) =>
                      setCheckData({ ...checkData, checkDate: e.target.value })
                    }
                    required={formData.paymentMethod === 'CHECK'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuer">
                  Émetteur <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="issuer"
                  value={checkData.issuer}
                  onChange={(e) =>
                    setCheckData({ ...checkData, issuer: e.target.value })
                  }
                  placeholder="Nom de l'émetteur"
                  required={formData.paymentMethod === 'CHECK'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="beneficiary">
                  Bénéficiaire <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="beneficiary"
                  value={checkData.beneficiary}
                  onChange={(e) =>
                    setCheckData({ ...checkData, beneficiary: e.target.value })
                  }
                  placeholder="Nom du bénéficiaire"
                  required={formData.paymentMethod === 'CHECK'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkNotes">Notes sur le chèque</Label>
                <Input
                  id="checkNotes"
                  value={checkData.notes}
                  onChange={(e) =>
                    setCheckData({ ...checkData, notes: e.target.value })
                  }
                  placeholder="Notes optionnelles"
                />
              </div>
            </div>
          )}

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
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              {loading ? 'Encaissement...' : 'Encaisser le paiement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

