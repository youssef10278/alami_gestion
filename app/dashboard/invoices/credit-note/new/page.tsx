'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Trash2, Search, Calculator, FileText, Package, AlertTriangle, XCircle } from 'lucide-react'
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

/**
 * 🔄 NOUVELLE PAGE FACTURE D'AVOIR - VERSION SÉCURISÉE
 * 
 * Recréation complète avec protection totale contre les erreurs undefined
 */

// Types sécurisés avec valeurs par défaut
interface SafeProduct {
  id: string
  name: string
  sku: string
  description: string
  price: number
  stock: number
  defectiveStock: number
}

interface SafeCustomer {
  id: string
  name: string
  phone: string
  email: string
  address: string
  company: string
  ice: string
}

interface SafeInvoiceItem {
  id: string
  productId: string
  productName: string
  productSku: string
  description: string
  quantity: number
  unitPrice: number
  discountAmount: number
  total: number
  returnStatus: 'GOOD' | 'DEFECTIVE' | 'UNUSABLE'
  returnReason: string
}

// Fonctions utilitaires de sécurité
const safeString = (value: any): string => {
  if (typeof value === 'string') return value
  if (value === null || value === undefined) return ''
  return String(value)
}

const safeNumber = (value: any): number => {
  if (typeof value === 'number' && !isNaN(value)) return value
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

const safeArray = <T>(value: any): T[] => {
  return Array.isArray(value) ? value : []
}

const safeObject = (value: any): any => {
  return value && typeof value === 'object' ? value : {}
}

// Validation stricte des produits
const validateProduct = (product: any): SafeProduct | null => {
  if (!product || typeof product !== 'object') return null
  
  const id = safeString(product.id)
  const name = safeString(product.name)
  
  if (!id || !name) return null
  
  return {
    id,
    name,
    sku: safeString(product.sku),
    description: safeString(product.description),
    price: safeNumber(product.price),
    stock: safeNumber(product.stock),
    defectiveStock: safeNumber(product.defectiveStock)
  }
}

// Validation stricte des clients
const validateCustomer = (customer: any): SafeCustomer | null => {
  if (!customer || typeof customer !== 'object') return null
  
  const id = safeString(customer.id)
  const name = safeString(customer.name)
  
  if (!id || !name) return null
  
  return {
    id,
    name,
    phone: safeString(customer.phone),
    email: safeString(customer.email),
    address: safeString(customer.address),
    company: safeString(customer.company),
    ice: safeString(customer.ice)
  }
}

export default function NewCreditNotePageSecure() {
  const router = useRouter()
  
  // États avec valeurs par défaut sécurisées
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)
  
  // Données sécurisées
  const [products, setProducts] = useState<SafeProduct[]>([])
  const [customers, setCustomers] = useState<SafeCustomer[]>([])
  const [filteredProducts, setFilteredProducts] = useState<SafeProduct[]>([])
  
  // Formulaire
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerTaxId, setCustomerTaxId] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<SafeInvoiceItem[]>([])
  const [searchProduct, setSearchProduct] = useState('')

  // États pour la recherche client
  const [customerSearchInput, setCustomerSearchInput] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [filteredCustomers, setFilteredCustomers] = useState<SafeCustomer[]>([])
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState(-1)
  
  // Totaux
  const [subtotal, setSubtotal] = useState(0)
  const [total, setTotal] = useState(0)

  // Chargement sécurisé des produits
  const loadProducts = async (): Promise<SafeProduct[]> => {
    try {
      console.log('🔄 Chargement sécurisé des produits...')
      const response = await fetch('/api/products?limit=1000')
      
      if (!response.ok) {
        console.error('❌ Erreur API produits:', response.status)
        return []
      }
      
      const data = await response.json()
      const rawProducts = safeArray(data.products || data)
      
      const validProducts: SafeProduct[] = []
      
      for (const rawProduct of rawProducts) {
        const validProduct = validateProduct(rawProduct)
        if (validProduct) {
          validProducts.push(validProduct)
        }
      }
      
      console.log('✅ Produits valides chargés:', validProducts.length)
      return validProducts
      
    } catch (error) {
      console.error('❌ Erreur chargement produits:', error)
      return []
    }
  }

  // Chargement sécurisé des clients
  const loadCustomers = async (): Promise<SafeCustomer[]> => {
    try {
      console.log('🔄 Chargement sécurisé des clients...')
      const response = await fetch('/api/customers?limit=1000')
      
      if (!response.ok) {
        console.error('❌ Erreur API clients:', response.status)
        return []
      }
      
      const data = await response.json()
      const rawCustomers = safeArray(data.customers || data)
      
      const validCustomers: SafeCustomer[] = []
      
      for (const rawCustomer of rawCustomers) {
        const validCustomer = validateCustomer(rawCustomer)
        if (validCustomer) {
          validCustomers.push(validCustomer)
        }
      }
      
      console.log('✅ Clients valides chargés:', validCustomers.length)
      return validCustomers
      
    } catch (error) {
      console.error('❌ Erreur chargement clients:', error)
      return []
    }
  }

  // Génération numéro de facture
  const generateInvoiceNumber = async (): Promise<string> => {
    try {
      const response = await fetch('/api/invoices/next-number?type=CREDIT_NOTE')
      if (response.ok) {
        const data = await response.json()
        return safeString(data.nextNumber) || 'FAV-00000001'
      }
    } catch (error) {
      console.error('❌ Erreur génération numéro:', error)
    }
    return 'FAV-00000001'
  }

  // Chargement initial sécurisé
  useEffect(() => {
    const initializeData = async () => {
      try {
        setInitialLoading(true)
        console.log('🚀 Initialisation sécurisée des données...')
        
        const [productsData, customersData, invoiceNum] = await Promise.all([
          loadProducts(),
          loadCustomers(),
          generateInvoiceNumber()
        ])
        
        setProducts(productsData)
        setCustomers(customersData)
        setInvoiceNumber(invoiceNum)
        setDataLoaded(true)
        
        console.log('✅ Initialisation terminée avec succès')
        
      } catch (error) {
        console.error('❌ Erreur initialisation:', error)
        toast.error('Erreur lors du chargement des données')
      } finally {
        setInitialLoading(false)
      }
    }
    
    initializeData()
  }, [])

  // Filtrage sécurisé des produits
  useEffect(() => {
    if (!dataLoaded || !searchProduct.trim()) {
      setFilteredProducts([])
      return
    }

    const searchTerm = searchProduct.toLowerCase()
    const filtered = products.filter(product => {
      const name = safeString(product.name).toLowerCase()
      const sku = safeString(product.sku).toLowerCase()
      return name.includes(searchTerm) || sku.includes(searchTerm)
    })

    setFilteredProducts(filtered.slice(0, 10))
  }, [searchProduct, products, dataLoaded])

  // Gestion de la sélection de client
  const handleCustomerSelect = (customer: SafeCustomer) => {
    setCustomerId(customer.id)
    setCustomerName(customer.name)
    setCustomerPhone(customer.phone || '')
    setCustomerEmail(customer.email || '')
    setCustomerAddress(customer.address || '')
    setCustomerTaxId(customer.ice || '')
    setCustomerSearchInput(`${customer.name}${customer.company ? ` (${customer.company})` : ''}`)
    setShowCustomerDropdown(false)
    setSelectedCustomerIndex(-1)
  }

  // Gestion du nouveau client
  const handleNewCustomer = () => {
    setCustomerId('')
    setCustomerName('')
    setCustomerPhone('')
    setCustomerEmail('')
    setCustomerAddress('')
    setCustomerTaxId('')
    setCustomerSearchInput('')
    setShowCustomerDropdown(false)
    setSelectedCustomerIndex(-1)
  }

  // Gestion des touches clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showCustomerDropdown) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedCustomerIndex(prev =>
          prev < filteredCustomers.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedCustomerIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedCustomerIndex >= 0 && selectedCustomerIndex < filteredCustomers.length) {
          handleCustomerSelect(filteredCustomers[selectedCustomerIndex])
        }
        break
      case 'Escape':
        setShowCustomerDropdown(false)
        setSelectedCustomerIndex(-1)
        break
    }
  }

  // Calcul sécurisé des totaux
  useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => sum + safeNumber(item.total), 0)
    const newTotal = -newSubtotal // Négatif pour facture d'avoir

    setSubtotal(newSubtotal)
    setTotal(newTotal)
  }, [items])

  // Filtrage des clients en temps réel
  useEffect(() => {
    if (!customerSearchInput.trim()) {
      setFilteredCustomers([])
      setShowCustomerDropdown(false)
      return
    }

    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(customerSearchInput.toLowerCase()) ||
      (customer.company && customer.company.toLowerCase().includes(customerSearchInput.toLowerCase()))
    ).slice(0, 10) // Limiter à 10 résultats

    setFilteredCustomers(filtered)
    setShowCustomerDropdown(filtered.length > 0)
    setSelectedCustomerIndex(-1)
  }, [customerSearchInput, customers])

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.customer-search-container')) {
        setShowCustomerDropdown(false)
        setSelectedCustomerIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Ajout sécurisé de produit
  const addProduct = (product: SafeProduct) => {
    if (!product || !product.id) return
    
    const existingItem = items.find(item => item.productId === product.id)
    
    if (existingItem) {
      updateItemQuantity(existingItem.id, existingItem.quantity + 1)
    } else {
      const newItem: SafeInvoiceItem = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        description: product.description,
        quantity: 1,
        unitPrice: product.price,
        discountAmount: 0,
        total: product.price,
        returnStatus: 'GOOD',
        returnReason: ''
      }
      setItems([...items, newItem])
    }
    setSearchProduct('')
  }

  // Mise à jour sécurisée des articles
  const updateItem = (itemId: string, field: keyof SafeInvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitPrice' || field === 'discountAmount') {
          updatedItem.total = (safeNumber(updatedItem.quantity) * safeNumber(updatedItem.unitPrice)) - safeNumber(updatedItem.discountAmount)
        }
        return updatedItem
      }
      return item
    }))
  }

  const updateItemQuantity = (itemId: string, quantity: number) => {
    updateItem(itemId, 'quantity', Math.max(1, safeNumber(quantity)))
  }

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId))
  }

  // Soumission sécurisée
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
        customerId: customerId || null,
        customerName: safeString(customerName),
        customerPhone: safeString(customerPhone),
        customerEmail: safeString(customerEmail),
        customerAddress: safeString(customerAddress),
        customerTaxId: safeString(customerTaxId),
        subtotal: safeNumber(subtotal),
        discountAmount: 0,
        taxRate: 20,
        taxAmount: 0,
        total: safeNumber(total),
        notes: safeString(notes),
        items: items.map(item => ({
          productId: safeString(item.productId),
          productName: safeString(item.productName),
          productSku: safeString(item.productSku),
          description: safeString(item.description),
          quantity: safeNumber(item.quantity),
          unitPrice: safeNumber(item.unitPrice),
          discountAmount: safeNumber(item.discountAmount),
          total: safeNumber(item.total),
          returnStatus: item.returnStatus,
          returnReason: safeString(item.returnReason)
        }))
      }
      
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      })
      
      if (response.ok) {
        const invoice = await response.json()
        toast.success('Facture d\'avoir créée avec succès')
        router.push(`/dashboard/invoices/${invoice.id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la création')
      }
      
    } catch (error) {
      console.error('❌ Erreur soumission:', error)
      toast.error('Erreur lors de la création de la facture')
    } finally {
      setLoading(false)
    }
  }

  // Écran de chargement sécurisé
  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/invoices">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-red-600">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">🧾 Nouvelle Facture d'Avoir</h1>
              <p className="text-red-100 mt-1">Chargement sécurisé des données...</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Initialisation sécurisée en cours...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header sécurisé */}
      <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-red-600">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">🧾 Nouvelle Facture d'Avoir - Version Sécurisée</h1>
            <p className="text-red-100 mt-1">
              Système de retour complet avec protection totale contre les erreurs
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
                <Label htmlFor="invoiceNumber">Numéro de Facture</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(safeString(e.target.value))}
                  placeholder="FAV-00000001"
                />
              </div>
              <div className="relative customer-search-container">
                <Label htmlFor="customer">Client</Label>
                <div className="relative">
                  <Input
                    id="customer"
                    value={customerSearchInput}
                    onChange={(e) => setCustomerSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (customerSearchInput.trim()) {
                        setShowCustomerDropdown(filteredCustomers.length > 0)
                      }
                    }}
                    placeholder="Rechercher un client ou taper pour nouveau..."
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

                  {/* Dropdown des résultats */}
                  {showCustomerDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {/* Option Nouveau client */}
                      <div
                        onClick={handleNewCustomer}
                        className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                      >
                        <Plus className="mr-2 h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Nouveau client</span>
                      </div>

                      {/* Liste des clients filtrés */}
                      {filteredCustomers.map((customer, index) => (
                        <div
                          key={customer.id}
                          onClick={() => handleCustomerSelect(customer)}
                          className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                            index === selectedCustomerIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                          }`}
                        >
                          <div className="font-medium">{customer.name}</div>
                          {customer.company && (
                            <div className="text-sm text-gray-500">{customer.company}</div>
                          )}
                        </div>
                      ))}

                      {filteredCustomers.length === 0 && customerSearchInput.trim() && (
                        <div className="px-3 py-2 text-gray-500 text-center">
                          Aucun client trouvé
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Nom du Client *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(safeString(e.target.value))}
                  placeholder="Nom du client"
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerTaxId">N° Fiscal</Label>
                <Input
                  id="customerTaxId"
                  value={customerTaxId}
                  onChange={(e) => setCustomerTaxId(safeString(e.target.value))}
                  placeholder="ICE du client"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerPhone">Téléphone</Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(safeString(e.target.value))}
                  placeholder="Téléphone du client"
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(safeString(e.target.value))}
                  placeholder="Email du client"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customerAddress">Adresse</Label>
              <Input
                id="customerAddress"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(safeString(e.target.value))}
                placeholder="Adresse du client"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recherche de produits sécurisée */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Ajouter des Produits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un produit par nom ou SKU..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(safeString(e.target.value))}
                className="pl-10"
              />
              {filteredProducts.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addProduct(product)}
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
          </CardContent>
        </Card>

        {/* Articles avec système de retour */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Articles à Rembourser
              <div className="text-sm text-gray-600">
                Total: {total.toLocaleString('fr-FR')} DH
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun article ajouté. Recherchez et ajoutez des produits ci-dessus.
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
                          onChange={(e) => updateItem(item.id, 'productName', safeString(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>SKU</Label>
                        <Input
                          value={item.productSku}
                          onChange={(e) => updateItem(item.id, 'productSku', safeString(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
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

                    {/* Système de retour */}
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium text-sm mb-3 flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Gestion du Retour
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>État du Produit Retourné</Label>
                          <Select
                            value={item.returnStatus}
                            onValueChange={(value: 'GOOD' | 'DEFECTIVE' | 'UNUSABLE') => updateItem(item.id, 'returnStatus', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="GOOD">
                                <div className="flex items-center">
                                  <Package className="w-4 h-4 mr-2 text-green-600" />
                                  <div>
                                    <div className="font-medium">Bon État</div>
                                    <div className="text-xs text-gray-500">Retour en stock vendable</div>
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem value="DEFECTIVE">
                                <div className="flex items-center">
                                  <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                                  <div>
                                    <div className="font-medium">Défectueux</div>
                                    <div className="text-xs text-gray-500">Stock séparé, pas vendable</div>
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem value="UNUSABLE">
                                <div className="flex items-center">
                                  <XCircle className="w-4 h-4 mr-2 text-red-600" />
                                  <div>
                                    <div className="font-medium">Inutilisable</div>
                                    <div className="text-xs text-gray-500">Pas de retour en stock</div>
                                  </div>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Raison du Retour (Optionnel)</Label>
                          <Input
                            placeholder="Ex: Produit endommagé, défaut de fabrication..."
                            value={item.returnReason}
                            onChange={(e) => updateItem(item.id, 'returnReason', safeString(e.target.value))}
                          />
                        </div>
                      </div>

                      {/* Indicateur visuel de l'impact sur le stock */}
                      <div className="mt-3 p-3 rounded-lg bg-gray-50">
                        <div className="text-sm">
                          <span className="font-medium">Impact sur le stock:</span>
                          {item.returnStatus === 'GOOD' && (
                            <span className="ml-2 text-green-600">
                              +{item.quantity} en stock vendable
                            </span>
                          )}
                          {item.returnStatus === 'DEFECTIVE' && (
                            <span className="ml-2 text-orange-600">
                              +{item.quantity} en stock défectueux
                            </span>
                          )}
                          {item.returnStatus === 'UNUSABLE' && (
                            <span className="ml-2 text-red-600">
                              Aucun retour en stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Notes additionnelles..."
              value={notes}
              onChange={(e) => setNotes(safeString(e.target.value))}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4">
          <Link href="/dashboard/invoices">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={loading || items.length === 0}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Création...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Créer la Facture d'Avoir
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Informations de débogage (en développement) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="glass border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-600">🔧 Informations de Débogage</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>Produits chargés: {products.length}</div>
            <div>Clients chargés: {customers.length}</div>
            <div>Articles dans la facture: {items.length}</div>
            <div>Données initialisées: {dataLoaded ? '✅' : '❌'}</div>
            <div>Recherche active: {searchProduct || 'Aucune'}</div>
            <div>Produits filtrés: {filteredProducts.length}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
