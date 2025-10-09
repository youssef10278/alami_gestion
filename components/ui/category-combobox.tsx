'use client'

import { useState } from 'react'
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

  const selectedCategory = categories.find(cat => cat.id === value)

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  const exactMatch = categories.find(cat =>
    cat.name.toLowerCase() === searchValue.toLowerCase()
  )

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
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedCategory ? selectedCategory.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
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
                  <button
                    onClick={createCategory}
                    disabled={creating}
                    className="w-full text-left p-3 rounded-lg hover:bg-green-50 border-2 border-dashed border-green-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-medium text-green-600">
                          {creating ? 'Création...' : `Créer "${searchValue.trim()}"`}
                        </div>
                        <div className="text-xs text-gray-500">
                          Nouvelle catégorie
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="p-4 text-sm text-gray-500 text-center">
                  Aucune catégorie trouvée
                </div>
              )}
            </CommandEmpty>

            {filteredCategories.length > 0 && (
              <CommandGroup heading="Catégories disponibles">
                {filteredCategories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => {
                      onValueChange(category.id)
                      setOpen(false)
                      setSearchValue('')
                    }}
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
                    <div className="text-xs text-gray-500">
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
