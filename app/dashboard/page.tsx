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
      value: `${totalRevenue._sum.totalAmount?.toFixed(2) || 0} DH`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Crédit utilisé',
      value: `${creditUsed._sum.creditUsed?.toFixed(2) || 0} DH`,
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
    <div className="space-y-6">
      {/* Header Premium */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 shadow-2xl">
        {/* Effet de fond animé */}
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 backdrop-blur-3xl"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-1 drop-shadow-lg">
                Tableau de bord
              </h1>
              <p className="text-blue-100 text-sm">
                Vue d'ensemble de votre entreprise en temps réel
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-xs text-white/80 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                  👋 Bienvenue, {session?.user?.name}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid avec design premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const gradients = [
            'from-blue-50 to-blue-100/50',
            'from-green-50 to-emerald-100/50',
            'from-purple-50 to-purple-100/50',
            'from-emerald-50 to-teal-100/50',
            'from-orange-50 to-amber-100/50',
            'from-red-50 to-rose-100/50',
          ]
          const iconGradients = [
            'from-blue-500 to-blue-600',
            'from-green-500 to-emerald-600',
            'from-purple-500 to-purple-600',
            'from-emerald-500 to-teal-600',
            'from-orange-500 to-amber-600',
            'from-red-500 to-rose-600',
          ]
          const textGradients = [
            'from-blue-600 to-blue-500',
            'from-green-600 to-emerald-500',
            'from-purple-600 to-purple-500',
            'from-emerald-600 to-teal-500',
            'from-orange-600 to-amber-500',
            'from-red-600 to-rose-500',
          ]

          return (
            <Card
              key={stat.title}
              className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br"
              style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index]}`}></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>

              <CardHeader className="relative flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-gray-900">
                  {stat.title}
                </CardTitle>
                <div className={`p-3 bg-gradient-to-br ${iconGradients[index]} rounded-xl shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className={`text-4xl font-bold bg-gradient-to-r ${textGradients[index]} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Sales avec design premium */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Ventes récentes
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">Dernières transactions effectuées</p>
          </div>
          <Link href="/dashboard/sales/history">
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all shadow-sm hover:shadow-md"
            >
              📊 Voir tout
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-6">
          {recentSales.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">
                Aucune vente enregistrée
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Les ventes apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSales.map((sale, index) => (
                <div
                  key={sale.id}
                  className="group relative overflow-hidden flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{sale.customer.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{sale.saleNumber}</span>
                        <span>•</span>
                        <span>👤 {sale.seller.name}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {sale.totalAmount.toFixed(2)} DH
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      📅 {new Date(sale.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Bénéfices avec design premium */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 border-2 border-green-100 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full -mr-32 -mt-32"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                Analyse des Bénéfices
              </h2>
              <p className="text-sm text-green-600">Suivi de la rentabilité en temps réel</p>
            </div>
          </div>
          <ProfitStats />
        </div>
      </div>
    </div>
  )
}

