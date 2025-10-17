'use client'

import { Edit, Trash2, ShoppingCart, Plus, Copy, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'
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

interface ProductTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  onQuickSell?: (product: Product) => void
  onAddStock?: (product: Product) => void
}

export default function ProductTable({ 
  products, 
  onEdit, 
  onDelete,
  onQuickSell,
  onAddStock 
}: ProductTableProps) {
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const calculateMargin = (purchasePrice: number, salePrice: number) => {
    if (purchasePrice === 0) return 0
    return ((salePrice - purchasePrice) / purchasePrice) * 100
  }

  const getMarginColor = (margin: number) => {
    if (margin >= 30) return 'text-green-600'
    if (margin >= 15) return 'text-orange-600'
    return 'text-red-600'
  }

  const getStockColor = (stock: number, minStock: number) => {
    if (stock <= minStock) return 'text-red-600 font-bold'
    if (stock <= minStock * 1.5) return 'text-orange-600'
    return 'text-green-600'
  }

  return (
    <div className="glass rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Produit
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                Prix d'achat
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                Prix de vente
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                Marge
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const margin = calculateMargin(Number(product.purchasePrice), Number(product.price))
              const marginAmount = Number(product.price) - Number(product.purchasePrice)
              const isLowStock = product.stock <= product.minStock

              return (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  {/* Produit */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-gray-300 rounded" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        {product.description && (
                          <p className="text-xs text-gray-500 truncate max-w-xs">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        {product.sku}
                      </code>
                      <button
                        onClick={() => copyToClipboard(product.sku)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copier le SKU"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  {/* Catégorie */}
                  <td className="px-4 py-4">
                    {product.category ? (
                      <Badge variant="secondary" className="text-xs">
                        {product.category.name}
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>

                  {/* Prix d'achat */}
                  <td className="px-4 py-4 text-right">
                    <span className="text-sm text-gray-700">
                      {safeToFixed(product.purchasePrice)} DH
                    </span>
                  </td>

                  {/* Prix de vente */}
                  <td className="px-4 py-4 text-right">
                    <span className="text-sm font-semibold text-blue-600">
                      {safeToFixed(product.price)} DH
                    </span>
                  </td>

                  {/* Marge */}
                  <td className="px-4 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-bold ${getMarginColor(margin)}`}>
                        {safeToFixed(margin, 1)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {safeToFixed(marginAmount)} DH
                      </span>
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-semibold ${getStockColor(product.stock, product.minStock)}`}>
                        {product.stock}
                      </span>
                      <span className="text-xs text-gray-500">
                        min: {product.minStock}
                      </span>
                      {isLowStock && (
                        <Badge variant="destructive" className="text-xs mt-1">
                          Stock faible
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(product)}
                        className="h-8"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Modifier
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onQuickSell && (
                            <DropdownMenuItem onClick={() => onQuickSell(product)}>
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Vendre
                            </DropdownMenuItem>
                          )}
                          {onAddStock && (
                            <DropdownMenuItem onClick={() => onAddStock(product)}>
                              <Plus className="w-4 h-4 mr-2" />
                              Ajouter au stock
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => copyToClipboard(product.sku)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copier le SKU
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Voir l'historique
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(product.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun produit à afficher</p>
        </div>
      )}
    </div>
  )
}

