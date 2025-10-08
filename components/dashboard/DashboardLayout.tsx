'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface DashboardWrapperProps {
  user: User
  children: React.ReactNode
}

export default function DashboardWrapper({
  user,
  children
}: DashboardWrapperProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // TopBar supprimée - plus d'en-tête sur aucune page

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Detect sidebar collapse state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved) {
      setSidebarCollapsed(JSON.parse(saved))
    }
  }, [])

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          user={user}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative">
            <Sidebar
              user={user}
              collapsed={false}
              onToggleCollapse={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Mobile Header with Hamburger */}
      <div className="md:hidden bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[var(--color-business-blue)] to-[var(--color-business-blue-dark)] rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">AG</span>
            </div>
            <h1 className="font-bold text-lg text-[hsl(var(--foreground))]">Alami Gestion</h1>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {user.role === 'OWNER' ? 'Propriétaire' : 'Vendeur'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        "md:ml-64", // Default sidebar width
        sidebarCollapsed && "md:ml-20" // Collapsed sidebar width
      )}>
        {/* Page Content - Sans TopBar */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
