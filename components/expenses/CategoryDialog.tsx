'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface ExpenseCategory {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
}

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  category?: ExpenseCategory | null
}

const PRESET_CATEGORIES = [
  { name: 'Loyer', icon: '🏢', color: '#3b82f6' },
  { name: 'Salaires', icon: '💰', color: '#10b981' },
  { name: 'Électricité', icon: '⚡', color: '#f59e0b' },
  { name: 'Eau', icon: '💧', color: '#06b6d4' },
  { name: 'Internet', icon: '🌐', color: '#8b5cf6' },
  { name: 'Téléphone', icon: '📱', color: '#ec4899' },
  { name: 'Fournitures', icon: '📦', color: '#6366f1' },
  { name: 'Marketing', icon: '📢', color: '#f43f5e' },
  { name: 'Transport', icon: '🚗', color: '#14b8a6' },
  { name: 'Entretien', icon: '🔧', color: '#84cc16' },
  { name: 'Assurance', icon: '🛡️', color: '#0ea5e9' },
  { name: 'Taxes', icon: '📊', color: '#ef4444' },
  { name: 'Formation', icon: '📚', color: '#a855f7' },
  { name: 'Repas', icon: '🍽️', color: '#f97316' },
  { name: 'Autre', icon: '📝', color: '#64748b' }
]

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6',
  '#ec4899', '#6366f1', '#f43f5e', '#14b8a6', '#84cc16',
  '#0ea5e9', '#ef4444', '#a855f7', '#f97316', '#64748b'
]

export function CategoryDialog({
  open,
  onOpenChange,
  onSuccess,
  category
}: CategoryDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: '💰'
  })

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color || '#3b82f6',
        icon: category.icon || '💰'
      })
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#3b82f6',
        icon: '💰'
      })
    }
  }, [category, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = '/api/expenses/categories'
      const method = category ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(category && { id: category.id }),
          ...formData
        })
      })

      if (response.ok) {
        toast.success(category ? 'Catégorie modifiée' : 'Catégorie créée')
        onSuccess()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const handlePresetSelect = (preset: typeof PRESET_CATEGORIES[0]) => {
    setFormData({
      ...formData,
      name: preset.name,
      icon: preset.icon,
      color: preset.color
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </DialogTitle>
          <DialogDescription>
            {category ? 'Modifiez les informations de la catégorie' : 'Créez une nouvelle catégorie de dépenses'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!category && (
            <div className="space-y-2">
              <Label>Catégories prédéfinies</Label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_CATEGORIES.map((preset) => (
                  <Button
                    key={preset.name}
                    type="button"
                    variant="outline"
                    onClick={() => handlePresetSelect(preset)}
                    className="justify-start"
                  >
                    <span className="mr-2">{preset.icon}</span>
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nom de la catégorie *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Loyer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description de la catégorie..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icône (Emoji)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="💰"
                maxLength={2}
              />
              <p className="text-xs text-gray-500">
                Utilisez un emoji pour représenter la catégorie
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Couleur</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20 h-10"
                />
                <div className="flex-1 grid grid-cols-5 gap-1">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: color,
                        borderColor: formData.color === color ? '#000' : 'transparent'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border-2 border-dashed" style={{ borderColor: formData.color }}>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${formData.color}20` }}
              >
                {formData.icon}
              </div>
              <div>
                <div className="font-semibold">{formData.name || 'Nom de la catégorie'}</div>
                <div className="text-sm text-gray-500">
                  {formData.description || 'Description de la catégorie'}
                </div>
              </div>
            </div>
          </div>

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
              {loading ? 'Enregistrement...' : category ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

