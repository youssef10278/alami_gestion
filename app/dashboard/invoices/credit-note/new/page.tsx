'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Trash2, Search, Calculator, FileText } from 'lucide-react'
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
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

interface Invoice {
  id: string
  invoiceNumber: string
  customerName: string
  total: number
  createdAt: string
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

export default function NewCreditNotePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState('')
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Données de la facture d'avoir
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [originalInvoiceId, setOriginalInvoiceId] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerTaxId, setCustomerTaxId] = useState('')
  const [notes, setNotes] = useState('')
  const [terms, setTerms] = useState('')
  const [taxRate, setTaxRate] = useState(20)

  // Articles de la facture d'avoir
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [searchProduct, setSearchProduct] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  // Calculs
  const [subtotal, setSubtotal] = useState(0)
  const [totalDiscount, setTotalDiscount] = useState(0)
  const [taxAmount, setTaxAmount] = useState(0)
  const [total, setTotal] = useState(0)

  // Charger les données initiales
  useEffect(() => {
    fetchProducts()
    fetchCustomers()
    fetchInvoices()
    fetchNextInvoiceNumber()
  }, [])

  // Filtrer les produits selon la recherche
  useEffect(() => {
    console.log('🔍 Recherche produit:', searchProduct, 'Produits disponibles:', products.length)
    if (searchProduct.trim()) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchProduct.toLowerCase())
      )
      console.log('📋 Produits filtrés:', filtered.length)
      setFilteredProducts(filtered.slice(0, 10))
    } else {
      setFilteredProducts([])
    }
  }, [searchProduct, products])

  // Recalculer les totaux quand les articles changent (pour facture d'avoir)
  useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => sum + item.total, 0)
    const newTotalDiscount = items.reduce((sum, item) => sum + item.discountAmount, 0)
    const newTaxAmount = (newSubtotal * taxRate) / 100
    // Pour une facture d'avoir: total = -(sous-total - remise + TVA)
    const newTotal = -(newSubtotal - newTotalDiscount + newTaxAmount)

    setSubtotal(newSubtotal)
    setTotalDiscount(newTotalDiscount)
    setTaxAmount(newTaxAmount)
    setTotal(newTotal)
  }, [items, taxRate])

  const fetchProducts = async () => {
    setLoadingProducts(true)
    try {
      console.log('🔄 Chargement des produits pour facture d\'avoir...')
      // ✅ CORRECTION: Utiliser l'API rapide optimisée
      const response = await fetch('/api/products/fast?limit=all&cache=true')
      if (response.ok) {
        const data = await response.json()
        const productsList = data.products || data
        setProducts(Array.isArray(productsList) ? productsList : [])
        console.log('✅ Produits chargés pour facture d\'avoir:', productsList.length)
      } else {
        console.error('❌ Erreur API produits:', response.status, response.statusText)
        setProducts([])
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des produits:', error)
      setProducts([])
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers?limit=1000')
      if (response.ok) {
        const data = await response.json()
        const customersList = data.customers || data
        setCustomers(Array.isArray(customersList) ? customersList : [])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      setCustomers([])
    }
  }

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices?type=INVOICE&limit=1000')
      if (response.ok) {
        const data = await response.json()
        const invoicesList = data.invoices || []
        setInvoices(Array.isArray(invoicesList) ? invoicesList : [])
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      setInvoices([])
    }
  }

  const fetchNextInvoiceNumber = async () => {
    try {
      const response = await fetch('/api/invoices/next-number?type=CREDIT_NOTE')
      if (response.ok) {
        const data = await response.json()
        setNextInvoiceNumber(data.nextNumber)
        setInvoiceNumber(data.nextNumber)
      }
    } catch (error) {
      console.error('Error fetching next invoice number:', error)
    }
  }

  const handleCustomerSelect = (selectedCustomerId: string) => {
    const customer = customers.find(c => c.id === selectedCustomerId)
    if (customer) {
      setCustomerId(customer.id)
      setCustomerName(customer.name)
      setCustomerPhone(customer.phone || '')
      setCustomerEmail(customer.email || '')
      setCustomerAddress(customer.address || '')
    }
  }

  const handleOriginalInvoiceSelect = (selectedInvoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === selectedInvoiceId)
    if (invoice) {
      setOriginalInvoiceId(invoice.id)
      setCustomerName(invoice.customerName)
      // Optionnel: pré-remplir avec les données de la facture originale
    }
  }

  const addProductToInvoice = (product: Product) => {
    const existingItem = items.find(item => item.productId === product.id)
    
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
      setItems([...items, newItem])
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
    setItems([...items, newItem])
  }

  const updateItem = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value }
        updatedItem.total = (updatedItem.quantity * updatedItem.unitPrice) - updatedItem.discountAmount
        return updatedItem
      }
      return item
    }))
  }

  const updateItemQuantity = (itemId: string, quantity: number) => {
    updateItem(itemId, 'quantity', Math.max(1, quantity))
  }

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customerName.trim()) {
      toast.error('Le nom du client est requis')
      return
    }

    if (items.length === 0) {
      toast.error('Au moins un article est requis')
      return
    }

    setLoading(true)

    try {
      const invoiceData = {
        type: 'CREDIT_NOTE',
        invoiceNumber,
        originalInvoiceId: originalInvoiceId || undefined,
        customerId: customerId || undefined,
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        customerTaxId,
        subtotal,
        discountAmount: totalDiscount,
        taxRate,
        taxAmount,
        total,
        notes,
        terms,
        items: items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount,
          total: item.total,
        })),
      }

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      })

      if (response.ok) {
        const invoice = await response.json()
        toast.success('Facture d\'avoir créée avec succès')
        router.push(`/dashboard/invoices/${invoice.id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la création de la facture d\'avoir')
      }
    } catch (error) {
      console.error('Error creating credit note:', error)
      toast.error('Erreur lors de la création de la facture d\'avoir')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-red-600">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">🧾 Nouvelle Facture d'Avoir</h1>
            <p className="text-red-100 mt-1">
              Créez une facture d'avoir pour remboursement ou correction
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Informations de la Facture d'Avoir</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">Numéro de Facture d'Avoir</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder={nextInvoiceNumber}
                  required
                />
              </div>
              <div>
                <Label htmlFor="taxRate">Taux de TVA (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="originalInvoice">Facture Originale (Optionnel)</Label>
              <Select value={originalInvoiceId} onValueChange={handleOriginalInvoiceSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la facture originale (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  {invoices.map((invoice) => (
                    <SelectItem key={invoice.id} value={invoice.id}>
                      {invoice.invoiceNumber} - {invoice.customerName} ({invoice.total.toLocaleString('fr-FR')} DH)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select value={customerId} onValueChange={handleCustomerSelect}>
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
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Téléphone</Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="customerTaxId">Numéro Fiscal</Label>
                <Input
                  id="customerTaxId"
                  value={customerTaxId}
                  onChange={(e) => setCustomerTaxId(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customerAddress">Adresse</Label>
              <Textarea
                id="customerAddress"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Articles */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Articles à Rembourser
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
                        SKU: {product.sku} • Prix: {product.price.toLocaleString('fr-FR')} DH • Stock: {product.stock}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Liste des articles */}
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun article ajouté. Recherchez un produit ou ajoutez un article personnalisé.
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3 bg-red-50">
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
                        <Label>Prix Unitaire (DH)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Remise (DH)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.discountAmount}
                          onChange={(e) => updateItem(item.id, 'discountAmount', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Total (DH)</Label>
                        <div className="p-2 bg-red-100 rounded font-semibold text-red-700">
                          -{item.total.toLocaleString('fr-FR')}
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
        <Card className="glass border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Calculator className="w-5 h-5" />
              Totaux de Remboursement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span className="font-semibold text-red-600">-{subtotal.toLocaleString('fr-FR')} DH</span>
              </div>
              <div className="flex justify-between">
                <span>Remise totale:</span>
                <span className="font-semibold text-green-600">+{totalDiscount.toLocaleString('fr-FR')} DH</span>
              </div>
              <div className="flex justify-between">
                <span>TVA ({taxRate}%):</span>
                <span className="font-semibold text-red-600">-{taxAmount.toLocaleString('fr-FR')} DH</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total à Rembourser:</span>
                  <span className="font-bold text-red-600">{total.toLocaleString('fr-FR')} DH</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes et conditions */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Notes et Motif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notes">Motif du Remboursement</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Motif du remboursement (retour produit, erreur de facturation, etc.)"
              />
            </div>
            <div>
              <Label htmlFor="terms">Conditions</Label>
              <Textarea
                id="terms"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={3}
                placeholder="Conditions de remboursement"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/dashboard/invoices">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
            {loading ? 'Création...' : 'Créer la Facture d\'Avoir'}
          </Button>
        </div>
      </form>
    </div>
  )
}
