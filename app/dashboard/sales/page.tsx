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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { toast } from 'sonner'
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner'
import DeliveryNoteButton from '@/components/sales/DeliveryNoteButton'
import { Scan } from 'lucide-react'
import { safeToFixed, safeNumber } from '@/lib/utils'
import { notifyDashboardUpdate } from '@/hooks/useDashboardStats'

interface Product {
  id: string
  sku: string
  name: string
  price: number
  stock: number
  image?: string | null
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
  customPrice?: number // Prix personnalisé pour négociation
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
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingAllProducts, setLoadingAllProducts] = useState(false)
  const [success, setSuccess] = useState(false)
  const [lastSale, setLastSale] = useState<any>(null)
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false)
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
  })
  const [creatingCustomer, setCreatingCustomer] = useState(false)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)

  // États pour les informations du chèque
  const [checkNumber, setCheckNumber] = useState('')
  const [checkIssuer, setCheckIssuer] = useState('')
  const [checkBeneficiary, setCheckBeneficiary] = useState('')
  const [checkDate, setCheckDate] = useState('')

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
      setLoadingProducts(true)

      // ✅ OPTIMISATION: Utilisation de l'API optimisée avec cache
      const response = await fetch('/api/products/sales?limit=500&cache=true')
      const data = await response.json()
      setProducts(data.products || [])
      setLoadingProducts(false)

      // Afficher un indicateur si on charge plus de produits en arrière-plan
      if (data.pagination?.total > 500) {
        setLoadingAllProducts(true)

        // Chargement différé du reste des produits
        setTimeout(async () => {
          try {
            const fullResponse = await fetch('/api/products/sales?limit=0&cache=true')
            const fullData = await fullResponse.json()
            setProducts(fullData.products || [])
            setLoadingAllProducts(false)
          } catch (error) {
            console.error('Error fetching all products:', error)
            setLoadingAllProducts(false)
          }
        }, 500) // Délai de 500ms pour laisser l'UI se stabiliser
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setLoadingProducts(false)
      setLoadingAllProducts(false)
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

  const handleCreateCustomer = async () => {
    if (!newCustomerData.name.trim()) {
      toast.error('Le nom du client est requis')
      return
    }

    setCreatingCustomer(true)
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomerData),
      })

      if (response.ok) {
        const newCustomer = await response.json()
        setCustomers([...customers, newCustomer])
        setSelectedCustomer(newCustomer)
        setIsWalkInCustomer(false)
        setShowNewCustomerDialog(false)
        setNewCustomerData({ name: '', phone: '', email: '', company: '' })
        toast.success('Client créé avec succès')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la création du client')
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      toast.error('Erreur lors de la création du client')
    } finally {
      setCreatingCustomer(false)
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

  // Fonction pour mettre à jour le prix personnalisé
  const updateCustomPrice = (productId: string, customPrice: number | undefined) => {
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, customPrice }
        : item
    ))
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      const price = item.customPrice !== undefined ? item.customPrice : safeNumber(item.product.price)
      return sum + (price * item.quantity)
    }, 0)
  }

  const printReceipt = async () => {
    if (!lastSale) return

    // Récupérer les informations de la société
    let companySettings = null
    try {
      const response = await fetch('/api/settings/company')
      if (response.ok) {
        companySettings = await response.json()
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error)
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Impossible d\'ouvrir la fenêtre d\'impression')
      return
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reçu de Vente - ${lastSale.saleNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            max-width: 80mm;
            margin: 0 auto;
          }
          .receipt {
            border: 2px solid #000;
            padding: 15px;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .header .logo {
            max-width: 80px;
            max-height: 80px;
            margin: 0 auto 10px;
            display: block;
          }
          .header h1 {
            font-size: 18px;
            margin-bottom: 5px;
            font-weight: bold;
          }
          .header p {
            font-size: 11px;
            margin: 2px 0;
            color: #333;
          }
          .header .receipt-title {
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0 5px;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            padding: 5px 0;
          }
          .info {
            margin: 10px 0;
            font-size: 12px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          .items {
            border-top: 2px dashed #000;
            border-bottom: 2px dashed #000;
            padding: 10px 0;
            margin: 10px 0;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 12px;
          }
          .item-name {
            flex: 1;
          }
          .item-qty {
            width: 60px;
            text-align: center;
          }
          .item-price {
            width: 80px;
            text-align: right;
          }
          .totals {
            margin: 10px 0;
            font-size: 13px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .total-row.grand {
            font-weight: bold;
            font-size: 16px;
            border-top: 2px solid #000;
            padding-top: 5px;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 2px dashed #000;
            font-size: 11px;
          }
          @media print {
            body {
              padding: 0;
            }
            .receipt {
              border: none;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            ${companySettings?.companyLogo ? `
              <img src="${companySettings.companyLogo}" alt="Logo" class="logo" />
            ` : ''}
            <h1>${companySettings?.companyName || 'ALAMI GESTION'}</h1>
            ${companySettings?.companyAddress ? `<p>📍 ${companySettings.companyAddress}</p>` : ''}
            ${companySettings?.companyPhone ? `<p>📞 ${companySettings.companyPhone}</p>` : ''}
            ${companySettings?.companyEmail ? `<p>📧 ${companySettings.companyEmail}</p>` : ''}
            ${companySettings?.companyICE ? `<p>ICE: ${companySettings.companyICE}</p>` : ''}
            <p class="receipt-title">REÇU DE VENTE</p>
            <p><strong>N° ${lastSale.saleNumber}</strong></p>
          </div>

          <div class="info">
            <div class="info-row">
              <span>Date:</span>
              <span>${new Date(lastSale.createdAt).toLocaleString('fr-FR')}</span>
            </div>
            <div class="info-row">
              <span>Client:</span>
              <span>${lastSale.customer ? lastSale.customer.name : 'Client de passage'}</span>
            </div>
            <div class="info-row">
              <span>Vendeur:</span>
              <span>${lastSale.seller.name}</span>
            </div>
            <div class="info-row">
              <span>Paiement:</span>
              <span>${getPaymentMethodLabel(lastSale.paymentMethod)}</span>
            </div>
          </div>

          <div class="items">
            <div class="item" style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px;">
              <div class="item-name">Article</div>
              <div class="item-qty">Qté</div>
              <div class="item-price">Prix</div>
            </div>
            ${lastSale.items.map((item: any) => `
              <div class="item">
                <div class="item-name">${item.product.name}</div>
                <div class="item-qty">${item.quantity}</div>
                <div class="item-price">${safeToFixed(item.total)} DH</div>
              </div>
              <div class="item" style="font-size: 10px; color: #666; margin-top: -3px;">
                <div class="item-name" style="padding-left: 10px;">
                  ${item.quantity} × ${safeToFixed(item.unitPrice)} DH
                </div>
                <div class="item-qty"></div>
                <div class="item-price"></div>
              </div>
            `).join('')}
          </div>

          <div class="totals">
            <div class="total-row">
              <span>Sous-total:</span>
              <span>${safeToFixed(lastSale.totalAmount)} DH</span>
            </div>
            <div class="total-row">
              <span>Montant payé:</span>
              <span>${safeToFixed(lastSale.paidAmount)} DH</span>
            </div>
            ${safeNumber(lastSale.creditAmount) > 0 ? `
              <div class="total-row" style="color: #d97706;">
                <span>Reste à payer:</span>
                <span>${safeToFixed(lastSale.creditAmount)} DH</span>
              </div>
            ` : ''}
            <div class="total-row grand">
              <span>TOTAL:</span>
              <span>${safeToFixed(lastSale.totalAmount)} DH</span>
            </div>
          </div>

          <div class="footer">
            <p>Merci pour votre achat !</p>
            <p>À bientôt chez ${companySettings?.companyName || 'Alami Gestion'}</p>
            <p style="margin-top: 10px; font-size: 10px;">
              ${new Date().toLocaleString('fr-FR')}
            </p>
          </div>
        </div>

        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; background: #3b82f6; color: white; border: none; border-radius: 5px; margin-right: 10px;">
            🖨️ Imprimer
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; background: #6b7280; color: white; border: none; border-radius: 5px;">
            Fermer
          </button>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(receiptHTML)
    printWindow.document.close()
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH': return '💵 Espèces'
      case 'CARD': return '💳 Carte'
      case 'CHECK': return '📄 Chèque'
      case 'TRANSFER': return '🏦 Virement'
      case 'CREDIT': return '📝 Crédit'
      default: return method
    }
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

    // Validation : Montant payé requis pour crédit (peut être 0)
    if (paymentMethod === 'CREDIT' && amountPaid === '') {
      toast.error('Veuillez saisir le montant payé pour un paiement à crédit (0 si aucun paiement)')
      return
    }

    // Validation : Informations chèque requises
    if (paymentMethod === 'CHECK') {
      if (!checkNumber || !checkIssuer || !checkBeneficiary || !checkDate) {
        toast.error('Veuillez remplir toutes les informations du chèque')
        return
      }
    }

    setLoading(true)

    try {
      const total = calculateTotal()

      // Calcul automatique du montant payé selon la méthode
      let finalAmountPaid = 0
      if (paymentMethod === 'CREDIT') {
        // Pour crédit : utiliser le montant saisi
        finalAmountPaid = parseFloat(amountPaid) || 0
      } else {
        // Pour Espèces/Carte/Chèque/Virement : montant total automatiquement
        finalAmountPaid = total
      }

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
            customPrice: item.customPrice, // Prix personnalisé si négocié
          })),
          paymentMethod,
          amountPaid: finalAmountPaid,
          notes,
        }),
      })

      const data = await response.json()

      console.log('🔍 Réponse API:', { ok: response.ok, status: response.status, data })

      if (!response.ok) {
        toast.error(data.error || 'Erreur lors de la création de la vente')
        setLoading(false)
        return
      }

      // Sauvegarder la vente pour l'impression
      console.log('💾 Sauvegarde de la vente:', data.sale)
      setLastSale(data.sale)

      // Si paiement par chèque, créer l'enregistrement du chèque
      if (paymentMethod === 'CHECK') {
        try {
          const checkResponse = await fetch('/api/sale-checks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              saleId: data.sale.id,
              checkNumber,
              issuer: checkIssuer,
              beneficiary: checkBeneficiary,
              checkDate,
              amount: total,
              notes: `Chèque pour vente ${data.sale.saleNumber}`
            }),
          })

          if (!checkResponse.ok) {
            console.error('Erreur lors de la création du chèque')
            toast.warning('Vente créée mais erreur lors de l\'enregistrement du chèque')
          } else {
            console.log('✅ Chèque enregistré avec succès')
          }
        } catch (checkError) {
          console.error('Erreur lors de la création du chèque:', checkError)
          toast.warning('Vente créée mais erreur lors de l\'enregistrement du chèque')
        }
      }

      // Afficher le dialogue d'impression
      console.log('📋 Affichage du dialogue d\'impression')
      setShowReceiptDialog(true)

      toast.success('Vente créée avec succès !')

      // Notifier la mise à jour du dashboard
      notifyDashboardUpdate()

      // Réinitialiser le formulaire
      setCart([])
      setSelectedCustomer(null)
      setIsWalkInCustomer(true) // Retour à client de passage par défaut
      setAmountPaid('')
      setNotes('')
      // Réinitialiser les champs du chèque
      setCheckNumber('')
      setCheckIssuer('')
      setCheckBeneficiary('')
      setCheckDate('')
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

  // Calcul du montant payé selon la méthode
  const paid = paymentMethod === 'CREDIT'
    ? (parseFloat(amountPaid) || 0)
    : total // Pour Espèces/Carte/Chèque/Virement, montant total automatiquement

  const remaining = total - paid
  const creditAvailable = selectedCustomer
    ? safeNumber(selectedCustomer.creditLimit) - safeNumber(selectedCustomer.creditUsed)
    : 0

  // Log pour déboguer
  console.log('🔍 État du dialogue:', { showReceiptDialog, hasLastSale: !!lastSale })

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchProduct.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Indicateur de scanner (si actif) */}
      {isScanning && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg">
          <Scan className="w-4 h-4" />
          <span className="text-sm font-medium">Scanner actif...</span>
        </div>
      )}

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
        {/* Produits - Design amélioré */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-[hsl(var(--border))] shadow-lg bg-[hsl(var(--card))] backdrop-blur-sm">
            <CardHeader className="border-b border-[hsl(var(--border))] pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--color-business-blue)]/10 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-[var(--color-business-blue)]" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-[hsl(var(--foreground))]">
                      Produits
                    </CardTitle>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                      {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} disponible{filteredProducts.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[hsl(var(--muted-foreground))]">
                    Total catalogue
                  </div>
                  <div className="text-lg font-bold text-[var(--color-business-blue)]">
                    {products.length}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Indicateur de chargement des produits */}
              {loadingProducts && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3 text-[var(--color-business-blue)]">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--color-business-blue)]"></div>
                    <span className="font-medium">Chargement des produits...</span>
                  </div>
                </div>
              )}

              {/* Indicateur de chargement supplémentaire */}
              {loadingAllProducts && !loadingProducts && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                    <span className="text-sm">Chargement de tous les produits en arrière-plan...</span>
                  </div>
                </div>
              )}

              {/* Recherche et Scanner - Design amélioré */}
              {!loadingProducts && (
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--muted-foreground))] w-5 h-5" />
                    <Input
                      placeholder="Rechercher un produit par nom ou SKU..."
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      className="pl-11 h-12 text-base border-2 focus:border-[var(--color-business-blue)] transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Compteur de produits */}
              {!loadingProducts && products.length > 0 && (
                <div className="flex items-center justify-between mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">
                      {products.length} produits disponibles
                      {loadingAllProducts && " (chargement en cours...)"}
                    </span>
                  </div>
                  {filteredProducts.length !== products.length && (
                    <span className="text-xs text-green-600">
                      {filteredProducts.length} affichés
                    </span>
                  )}
                </div>
              )}

              {/* Liste des produits - Design amélioré */}
              {!loadingProducts && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group relative p-4 border-2 border-[hsl(var(--border))] rounded-xl hover:border-[var(--color-business-blue)] hover:shadow-lg cursor-pointer transition-all duration-200 bg-[hsl(var(--card))] hover:bg-[hsl(var(--accent))]"
                    onClick={() => addToCart(product)}
                  >
                    {/* Badge de stock */}
                    <div className="absolute top-3 right-3 z-10">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock > 10
                          ? 'bg-green-100 text-green-700'
                          : product.stock > 0
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                      }`}>
                        {product.stock > 0 ? `${product.stock} en stock` : 'Rupture'}
                      </div>
                    </div>

                    {/* Image et Contenu */}
                    <div className="flex gap-3">
                      {/* Image du produit */}
                      <div className="flex-shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg border border-[hsl(var(--border))]"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpolyline points="21 15 16 10 5 21"%3E%3C/polyline%3E%3C/svg%3E'
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-[hsl(var(--muted))] rounded-lg flex items-center justify-center border border-[hsl(var(--border))]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="32"
                              height="32"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-[hsl(var(--muted-foreground))]"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Contenu principal */}
                      <div className="flex-1 pr-16 min-w-0">
                        <h4 className="font-bold text-base text-[hsl(var(--foreground))] group-hover:text-[var(--color-business-blue)] transition-colors line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 font-mono">
                          {product.sku}
                        </p>
                      </div>
                    </div>

                    {/* Prix et action */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-[var(--color-business-blue)]">
                          {safeToFixed(product.price)} DH
                        </span>
                        <span className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                          Prix unitaire
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-[var(--color-business-blue)]/10 rounded-lg group-hover:bg-[var(--color-business-blue)] transition-colors">
                          <Plus className="w-5 h-5 text-[var(--color-business-blue)] group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>

                    {/* Effet de survol */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--color-business-blue)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                  </div>
                  ))}
                  </div>

                  {/* Message si aucun produit */}
                  {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                      <div className="p-4 bg-[hsl(var(--muted))]/20 rounded-xl inline-block">
                        <ShoppingCart className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
                        <p className="text-[hsl(var(--muted-foreground))] font-medium">
                          {searchProduct ? 'Aucun produit trouvé' : 'Aucun produit disponible'}
                        </p>
                        {searchProduct && (
                          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                            Essayez un autre terme de recherche
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
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
              <CardContent className="space-y-3">
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

                {/* Bouton Nouveau Client */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed border-2 border-green-300 hover:border-green-400 hover:bg-green-50 text-green-700 font-medium"
                  onClick={() => setShowNewCustomerDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau client
                </Button>

                {selectedCustomer ? (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-blue-900">💳 Crédit disponible:</span>
                      <span className="text-blue-600 font-bold">{safeToFixed(creditAvailable)} DH</span>
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
                  <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {cart.map((item) => {
                      const currentPrice = item.customPrice !== undefined ? item.customPrice : safeNumber(item.product.price)
                      const originalPrice = safeNumber(item.product.price)
                      const isDiscounted = item.customPrice !== undefined && item.customPrice < originalPrice

                      return (
                        <div key={item.product.id} className="p-3 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg space-y-3">
                          {/* En-tête du produit */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{item.product.name}</p>
                              <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">{item.product.sku}</p>
                              {isDiscounted && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs line-through text-[hsl(var(--muted-foreground))]">
                                    {safeToFixed(originalPrice)} DH
                                  </span>
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                    Négocié
                                  </span>
                                </div>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Contrôles de quantité et prix */}
                          <div className="grid grid-cols-3 gap-2">
                            {/* Quantité */}
                            <div>
                              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Qté</Label>
                              <Input
                                type="number"
                                min="1"
                                max={item.product.stock}
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value))}
                                className="h-8 text-center text-sm"
                              />
                            </div>

                            {/* Prix unitaire */}
                            <div>
                              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Prix (DH)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={safeToFixed(currentPrice)}
                                onChange={(e) => {
                                  const newPrice = parseFloat(e.target.value)
                                  if (isNaN(newPrice) || newPrice < 0) return
                                  updateCustomPrice(item.product.id, newPrice === originalPrice ? undefined : newPrice)
                                }}
                                className="h-8 text-center text-sm"
                                placeholder={safeToFixed(originalPrice)}
                              />
                            </div>

                            {/* Total ligne */}
                            <div>
                              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Total</Label>
                              <div className="h-8 flex items-center justify-center bg-[hsl(var(--muted))] rounded-md">
                                <span className="text-sm font-bold text-[var(--color-business-blue)]">
                                  {safeToFixed(currentPrice * item.quantity)} DH
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions rapides */}
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateCustomPrice(item.product.id, undefined)}
                              className="text-xs h-7 flex-1"
                              disabled={item.customPrice === undefined}
                            >
                              Prix original
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateCustomPrice(item.product.id, originalPrice * 0.9)}
                              className="text-xs h-7 flex-1"
                            >
                              -10%
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateCustomPrice(item.product.id, originalPrice * 0.8)}
                              className="text-xs h-7 flex-1"
                            >
                              -20%
                            </Button>
                          </div>
                        </div>
                      )
                    })}
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
                      <SelectItem value="CHECK">
                        <div className="flex items-center gap-2">
                          <span>📄</span>
                          <span>Chèque</span>
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

                {/* Champ Montant Payé - Visible uniquement pour Crédit */}
                {paymentMethod === 'CREDIT' && (
                  <div>
                    <Label className="text-xs">
                      Montant payé (DH) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="0.00 (0 = tout à crédit)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Saisissez le montant payé maintenant. Le reste sera en crédit. (0 = tout à crédit)
                    </p>
                  </div>
                )}

                {/* Formulaire pour les informations du chèque */}
                {paymentMethod === 'CHECK' && (
                  <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <span>📄</span>
                      <span className="font-semibold text-blue-800">Informations du chèque</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">
                          Numéro du chèque <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="text"
                          value={checkNumber}
                          onChange={(e) => setCheckNumber(e.target.value)}
                          placeholder="Ex: 1234567"
                          required
                        />
                      </div>

                      <div>
                        <Label className="text-xs">
                          Date du chèque <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={checkDate}
                          onChange={(e) => setCheckDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">
                        Émetteur <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        value={checkIssuer}
                        onChange={(e) => setCheckIssuer(e.target.value)}
                        placeholder="Nom de la personne/entreprise qui émet le chèque"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-xs">
                        Bénéficiaire <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        value={checkBeneficiary}
                        onChange={(e) => setCheckBeneficiary(e.target.value)}
                        placeholder="Nom du bénéficiaire du chèque"
                        required
                      />
                    </div>

                    <div className="p-2 bg-blue-100 rounded text-xs text-blue-700">
                      💡 Le montant du chèque sera automatiquement défini au total de la vente ({safeToFixed(total)} DH)
                    </div>
                  </div>
                )}

                {/* Message pour paiements comptants */}
                {paymentMethod !== 'CREDIT' && paymentMethod !== 'CHECK' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700 flex items-center gap-2">
                      <span>✅</span>
                      <span className="font-medium">
                        Paiement comptant : Le montant total ({safeToFixed(total)} DH) sera automatiquement considéré comme payé.
                      </span>
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span className="font-bold">{safeToFixed(total)} DH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Payé:</span>
                    <span className="text-green-600">{safeToFixed(paid)} DH</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span>Reste:</span>
                    <span className={remaining > 0 ? 'text-orange-600' : 'text-green-600'}>
                      {safeToFixed(remaining)} DH
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="sales"
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

      {/* Dialogue d'impression du reçu */}
      {showReceiptDialog && lastSale && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            console.log('🔴 Fermeture du dialogue (clic fond)')
            setShowReceiptDialog(false)
          }}
        >
          <Card
            className="max-w-md w-full"
            onClick={(e) => {
              console.log('🟢 Clic sur la carte (ne ferme pas)')
              e.stopPropagation()
            }}
          >
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">✅ Vente Réussie !</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-green-600">
                  Vente N° {lastSale.saleNumber}
                </p>
                <p className="text-3xl font-bold">
                  {safeToFixed(lastSale.totalAmount)} DH
                </p>
                {safeNumber(lastSale.creditAmount) > 0 && (
                  <p className="text-sm text-orange-600">
                    Reste à payer : {safeToFixed(lastSale.creditAmount)} DH
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Client :</span>
                  <span className="font-medium">
                    {lastSale.customer ? lastSale.customer.name : '🚶 Client de passage'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paiement :</span>
                  <span className="font-medium">
                    {getPaymentMethodLabel(lastSale.paymentMethod)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Articles :</span>
                  <span className="font-medium">{lastSale.items.length}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => {
                    printReceipt()
                    setShowReceiptDialog(false)
                  }}
                  variant="invoices"
                  className="w-full"
                >
                  🖨️ Imprimer le Reçu
                </Button>

                <DeliveryNoteButton
                  saleId={lastSale.id}
                  saleNumber={lastSale.saleNumber}
                  isGenerated={lastSale.deliveryNoteGenerated || false}
                  className="w-full"
                  onGenerated={() => {
                    // Optionnel: fermer le dialogue après génération
                    // setShowReceiptDialog(false)
                  }}
                />

                <Button
                  onClick={() => setShowReceiptDialog(false)}
                  variant="outline"
                  className="w-full"
                >
                  Fermer
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500">
                💡 Vous pouvez réimprimer ce reçu depuis l'historique des ventes
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Nouveau Client */}
      <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Plus className="w-5 h-5 text-green-600" />
              </div>
              Nouveau client
            </DialogTitle>
            <DialogDescription>
              Créez rapidement un nouveau client pour cette vente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">
                Nom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customer-name"
                placeholder="Nom du client"
                value={newCustomerData.name}
                onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-phone">Téléphone</Label>
              <Input
                id="customer-phone"
                type="tel"
                placeholder="+212 6XX XXX XXX"
                value={newCustomerData.phone}
                onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-email">Email</Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="client@example.com"
                value={newCustomerData.email}
                onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-company">Entreprise</Label>
              <Input
                id="customer-company"
                placeholder="Nom de l'entreprise (optionnel)"
                value={newCustomerData.company}
                onChange={(e) => setNewCustomerData({ ...newCustomerData, company: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowNewCustomerDialog(false)
                setNewCustomerData({ name: '', phone: '', email: '', company: '' })
              }}
              disabled={creatingCustomer}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleCreateCustomer}
              disabled={creatingCustomer || !newCustomerData.name.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {creatingCustomer ? 'Création...' : 'Créer le client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

