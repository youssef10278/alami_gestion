'use client'

import { useState, useEffect } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { safeToFixed } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, Package, Users, CreditCard, DollarSign, ShoppingCart, Target, Activity, Calendar, ArrowUpDown, TrendingDown } from 'lucide-react'

interface DashboardStats {
  salesByDay: { date: string; total: number; count: number }[]
  topProducts: { name: string; sku: string; quantity: number; total: number }[]
  topCustomers: { name: string; company: string | null; total: number; orders: number }[]
  paymentMethods: { method: string; total: number; count: number }[]
  categories: { name: string; products: number }[]
}

const COLORS = ['#4DA6FF', '#FF6B6B', '#4ECDC4', '#FFD93D', '#A8E6CF']

export default function ReportsPage() {
  usePageTitle('Rapports et Statistiques')

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7')
  const [dateRange, setDateRange] = useState<{start: string, end: string} | null>(null)
  const [viewMode, setViewMode] = useState<'preset' | 'custom'>('preset')

  useEffect(() => {
    fetchStats()
  }, [period, dateRange, viewMode])

  const fetchStats = async () => {
    setLoading(true)
    try {
      let url = '/api/dashboard/stats'
      if (viewMode === 'custom' && dateRange) {
        url += `?startDate=${dateRange.start}&endDate=${dateRange.end}`
      } else {
        url += `?days=${period}`
      }

      const response = await fetch(url)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'Espèces'
      case 'CARD':
        return 'Carte'
      case 'TRANSFER':
        return 'Virement'
      case 'CREDIT':
        return 'Crédit'
      default:
        return method
    }
  }

  // Fonctions utilitaires pour les dates
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const getDateLabel = (daysAgo: number) => {
    if (daysAgo === 0) return 'Aujourd\'hui'
    if (daysAgo === 1) return 'Hier'
    if (daysAgo === 2) return 'Avant-hier'
    return `Il y a ${daysAgo} jours`
  }

  const handleDateRangeChange = (start: string, end: string) => {
    setDateRange({ start, end })
    setViewMode('custom')
  }

  const handlePresetChange = (newPeriod: string) => {
    setPeriod(newPeriod)
    setViewMode('preset')
    setDateRange(null)
  }

  // Calculer les comparaisons jour par jour
  const getDayComparison = (currentDay: any, previousDay: any) => {
    if (!previousDay) return null

    const currentTotal = currentDay.total || 0
    const previousTotal = previousDay.total || 0

    if (previousTotal === 0) return currentTotal > 0 ? '+100%' : '0%'

    const change = ((currentTotal - previousTotal) / previousTotal) * 100
    return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Chargement des rapports...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Aucune donnée disponible</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Premium */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-600 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 backdrop-blur-3xl"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-1 drop-shadow-lg">
                Rapports et Statistiques
              </h1>
              <p className="text-cyan-100 text-sm">
                Analysez les performances de votre entreprise
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-xs text-white/80 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                  📊 {viewMode === 'custom' && dateRange
                    ? `Du ${new Date(dateRange.start).toLocaleDateString('fr-FR')} au ${new Date(dateRange.end).toLocaleDateString('fr-FR')}`
                    : `Période : ${period} jours`
                  }
                </div>

              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Sélecteur de mode */}
            <div className="flex bg-white/10 rounded-lg p-1 backdrop-blur-sm">
              <button
                onClick={() => setViewMode('preset')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'preset'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Périodes prédéfinies
              </button>
              <button
                onClick={() => setViewMode('custom')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'custom'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Plage personnalisée
              </button>
            </div>

            {/* Sélecteurs conditionnels */}
            {viewMode === 'preset' ? (
              <Select value={period} onValueChange={handlePresetChange}>
                <SelectTrigger className="w-[200px] bg-white/20 backdrop-blur-sm border-white/30 text-white h-12 rounded-xl shadow-lg hover:bg-white/30 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">📅 Aujourd'hui</SelectItem>
                  <SelectItem value="2">📅 2 derniers jours</SelectItem>
                  <SelectItem value="7">📅 7 derniers jours</SelectItem>
                  <SelectItem value="14">📅 14 derniers jours</SelectItem>
                  <SelectItem value="30">📅 30 derniers jours</SelectItem>
                  <SelectItem value="90">📅 90 derniers jours</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex gap-2 items-center">
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                  <Calendar className="w-4 h-4 text-white/80" />
                  <span className="text-sm text-white/80">Du:</span>
                  <input
                    type="date"
                    className="bg-transparent text-white text-sm border-none outline-none"
                    onChange={(e) => {
                      if (dateRange) {
                        handleDateRangeChange(e.target.value, dateRange.end)
                      } else {
                        const today = formatDateForInput(new Date())
                        handleDateRangeChange(e.target.value, today)
                      }
                    }}
                    value={dateRange?.start || ''}
                  />
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                  <span className="text-sm text-white/80">Au:</span>
                  <input
                    type="date"
                    className="bg-transparent text-white text-sm border-none outline-none"
                    onChange={(e) => {
                      if (dateRange) {
                        handleDateRangeChange(dateRange.start, e.target.value)
                      } else {
                        const today = formatDateForInput(new Date())
                        handleDateRangeChange(today, e.target.value)
                      }
                    }}
                    value={dateRange?.end || ''}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {stats && (
        <>
          {/* KPIs - Indicateurs clés */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Chiffre d'affaires total */}
            <Card className="glass border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Chiffre d'Affaires</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.salesByDay.reduce((sum, day) => sum + day.total, 0).toLocaleString('fr-FR')} DH
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {period} derniers jours
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nombre de ventes */}
            <Card className="glass border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nombre de Ventes</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.salesByDay.reduce((sum, day) => sum + day.count, 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Transactions totales
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <ShoppingCart className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Panier moyen */}
            <Card className="glass border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Panier Moyen</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {(() => {
                        const totalSales = stats.salesByDay.reduce((sum, day) => sum + day.total, 0)
                        const totalCount = stats.salesByDay.reduce((sum, day) => sum + day.count, 0)
                        return totalCount > 0 ? (totalSales / totalCount).toFixed(0) : '0'
                      })()} DH
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Par transaction
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clients actifs */}
            <Card className="glass border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Clients Actifs</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.topCustomers.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Top clients
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Activity className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analyse Jour par Jour */}
          <Card className="glass bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Calendar className="w-5 h-5" />
                Analyse Jour par Jour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {stats.salesByDay.slice().reverse().map((day, index) => {
                  const previousDay = stats.salesByDay.slice().reverse()[index + 1]
                  const comparison = getDayComparison(day, previousDay)
                  const daysAgo = index

                  return (
                    <div key={day.date} className="bg-white rounded-lg p-4 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-700 text-sm">
                          {getDateLabel(daysAgo)}
                        </h4>
                        {comparison && (
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            comparison.startsWith('+')
                              ? 'bg-green-100 text-green-700'
                              : comparison.startsWith('-')
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {comparison.startsWith('+') ? (
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {comparison}
                              </span>
                            ) : comparison.startsWith('-') ? (
                              <span className="flex items-center gap-1">
                                <TrendingDown className="w-3 h-3" />
                                {comparison}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <ArrowUpDown className="w-3 h-3" />
                                {comparison}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">Chiffre d'affaires</p>
                          <p className="text-lg font-bold text-blue-600">
                            {day.total.toLocaleString('fr-FR')} DH
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Nombre de ventes</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {day.count} transaction{day.count > 1 ? 's' : ''}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Panier moyen</p>
                          <p className="text-sm font-semibold text-purple-600">
                            {day.count > 0 ? (day.total / day.count).toFixed(0) : '0'} DH
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                          {new Date(day.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {stats.salesByDay.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucune donnée disponible pour cette période</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Évolution des ventes */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Évolution des Ventes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => `${value.toFixed(2)} DH`}
                    labelFormatter={(label) => {
                      const date = new Date(label)
                      return date.toLocaleDateString('fr-FR')
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#4DA6FF"
                    strokeWidth={2}
                    name="Chiffre d'affaires"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Produits */}
            {stats.topProducts && stats.topProducts.length > 0 ? (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-green-600" />
                    Top 5 Produits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value} unités`} />
                    <Bar dataKey="quantity" fill="#4ECDC4" name="Quantité vendue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            ) : (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-green-600" />
                    Top 5 Produits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
                </CardContent>
              </Card>
            )}

            {/* Top Clients */}
            {stats.topCustomers && stats.topCustomers.length > 0 ? (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Top 5 Clients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.topCustomers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toFixed(2)} DH`} />
                    <Bar dataKey="total" fill="#A8E6CF" name="Total achats" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            ) : (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Top 5 Clients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
                </CardContent>
              </Card>
            )}

            {/* Méthodes de paiement */}
            {stats.paymentMethods && stats.paymentMethods.length > 0 ? (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                    Méthodes de Paiement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.paymentMethods.map((item) => ({
                          ...item,
                          name: getPaymentMethodLabel(item.method),
                        }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {stats.paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toFixed(2)} DH`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            ) : (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                    Méthodes de Paiement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
                </CardContent>
              </Card>
            )}

            {/* Catégories */}
            {stats.categories && stats.categories.length > 0 ? (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Produits par Catégorie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.categories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="products"
                    >
                      {stats.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            ) : (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Produits par Catégorie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Résumé Exécutif */}
          <Card className="glass bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <TrendingUp className="w-5 h-5" />
                Résumé Exécutif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-700 mb-2">Produit Star</h4>
                  <p className="text-lg font-bold text-indigo-600">
                    {stats.topProducts[0]?.name || 'Aucun'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {stats.topProducts[0]?.quantity || 0} unités vendues
                  </p>
                </div>

                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-700 mb-2">Meilleur Client</h4>
                  <p className="text-lg font-bold text-indigo-600">
                    {stats.topCustomers[0]?.name || 'Aucun'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {stats.topCustomers[0]?.total?.toLocaleString('fr-FR') || 0} DH
                  </p>
                </div>

                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-700 mb-2">Paiement Préféré</h4>
                  <p className="text-lg font-bold text-indigo-600">
                    {getPaymentMethodLabel(stats.paymentMethods[0]?.method || 'CASH')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {stats.paymentMethods[0]?.count || 0} transactions
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-indigo-100 rounded-lg">
                <h4 className="font-semibold text-indigo-800 mb-2">💡 Insights Automatiques</h4>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• Votre chiffre d'affaires sur {period} jours représente {stats.salesByDay.reduce((sum, day) => sum + day.total, 0).toLocaleString('fr-FR')} DH</li>
                  <li>• Le panier moyen est de {(() => {
                    const totalSales = stats.salesByDay.reduce((sum, day) => sum + day.total, 0)
                    const totalCount = stats.salesByDay.reduce((sum, day) => sum + day.count, 0)
                    return totalCount > 0 ? (totalSales / totalCount).toFixed(0) : '0'
                  })()} DH par transaction</li>
                  <li>• {stats.topProducts.length > 0 ? `${stats.topProducts[0].name} est votre produit le plus vendu` : 'Aucune vente de produit enregistrée'}</li>
                  <li>• {stats.categories.length > 0 ? `Vous gérez ${stats.categories.reduce((sum, cat) => sum + cat.products, 0)} produits dans ${stats.categories.length} catégories` : 'Aucune catégorie configurée'}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Tableaux détaillés */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Détails Top Produits */}
            {stats.topProducts && stats.topProducts.length > 0 ? (
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Détails Top Produits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.topProducts.map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">
                            {safeToFixed(product.total)} DH
                          </p>
                          <p className="text-sm text-gray-500">{product.quantity} unités</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Détails Top Produits</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
                </CardContent>
              </Card>
            )}

            {/* Détails Top Clients */}
            {stats.topCustomers && stats.topCustomers.length > 0 ? (
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Détails Top Clients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.topCustomers.map((customer, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          {customer.company && (
                            <p className="text-sm text-gray-500">{customer.company}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">
                            {safeToFixed(customer.total)} DH
                          </p>
                          <p className="text-sm text-gray-500">{customer.orders} commandes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Détails Top Clients</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  )
}

