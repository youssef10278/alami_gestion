'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'

interface TopBarProps {
  showSearch?: boolean
  onMobileMenuToggle?: () => void
}

export default function TopBar({
  showSearch = true,
  onMobileMenuToggle
}: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [pageTitle, setPageTitle] = useState('Tableau de bord')

  useEffect(() => {
    const handlePageTitle = (event: CustomEvent) => {
      setPageTitle(event.detail)
    }

    window.addEventListener('pageTitle', handlePageTitle as EventListener)
    return () => window.removeEventListener('pageTitle', handlePageTitle as EventListener)
  }, [])

  return (
    <div className="bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onMobileMenuToggle}
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Page title */}
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">{pageTitle}</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Search bar */}
          {showSearch && (
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--muted-foreground))] w-4 h-4" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 focus:ring-[var(--color-business-blue)] focus:border-[var(--color-business-blue)]"
              />
            </div>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative hover:bg-[hsl(var(--accent))]">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--color-alert-red)] rounded-full text-xs"></span>
          </Button>
        </div>
      </div>
    </div>
  )
}
