'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Trash2, Search, Calculator, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

interface Invoice {
  id: string
  invoiceNumber: string
  type: 'INVOICE' | 'CREDIT_NOTE'
  customerName: string
  customerPhone?: string
  customerEmail?: string
  customerAddress?: string
  customerTaxId?: string
  subtotal: number
  discountAmount: number
  taxRate: number
  taxAmount: number
  total: number
  notes?: string
  terms?: string
  dueDate?: string
  items: InvoiceItem[]
}

export default function EditInvoicePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [invoice, setInvoice] = useState<Invoice | null>(null)

  // Données de la facture
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerTaxId, setCustomerTaxId] = useState('')
  const [notes, setNotes] = useState('')
  const [terms, setTerms] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [taxRate, setTaxRate] = useState(20)

  // Articles de la facture
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
    fetchInvoice()
    fetchProducts()
  }, [params.id])

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

  // Recalculer les totaux quand les articles changent
  useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => sum + item.total, 0)
    const newTotalDiscount = items.reduce((sum, item) => sum + item.discountAmount, 0)
    const newTaxAmount = (newSubtotal * taxRate) / 100
    const newTotal = newSubtotal + newTaxAmount

    setSubtotal(newSubtotal)
    setTotalDiscount(newTotalDiscount)
    setTaxAmount(newTaxAmount)
    setTotal(newTotal)
  }, [items, taxRate])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
        
        // Pré-remplir les champs
        setInvoiceNumber(data.invoiceNumber)
        setCustomerName(data.customerName)
        setCustomerPhone(data.customerPhone || '')
        setCustomerEmail(data.customerEmail || '')
        setCustomerAddress(data.customerAddress || '')
        setCustomerTaxId(data.customerTaxId || '')
        setNotes(data.notes || '')
        setTerms(data.terms || '')
        setDueDate(data.dueDate ? data.dueDate.split('T')[0] : '')
        setTaxRate(data.taxRate)
        setItems(data.items.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount,
          total: item.total,
        })))
      } else if (response.status === 404) {
        toast.error('Facture non trouvée')
        router.push('/dashboard/invoices')
      } else {
        toast.error('Erreur lors du chargement de la facture')
      }
    } catch (error) {
      console.error('Error fetching invoice:', error)
      toast.error('Erreur lors du chargement de la facture')
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=1000')
      if (response.ok) {
        const data = await response.json()
        const productsList = data.products || data
        setProducts(Array.isArray(productsList) ? productsList : [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
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
        invoiceNumber,
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
        dueDate: dueDate || undefined,
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

      const response = await fetch(`/api/invoices/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      })

      if (response.ok) {
        toast.success('Facture modifiée avec succès')
        router.push(`/dashboard/invoices/${params.id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la modification de la facture')
      }
    } catch (error) {
      console.error('Error updating invoice:', error)
      toast.error('Erreur lors de la modification de la facture')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Facture non trouvée</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`bg-gradient-to-r ${
        invoice.type === 'CREDIT_NOTE' 
          ? 'from-red-600 via-pink-600 to-purple-600' 
          : 'from-blue-600 via-purple-600 to-indigo-600'
      } rounded-xl p-6 text-white`}>
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/invoices/${params.id}`}>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              ✏️ Modifier {invoice.type === 'CREDIT_NOTE' ? 'la Facture d\'Avoir' : 'la Facture'}
            </h1>
            <p className={`${invoice.type === 'CREDIT_NOTE' ? 'text-red-100' : 'text-blue-100'} mt-1`}>
              {invoice.invoiceNumber} - {invoice.customerName}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Informations de la Facture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">Numéro de Facture</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Date d'Échéance</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
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
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informations client */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Informations Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              Articles de la Facture
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
                  <div key={item.id} className={`border rounded-lg p-4 space-y-3 ${
                    invoice.type === 'CREDIT_NOTE' ? 'bg-red-50' : ''
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
                        <div className={`p-2 rounded font-semibold ${
                          invoice.type === 'CREDIT_NOTE' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-gray-100'
                        }`}>
                          {invoice.type === 'CREDIT_NOTE' ? '-' : ''}
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
        <Card className={`glass ${invoice.type === 'CREDIT_NOTE' ? 'border-red-200' : ''}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${
              invoice.type === 'CREDIT_NOTE' ? 'text-red-700' : ''
            }`}>
              <Calculator className="w-5 h-5" />
              {invoice.type === 'CREDIT_NOTE' ? 'Totaux de Remboursement' : 'Totaux'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span className={`font-semibold ${invoice.type === 'CREDIT_NOTE' ? 'text-red-600' : ''}`}>
                  {invoice.type === 'CREDIT_NOTE' ? '-' : ''}
                  {subtotal.toLocaleString('fr-FR')} DH
                </span>
              </div>
              <div className="flex justify-between">
                <span>Remise totale:</span>
                <span className={`font-semibold ${invoice.type === 'CREDIT_NOTE' ? '' : 'text-red-600'}`}>
                  {invoice.type === 'CREDIT_NOTE' ? '+' : '-'}
                  {totalDiscount.toLocaleString('fr-FR')} DH
                </span>
              </div>
              <div className="flex justify-between">
                <span>TVA ({taxRate}%):</span>
                <span className={`font-semibold ${invoice.type === 'CREDIT_NOTE' ? 'text-red-600' : ''}`}>
                  {invoice.type === 'CREDIT_NOTE' ? '-' : ''}
                  {taxAmount.toLocaleString('fr-FR')} DH
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg">
                  <span className="font-bold">
                    {invoice.type === 'CREDIT_NOTE' ? 'Total à Rembourser:' : 'Total TTC:'}
                  </span>
                  <span className={`font-bold ${
                    invoice.type === 'CREDIT_NOTE' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {invoice.type === 'CREDIT_NOTE' ? '-' : ''}
                    {total.toLocaleString('fr-FR')} DH
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
                {invoice.type === 'CREDIT_NOTE' ? 'Motif du Remboursement' : 'Notes Internes'}
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder={
                  invoice.type === 'CREDIT_NOTE' 
                    ? 'Motif du remboursement (retour produit, erreur de facturation, etc.)'
                    : 'Notes internes (non visibles sur la facture)'
                }
              />
            </div>
            <div>
              <Label htmlFor="terms">Conditions</Label>
              <Textarea
                id="terms"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={3}
                placeholder={
                  invoice.type === 'CREDIT_NOTE' 
                    ? 'Conditions de remboursement'
                    : 'Conditions de paiement et mentions légales'
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href={`/dashboard/invoices/${params.id}`}>
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
          </Button>
        </div>
      </form>
    </div>
  )
}
