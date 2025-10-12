'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { DashboardAnalytics } from '@/hooks/useDashboardAnalytics'
import { safeToFixed } from '@/lib/utils'

interface AnalyticsChartsProps {
  analytics: DashboardAnalytics
  loading?: boolean
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function AnalyticsCharts({ analytics, loading }: AnalyticsChartsProps) {
  if (loading) {
    return (
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span className="text-xs font-medium">
          {isPositive ? '+' : ''}{safeToFixed(growth, 1)}%
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chiffre d'affaires */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Chiffre d'Affaires</CardTitle>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {safeToFixed(analytics.totalRevenue)} DH
            </div>
            <div className="flex items-center justify-between mt-2">
              {formatGrowth(analytics.revenueGrowth)}
              <span className="text-xs text-gray-500">vs période précédente</span>
            </div>
          </CardContent>
        </Card>

        {/* Ventes */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ventes Complétées</CardTitle>
            <ShoppingCart className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.totalSales}
            </div>
            <div className="flex items-center justify-between mt-2">
              {formatGrowth(analytics.salesGrowth)}
              <span className="text-xs text-gray-500">
                Moy: {safeToFixed(analytics.averageOrderValue)} DH
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Commandes */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Commandes</CardTitle>
            <Package className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analytics.totalOrders}
            </div>
            <div className="flex items-center justify-between mt-2">
              {formatGrowth(analytics.ordersGrowth)}
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                  {analytics.completedSales}
                </Badge>
                {analytics.pendingSales > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1 text-orange-500" />
                    {analytics.pendingSales}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Clients</CardTitle>
            <Users className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {analytics.totalCustomers}
            </div>
            <div className="flex items-center justify-between mt-2">
              <Badge variant="outline" className="text-xs">
                +{analytics.newCustomers} nouveaux
              </Badge>
              <span className="text-xs text-gray-500">cette période</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des ventes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Évolution des Ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.salesByDay}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return `${date.getDate()}/${date.getMonth() + 1}`
                  }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${safeToFixed(value)} DH`, 'Chiffre d\'affaires']}
                  labelFormatter={(label) => {
                    const date = new Date(label)
                    return date.toLocaleDateString('fr-FR')
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ventes par heure (si données disponibles) */}
        {analytics.salesByHour.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                Ventes par Heure (Aujourd'hui)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.salesByHour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tickFormatter={(value) => `${value}h`} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${safeToFixed(value)} DH`, 'Ventes']}
                    labelFormatter={(label) => `${label}h00`}
                  />
                  <Bar dataKey="sales" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Produits */}
        {analytics.topProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Top 5 Produits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topProducts} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value: number) => [`${value} unités`, 'Quantité vendue']} />
                  <Bar dataKey="quantity" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Méthodes de paiement */}
        {analytics.paymentMethods.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Méthodes de Paiement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.paymentMethods}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {analytics.paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${safeToFixed(value)} DH`, 'Montant']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
