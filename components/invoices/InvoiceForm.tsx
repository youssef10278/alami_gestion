'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Search, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Product {
  id: string
  sku: string
  name: string
  description?: string
  price: number
  stock: number
}

interface Customer {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  address?: string
}

interface InvoiceItem {
  id: string
  productId?: string
  productName: string
  productSku?: string
  description?: string
  quantity: number
  unitPrice: number
  discountAmount: number
  total: number
}

interface InvoiceFormData {
  invoiceNumber: string
  customerId?: string
  customerName: string
  customerPhone: string
  customerEmail: string
  customerAddress: string
  customerTaxId: string
  notes: string
  terms: string
  dueDate: string
  taxRate: number
  items: InvoiceItem[]
}

interface InvoiceFormProps {
  initialData?: Partial<InvoiceFormData>
  type: 'INVOICE' | 'CREDIT_NOTE'
  onSubmit: (data: InvoiceFormData) => void
  loading: boolean
  products: Product[]
  customers: Customer[]
  invoices?: any[] // Pour les factures d'avoir
}

export default function InvoiceForm({
  initialData,
  type,
  onSubmit,
  loading,
  products,
  customers,
  invoices = []
}: InvoiceFormProps) {
  // États du formulaire
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    customerTaxId: '',
    notes: '',
    terms: '',
    dueDate: '',
    taxRate: 20,
    items: [],
    ...initialData
  })

  const [originalInvoiceId, setOriginalInvoiceId] = useState('')
  const [searchProduct, setSearchProduct] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  // Calculs automatiques
  const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0)
  const totalDiscount = formData.items.reduce((sum, item) => sum + item.discountAmount, 0)
  const taxAmount = (subtotal * formData.taxRate) / 100
  const total = subtotal + taxAmount

  // Filtrer les produits selon la recherche
  useEffect(() => {
    if (searchProduct.trim()) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchProduct.toLowerCase())
      )
      setFilteredProducts(filtered.slice(0, 10))
    } else {
      setFilteredProducts([])
    }
  }, [searchProduct, products])

  const updateFormData = (field: keyof InvoiceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCustomerSelect = (selectedCustomerId: string) => {
    const customer = customers.find(c => c.id === selectedCustomerId)
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone || '',
        customerEmail: customer.email || '',
        customerAddress: customer.address || '',
      }))
    }
  }

  const handleOriginalInvoiceSelect = (selectedInvoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === selectedInvoiceId)
    if (invoice) {
      setOriginalInvoiceId(invoice.id)
      setFormData(prev => ({
        ...prev,
        customerName: invoice.customerName,
      }))
    }
  }

  const addProductToInvoice = (product: Product) => {
    const existingItem = formData.items.find(item => item.productId === product.id)
    
    if (existingItem) {
      updateItemQuantity(existingItem.id, existingItem.quantity + 1)
    } else {
      const newItem: InvoiceItem = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        description: product.description || '',
        quantity: 1,
        unitPrice: product.price,
        discountAmount: 0,
        total: product.price,
      }
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }))
    }
    setSearchProduct('')
  }

  const addCustomItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      productName: 'Article personnalisé',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discountAmount: 0,
      total: 0,
    }
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const updateItem = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value }
          updatedItem.total = (updatedItem.quantity * updatedItem.unitPrice) - updatedItem.discountAmount
          return updatedItem
        }
        return item
      })
    }))
  }

  const updateItemQuantity = (itemId: string, quantity: number) => {
    updateItem(itemId, 'quantity', Math.max(1, quantity))
  }

  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      originalInvoiceId: type === 'CREDIT_NOTE' ? originalInvoiceId : undefined,
    }
    
    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>
            Informations de la {type === 'CREDIT_NOTE' ? 'Facture d\'Avoir' : 'Facture'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">
                Numéro de {type === 'CREDIT_NOTE' ? 'Facture d\'Avoir' : 'Facture'}
              </Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => updateFormData('invoiceNumber', e.target.value)}
                required
              />
            </div>
            {type === 'INVOICE' && (
              <div>
                <Label htmlFor="dueDate">Date d'Échéance</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => updateFormData('dueDate', e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taxRate">Taux de TVA (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.taxRate}
                onChange={(e) => updateFormData('taxRate', parseFloat(e.target.value) || 0)}
              />
            </div>
            {type === 'CREDIT_NOTE' && invoices.length > 0 && (
              <div>
                <Label htmlFor="originalInvoice">Facture Originale (Optionnel)</Label>
                <Select value={originalInvoiceId} onValueChange={handleOriginalInvoiceSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la facture originale" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        {invoice.invoiceNumber} - {invoice.customerName} ({invoice.total.toLocaleString('fr-FR')} €)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informations client */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Informations Client</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="customer">Client Existant</Label>
            <Select value={formData.customerId || ''} onValueChange={handleCustomerSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client existant (optionnel)" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} {customer.company && `(${customer.company})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Nom du Client *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => updateFormData('customerName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Téléphone</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) => updateFormData('customerPhone', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => updateFormData('customerEmail', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="customerTaxId">Numéro Fiscal</Label>
              <Input
                id="customerTaxId"
                value={formData.customerTaxId}
                onChange={(e) => updateFormData('customerTaxId', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="customerAddress">Adresse</Label>
            <Textarea
              id="customerAddress"
              value={formData.customerAddress}
              onChange={(e) => updateFormData('customerAddress', e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Articles */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Articles {type === 'CREDIT_NOTE' ? 'à Rembourser' : 'de la Facture'}
            <Button type="button" onClick={addCustomItem} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Article Personnalisé
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recherche de produits */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un produit par nom ou SKU..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="pl-10"
            />
            {filteredProducts.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addProductToInvoice(product)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b last:border-b-0"
                  >
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      SKU: {product.sku} • Prix: {product.price.toLocaleString('fr-FR')} € • Stock: {product.stock}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Liste des articles */}
          {formData.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun article ajouté. Recherchez un produit ou ajoutez un article personnalisé.
            </div>
          ) : (
            <div className="space-y-4">
              {formData.items.map((item) => (
                <div key={item.id} className={`border rounded-lg p-4 space-y-3 ${
                  type === 'CREDIT_NOTE' ? 'bg-red-50' : ''
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nom du Produit</Label>
                      <Input
                        value={item.productName}
                        onChange={(e) => updateItem(item.id, 'productName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>SKU</Label>
                      <Input
                        value={item.productSku || ''}
                        onChange={(e) => updateItem(item.id, 'productSku', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Input
                      value={item.description || ''}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                    <div>
                      <Label>Quantité</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <Label>Prix Unitaire (€)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Remise (€)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.discountAmount}
                        onChange={(e) => updateItem(item.id, 'discountAmount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Total (€)</Label>
                      <div className={`p-2 rounded font-semibold ${
                        type === 'CREDIT_NOTE' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-gray-100'
                      }`}>
                        {type === 'CREDIT_NOTE' ? '-' : ''}
                        {item.total.toLocaleString('fr-FR')}
                      </div>
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totaux */}
      <Card className={`glass ${type === 'CREDIT_NOTE' ? 'border-red-200' : ''}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${
            type === 'CREDIT_NOTE' ? 'text-red-700' : ''
          }`}>
            <Calculator className="w-5 h-5" />
            {type === 'CREDIT_NOTE' ? 'Totaux de Remboursement' : 'Totaux'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Sous-total:</span>
              <span className={`font-semibold ${type === 'CREDIT_NOTE' ? 'text-red-600' : ''}`}>
                {type === 'CREDIT_NOTE' ? '-' : ''}
                {subtotal.toLocaleString('fr-FR')} €
              </span>
            </div>
            <div className="flex justify-between">
              <span>Remise totale:</span>
              <span className={`font-semibold ${type === 'CREDIT_NOTE' ? '' : 'text-red-600'}`}>
                {type === 'CREDIT_NOTE' ? '+' : '-'}
                {totalDiscount.toLocaleString('fr-FR')} €
              </span>
            </div>
            <div className="flex justify-between">
              <span>TVA ({formData.taxRate}%):</span>
              <span className={`font-semibold ${type === 'CREDIT_NOTE' ? 'text-red-600' : ''}`}>
                {type === 'CREDIT_NOTE' ? '-' : ''}
                {taxAmount.toLocaleString('fr-FR')} €
              </span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg">
                <span className="font-bold">
                  {type === 'CREDIT_NOTE' ? 'Total à Rembourser:' : 'Total TTC:'}
                </span>
                <span className={`font-bold ${
                  type === 'CREDIT_NOTE' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {type === 'CREDIT_NOTE' ? '-' : ''}
                  {total.toLocaleString('fr-FR')} €
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes et conditions */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Notes et Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notes">
              {type === 'CREDIT_NOTE' ? 'Motif du Remboursement' : 'Notes Internes'}
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateFormData('notes', e.target.value)}
              rows={3}
              placeholder={
                type === 'CREDIT_NOTE' 
                  ? 'Motif du remboursement (retour produit, erreur de facturation, etc.)'
                  : 'Notes internes (non visibles sur la facture)'
              }
            />
          </div>
          <div>
            <Label htmlFor="terms">Conditions</Label>
            <Textarea
              id="terms"
              value={formData.terms}
              onChange={(e) => updateFormData('terms', e.target.value)}
              rows={3}
              placeholder={
                type === 'CREDIT_NOTE' 
                  ? 'Conditions de remboursement'
                  : 'Conditions de paiement et mentions légales'
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit button sera géré par le parent */}
    </form>
  )
}
