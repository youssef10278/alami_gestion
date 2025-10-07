'use client'

import { useState, useEffect, useRef } from 'react'
import { Package, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  sku?: string
  description?: string
  price: number | string
  category?: {
    id: string
    name: string
  }
}

interface ProductAutocompleteProps {
  products: Product[]
  value: string
  onChange: (value: string) => void
  onProductSelect: (product: Product) => void
  placeholder?: string
  className?: string
}

export default function ProductAutocomplete({
  products,
  value,
  onChange,
  onProductSelect,
  placeholder = "Nom du produit",
  className
}: ProductAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Fonction utilitaire pour convertir le prix
  const getProductPrice = (price: number | string): number => {
    return typeof price === 'string' ? parseFloat(price) : price
  }

  // Filtrer les produits en fonction de la saisie
  useEffect(() => {
    if (value.length >= 2) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(value.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(value.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(value.toLowerCase()))
      ).slice(0, 10) // Limiter à 10 résultats
      
      setFilteredProducts(filtered)
      setIsOpen(filtered.length > 0)
      setHighlightedIndex(-1)
    } else {
      setFilteredProducts([])
      setIsOpen(false)
    }
  }, [value, products])

  // Gestion des touches du clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredProducts.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredProducts[highlightedIndex]) {
          selectProduct(filteredProducts[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  // Sélectionner un produit
  const selectProduct = (product: Product) => {
    onChange(product.name)
    onProductSelect(product)
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  // Fermer la liste quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node) &&
          listRef.current && !listRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn("pr-8", className)}
          autoComplete="off"
        />
        <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {isOpen && filteredProducts.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className={cn(
                "px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0",
                "hover:bg-blue-50 transition-colors",
                highlightedIndex === index && "bg-blue-50"
              )}
              onClick={() => selectProduct(product)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">
                      {product.name}
                    </span>
                    <span className="text-green-600 font-semibold text-sm ml-2 flex-shrink-0">
                      {getProductPrice(product.price).toFixed(2)} DH
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {product.sku && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono">
                        {product.sku}
                      </span>
                    )}
                    {product.category && (
                      <span className="text-blue-600 text-xs">
                        {product.category.name}
                      </span>
                    )}
                  </div>
                  {product.description && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {product.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {value.length >= 2 && filteredProducts.length === 0 && (
            <div className="px-3 py-4 text-center text-gray-500 text-sm">
              <Package className="w-6 h-6 mx-auto mb-2 text-gray-300" />
              <p>Aucun produit trouvé</p>
              <p className="text-xs mt-1">Essayez avec un autre terme de recherche</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
