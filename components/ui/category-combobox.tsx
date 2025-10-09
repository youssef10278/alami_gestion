'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
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
          className="w-full justify-between h-10"
          disabled={disabled}
        >
          {selectedCategory ? selectedCategory.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-[100]" align="start" sideOffset={4}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Rechercher ou créer une catégorie..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {searchValue.trim() && !exactMatch ? (
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-auto p-2"
                    onClick={createCategory}
                    disabled={creating}
                  >
                    <Plus className="mr-2 h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium text-green-600">
                        {creating ? 'Création...' : `Créer "${searchValue.trim()}"`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Nouvelle catégorie
                      </div>
                    </div>
                  </Button>
                </div>
              ) : (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  Aucune catégorie trouvée
                </div>
              )}
            </CommandEmpty>
            
            {filteredCategories.length > 0 && (
              <CommandGroup heading="Catégories existantes">
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
                    className="cursor-pointer hover:bg-accent"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === category.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {category.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Option pour créer une nouvelle catégorie si elle n'existe pas */}
            {searchValue.trim() && !exactMatch && filteredCategories.length > 0 && (
              <CommandGroup heading="Nouvelle catégorie">
                <CommandItem
                  onSelect={createCategory}
                  disabled={creating}
                >
                  <Plus className="mr-2 h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium text-green-600">
                      {creating ? 'Création...' : `Créer "${searchValue.trim()}"`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Nouvelle catégorie
                    </div>
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
