'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Package, AlertTriangle, Grid3x3, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
        return sorted.sort((a, b) => Number(a.price) - Number(b.price))
      case 'price-desc':
        return sorted.sort((a, b) => Number(b.price) - Number(a.price))
      case 'margin-desc':
        return sorted.sort((a, b) => {
          const marginA = ((Number(a.price) - Number(a.purchasePrice)) / Number(a.purchasePrice)) * 100
          const marginB = ((Number(b.price) - Number(b.purchasePrice)) / Number(b.purchasePrice)) * 100
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

  const handleProductSaved = () => {
    fetchProducts()
    setDialogOpen(false)
    setEditingProduct(null)
    toast.success(editingProduct ? 'Produit modifié avec succès' : 'Produit créé avec succès')
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  const handleDelete = async (productId: string) => {
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
    if (!quantity || isNaN(Number(quantity))) return

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock: product.stock + Number(quantity)
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
  const stockValue = products.reduce((sum, p) => sum + (Number(p.purchasePrice) * p.stock), 0)
  const potentialValue = products.reduce((sum, p) => sum + (Number(p.price) * p.stock), 0)
  const potentialProfit = potentialValue - stockValue

  return (
    <div className="space-y-6">
      {/* Header avec design amélioré */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 p-8 shadow-2xl">
        {/* Effet de fond animé */}
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 backdrop-blur-3xl"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-1 drop-shadow-lg">
                Gestion des Produits
              </h1>
              <p className="text-blue-100 text-sm">
                Gérez votre catalogue de produits et stock en temps réel
              </p>
              <div className="flex items-center gap-3 mt-2">
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
            className="gap-2 bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-6 py-6 text-base font-semibold"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            Nouveau Produit
          </Button>
        </div>
      </div>

      {/* Stats avec design amélioré */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              {products.length}
            </div>
            <p className="text-xs text-blue-600 mt-2 font-medium">
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
            <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              {stockValue.toFixed(0)} DH
            </div>
            <p className="text-xs text-green-600 mt-2 font-medium">
              💰 Potentiel: {potentialValue.toFixed(0)} DH
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
            <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
              {lowStockCount}
            </div>
            <p className="text-xs text-orange-600 mt-2 font-medium">
              📈 Bénéfice: {potentialProfit.toFixed(0)} DH
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters avec design amélioré */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche avec icône animée */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="🔍 Rechercher par nom, SKU ou description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm hover:shadow-md transition-all"
              />
            </div>

            {/* Filtre catégorie */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[220px] h-12 border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
                <SelectValue placeholder="📂 Toutes les catégories" />
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
              <SelectTrigger className="w-full md:w-[220px] h-12 border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
                <SelectValue placeholder="🔄 Trier par..." />
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
            <div className="flex gap-2 bg-gray-100 rounded-xl p-1.5 shadow-inner">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`h-9 px-4 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-md'
                    : 'hover:bg-white/50'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`h-9 px-4 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white shadow-md'
                    : 'hover:bg-white/50'
                }`}
              >
                <List className="w-4 h-4" />
              </Button>
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
              variant="outline"
              className="mt-4"
            >
              Ajouter votre premier produit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

          {/* Pagination avec design moderne */}
          {totalPages > 1 && (
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm">
                      <span className="text-sm font-medium text-gray-700">
                        📊 Affichage
                      </span>
                      <span className="font-bold text-blue-600">
                        {startIndex + 1}-{Math.min(endIndex, sortedProducts.length)}
                      </span>
                      <span className="text-sm text-gray-500">
                        sur {sortedProducts.length}
                      </span>
                    </div>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => {
                        setItemsPerPage(Number(value))
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger className="w-[130px] bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">📄 10 / page</SelectItem>
                        <SelectItem value="20">📄 20 / page</SelectItem>
                        <SelectItem value="50">📄 50 / page</SelectItem>
                        <SelectItem value="100">📄 100 / page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm hover:shadow-md transition-all"
                    >
                      ⏮️ Premier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm hover:shadow-md transition-all"
                    >
                      ◀️ Précédent
                    </Button>
                    <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-md">
                      Page {currentPage} / {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm hover:shadow-md transition-all"
                    >
                      Suivant ▶️
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm hover:shadow-md transition-all"
                    >
                      Dernier ⏭️
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
      />
    </div>
  )
}

