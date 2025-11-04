'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  BarChart3,
  Warehouse,
  Truck,
  FileCheck,
  Receipt,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Wallet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface SidebarProps {
  user: User
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export default function Sidebar({ user, collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['OWNER', 'SELLER'] },
    { href: '/dashboard/products', label: 'Produits', icon: Package, roles: ['OWNER', 'SELLER'] },
    { href: '/dashboard/stock', label: 'Stock', icon: Warehouse, roles: ['OWNER', 'SELLER'] },
    { href: '/dashboard/customers', label: 'Clients', icon: Users, roles: ['OWNER', 'SELLER'] },
    { href: '/dashboard/sales', label: 'Nouvelle Vente', icon: ShoppingCart, roles: ['OWNER', 'SELLER'] },
    { href: '/dashboard/sales/history', label: 'Historique Ventes', icon: FileText, roles: ['OWNER', 'SELLER'] },
    { href: '/dashboard/checks', label: 'Chèques', icon: CheckSquare, roles: ['OWNER', 'SELLER'] },
    { href: '/dashboard/quotes', label: 'Devis', icon: FileCheck, roles: ['OWNER', 'SELLER'] },
    { href: '/dashboard/invoices', label: 'Factures', icon: Receipt, roles: ['OWNER'] },
    { href: '/dashboard/suppliers', label: 'Fournisseurs', icon: Truck, roles: ['OWNER', 'SELLER'] },
    { href: '/dashboard/expenses', label: 'Dépenses', icon: Wallet, roles: ['OWNER'] },
    { href: '/dashboard/credit', label: 'Crédit', icon: CreditCard, roles: ['OWNER'] },
    { href: '/dashboard/reports', label: 'Rapports', icon: BarChart3, roles: ['OWNER'] },
    { href: '/dashboard/documents', label: 'Documents', icon: FileText, roles: ['OWNER'] },
    { href: '/dashboard/settings', label: 'Paramètres', icon: Settings, roles: ['OWNER'] },
  ]

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role))

  // Fonction pour obtenir la couleur du module
  const getModuleColor = (href: string) => {
    if (href.includes('/sales')) return 'var(--color-sales)'
    if (href.includes('/invoices')) return 'var(--color-invoices)'
    if (href.includes('/quotes')) return 'var(--color-quotes)'
    if (href.includes('/stock') || href.includes('/products')) return 'var(--color-stock)'
    if (href.includes('/customers') || href.includes('/suppliers')) return 'var(--color-customers)'
    if (href.includes('/expenses')) return '#a855f7' // Purple pour les dépenses
    if (href.includes('/reports') || href.includes('/credit')) return 'var(--color-reports)'
    return 'var(--color-business-blue)' // Couleur par défaut
  }

  return (
    <div className={cn(
      "fixed left-0 top-0 h-screen bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] shadow-lg transition-all duration-300 z-50 flex flex-col",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[var(--color-business-blue)] to-[var(--color-business-blue-dark)] rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">AG</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-[hsl(var(--foreground))]">Alami Gestion</h1>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Gestion d'entreprise</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 bg-gradient-to-r from-[var(--color-business-blue)] to-[var(--color-business-blue-dark)] rounded-xl flex items-center justify-center shadow-md mx-auto">
            <span className="text-white font-bold text-sm">AG</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className={cn("p-2", collapsed && "absolute top-4 right-2")}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-[hsl(var(--border))] flex-shrink-0">
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <div className="w-12 h-12 bg-gradient-to-r from-[var(--color-success-green)] to-[var(--color-business-blue)] rounded-full flex items-center justify-center shadow-md">
            <span className="text-white font-semibold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[hsl(var(--foreground))] truncate">{user.name}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] truncate">{user.email}</p>
              <span className={cn(
                "inline-block px-2 py-1 text-xs rounded-full mt-1",
                user.role === 'OWNER'
                  ? "bg-[var(--color-business-blue)]/10 text-[var(--color-business-blue)] border border-[var(--color-business-blue)]/20"
                  : "bg-[var(--color-success-green)]/10 text-[var(--color-success-green)] border border-[var(--color-success-green)]/20"
              )}>
                {user.role === 'OWNER' ? 'Propriétaire' : 'Vendeur'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 min-h-0" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#d1d5db #f3f4f6'
      }}>
        <div className="space-y-3 pb-4">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const moduleColor = getModuleColor(item.href)

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg transition-all duration-200 group",
                    collapsed ? "px-2 py-3 justify-center" : "px-3 py-2",
                    isActive
                      ? "shadow-md"
                      : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
                  )}
                  style={isActive ? {
                    background: `linear-gradient(135deg, ${moduleColor}, ${moduleColor}dd)`,
                    color: '#ffffff !important',
                    fontWeight: '500'
                  } : {}}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-colors flex-shrink-0",
                      !isActive && "group-hover:text-[hsl(var(--foreground))]"
                    )}
                    style={isActive ? {
                      color: '#ffffff !important',
                      fill: '#ffffff !important'
                    } : { color: moduleColor }}
                  />
                  {!collapsed && (
                    <span
                      className="font-medium truncate"
                      style={isActive ? {
                        color: '#ffffff !important',
                        fontWeight: '500'
                      } : {}}
                    >
                      {item.label}
                    </span>
                  )}
                  {collapsed && (
                    <div className="absolute left-20 bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] border border-[hsl(var(--border))] px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                      {item.label}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[hsl(var(--popover))] border-l border-b border-[hsl(var(--border))] rotate-45"></div>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-[hsl(var(--border))] flex-shrink-0">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={cn(
            "w-full gap-3 text-[var(--color-alert-red)] hover:text-[var(--color-alert-red-dark)] hover:bg-[var(--color-alert-red)]/10 relative group",
            collapsed ? "justify-center px-2 py-3" : "justify-start"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Déconnexion</span>}
          {collapsed && (
            <div className="absolute left-20 bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] border border-[hsl(var(--border))] px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
              Déconnexion
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[hsl(var(--popover))] border-l border-b border-[hsl(var(--border))] rotate-45"></div>
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}
