'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { BarcodeInput } from '@/components/ui/barcode-input'
import { ImageUpload } from '@/components/ui/image-upload'
import { CategoryCombobox } from '@/components/ui/category-combobox'

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
}

interface Category {
  id: string
  name: string
}

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  categories: Category[]
  onSaved: (savedProduct?: any, isEdit?: boolean) => void
  onCategoryCreated?: (category: Category) => void
}

export default function ProductDialog({
  open,
  onOpenChange,
  product,
  categories,
  onSaved,
  onCategoryCreated,
}: ProductDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    purchasePrice: '',
    price: '',
    stock: '',
    minStock: '10',
    categoryId: '',
    image: '',
  })

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        purchasePrice: product.purchasePrice?.toString() || '0',
        price: product.price?.toString() || '0',
        stock: product.stock?.toString() || '0',
        minStock: product.minStock?.toString() || '0',
        categoryId: product.categoryId || 'none',
        image: product.image || '',
      })
    } else {
      setFormData({
        sku: '',
        name: '',
        description: '',
        purchasePrice: '',
        price: '',
        stock: '',
        minStock: '10',
        categoryId: 'none',
        image: '',
      })
    }
    setError('')
    // ✅ FIX: Réinitialiser l'état de chargement quand le modal s'ouvre
    setLoading(false)
  }, [product, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = product ? `/api/products/${product.id}` : '/api/products'
      const method = product ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          categoryId: formData.categoryId === 'none' ? null : formData.categoryId || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue')
        setLoading(false)
        return
      }

      // ✅ FIX: Réinitialiser l'état de chargement avant de fermer le modal
      setLoading(false)

      // Passer le produit sauvegardé et indiquer si c'est une édition
      onSaved(data, !!product)
    } catch (err) {
      setError('Erreur lors de la sauvegarde du produit')
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Modifier le produit' : 'Nouveau produit'}
          </DialogTitle>
          <DialogDescription>
            {product
              ? 'Modifiez les informations du produit'
              : 'Ajoutez un nouveau produit à votre catalogue'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* SKU avec scanner automatique */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="sku">
                SKU / Code-barres <span className="text-red-500">*</span>
              </Label>
              <BarcodeInput
                value={formData.sku}
                onChange={(value) => setFormData({ ...formData, sku: value })}
                placeholder="Scanner ou saisir le code-barres"
                disabled={!!product} // SKU non modifiable
              />
            </div>

            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nom du produit"
                required
              />
            </div>
          </div>

          {/* Image du produit */}
          <div className="space-y-2">
            <Label>Photo du produit</Label>
            <ImageUpload
              value={formData.image}
              onChange={(imageData) =>
                setFormData({ ...formData, image: imageData })
              }
              onRemove={() => setFormData({ ...formData, image: '' })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Description du produit"
              className="flex min-h-[80px] w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Prix d'achat */}
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">
                Prix d'achat (DH) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) =>
                  setFormData({ ...formData, purchasePrice: e.target.value })
                }
                placeholder="0.00"
                required
              />
              <p className="text-xs text-gray-500">
                Prix auquel vous achetez le produit
              </p>
            </div>

            {/* Prix de vente */}
            <div className="space-y-2">
              <Label htmlFor="price">
                Prix de vente (DH) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
                required
              />
              {formData.purchasePrice && formData.price && (
                <p className="text-xs text-green-600 font-medium">
                  Marge: {(parseFloat(formData.price) - parseFloat(formData.purchasePrice)).toFixed(2)} DH
                  ({((parseFloat(formData.price) - parseFloat(formData.purchasePrice)) / parseFloat(formData.purchasePrice) * 100).toFixed(1)}%)
                </p>
              )}
            </div>
          </div>

          {/* Catégorie avec autocomplétion */}
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <CategoryCombobox
              value={formData.categoryId}
              onValueChange={(value) =>
                setFormData({ ...formData, categoryId: value })
              }
              categories={categories}
              onCategoryCreated={onCategoryCreated}
              placeholder="Sélectionner ou créer une catégorie..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Stock */}
            <div className="space-y-2">
              <Label htmlFor="stock">Stock actuel</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                placeholder="0"
              />
            </div>

            {/* Stock minimum */}
            <div className="space-y-2">
              <Label htmlFor="minStock">Stock minimum</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) =>
                  setFormData({ ...formData, minStock: e.target.value })
                }
                placeholder="10"
              />
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image">URL de l'image</Label>
            <Input
              id="image"
              type="url"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : product ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

