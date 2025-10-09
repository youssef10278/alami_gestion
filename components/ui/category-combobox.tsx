'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Plus, FolderOpen, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

interface Category {
  id: string
  name: string
}

interface CategoryComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  categories: Category[]
  onCategoryCreated?: (category: Category) => void
  placeholder?: string
  disabled?: boolean
}

export function CategoryCombobox({
  value,
  onValueChange,
  categories,
  onCategoryCreated,
  placeholder = "Sélectionner ou créer une catégorie...",
  disabled = false
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [creating, setCreating] = useState(false)

  // Trouver la catégorie sélectionnée
  const selectedCategory = categories.find(cat => cat.id === value)

  // Filtrer les catégories selon la recherche
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  // Vérifier si la recherche correspond exactement à une catégorie existante
  const exactMatch = categories.find(cat => 
    cat.name.toLowerCase() === searchValue.toLowerCase()
  )

  // Créer une nouvelle catégorie
  const createCategory = async () => {
    if (!searchValue.trim() || exactMatch || creating) return

    setCreating(true)
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: searchValue.trim(),
        }),
      })

      if (response.ok) {
        const newCategory = await response.json()
        onCategoryCreated?.(newCategory)
        onValueChange(newCategory.id)
        setSearchValue('')
        setOpen(false)
      }
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-12 px-4 rounded-xl border-2 transition-all duration-300",
            selectedCategory
              ? "border-violet-300 bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 shadow-sm hover:shadow-md"
              : "border-gray-200 hover:border-violet-300 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50 hover:shadow-sm",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {selectedCategory ? (
              <>
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-md flex-shrink-0">
                  <FolderOpen className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-medium text-gray-900 truncate">{selectedCategory.name}</span>
                  <Badge variant="secondary" className="bg-violet-100 text-violet-700 border-violet-200 text-xs px-2 py-0.5 flex-shrink-0">
                    Sélectionnée
                  </Badge>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-gray-500 font-medium truncate">{placeholder}</span>
              </>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-[100] shadow-2xl border-2 border-violet-100" align="start" sideOffset={8}>
        <Command shouldFilter={false} className="rounded-xl">
          <div className="px-3 py-2 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
            <CommandInput
              placeholder="🔍 Rechercher ou créer une catégorie..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="border-0 focus:ring-0 bg-transparent placeholder:text-gray-500"
            />
          </div>
          <CommandList>
            <CommandEmpty>
              {searchValue.trim() && !exactMatch ? (
                <div className="p-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-auto p-3 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 border-2 border-dashed border-green-300 hover:border-green-400 transition-all duration-200 hover:shadow-md"
                    onClick={createCategory}
                    disabled={creating}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-md flex-shrink-0">
                        <Plus className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-green-700 truncate">
                          {creating ? '✨ Création en cours...' : `✨ Créer "${searchValue.trim()}"`}
                        </div>
                        <div className="text-xs text-green-600 mt-0.5">
                          Nouvelle catégorie • Cliquez pour créer
                        </div>
                      </div>
                      {creating && (
                        <div className="flex-shrink-0">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent"></div>
                        </div>
                      )}
                    </div>
                  </Button>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">Aucune catégorie trouvée</p>
                    <p className="text-xs text-gray-400">Essayez un autre terme de recherche</p>
                  </div>
                </div>
              )}
            </CommandEmpty>
            
            {filteredCategories.length > 0 && (
              <CommandGroup heading="📁 Catégories existantes" className="px-2 py-2">
                {filteredCategories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => {
                      console.log('Category selected:', category.name, category.id)
                      onValueChange(category.id)
                      setOpen(false)
                      setSearchValue('')
                    }}
                    className={cn(
                      "cursor-pointer rounded-lg px-3 py-2.5 my-0.5 transition-all duration-200",
                      value === category.id
                        ? "bg-gradient-to-r from-violet-100 to-purple-100 text-violet-900 font-medium shadow-sm"
                        : "hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50"
                    )}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={cn(
                        "flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200",
                        value === category.id
                          ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-md"
                          : "bg-gradient-to-br from-gray-100 to-gray-200"
                      )}>
                        {value === category.id ? (
                          <Check className="h-4 w-4 text-white" />
                        ) : (
                          <FolderOpen className="h-3.5 w-3.5 text-gray-500" />
                        )}
                      </div>
                      <span className="flex-1 truncate">{category.name}</span>
                      {value === category.id && (
                        <Badge variant="secondary" className="bg-violet-200 text-violet-700 border-0 text-xs px-2 py-0">
                          ✓
                        </Badge>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Option pour créer une nouvelle catégorie si elle n'existe pas */}
            {searchValue.trim() && !exactMatch && filteredCategories.length > 0 && (
              <CommandGroup heading="➕ Nouvelle catégorie" className="px-2 py-2 border-t border-gray-100">
                <CommandItem
                  onSelect={createCategory}
                  disabled={creating}
                  className="cursor-pointer rounded-lg px-3 py-2.5 my-0.5 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 border-2 border-dashed border-green-200 hover:border-green-300 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-md flex-shrink-0">
                      <Plus className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-green-700 truncate">
                        {creating ? '✨ Création...' : `✨ Créer "${searchValue.trim()}"`}
                      </div>
                      <div className="text-xs text-green-600">
                        Nouvelle catégorie
                      </div>
                    </div>
                    {creating && (
                      <div className="flex-shrink-0">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
