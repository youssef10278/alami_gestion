'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BarcodeScannerButton } from '@/components/ui/barcode-scanner'
import { toast } from 'sonner'
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner'
import { Scan } from 'lucide-react'

interface Product {
  id: string
  sku: string
  name: string
  price: number
  stock: number
}

interface Customer {
  id: string
  name: string
  company: string | null
  creditLimit: number
  creditUsed: number
  isBlocked: boolean
}

interface CartItem {
  product: Product
  quantity: number
}

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isWalkInCustomer, setIsWalkInCustomer] = useState(true) // Par défaut client de passage
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchProduct, setSearchProduct] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [amountPaid, setAmountPaid] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Détection automatique du scanner physique
  const { isScanning } = useBarcodeScanner({
    onScan: (barcode) => {
      const product = products.find((p) => p.sku === barcode)
      if (product) {
        addToCart(product)
        toast.success(`${product.name} ajouté au panier`, {
          description: 'Scanné avec succès',
          icon: <Scan className="w-4 h-4" />,
        })
      } else {
        toast.error('Produit non trouvé', {
          description: `Code-barres: ${barcode}`,
        })
      }
    },
    enabled: true,
    minLength: 3,
  })

  useEffect(() => {
    fetchProducts()
    fetchCustomers()
  }, [])

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

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id)
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert('Stock insuffisant')
        return
      }
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    const item = cart.find(i => i.product.id === productId)
    if (!item) return

    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    if (quantity > item.product.stock) {
      alert('Stock insuffisant')
      return
    }

    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity }
        : item
    ))
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation : Crédit nécessite un client enregistré
    if (!selectedCustomer && paymentMethod === 'CREDIT') {
      toast.error('Le paiement à crédit nécessite un client enregistré')
      return
    }

    if (cart.length === 0) {
      toast.error('Le panier est vide')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomer?.id || null,
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          paymentMethod,
          amountPaid: parseFloat(amountPaid) || 0,
          notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Erreur lors de la création de la vente')
        setLoading(false)
        return
      }

      // Réinitialiser le formulaire
      setCart([])
      setSelectedCustomer(null)
      setIsWalkInCustomer(true) // Retour à client de passage par défaut
      setAmountPaid('')
      setNotes('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      
      // Rafraîchir les données
      fetchProducts()
      fetchCustomers()
    } catch (error) {
      console.error('Error creating sale:', error)
      alert('Erreur lors de la création de la vente')
    } finally {
      setLoading(false)
    }
  }

  const total = calculateTotal()
  const paid = parseFloat(amountPaid) || 0
  const remaining = total - paid
  const creditAvailable = selectedCustomer 
    ? Number(selectedCustomer.creditLimit) - Number(selectedCustomer.creditUsed)
    : 0

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchProduct.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header Premium */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 backdrop-blur-3xl"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-1 drop-shadow-lg">
                Nouvelle Vente
              </h1>
              <p className="text-purple-100 text-sm">
                Interface de vente rapide et intuitive
              </p>
              <div className="flex items-center gap-2 mt-2">
                {isScanning && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-lg animate-pulse">
                    <Scan className="w-4 h-4" />
                    <span className="text-xs font-medium">Scanner actif...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {success && (
        <div className="relative overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-800 px-6 py-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-full">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-lg">Vente créée avec succès !</p>
              <p className="text-sm text-green-600">La transaction a été enregistrée</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Produits */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Produits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recherche et Scanner */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher un produit..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <BarcodeScannerButton
                  onScan={(barcode) => {
                    // Rechercher le produit par SKU
                    const product = products.find((p) => p.sku === barcode)
                    if (product) {
                      addToCart(product)
                      toast.success(`${product.name} ajouté au panier`)
                    } else {
                      toast.error('Produit non trouvé')
                    }
                  }}
                />
              </div>

              {/* Liste des produits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => addToCart(product)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{product.name}</h4>
                        <p className="text-xs text-gray-500">{product.sku}</p>
                      </div>
                      <Plus className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-blue-600 font-bold">{Number(product.price).toFixed(2)} DH</span>
                      <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panier et Paiement */}
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Client */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm">Client</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedCustomer?.id || 'walk-in'}
                  onValueChange={(value) => {
                    if (value === 'walk-in') {
                      setSelectedCustomer(null)
                      setIsWalkInCustomer(true)
                      // Si le paiement était à crédit, revenir à espèces
                      if (paymentMethod === 'CREDIT') {
                        setPaymentMethod('CASH')
                        toast.info('Mode de paiement changé en Espèces')
                      }
                    } else {
                      const customer = customers.find(c => c.id === value)
                      setSelectedCustomer(customer || null)
                      setIsWalkInCustomer(false)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Option Client de passage */}
                    <SelectItem value="walk-in">
                      <div className="flex items-center gap-2">
                        <span>🚶</span>
                        <span className="font-semibold">Client de passage</span>
                      </div>
                    </SelectItem>

                    {/* Séparateur */}
                    <div className="border-t my-1"></div>

                    {/* Clients enregistrés */}
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex items-center gap-2">
                          <span>👤</span>
                          <span>
                            {customer.name}
                            {customer.company && ` (${customer.company})`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCustomer ? (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-blue-900">💳 Crédit disponible:</span>
                      <span className="text-blue-600 font-bold">{creditAvailable.toFixed(2)} DH</span>
                    </div>
                  </div>
                ) : isWalkInCustomer ? (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>🚶</span>
                      <span className="font-medium">Vente au comptant uniquement</span>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Panier */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm">Panier ({cart.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Panier vide
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.product.name}</p>
                          <p className="text-xs text-gray-500">{Number(item.product.price).toFixed(2)} DH</p>
                        </div>
                        <Input
                          type="number"
                          min="1"
                          max={item.product.stock}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value))}
                          className="w-16 h-8 text-center"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Paiement */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm">Paiement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Méthode</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(value) => {
                      // Si client de passage et tentative de paiement à crédit, bloquer
                      if (!selectedCustomer && value === 'CREDIT') {
                        toast.error('Le paiement à crédit nécessite un client enregistré')
                        return
                      }
                      setPaymentMethod(value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">
                        <div className="flex items-center gap-2">
                          <span>💵</span>
                          <span>Espèces</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="CARD">
                        <div className="flex items-center gap-2">
                          <span>💳</span>
                          <span>Carte</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="TRANSFER">
                        <div className="flex items-center gap-2">
                          <span>🏦</span>
                          <span>Virement</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="CREDIT"
                        disabled={!selectedCustomer}
                      >
                        <div className="flex items-center gap-2">
                          <span>📝</span>
                          <span>Crédit</span>
                          {!selectedCustomer && (
                            <span className="text-xs text-gray-400">(Client requis)</span>
                          )}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {isWalkInCustomer && paymentMethod === 'CREDIT' && (
                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                      <span>⚠️</span>
                      <span>Paiement à crédit non disponible pour les clients de passage</span>
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-xs">Montant payé (DH)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="pt-2 border-t space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span className="font-bold">{total.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Payé:</span>
                    <span className="text-green-600">{paid.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span>Reste:</span>
                    <span className={remaining > 0 ? 'text-orange-600' : 'text-green-600'}>
                      {remaining.toFixed(2)} DH
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || cart.length === 0}
                >
                  {loading ? 'Traitement...' : 'Valider la vente'}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}

