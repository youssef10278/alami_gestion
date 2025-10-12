'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Package, AlertTriangle, Grid3x3, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { safeToFixed, safeNumber } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ProductDialog from '@/components/products/ProductDialog'
import ProductCard from '@/components/products/ProductCard'
import ProductTable from '@/components/products/ProductTable'
import { useDebounce } from '@/hooks/useDebounce'
import { toast } from 'sonner'

interface Product {
  id: string
  sku: string
  name: string
  description: string | null
  purchasePrice: number
  price: number
  stock: number
  minStock: number
  image: string | null
  categoryId: string | null
  category: {
    id: string
    name: string
  } | null
}

interface Category {
  id: string
  name: string
  _count: {
    products: number
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  // Debounce de la recherche pour éviter trop d'appels API
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [debouncedSearch, selectedCategory])

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N : Nouveau produit
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        setEditingProduct(null)
        setDialogOpen(true)
      }

      // Ctrl/Cmd + F : Focus sur la recherche
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder*="Rechercher"]') as HTMLInputElement
        searchInput?.focus()
      }

      // Échap : Fermer le dialog
      if (e.key === 'Escape' && dialogOpen) {
        setDialogOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dialogOpen])

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (selectedCategory !== 'all') params.append('categoryId', selectedCategory)
      // ✅ FIX: Récupérer tous les produits par défaut (même limite que la page vente)
      params.append('limit', '1000')

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fonction de tri des produits
  const sortProducts = (products: Product[]) => {
    const sorted = [...products]

    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'price-asc':
        return sorted.sort((a, b) => safeNumber(a.price) - safeNumber(b.price))
      case 'price-desc':
        return sorted.sort((a, b) => safeNumber(b.price) - safeNumber(a.price))
      case 'margin-desc':
        return sorted.sort((a, b) => {
          const marginA = ((safeNumber(a.price) - safeNumber(a.purchasePrice)) / safeNumber(a.purchasePrice)) * 100
          const marginB = ((safeNumber(b.price) - safeNumber(b.purchasePrice)) / safeNumber(b.purchasePrice)) * 100
          return marginB - marginA
        })
      case 'stock-asc':
        return sorted.sort((a, b) => a.stock - b.stock)
      case 'stock-desc':
        return sorted.sort((a, b) => b.stock - a.stock)
      default:
        return sorted
    }
  }

  const sortedProducts = sortProducts(products)

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex)

  // Réinitialiser la page lors du changement de filtre
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, selectedCategory, sortBy])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Gérer la création d'une nouvelle catégorie
  const handleCategoryCreated = (newCategory: any) => {
    // Ajouter la propriété _count pour la compatibilité
    const categoryWithCount = {
      ...newCategory,
      _count: { products: 0 }
    }
    setCategories(prev => [...prev, categoryWithCount])
    toast.success(`Catégorie "${newCategory.name}" créée avec succès`)
  }

  const handleProductSaved = () => {
    fetchProducts()
    setDialogOpen(false)
    setEditingProduct(null)
    toast.success(editingProduct ? 'Produit modifié avec succès' : 'Produit créé avec succès')
  }

  const handleEdit = (product: Product) => {
    console.log('handleEdit called with product:', product.name)
    setEditingProduct(product)
    setDialogOpen(true)
  }

  const handleDelete = async (productId: string) => {
    console.log('handleDelete called with productId:', productId)
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchProducts()
        toast.success('Produit supprimé avec succès')
      } else {
        toast.error('Erreur lors de la suppression du produit')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Erreur lors de la suppression du produit')
    }
  }

  // Actions rapides
  const handleQuickSell = (product: Product) => {
    // Rediriger vers la page de vente avec le produit pré-sélectionné
    const productData = encodeURIComponent(JSON.stringify({
      id: product.id,
      name: product.name,
      price: product.price
    }))
    window.location.href = `/dashboard/sales?product=${productData}`
  }

  const handleAddStock = async (product: Product) => {
    const quantity = prompt(`Ajouter du stock pour "${product.name}"\n\nQuantité à ajouter:`)
    if (!quantity || isNaN(safeNumber(quantity))) return

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock: product.stock + safeNumber(quantity)
        })
      })

      if (response.ok) {
        fetchProducts()
        toast.success(`${quantity} unités ajoutées au stock`)
      } else {
        toast.error('Erreur lors de l\'ajout du stock')
      }
    } catch (error) {
      console.error('Error adding stock:', error)
      toast.error('Erreur lors de l\'ajout du stock')
    }
  }

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length

  // Calcul de la valeur du stock
  const stockValue = products.reduce((sum, p) => sum + (safeNumber(p.purchasePrice) * p.stock), 0)
  const potentialValue = products.reduce((sum, p) => sum + (safeNumber(p.price) * p.stock), 0)
  const potentialProfit = potentialValue - stockValue



  return (
    <div className="space-y-6">
      {/* Header avec design amélioré - Responsive */}
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 p-4 md:p-8 shadow-2xl">
        {/* Effet de fond animé */}
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 backdrop-blur-3xl"></div>

        <div className="relative">
          {/* Layout mobile : vertical, desktop : horizontal */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl shadow-lg">
                <Package className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 drop-shadow-lg">
                  Gestion des Produits
                </h1>
                <p className="text-blue-100 text-xs md:text-sm">
                  Gérez votre catalogue de produits et stock en temps réel
                </p>
                <div className="hidden sm:flex items-center gap-2 md:gap-3 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-white/80 bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm">
                    <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs font-semibold">Ctrl+N</kbd>
                    <span>Nouveau</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/80 bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm">
                    <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs font-semibold">Ctrl+F</kbd>
                    <span>Rechercher</span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingProduct(null)
                setDialogOpen(true)
              }}
              variant="stock"
              className="gap-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-4 py-3 md:px-6 md:py-6 text-sm md:text-base font-semibold w-full md:w-auto"
              size="lg"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span className="md:hidden">Nouveau</span>
              <span className="hidden md:inline">Nouveau Produit</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats avec design amélioré - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Carte Total Produits */}
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-blue-900">
              Total Produits
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              {products.length}
            </div>
            <p className="text-xs md:text-sm text-blue-600 mt-2 font-medium">
              📂 {categories.length} catégories
            </p>
          </CardContent>
        </Card>

        {/* Carte Valeur du Stock */}
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-100/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-green-900">
              Valeur du Stock
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              {safeToFixed(stockValue, 0)} DH
            </div>
            <p className="text-xs md:text-sm text-green-600 mt-2 font-medium">
              💰 Potentiel: {safeToFixed(potentialValue, 0)} DH
            </p>
          </CardContent>
        </Card>

        {/* Carte Stock Faible */}
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-orange-50 to-red-100/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-red-900">
              Stock Faible
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg animate-pulse">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
              {lowStockCount}
            </div>
            <p className="text-xs md:text-sm text-orange-600 mt-2 font-medium">
              📈 Bénéfice: {safeToFixed(potentialProfit, 0)} DH
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Filters avec design amélioré - Responsive */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-4 md:pt-6">
          <div className="space-y-4">
            {/* Ligne 1: Recherche */}
            <div className="relative group">
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="🔍 Rechercher par nom, SKU ou description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 md:pl-12 h-10 md:h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-all text-sm md:text-base"
              />
            </div>

            {/* Ligne 2: Filtres et contrôles */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              {/* Filtre catégorie */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px] md:w-[220px] h-10 md:h-12 border-2 border-gray-200 rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-all text-sm md:text-base">
                  <SelectValue placeholder="📂 Catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📂 Toutes les catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      📁 {category.name} ({category._count.products})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Tri */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[160px] md:w-[220px] h-10 md:h-12 border-2 border-gray-200 rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-all text-sm md:text-base">
                  <SelectValue placeholder="🔄 Trier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">🔤 Nom (A-Z)</SelectItem>
                  <SelectItem value="price-asc">💰 Prix croissant</SelectItem>
                  <SelectItem value="price-desc">💎 Prix décroissant</SelectItem>
                  <SelectItem value="margin-desc">📈 Marge décroissante</SelectItem>
                  <SelectItem value="stock-asc">⚠️ Stock faible d'abord</SelectItem>
                  <SelectItem value="stock-desc">✅ Stock élevé d'abord</SelectItem>
                </SelectContent>
              </Select>

              {/* Toggle Vue Grille/Liste avec design amélioré */}
              <div className="flex gap-1 md:gap-2 bg-gray-100 rounded-lg md:rounded-xl p-1 md:p-1.5 shadow-inner ml-auto">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`h-8 md:h-9 px-3 md:px-4 rounded-md md:rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-md'
                      : 'hover:bg-white/50'
                  }`}
                >
                  <Grid3x3 className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline ml-1 md:ml-2 text-xs md:text-sm">Grille</span>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`h-8 md:h-9 px-3 md:px-4 rounded-md md:rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-white shadow-md'
                      : 'hover:bg-white/50'
                  }`}
                >
                  <List className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline ml-1 md:ml-2 text-xs md:text-sm">Liste</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid/List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      ) : sortedProducts.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun produit trouvé</p>
            <Button
              onClick={() => setDialogOpen(true)}
              variant="stock-outline"
              className="mt-4"
            >
              Ajouter votre premier produit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <ProductTable
              products={paginatedProducts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onQuickSell={handleQuickSell}
              onAddStock={handleAddStock}
            />
          )}

          {/* Pagination avec design moderne - Responsive */}
          {totalPages > 1 && (
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="py-4 md:py-6">
                <div className="space-y-4">
                  {/* Informations d'affichage et sélecteur */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 md:gap-4 order-2 sm:order-1">
                      <div className="flex items-center gap-2 bg-white px-3 md:px-4 py-2 rounded-lg md:rounded-xl shadow-sm text-sm">
                        <span className="font-medium text-gray-700">
                          📊 <span className="hidden sm:inline">Affichage</span>
                        </span>
                        <span className="font-bold text-blue-600">
                          {startIndex + 1}-{Math.min(endIndex, sortedProducts.length)}
                        </span>
                        <span className="text-gray-500">
                          <span className="hidden sm:inline">sur</span> {sortedProducts.length}
                        </span>
                      </div>
                      <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => {
                          setItemsPerPage(safeNumber(value))
                          setCurrentPage(1)
                        }}
                      >
                        <SelectTrigger className="w-[100px] md:w-[130px] bg-white border-2 border-gray-200 rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-all text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">📄 10</SelectItem>
                          <SelectItem value="20">📄 20</SelectItem>
                          <SelectItem value="50">📄 50</SelectItem>
                          <SelectItem value="100">📄 100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Indicateur de page mobile */}
                    <div className="px-3 md:px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg md:rounded-xl shadow-md text-sm order-1 sm:order-2">
                      Page {currentPage} / {totalPages}
                    </div>
                  </div>

                  {/* Contrôles de navigation */}
                  <div className="flex items-center justify-center gap-1 md:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-all px-2 md:px-3 text-xs md:text-sm"
                    >
                      <span className="md:hidden">⏮️</span>
                      <span className="hidden md:inline">⏮️ Premier</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-all px-2 md:px-3 text-xs md:text-sm"
                    >
                      <span className="md:hidden">◀️</span>
                      <span className="hidden md:inline">◀️ Précédent</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-all px-2 md:px-3 text-xs md:text-sm"
                    >
                      <span className="md:hidden">▶️</span>
                      <span className="hidden md:inline">Suivant ▶️</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-all px-2 md:px-3 text-xs md:text-sm"
                    >
                      <span className="md:hidden">⏭️</span>
                      <span className="hidden md:inline">Dernier ⏭️</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}



      {/* Product Dialog */}
      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        categories={categories}
        onSaved={handleProductSaved}
        onCategoryCreated={handleCategoryCreated}
      />
    </div>
  )
}

