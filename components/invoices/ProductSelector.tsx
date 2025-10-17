'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Search, Package } from 'lucide-react'
import { cn, safeToFixed } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

interface Product {
  id: string
  name: string
  sku?: string
  description?: string
  price: number
  category?: {
    id: string
    name: string
  }
}

interface ProductSelectorProps {
  products: Product[]
  onSelect: (product: Product) => void
  placeholder?: string
  disabled?: boolean
}

export default function ProductSelector({ 
  products, 
  onSelect, 
  placeholder = "Sélectionner un produit...",
  disabled = false 
}: ProductSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const handleSelect = (product: Product) => {
    setSelectedProduct(product)
    setOpen(false)
    onSelect(product)
  }

  const resetSelection = () => {
    setSelectedProduct(null)
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedProduct ? (
              <div className="flex items-center gap-2 truncate">
                <Package className="w-4 h-4 text-blue-500" />
                <span className="truncate">{selectedProduct.name}</span>
                {selectedProduct.sku && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedProduct.sku}
                  </Badge>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Search className="w-4 h-4" />
                <span>{placeholder}</span>
              </div>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Rechercher un produit..." />
            <CommandList>
              <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
              <CommandGroup>
                {products.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={`${product.name} ${product.sku || ''} ${product.description || ''}`}
                    onSelect={() => handleSelect(product)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedProduct?.id === product.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="font-medium truncate">{product.name}</span>
                          {product.sku && (
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {product.sku}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span className="font-medium text-green-600">
                            {safeToFixed(product.price)} DH
                          </span>
                          {product.category && (
                            <>
                              <span>•</span>
                              <span>{product.category.name}</span>
                            </>
                          )}
                        </div>
                        {product.description && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedProduct && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-500" />
            <div>
              <p className="font-medium text-sm">{selectedProduct.name}</p>
              <p className="text-xs text-muted-foreground">
                Prix: {selectedProduct.price.toFixed(2)} DH
                {selectedProduct.sku && ` • SKU: ${selectedProduct.sku}`}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetSelection}
            className="text-blue-600 hover:text-blue-800"
          >
            Changer
          </Button>
        </div>
      )}
    </div>
  )
}
