'use client'

import { Edit, Trash2, Package, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { safeToFixed } from '@/lib/utils'

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

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const isLowStock = product.stock <= product.minStock
  // Calcul amélioré du pourcentage de stock (basé sur le stock minimum)
  const stockPercentage = product.minStock > 0 ? Math.min((product.stock / product.minStock) * 100, 100) : 0

  // Calcul de la marge
  const purchasePrice = Number(product.purchasePrice) || 0
  const salePrice = Number(product.price) || 0
  const marginAmount = salePrice - purchasePrice
  const marginPercentage = purchasePrice > 0 ? (marginAmount / purchasePrice) * 100 : 0

  return (
    <Card
      className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white"
      data-testid="product-card"
      data-product-id={product.id}
    >
      {/* Effet de brillance au survol */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500 pointer-events-none"></div>

      {/* Badge stock faible en haut à droite */}
      {isLowStock && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Stock faible
          </div>
        </div>
      )}

      <CardContent className="pt-4 md:pt-6 relative">
        {/* Image avec effet de zoom - Responsive */}
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl md:rounded-2xl mb-3 md:mb-4 flex items-center justify-center overflow-hidden shadow-inner group-hover:shadow-xl transition-all duration-300">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
              <Package className="w-16 h-16 md:w-20 md:h-20 text-gray-400 relative" />
            </div>
          )}
        </div>

        {/* Info - Responsive */}
        <div className="space-y-2 md:space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg md:text-xl line-clamp-1 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                {product.name}
              </h3>
              <p className="text-xs md:text-sm text-gray-500 font-mono mt-1">
                <span className="text-xs text-gray-400">SKU:</span> {product.sku}
              </p>
            </div>
          </div>

          {product.description && (
            <p className="text-xs md:text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          {product.category && (
            <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0 shadow-sm">
              📁 {product.category.name}
            </Badge>
          )}

          {/* Prix et Marge - DESIGN PREMIUM - Responsive */}
          <div className="pt-2 md:pt-3 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-3 md:p-4 rounded-lg md:rounded-xl space-y-2 border-2 border-blue-100 shadow-inner">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full"></span>
                <span className="hidden sm:inline">Prix d'achat</span>
                <span className="sm:hidden">Achat</span>
              </span>
              <span className="font-semibold text-gray-700 bg-white px-2 py-0.5 rounded-md shadow-sm text-xs">
                {safeToFixed(purchasePrice, 2)} DH
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full"></span>
                <span className="hidden sm:inline">Prix de vente</span>
                <span className="sm:hidden">Vente</span>
              </span>
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {safeToFixed(salePrice, 2)} DH
              </span>
            </div>
            <div className="pt-2 border-t-2 border-white/50">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${marginPercentage >= 30 ? 'bg-green-500' : marginPercentage >= 15 ? 'bg-orange-500' : 'bg-red-500'}`}></span>
                  Marge
                </span>
                <div className="text-right">
                  <div className={`inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full font-bold text-xs md:text-sm shadow-md ${
                    marginPercentage >= 30
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      : marginPercentage >= 15
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                      : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                  }`}>
                    {marginPercentage >= 30 ? '🎉' : marginPercentage >= 15 ? '👍' : '⚠️'}
                    {safeToFixed(marginPercentage, 1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    +{safeToFixed(marginAmount, 2)} DH
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stock avec design amélioré - Responsive */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs md:text-sm">
              <span className="text-gray-600 font-medium flex items-center gap-1">
                📦 Stock
              </span>
              <span className={`font-bold px-2 py-1 rounded-md md:rounded-lg text-xs md:text-sm ${
                isLowStock
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {product.stock} <span className="hidden sm:inline">unités</span>
              </span>
            </div>
            <div className="relative w-full bg-gray-200 rounded-full h-2 md:h-3 overflow-hidden shadow-inner">
              <div
                className={`h-2 md:h-3 rounded-full transition-all duration-500 relative overflow-hidden ${
                  isLowStock
                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500'
                }`}
                style={{ width: `${Math.min(stockPercentage, 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Min: {product.minStock}</span>
              <span>{safeToFixed(stockPercentage, 0)}%</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-0 pb-4 md:pb-6 relative z-20">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md text-xs md:text-sm"
          data-testid="edit-button"
          data-product-id={product.id}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('Edit button clicked for product:', product.name)
            onEdit(product)
          }}
        >
          <Edit className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
          <span className="hidden sm:inline">Modifier</span>
          <span className="sm:hidden">Edit</span>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-md hover:shadow-lg transition-all duration-300 px-2 md:px-3"
          data-testid="delete-button"
          data-product-id={product.id}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('Delete button clicked for product:', product.name)
            onDelete(product.id)
          }}
        >
          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

