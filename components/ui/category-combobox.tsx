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
              <CommandGroup className="p-0">
                <div className="px-3 py-2 bg-gradient-to-r from-slate-50 to-gray-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-4 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full"></div>
                    Catégories disponibles
                    <Badge variant="secondary" className="ml-auto bg-violet-100 text-violet-700 text-xs px-2 py-0.5">
                      {filteredCategories.length}
                    </Badge>
                  </p>
                </div>
                <div className="px-2 py-2 space-y-1">
                  {filteredCategories.map((category, index) => (
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
                        "cursor-pointer rounded-xl px-3 py-3 transition-all duration-300 group relative overflow-hidden",
                        value === category.id
                          ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold shadow-lg shadow-violet-200 scale-[1.02]"
                          : "hover:bg-white hover:shadow-md hover:scale-[1.01] border border-transparent hover:border-violet-100"
                      )}
                    >
                      {/* Effet de brillance au hover */}
                      {value !== category.id && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full"></div>
                      )}

                      <div className="flex items-center gap-3 w-full relative z-10">
                        {/* Icône avec animation */}
                        <div className={cn(
                          "flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 flex-shrink-0",
                          value === category.id
                            ? "bg-white/20 backdrop-blur-sm shadow-lg scale-110"
                            : "bg-gradient-to-br from-violet-100 to-purple-100 group-hover:scale-110 group-hover:rotate-6"
                        )}>
                          {value === category.id ? (
                            <Check className="h-5 w-5 text-white animate-in zoom-in duration-300" />
                          ) : (
                            <FolderOpen className={cn(
                              "h-4 w-4 transition-colors duration-300",
                              "text-violet-600 group-hover:text-violet-700"
                            )} />
                          )}
                        </div>

                        {/* Nom de la catégorie */}
                        <div className="flex-1 min-w-0">
                          <span className={cn(
                            "block truncate transition-all duration-300",
                            value === category.id
                              ? "text-white text-base"
                              : "text-gray-700 group-hover:text-violet-900 text-sm font-medium"
                          )}>
                            {category.name}
                          </span>
                          {value === category.id && (
                            <span className="text-xs text-white/80 animate-in fade-in slide-in-from-left-2 duration-300">
                              Catégorie active
                            </span>
                          )}
                        </div>

                        {/* Badge de sélection */}
                        {value === category.id && (
                          <div className="flex items-center gap-2 flex-shrink-0 animate-in zoom-in duration-300">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <Badge className="bg-white/20 text-white border-white/30 text-xs px-2.5 py-0.5 font-semibold backdrop-blur-sm">
                              ✓ Sélectionnée
                            </Badge>
                          </div>
                        )}

                        {/* Indicateur de hover */}
                        {value !== category.id && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0">
                            <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                          </div>
                        )}
                      </div>

                      {/* Numéro d'index décoratif */}
                      {value !== category.id && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                          <span className="text-4xl font-black text-violet-600">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                      )}
                    </CommandItem>
                  ))}
                </div>
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
