import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  DollarSign
} from 'lucide-react'
import ProfitStats from '@/components/dashboard/ProfitStats'
import DashboardPageClient from '@/components/dashboard/DashboardPageClient'
import DashboardStatsCards from '@/components/dashboard/DashboardStatsCards'
import AutoUpdateNotice from '@/components/dashboard/AutoUpdateNotice'

export default async function DashboardPage() {
  const session = await getSession()

  // Fetch dashboard statistics
  const [
    totalProducts,
    totalCustomers,
    totalSales,
    lowStockProducts,
    recentSales,
    totalRevenue,
    creditUsed,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.customer.count(),
    prisma.sale.count({ where: { status: 'COMPLETED' } }),
    prisma.product.count({
      where: {
        isActive: true,
        stock: {
          lte: prisma.product.fields.minStock,
        },
      },
    }),
    prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        seller: true,
      },
    }),
    prisma.sale.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { totalAmount: true },
    }),
    prisma.customer.aggregate({
      _sum: { creditUsed: true },
    }),
  ])

  const stats = [
    {
      title: 'Produits',
      value: totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Clients',
      value: totalCustomers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Ventes',
      value: totalSales,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Chiffre d\'affaires',
      value: `${(totalRevenue._sum.totalAmount ? Number(totalRevenue._sum.totalAmount).toFixed(2) : '0.00')} DH`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Crédit utilisé',
      value: `${(creditUsed._sum.creditUsed ? Number(creditUsed._sum.creditUsed).toFixed(2) : '0.00')} DH`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Stock faible',
      value: lowStockProducts,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ]

  return (
    <DashboardPageClient>
      <div className="space-y-6">
      {/* Header Business Moderne - Responsive */}
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-[var(--color-business-blue)] via-[var(--color-business-blue)] to-[var(--color-success-green)] p-4 md:p-8 shadow-2xl border border-[hsl(var(--border))]">
        {/* Effet de fond moderne */}
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.3))]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-business-blue)]/10 to-[var(--color-success-green)]/10 backdrop-blur-3xl"></div>

        {/* Éléments décoratifs Business - Adaptés mobile */}
        <div className="absolute top-2 right-2 md:top-4 md:right-4 w-16 h-16 md:w-32 md:h-32 bg-white/5 rounded-full blur-xl md:blur-2xl"></div>
        <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 w-12 h-12 md:w-24 md:h-24 bg-[var(--color-success-green)]/10 rounded-full blur-lg md:blur-xl"></div>

        <div className="relative">
          {/* Layout mobile : vertical, desktop : horizontal */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-3 md:gap-6">
              <div className="p-2 md:p-4 bg-white/15 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg border border-white/20">
                <TrendingUp className="w-6 h-6 md:w-10 md:h-10 text-white drop-shadow-sm" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                  <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
                    Tableau de bord
                  </h1>
                  <div className="px-2 py-1 md:px-3 md:py-1 bg-[var(--color-success-green)]/20 text-[var(--color-success-green)] text-xs font-medium rounded-full border border-[var(--color-success-green)]/30 backdrop-blur-sm w-fit">
                    ✨ Business Pro
                  </div>
                </div>
                <p className="text-white/90 text-sm md:text-base font-medium mb-2 md:mb-3">
                  Vue d'ensemble de votre entreprise en temps réel
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3">
                  <div className="text-xs md:text-sm text-white/90 bg-white/10 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl backdrop-blur-sm border border-white/20 flex items-center gap-2">
                    <div className="w-2 h-2 bg-[var(--color-success-green)] rounded-full animate-pulse"></div>
                    👋 Bienvenue, {session?.user?.name}
                  </div>
                  <div className="text-xs text-white/70 bg-white/5 px-2 py-1 md:px-3 md:py-2 rounded-md md:rounded-lg backdrop-blur-sm">
                    📊 Données en temps réel
                  </div>
                </div>
              </div>
            </div>

            {/* Indicateur de statut - Caché sur mobile, visible sur desktop */}
            <div className="hidden lg:flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <div className="w-3 h-3 bg-[var(--color-success-green)] rounded-full animate-pulse"></div>
                Système opérationnel
              </div>
              <div className="text-xs text-white/70">
                Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid Business Moderne - Responsive avec mise à jour automatique */}
      <DashboardStatsCards />

      {/* Ventes récentes Business Moderne */}
      <Card className="border border-[hsl(var(--border))] shadow-lg bg-[hsl(var(--card))] backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[hsl(var(--border))] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-sales)]/10 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-[var(--color-sales)]" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-[hsl(var(--foreground))]">
                Ventes récentes
              </CardTitle>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Dernières transactions effectuées</p>
            </div>
          </div>
          <Link href="/dashboard/sales/history">
            <Button
              variant="sales-outline"
              size="sm"
              className="shadow-sm hover:shadow-md transition-all"
            >
              📊 Voir tout
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-6">
          {recentSales.length > 0 && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-[var(--color-sales)]/5 border border-[var(--color-sales)]/10 rounded-lg md:rounded-xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-[var(--color-sales)]">
                    {recentSales.length}
                  </div>
                  <div className="text-xs md:text-sm text-[hsl(var(--muted-foreground))]">
                    Ventes récentes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-[var(--color-success-green)]">
                    {recentSales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0).toFixed(0)} DH
                  </div>
                  <div className="text-xs md:text-sm text-[hsl(var(--muted-foreground))]">
                    Chiffre d'affaires
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-[var(--color-business-blue)]">
                    {recentSales.length > 0
                      ? (recentSales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0) / recentSales.length).toFixed(0)
                      : '0'} DH
                  </div>
                  <div className="text-xs md:text-sm text-[hsl(var(--muted-foreground))]">
                    Panier moyen
                  </div>
                </div>
              </div>
            </div>
          )}

          {recentSales.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-[var(--color-sales)]/5 rounded-full w-fit mx-auto mb-4">
                <ShoppingCart className="w-16 h-16 text-[var(--color-sales)]/50" />
              </div>
              <p className="text-[hsl(var(--foreground))] font-medium">
                Aucune vente enregistrée
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                Les ventes apparaîtront ici une fois effectuées
              </p>
              <Link href="/dashboard/sales" className="inline-block mt-4">
                <Button variant="sales" size="sm">
                  🛒 Créer une vente
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSales.map((sale, index) => (
                <div
                  key={sale.id}
                  className="group relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-5 bg-[hsl(var(--card))] rounded-lg md:rounded-xl border border-[hsl(var(--border))] hover:border-[var(--color-sales)]/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 gap-3 sm:gap-0"
                >
                  {/* Barre latérale colorée */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-sales)] transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 rounded-r"></div>

                  {/* Effet de fond subtil */}
                  <div className="absolute inset-0 bg-[var(--color-sales)]/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>

                  <div className="relative flex items-center gap-3 md:gap-4 flex-1">
                    {/* Numéro de vente stylisé */}
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-[var(--color-sales)]/10 border border-[var(--color-sales)]/20 flex items-center justify-center text-[var(--color-sales)] font-bold shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-110 text-sm md:text-base">
                      #{index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Nom du client */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <p className="font-semibold text-sm md:text-base text-[hsl(var(--foreground))] group-hover:text-[var(--color-sales)] transition-colors truncate">
                          {sale.customer ? sale.customer.name : 'Client de passage'}
                        </p>
                        {!sale.customer && (
                          <span className="px-2 py-0.5 bg-[var(--color-quotes)]/10 text-[var(--color-quotes)] text-xs font-medium rounded-full border border-[var(--color-quotes)]/20 w-fit">
                            Passage
                          </span>
                        )}
                      </div>

                      {/* Informations de la vente */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs md:text-sm text-[hsl(var(--muted-foreground))]">
                        <span className="font-mono text-xs bg-[hsl(var(--muted))] px-2 py-1 rounded border border-[hsl(var(--border))] group-hover:bg-[var(--color-sales)]/10 group-hover:border-[var(--color-sales)]/20 transition-all w-fit">
                          {sale.saleNumber}
                        </span>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-[var(--color-customers)] rounded-full"></span>
                            <span className="truncate">{sale.seller.name}</span>
                          </span>
                          <span className="hidden sm:inline w-1 h-1 bg-[hsl(var(--muted-foreground))] rounded-full"></span>
                          <span className="flex items-center gap-1">
                            📦 {sale.items?.length || 0} article{(sale.items?.length || 0) > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Montant et date */}
                  <div className="relative text-right sm:text-right">
                    <p className="text-xl md:text-2xl font-bold text-[var(--color-sales)] group-hover:scale-105 transition-transform duration-300">
                      {Number(sale.totalAmount).toFixed(2)} DH
                    </p>
                    <div className="flex items-center gap-2 mt-1 justify-end">
                      <div className="w-2 h-2 bg-[var(--color-success-green)] rounded-full animate-pulse"></div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {new Date(sale.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Bénéfices Business Moderne - Responsive */}
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-[var(--color-success-green)]/5 rounded-full -mr-16 -mt-16 md:-mr-32 md:-mt-32"></div>
        <div className="absolute top-0 left-0 w-16 h-16 md:w-32 md:h-32 bg-[var(--color-business-blue)]/5 rounded-full -ml-8 -mt-8 md:-ml-16 md:-mt-16"></div>
        <div className="relative p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 mb-6 md:mb-8">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-3 md:p-4 bg-gradient-to-br from-[var(--color-success-green)] to-[var(--color-business-blue)] rounded-xl md:rounded-2xl shadow-lg">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-sm" />
              </div>
              <div>
                <h2 className="text-xl md:text-3xl font-bold text-[hsl(var(--foreground))]">
                  Analyse des Bénéfices
                </h2>
                <p className="text-xs md:text-sm text-[hsl(var(--muted-foreground))] mt-1">
                  Suivi de la rentabilité en temps réel avec indicateurs avancés
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 md:px-3 md:py-1 bg-[var(--color-success-green)]/10 text-[var(--color-success-green)] text-xs font-medium rounded-full border border-[var(--color-success-green)]/20">
                ✨ Analytics Pro
              </div>
              <div className="w-3 h-3 bg-[var(--color-success-green)] rounded-full animate-pulse"></div>
            </div>
          </div>
          <ProfitStats />
        </div>
      </div>
      </div>

      {/* Notification de mise à jour automatique */}
      <AutoUpdateNotice />
    </DashboardPageClient>
  )
}

