'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Edit3, Trash2, Plus, Minus, AlertTriangle, Clock, User } from 'lucide-react'
import { safeToFixed, safeNumber } from '@/lib/utils'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock: number
}

interface Customer {
  id: string
  name: string
  company?: string
}

interface SaleItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  total: number
  product: Product
}

interface Sale {
  id: string
  saleNumber: string
  customerId?: string
  totalAmount: number
  paidAmount: number
  creditAmount: number
  paymentMethod: string
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
  customer?: Customer
  seller: {
    id: string
    name: string
  }
  items: SaleItem[]
}

interface SaleEditDialogProps {
  sale: Sale | null
  isOpen: boolean
  onClose: () => void
  onSaleUpdated: () => void
  userRole: string
  userId: string
}

export default function SaleEditDialog({
  sale,
  isOpen,
  onClose,
  onSaleUpdated,
  userRole,
  userId
}: SaleEditDialogProps) {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  
  // États du formulaire
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [items, setItems] = useState<any[]>([])
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH')
  const [amountPaid, setAmountPaid] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [reason, setReason] = useState<string>('')

  // Calculer les totaux
  const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const paid = Number(amountPaid) || 0
  const remaining = Math.max(0, total - paid)

  // Vérifier si la modification est autorisée
  const canEdit = () => {
    if (!sale) return false

    // Pour l'instant, permettre à tous les utilisateurs connectés d'essayer
    // Les permissions seront vérifiées côté serveur
    return userRole === 'OWNER' || userRole === 'SELLER'
  }

  // Vérifier si la suppression est autorisée
  const canDelete = () => {
    if (!sale) return false

    // Pour l'instant, permettre à tous les utilisateurs connectés d'essayer
    // Les permissions seront vérifiées côté serveur
    return userRole === 'OWNER' || userRole === 'SELLER'
  }

  // Calculer les délais pour l'affichage
  const getTimeInfo = () => {
    if (!sale) return { editTimeLeft: 0, deleteTimeLeft: 0 }

    const timeSinceCreation = Date.now() - new Date(sale.createdAt).getTime()
    const editTimeLeft = Math.max(0, (24 * 60 * 60 * 1000) - timeSinceCreation)
    const deleteTimeLeft = Math.max(0, (2 * 60 * 60 * 1000) - timeSinceCreation)

    return { editTimeLeft, deleteTimeLeft }
  }

  useEffect(() => {
    if (isOpen && sale) {
      console.log('Initializing edit dialog with sale:', sale) // Debug

      // Initialiser le formulaire avec les données de la vente
      setSelectedCustomer(sale.customerId || '')
      setItems(sale.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        product: item.product
      })))
      setPaymentMethod(sale.paymentMethod)
      setAmountPaid(sale.paidAmount.toString())
      setNotes(sale.notes || '')
      setReason('')

      // Charger les données
      fetchProducts()
      fetchCustomers()
    }
  }, [isOpen, sale])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers?limit=100')
      const data = await response.json()
      setCustomers(data.customers || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const addItem = () => {
    if (products.length > 0) {
      const firstProduct = products[0]
      setItems([...items, {
        productId: firstProduct.id,
        quantity: 1,
        unitPrice: firstProduct.price,
        product: firstProduct
      }])
    }
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value)
      if (product) {
        newItems[index] = {
          ...newItems[index],
          productId: value,
          unitPrice: product.price,
          product: product
        }
      }
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: field === 'quantity' ? parseInt(value) || 1 : parseFloat(value) || 0
      }
    }
    
    setItems(newItems)
  }

  const handleSave = async () => {
    if (!sale) {
      toast.error('Aucune vente sélectionnée')
      return
    }

    if (items.length === 0) {
      toast.error('Au moins un produit est requis')
      return
    }

    if (!reason.trim() || reason.trim().length < 5) {
      toast.error('Raison de modification requise (minimum 5 caractères)')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/sales/${sale.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomer || null,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            customPrice: item.unitPrice
          })),
          paymentMethod,
          amountPaid: paid,
          notes: notes.trim() || null,
          reason: reason.trim()
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la modification')
      }

      toast.success('Vente modifiée avec succès')
      onSaleUpdated()
      onClose()
    } catch (error) {
      console.error('Error updating sale:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!sale) {
      toast.error('Aucune vente sélectionnée')
      return
    }

    if (!reason.trim() || reason.trim().length < 5) {
      toast.error('Raison de suppression requise (minimum 5 caractères)')
      return
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer la vente ${sale.saleNumber} ?\n\nCette action est irréversible.`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/sales/${sale.id}?reason=${encodeURIComponent(reason.trim())}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la suppression')
      }

      toast.success('Vente supprimée avec succès')
      onSaleUpdated()
      onClose()
    } catch (error) {
      console.error('Error deleting sale:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression')
    } finally {
      setLoading(false)
    }
  }

  if (!sale) return null

  const { editTimeLeft, deleteTimeLeft } = getTimeInfo()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Modifier la vente {sale.saleNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations et permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="w-4 h-4" />
                Informations de la vente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Vendeur:</span> {sale.seller.name}
                </div>
                <div>
                  <span className="font-medium">Date:</span> {new Date(sale.createdAt).toLocaleString('fr-FR')}
                </div>
              </div>

              {/* Alertes de permissions */}
              {userRole === 'SELLER' && sale.seller.id === userId && (
                <div className="space-y-2">
                  {editTimeLeft > 0 ? (
                    <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                      <Clock className="w-4 h-4" />
                      Modification autorisée pendant encore {Math.ceil(editTimeLeft / (60 * 60 * 1000))}h
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                      <AlertTriangle className="w-4 h-4" />
                      Délai de modification dépassé (24h). Contactez le propriétaire.
                    </div>
                  )}

                  {deleteTimeLeft > 0 ? (
                    <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                      <Clock className="w-4 h-4" />
                      Suppression autorisée pendant encore {Math.ceil(deleteTimeLeft / (60 * 60 * 1000))}h
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                      <AlertTriangle className="w-4 h-4" />
                      Délai de suppression dépassé (2h). Contactez le propriétaire.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulaire de modification */}
          <div className="space-y-4">
              {/* Client */}
              <div>
                <Label htmlFor="customer">Client</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Client de passage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Client de passage</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} {customer.company && `(${customer.company})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Produits */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Produits</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center p-3 border rounded">
                      <div className="flex-1">
                        <Select
                          value={item.productId}
                          onValueChange={(value) => updateItem(index, 'productId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} ({product.sku}) - {safeToFixed(product.price)} DH
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Input
                        type="number"
                        placeholder="Qté"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="w-20"
                        min="1"
                      />
                      
                      <Input
                        type="number"
                        placeholder="Prix"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                        className="w-24"
                        step="0.01"
                        min="0"
                      />
                      
                      <div className="w-24 text-sm font-medium">
                        {safeToFixed(item.quantity * item.unitPrice)} DH
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Paiement */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentMethod">Mode de paiement</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Espèces</SelectItem>
                      <SelectItem value="CARD">Carte</SelectItem>
                      <SelectItem value="TRANSFER">Virement</SelectItem>
                      <SelectItem value="CHECK">Chèque</SelectItem>
                      <SelectItem value="CREDIT">Crédit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="amountPaid">Montant payé (DH)</Label>
                  <Input
                    id="amountPaid"
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    step="0.01"
                    min="0"
                    max={total}
                  />
                </div>
              </div>

              {/* Résumé */}
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-bold">{safeToFixed(total)} DH</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payé:</span>
                      <span className="text-green-600">{safeToFixed(paid)} DH</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Reste:</span>
                      <span className={remaining > 0 ? 'text-orange-600' : 'text-green-600'}>
                        {safeToFixed(remaining)} DH
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes sur la vente..."
                  rows={2}
                />
              </div>

              {/* Raison de modification */}
              <div>
                <Label htmlFor="reason">Raison de la modification *</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Expliquez pourquoi vous modifiez cette vente..."
                  rows={2}
                  className="border-orange-200 focus:border-orange-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cette information sera enregistrée dans l'historique des modifications
                </p>
              </div>
            </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={loading || items.length === 0 || !reason.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Modification...' : 'Modifier la vente'}
            </Button>

            <Button
              onClick={handleDelete}
              disabled={loading || !reason.trim()}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {loading ? 'Suppression...' : 'Supprimer'}
            </Button>
            
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
