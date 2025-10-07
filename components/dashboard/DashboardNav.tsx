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
  Menu,
  BarChart3,
  Warehouse,
  Truck,
  FileCheck,
  Receipt
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface DashboardNavProps {
  user: User
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    { href: '/dashboard/quotes', label: 'Devis', icon: FileCheck, roles: ['OWNER', 'SELLER'] },
    { href: '/dashboard/invoices', label: 'Factures', icon: Receipt, roles: ['OWNER'] },
    { href: '/dashboard/suppliers', label: 'Fournisseurs', icon: Truck, roles: ['OWNER', 'SELLER'] },
    { href: '/dashboard/credit', label: 'Crédit', icon: CreditCard, roles: ['OWNER'] },
    { href: '/dashboard/reports', label: 'Rapports', icon: BarChart3, roles: ['OWNER'] },
    { href: '/dashboard/documents', label: 'Documents', icon: FileText, roles: ['OWNER'] },
    { href: '/dashboard/settings', label: 'Paramètres', icon: Settings, roles: ['OWNER'] },
  ]

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role))

  return (
    <nav className="glass border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Alami Gestion
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-700 hover:bg-blue-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">
                {user.role === 'OWNER' ? 'Propriétaire' : 'Vendeur'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-700 hover:bg-blue-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <div className="pt-4 border-t">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">
                  {user.role === 'OWNER' ? 'Propriétaire' : 'Vendeur'}
                </p>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

