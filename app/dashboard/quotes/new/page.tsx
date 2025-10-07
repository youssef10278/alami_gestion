'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import Link from 'next/link'

interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
}

interface Product {
  id: string
  sku: string
  name: string
  price: number
  stock: number
}

interface QuoteItem {
  productId: string | null
  productName: string
  productSku: string | null
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

export default function NewQuotePage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [searchProduct, setSearchProduct] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    validUntil: '',
    notes: '',
    terms: 'Devis valable pour la durée indiquée. Prix TTC. Paiement à la commande.',
  })

  const [items, setItems] = useState<QuoteItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(0)

  useEffect(() => {
    fetchCustomers()
    fetchProducts()
    
    // Date de validité par défaut : 30 jours
    const defaultValidUntil = new Date()
    defaultValidUntil.setDate(defaultValidUntil.getDate() + 30)
    setFormData(prev => ({
      ...prev,
      validUntil: defaultValidUntil.toISOString().split('T')[0]
    }))
  }, [])

  useEffect(() => {
    if (searchProduct) {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchProduct.toLowerCase())
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts([])
    }
  }, [searchProduct, products])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers?limit=1000')
      if (response.ok) {
        const data = await response.json()
        // L'API retourne { customers: [...], pagination: {...} }
        const customersList = data.customers || data
        setCustomers(Array.isArray(customersList) ? customersList : [])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      setCustomers([])
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=1000')
      if (response.ok) {
        const data = await response.json()
        // L'API retourne { products: [...], pagination: {...} }
        const productsList = data.products || data
        setProducts(Array.isArray(productsList) ? productsList : [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    }
  }

  const handleCustomerChange = (customerId: string) => {
    if (customerId === 'walk-in') {
      setFormData({
        ...formData,
        customerId: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        customerAddress: '',
      })
    } else {
      const customer = customers.find(c => c.id === customerId)
      if (customer) {
        setFormData({
          ...formData,
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.phone || '',
          customerEmail: customer.email || '',
          customerAddress: customer.address || '',
        })
      }
    }
  }

  const addProduct = (product: Product) => {
    const existingItem = items.find(item => item.productId === product.id)
    
    if (existingItem) {
      setItems(items.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice - item.discount }
          : item
      ))
    } else {
      setItems([...items, {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: 1,
        unitPrice: Number(product.price),
        discount: 0,
        total: Number(product.price),
      }])
    }
    
    setSearchProduct('')
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Recalculer le total de la ligne
    const item = newItems[index]
    item.total = item.quantity * item.unitPrice - item.discount
    
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const total = subtotal - discount + tax
    return { subtotal, total }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerName) {
      toast.error('Veuillez saisir le nom du client')
      return
    }

    if (items.length === 0) {
      toast.error('Veuillez ajouter au moins un article')
      return
    }

    if (!formData.validUntil) {
      toast.error('Veuillez saisir la date de validité')
      return
    }

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: formData.customerId || null,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone || null,
          customerEmail: formData.customerEmail || null,
          customerAddress: formData.customerAddress || null,
          validUntil: formData.validUntil,
          items,
          discount,
          tax,
          notes: formData.notes || null,
          terms: formData.terms || null,
        }),
      })

      if (response.ok) {
        const quote = await response.json()
        toast.success('Devis créé avec succès')
        router.push(`/dashboard/quotes/${quote.id}`)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erreur lors de la création du devis')
      }
    } catch (error) {
      console.error('Error creating quote:', error)
      toast.error('Erreur lors de la création du devis')
    }
  }

  const { subtotal, total } = calculateTotals()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/dashboard/quotes">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">➕ Nouveau Devis</h1>
          <p className="text-blue-100">Créez un devis pour votre client</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations Client */}
          <Card>
            <CardHeader>
              <CardTitle>👤 Informations Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer">Client</Label>
                <select
                  id="customer"
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="walk-in">🚶 Client de passage (saisie manuelle)</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.phone ? `- ${customer.phone}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Nom <span className="text-red-500">*</span></Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Téléphone</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="validUntil">Valide jusqu'au <span className="text-red-500">*</span></Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="customerAddress">Adresse</Label>
                <Input
                  id="customerAddress"
                  value={formData.customerAddress}
                  onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Articles */}
          <Card>
            <CardHeader>
              <CardTitle>📦 Articles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recherche de produit */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="🔍 Rechercher un produit..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="pl-10"
                />

                {/* Liste déroulante des produits */}
                {filteredProducts.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => addProduct(product)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{Number(product.price).toFixed(2)} DH</p>
                            <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tableau des articles */}
              {items.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qté</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prix Unit.</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remise</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                            {item.productSku && (
                              <div className="text-sm text-gray-500">SKU: {item.productSku}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-20"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-28"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.discount}
                              onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                              className="w-28"
                            />
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            {item.total.toFixed(2)} DH
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {items.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucun article ajouté. Recherchez un produit ci-dessus.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Totaux et Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>📝 Notes et Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notes">Notes internes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Notes visibles uniquement en interne..."
                  />
                </div>
                <div>
                  <Label htmlFor="terms">Conditions générales</Label>
                  <Textarea
                    id="terms"
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    rows={3}
                    placeholder="Conditions affichées sur le devis..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Totaux */}
            <Card>
              <CardHeader>
                <CardTitle>💰 Totaux</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sous-total :</span>
                    <span className="font-medium">{subtotal.toFixed(2)} DH</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <Label htmlFor="discount">Remise globale :</Label>
                    <Input
                      id="discount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="w-32"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <Label htmlFor="tax">TVA / Taxe :</Label>
                    <Input
                      id="tax"
                      type="number"
                      step="0.01"
                      min="0"
                      value={tax}
                      onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                      className="w-32"
                    />
                  </div>

                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Total :</span>
                    <span className="text-blue-600">{total.toFixed(2)} DH</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    ✅ Créer le Devis
                  </Button>
                  <Link href="/dashboard/quotes" className="block">
                    <Button type="button" variant="outline" className="w-full">
                      Annuler
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  )
}

