'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShoppingCart, CreditCard, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import Link from 'next/link'

interface Supplier {
  id: string
  name: string
  company: string | null
  balance: number
}

export default function NewTransactionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [step, setStep] = useState(1)
  const [transactionType, setTransactionType] = useState<'PURCHASE' | 'PAYMENT' | 'ADJUSTMENT'>('PURCHASE')
  const [formData, setFormData] = useState({
    supplierId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    notes: '',
    // Données du chèque
    checkNumber: '',
    bankName: '',
    dueDate: '',
    accountNumber: '',
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers')
      if (response.ok) {
        const data = await response.json()
        setSuppliers(data.filter((s: Supplier) => s))
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.supplierId || !formData.amount || !formData.description) {
      toast.error('Veuillez remplir tous les champs requis')
      return
    }

    if (parseFloat(formData.amount) <= 0) {
      toast.error('Le montant doit être positif')
      return
    }

    // Validation chèque
    if (transactionType === 'PAYMENT' && formData.paymentMethod === 'CHECK') {
      if (!formData.checkNumber || !formData.bankName || !formData.dueDate) {
        toast.error('Veuillez remplir toutes les informations du chèque')
        return
      }
    }

    setLoading(true)

    try {
      const payload: any = {
        supplierId: formData.supplierId,
        type: transactionType,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        notes: formData.notes || null,
      }

      if (transactionType === 'PAYMENT') {
        payload.paymentMethod = formData.paymentMethod

        if (formData.paymentMethod === 'CHECK') {
          payload.checkData = {
            checkNumber: formData.checkNumber,
            bankName: formData.bankName,
            dueDate: formData.dueDate,
            accountNumber: formData.accountNumber || null,
          }
        }
      }

      const response = await fetch('/api/suppliers/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Transaction créée avec succès !')
        router.push('/dashboard/suppliers')
      } else {
        toast.error(data.error || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
      toast.error('Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const selectedSupplier = suppliers.find(s => s.id === formData.supplierId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/dashboard/suppliers">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">➕ Nouvelle Transaction</h1>
          <p className="text-violet-100">Enregistrer un achat ou un paiement</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Étape 1 : Type de transaction */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Étape 1 : Type de Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setTransactionType('PURCHASE')
                    setStep(2)
                  }}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-violet-500 hover:bg-violet-50 transition-all group"
                >
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-violet-600" />
                  <h3 className="font-semibold text-lg mb-2">🛒 Achat</h3>
                  <p className="text-sm text-gray-600">
                    Enregistrer un achat auprès d'un fournisseur
                  </p>
                </button>

                <button
                  onClick={() => {
                    setTransactionType('PAYMENT')
                    setStep(2)
                  }}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
                >
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <h3 className="font-semibold text-lg mb-2">💳 Paiement</h3>
                  <p className="text-sm text-gray-600">
                    Enregistrer un paiement à un fournisseur
                  </p>
                </button>

                <button
                  onClick={() => {
                    setTransactionType('ADJUSTMENT')
                    setStep(2)
                  }}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
                >
                  <Settings className="w-12 h-12 mx-auto mb-4 text-orange-600" />
                  <h3 className="font-semibold text-lg mb-2">⚙️ Ajustement</h3>
                  <p className="text-sm text-gray-600">
                    Ajuster le solde d'un fournisseur
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 2 : Détails */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Étape 2 : Détails {transactionType === 'PURCHASE' ? "de l'Achat" : transactionType === 'PAYMENT' ? 'du Paiement' : "de l'Ajustement"}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  Changer le type
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Fournisseur */}
                <div>
                  <Label htmlFor="supplierId">
                    Fournisseur <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="supplierId"
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  >
                    <option value="">Sélectionner un fournisseur</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name} {supplier.company ? `(${supplier.company})` : ''} - Solde: {Number(supplier.balance).toFixed(2)} DH
                      </option>
                    ))}
                  </select>
                </div>

                {/* Montant et Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">
                      Montant (DH) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={
                      transactionType === 'PURCHASE'
                        ? 'Ex: Achat marchandises Janvier 2025'
                        : transactionType === 'PAYMENT'
                        ? 'Ex: Paiement facture #123'
                        : 'Ex: Correction solde'
                    }
                    required
                  />
                </div>

                {/* Mode de paiement (si PAYMENT) */}
                {transactionType === 'PAYMENT' && (
                  <div>
                    <Label htmlFor="paymentMethod">Mode de Paiement</Label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="CASH">💵 Espèces</option>
                      <option value="TRANSFER">🏦 Virement</option>
                      <option value="CHECK">📝 Chèque</option>
                    </select>
                  </div>
                )}

                {/* Informations du chèque (si CHECK) */}
                {transactionType === 'PAYMENT' && formData.paymentMethod === 'CHECK' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                    <h3 className="font-semibold text-blue-900">📝 Informations du Chèque</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="checkNumber">
                          N° Chèque <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="checkNumber"
                          name="checkNumber"
                          value={formData.checkNumber}
                          onChange={handleChange}
                          placeholder="123456"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="bankName">
                          Banque <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="bankName"
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleChange}
                          placeholder="Attijariwafa Bank"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dueDate">
                          Date d'Échéance <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="dueDate"
                          name="dueDate"
                          type="date"
                          value={formData.dueDate}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountNumber">N° Compte (optionnel)</Label>
                        <Input
                          id="accountNumber"
                          name="accountNumber"
                          value={formData.accountNumber}
                          onChange={handleChange}
                          placeholder="123456789"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Notes supplémentaires..."
                    rows={3}
                  />
                </div>

                {/* Résumé */}
                {selectedSupplier && formData.amount && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold mb-2">📊 Résumé</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fournisseur :</span>
                        <span className="font-medium">{selectedSupplier.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Solde actuel :</span>
                        <span className="font-medium">{Number(selectedSupplier.balance).toFixed(2)} DH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Montant transaction :</span>
                        <span className="font-medium">{parseFloat(formData.amount || '0').toFixed(2)} DH</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 mt-1">
                        <span className="text-gray-600">Nouveau solde :</span>
                        <span className="font-bold">
                          {transactionType === 'PURCHASE'
                            ? (Number(selectedSupplier.balance) + parseFloat(formData.amount || '0')).toFixed(2)
                            : transactionType === 'PAYMENT'
                            ? (Number(selectedSupplier.balance) - parseFloat(formData.amount || '0')).toFixed(2)
                            : (Number(selectedSupplier.balance) + parseFloat(formData.amount || '0')).toFixed(2)
                          } DH
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Boutons */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                  >
                    {loading ? 'Création...' : '✅ Créer la Transaction'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Retour
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

