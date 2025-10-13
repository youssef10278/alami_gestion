'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Save, Plus, Trash2, Calculator, Package, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import ValidationDebugger from '@/components/debug/ValidationDebugger'
import ProductAutocomplete from '@/components/invoices/ProductAutocomplete'

interface Customer {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  address?: string
  taxId?: string
}

interface Product {
  id: string
  name: string
  sku?: string
  description?: string
  price: number | string // Peut être un nombre ou une chaîne (Decimal de Prisma)
  category?: {
    id: string
    name: string
  }
}

interface InvoiceItem {
  productId?: string
  productName: string
  productSku?: string
  description?: string
  quantity: number
  unitPrice: number
  discountAmount: number
  total: number
}

export default function NewInvoicePage() {
  usePageTitle('Nouvelle Facture')
  const router = useRouter()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<any[]>([])
  const [lastSubmittedData, setLastSubmittedData] = useState<any>(null)

  // États du formulaire
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    customerTaxId: '',
    notes: '',
    terms: '',
    dueDate: '',
  })

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      productName: '',
      quantity: 1,
      unitPrice: 0,
      discountAmount: 0,
      total: 0,
    }
  ])

  const [taxRate, setTaxRate] = useState(20)

  // Charger les clients et produits
  useEffect(() => {
    fetchCustomers()
    fetchProducts()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers?limit=100')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=1000')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Fonction utilitaire pour convertir le prix en nombre
  const getProductPrice = (price: number | string): number => {
    return typeof price === 'string' ? parseFloat(price) : price
  }

  const selectProduct = (index: number, product: Product) => {
    const productPrice = getProductPrice(product.price)
    setItems(prev => {
      const newItems = [...prev]
      newItems[index] = {
        ...newItems[index],
        productId: product.id,
        productName: product.name,
        productSku: product.sku || '',
        description: product.description || '',
        unitPrice: productPrice,
        total: newItems[index].quantity * productPrice - newItems[index].discountAmount
      }
      return newItems
    })
  }



  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => {
      const newItems = [...prev]
      newItems[index] = { ...newItems[index], [field]: value }
      
      // Recalculer le total de l'item
      if (field === 'quantity' || field === 'unitPrice' || field === 'discountAmount') {
        const quantity = field === 'quantity' ? Number(value) : newItems[index].quantity
        const unitPrice = field === 'unitPrice' ? Number(value) : newItems[index].unitPrice
        const discountAmount = field === 'discountAmount' ? Number(value) : newItems[index].discountAmount
        
        newItems[index].total = (quantity * unitPrice) - discountAmount
      }
      
      return newItems
    })
  }

  const addItem = () => {
    setItems(prev => [...prev, {
      productName: '',
      quantity: 1,
      unitPrice: 0,
      discountAmount: 0,
      total: 0,
    }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index))
    }
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const discountAmount = items.reduce((sum, item) => sum + item.discountAmount, 0)
    const taxAmount = (subtotal - discountAmount) * (taxRate / 100)
    const total = subtotal - discountAmount + taxAmount

    return { subtotal, discountAmount, taxAmount, total }
  }

  const handleCustomerChange = (customerId: string) => {
    if (customerId === 'new') {
      setFormData(prev => ({
        ...prev,
        customerId: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        customerAddress: '',
        customerTaxId: '',
      }))
    } else {
      const customer = customers.find(c => c.id === customerId)
      if (customer) {
        setFormData(prev => ({
          ...prev,
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.phone || '',
          customerEmail: customer.email || '',
          customerAddress: customer.address || '',
          customerTaxId: customer.taxId || '',
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { subtotal, discountAmount, taxAmount, total } = calculateTotals()

      // Validation
      if (!formData.customerName.trim()) {
        toast.error('Le nom du client est requis')
        setSaving(false)
        return
      }

      if (items.some(item => !item.productName.trim() || item.quantity <= 0 || item.unitPrice < 0)) {
        toast.error('Veuillez vérifier les informations des articles')
        setSaving(false)
        return
      }

      const invoiceData = {
        type: 'INVOICE',
        customerId: formData.customerId || null,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone || null,
        customerEmail: formData.customerEmail || null,
        customerAddress: formData.customerAddress || null,
        customerTaxId: formData.customerTaxId || null,
        subtotal,
        discountAmount,
        taxRate,
        taxAmount,
        total,
        notes: formData.notes || null,
        terms: formData.terms || null,
        dueDate: formData.dueDate || null,
        items: items.map(item => ({
          productId: item.productId || null,
          productName: item.productName,
          productSku: item.productSku || null,
          description: item.description || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount,
          total: item.total,
        })),
      }

      // Sauvegarder les données pour le débogage
      setLastSubmittedData(invoiceData)
      setValidationErrors([])

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      })

      if (response.ok) {
        const invoice = await response.json()
        toast.success('Facture créée avec succès')
        router.push(`/dashboard/invoices`)
      } else {
        const error = await response.json()
        console.error('Erreur de création de facture:', error)
        
        if (error.details && Array.isArray(error.details)) {
          setValidationErrors(error.details)
          toast.error('Erreurs de validation détectées. Vérifiez les détails ci-dessous.')
        } else {
          toast.error(error.error || 'Erreur lors de la création de la facture')
        }
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast.error('Erreur lors de la création de la facture')
    } finally {
      setSaving(false)
    }
  }

  const { subtotal, discountAmount, taxAmount, total } = calculateTotals()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white bg-opacity-20 rounded-lg">
            <Calculator className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">📄 Nouvelle Facture</h1>
            <p className="text-blue-100 mt-1">
              Créez une nouvelle facture pour votre client
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Composant de débogage des erreurs de validation */}
        <ValidationDebugger
          errors={validationErrors}
          data={lastSubmittedData}
          onRetry={() => setValidationErrors([])}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations client */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Informations Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customer">Client</Label>
                  <Select value={formData.customerId || 'new'} onValueChange={handleCustomerChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Nouveau client</SelectItem>
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
                    <Label htmlFor="customerTaxId">N° Fiscal</Label>
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
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Articles */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-500" />
                  Articles de la facture
                  <span className="text-sm font-normal text-gray-500">
                    ({items.length} article{items.length > 1 ? 's' : ''})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="space-y-2">




                    {/* Saisie avec autocomplétion */}
                    <div className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-4">
                        <Label>Article *</Label>
                        <ProductAutocomplete
                          products={products}
                          value={item.productName}
                          onChange={(value) => updateItem(index, 'productName', value)}
                          onProductSelect={(product) => selectProduct(index, product)}
                          placeholder="Tapez le nom du produit..."
                        />
                      </div>
                    <div className="col-span-2">
                      <Label>SKU</Label>
                      <Input
                        value={item.productSku || ''}
                        onChange={(e) => updateItem(index, 'productSku', e.target.value)}
                        placeholder="SKU"
                      />
                    </div>
                    <div className="col-span-1">
                      <Label>Qté</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Prix Unit.</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Remise</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.discountAmount}
                        onChange={(e) => updateItem(index, 'discountAmount', Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addItem}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un article
                </Button>
              </CardContent>
            </Card>

            {/* Notes et conditions */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>Notes et Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => updateFormData('notes', e.target.value)}
                    rows={3}
                    placeholder="Notes internes..."
                  />
                </div>
                <div>
                  <Label htmlFor="terms">Conditions de Paiement</Label>
                  <Textarea
                    id="terms"
                    value={formData.terms}
                    onChange={(e) => updateFormData('terms', e.target.value)}
                    rows={3}
                    placeholder="Conditions de paiement..."
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Date d'Échéance</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => updateFormData('dueDate', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Résumé et totaux */}
          <div className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total:</span>
                    <span>{subtotal.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remise totale:</span>
                    <span className="text-red-600">-{discountAmount.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA ({taxRate}%):</span>
                    <span>{taxAmount.toFixed(2)} DH</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total TTC:</span>
                      <span className="text-blue-600">{total.toFixed(2)} DH</span>
                    </div>
                  </div>
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
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Création...' : 'Créer la Facture'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full"
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}