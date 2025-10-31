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

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()

    // Normaliser les dates pour comparer seulement jour/mois/année
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    const diffTime = todayOnly.getTime() - dateOnly.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Aujourd\'hui'
    if (diffDays === 1) return 'Hier'
    if (diffDays === 2) return 'Avant-hier'
    if (diffDays > 0) return `Il y a ${diffDays} jours`

    // Si la date est dans le futur (ne devrait pas arriver)
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })
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
      <div className="text-center py-8 sm:py-12">
        <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-cyan-600"></div>
        <p className="mt-2 text-gray-600 text-sm sm:text-base">Chargement des rapports...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl sm:text-3xl">📊</span>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">Aucune donnée disponible</p>
        <p className="text-gray-400 text-xs sm:text-sm mt-2">
          Les statistiques apparaîtront une fois que vous aurez des ventes
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Premium - Responsive */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-600 p-4 sm:p-6 lg:p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 backdrop-blur-3xl"></div>

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-1 drop-shadow-lg">
                <span className="hidden sm:inline">Rapports et </span>Statistiques
              </h1>
              <p className="text-cyan-100 text-xs sm:text-sm">
                <span className="hidden sm:inline">Analysez les performances de </span>
                <span className="sm:hidden">Performances </span>votre entreprise
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-xs text-white/80 bg-white/10 px-2 sm:px-3 py-1 rounded-lg backdrop-blur-sm">
                  📊 {viewMode === 'custom' && dateRange
                    ? `${new Date(dateRange.start).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} - ${new Date(dateRange.end).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`
                    : `${period} jours`
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full lg:w-auto">
            {/* Sélecteur de mode - Responsive */}
            <div className="flex bg-white/10 rounded-lg p-1 backdrop-blur-sm w-full lg:w-auto">
              <button
                onClick={() => setViewMode('preset')}
                className={`flex-1 lg:flex-none px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  viewMode === 'preset'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="hidden sm:inline">Périodes </span>Prédéfinies
              </button>
              <button
                onClick={() => setViewMode('custom')}
                className={`flex-1 lg:flex-none px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  viewMode === 'custom'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="hidden sm:inline">Plage </span>Personnalisée
              </button>
            </div>

            {/* Sélecteurs conditionnels - Responsive */}
            {viewMode === 'preset' ? (
              <Select value={period} onValueChange={handlePresetChange}>
                <SelectTrigger className="w-full lg:w-[200px] bg-white/20 backdrop-blur-sm border-white/30 text-white h-10 sm:h-12 rounded-lg sm:rounded-xl shadow-lg hover:bg-white/30 transition-all text-sm sm:text-base">
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
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-2 sm:px-3 py-2 backdrop-blur-sm">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-white/80 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-white/80">Du:</span>
                  <input
                    type="date"
                    className="bg-transparent text-white text-xs sm:text-sm border-none outline-none flex-1 min-w-0"
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
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-2 sm:px-3 py-2 backdrop-blur-sm">
                  <span className="text-xs sm:text-sm text-white/80">Au:</span>
                  <input
                    type="date"
                    className="bg-transparent text-white text-xs sm:text-sm border-none outline-none flex-1 min-w-0"
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
          {/* KPIs - Indicateurs clés - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Chiffre d'affaires total */}
            <Card className="glass border-l-4 border-l-blue-500">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      <span className="hidden sm:inline">Chiffre d'</span>Affaires
                    </p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 truncate">
                      {stats.salesByDay.reduce((sum, day) => sum + day.total, 0).toLocaleString('fr-FR')} DH
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {period} <span className="hidden sm:inline">derniers </span>jours
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nombre de ventes */}
            <Card className="glass border-l-4 border-l-green-500">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      <span className="hidden sm:inline">Nombre de </span>Ventes
                    </p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                      {stats.salesByDay.reduce((sum, day) => sum + day.count, 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="hidden sm:inline">Transactions </span>Totales
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-100 rounded-full flex-shrink-0">
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Panier moyen */}
            <Card className="glass border-l-4 border-l-purple-500">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Panier Moyen</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">
                      {(() => {
                        const totalSales = stats.salesByDay.reduce((sum, day) => sum + day.total, 0)
                        const totalCount = stats.salesByDay.reduce((sum, day) => sum + day.count, 0)
                        return totalCount > 0 ? (totalSales / totalCount).toFixed(0) : '0'
                      })()} DH
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="hidden sm:inline">Par </span>Transaction
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-100 rounded-full flex-shrink-0">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clients actifs */}
            <Card className="glass border-l-4 border-l-orange-500">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Clients Actifs</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">
                      {stats.topCustomers.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Top clients</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-orange-100 rounded-full flex-shrink-0">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analyse Jour par Jour - Responsive */}
          <Card className="glass bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-blue-700 text-base sm:text-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                Analyse Jour par Jour
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {stats.salesByDay.slice().reverse().map((day, index) => {
                  const previousDay = stats.salesByDay.slice().reverse()[index + 1]
                  const comparison = getDayComparison(day, previousDay)

                  return (
                    <div key={day.date} className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-700 text-sm truncate">
                            {getDateLabel(day.date)}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {new Date(day.date).toLocaleDateString('fr-FR', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </p>
                        </div>
                        {comparison && (
                          <div className={`text-xs px-1.5 sm:px-2 py-1 rounded-full flex-shrink-0 ${
                            comparison.startsWith('+')
                              ? 'bg-green-100 text-green-700'
                              : comparison.startsWith('-')
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {comparison.startsWith('+') ? (
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span className="hidden sm:inline">{comparison}</span>
                              </span>
                            ) : comparison.startsWith('-') ? (
                              <span className="flex items-center gap-1">
                                <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span className="hidden sm:inline">{comparison}</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <ArrowUpDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span className="hidden sm:inline">{comparison}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">
                            <span className="hidden sm:inline">Chiffre d'</span>Affaires
                          </p>
                          <p className="text-base sm:text-lg font-bold text-blue-600 truncate">
                            {day.total.toLocaleString('fr-FR')} DH
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            <span className="hidden sm:inline">Nombre de </span>Ventes
                          </p>
                          <p className="text-sm font-semibold text-gray-700">
                            {day.count} <span className="hidden sm:inline">transaction{day.count > 1 ? 's' : ''}</span>
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Panier <span className="hidden sm:inline">moyen</span></p>
                          <p className="text-sm font-semibold text-purple-600">
                            {day.count > 0 ? (day.total / day.count).toFixed(0) : '0'} DH
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 hidden sm:block">
                        <p className="text-xs text-gray-400 truncate">
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
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm sm:text-base">Aucune donnée disponible pour cette période</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Évolution des ventes - Responsive */}
          <Card className="glass">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Évolution des Ventes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px]">
                <LineChart data={stats.salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`
                    }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Top Produits - Responsive */}
            {stats.topProducts && stats.topProducts.length > 0 ? (
              <Card className="glass">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    Top <span className="hidden sm:inline">5 </span>Produits
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px]">
                    <BarChart data={stats.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 10 }}
                      className="sm:!text-xs"
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => `${value} unités`} />
                    <Bar dataKey="quantity" fill="#4ECDC4" name="Quantité vendue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            ) : (
              <Card className="glass">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    Top <span className="hidden sm:inline">5 </span>Produits
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="text-center py-6 sm:py-8">
                    <Package className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 text-sm sm:text-base">Aucune donnée disponible</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Clients - Responsive */}
            {stats.topCustomers && stats.topCustomers.length > 0 ? (
              <Card className="glass">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    Top <span className="hidden sm:inline">5 </span>Clients
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px]">
                    <BarChart data={stats.topCustomers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 10 }}
                      className="sm:!text-xs"
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => `${value.toFixed(2)} DH`} />
                    <Bar dataKey="total" fill="#A8E6CF" name="Total achats" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            ) : (
              <Card className="glass">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    Top <span className="hidden sm:inline">5 </span>Clients
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="text-center py-6 sm:py-8">
                    <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 text-sm sm:text-base">Aucune donnée disponible</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Méthodes de paiement - Responsive */}
            {stats.paymentMethods && stats.paymentMethods.length > 0 ? (
              <Card className="glass">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                    <span className="hidden sm:inline">Méthodes de </span>Paiement
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px]">
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
                      outerRadius={window.innerWidth < 640 ? 60 : 80}
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
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                    <span className="hidden sm:inline">Méthodes de </span>Paiement
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="text-center py-6 sm:py-8">
                    <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 text-sm sm:text-base">Aucune donnée disponible</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Catégories - Responsive */}
            {stats.categories && stats.categories.length > 0 ? (
              <Card className="glass">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <span className="hidden sm:inline">Produits par </span>Catégorie<span className="sm:hidden">s</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px]">
                    <PieChart>
                      <Pie
                        data={stats.categories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={window.innerWidth < 640 ? 60 : 80}
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
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <span className="hidden sm:inline">Produits par </span>Catégorie<span className="sm:hidden">s</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="text-center py-6 sm:py-8">
                    <Package className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 text-sm sm:text-base">Aucune donnée disponible</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Résumé Exécutif - Responsive */}
          <Card className="glass bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-indigo-700 text-base sm:text-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                Résumé Exécutif
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Produit Star</h4>
                  <p className="text-base sm:text-lg font-bold text-indigo-600 truncate">
                    {stats.topProducts[0]?.name || 'Aucun'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {stats.topProducts[0]?.quantity || 0} <span className="hidden sm:inline">unités </span>vendues
                  </p>
                </div>

                <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Meilleur Client</h4>
                  <p className="text-base sm:text-lg font-bold text-indigo-600 truncate">
                    {stats.topCustomers[0]?.name || 'Aucun'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {stats.topCustomers[0]?.total?.toLocaleString('fr-FR') || 0} DH
                  </p>
                </div>

                <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm sm:col-span-2 lg:col-span-1">
                  <h4 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">
                    <span className="hidden sm:inline">Paiement </span>Préféré
                  </h4>
                  <p className="text-base sm:text-lg font-bold text-indigo-600">
                    {getPaymentMethodLabel(stats.paymentMethods[0]?.method || 'CASH')}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {stats.paymentMethods[0]?.count || 0} <span className="hidden sm:inline">transactions</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 sm:p-4 bg-indigo-100 rounded-lg">
                <h4 className="font-semibold text-indigo-800 mb-2 text-sm sm:text-base">💡 Insights Automatiques</h4>
                <ul className="text-xs sm:text-sm text-indigo-700 space-y-1">
                  <li>• <span className="hidden sm:inline">Votre </span>CA sur {period} jours<span className="hidden sm:inline"> représente</span> : {stats.salesByDay.reduce((sum, day) => sum + day.total, 0).toLocaleString('fr-FR')} DH</li>
                  <li>• <span className="hidden sm:inline">Le </span>Panier moyen<span className="hidden sm:inline"> est de</span> : {(() => {
                    const totalSales = stats.salesByDay.reduce((sum, day) => sum + day.total, 0)
                    const totalCount = stats.salesByDay.reduce((sum, day) => sum + day.count, 0)
                    return totalCount > 0 ? (totalSales / totalCount).toFixed(0) : '0'
                  })()} DH<span className="hidden sm:inline"> par transaction</span></li>
                  <li>• {stats.topProducts.length > 0 ? `${stats.topProducts[0].name} est votre produit le plus vendu` : 'Aucune vente de produit enregistrée'}</li>
                  <li className="hidden sm:list-item">• {stats.categories.length > 0 ? `Vous gérez ${stats.categories.reduce((sum, cat) => sum + cat.products, 0)} produits dans ${stats.categories.length} catégories` : 'Aucune catégorie configurée'}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Tableaux détaillés - Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Détails Top Produits - Responsive */}
            {stats.topProducts && stats.topProducts.length > 0 ? (
              <Card className="glass">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Détails Top Produits</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    {stats.topProducts.map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow"
                      >
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="font-medium text-sm sm:text-base truncate">{product.name}</p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">{product.sku}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-blue-600 text-sm sm:text-base">
                            {safeToFixed(product.total)} DH
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {product.quantity} <span className="hidden sm:inline">unités</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Détails Top Produits</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="text-center py-6 sm:py-8">
                    <Package className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 text-sm sm:text-base">Aucune donnée disponible</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Détails Top Clients - Responsive */}
            {stats.topCustomers && stats.topCustomers.length > 0 ? (
              <Card className="glass">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Détails Top Clients</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    {stats.topCustomers.map((customer, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow"
                      >
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="font-medium text-sm sm:text-base truncate">{customer.name}</p>
                          {customer.company && (
                            <p className="text-xs sm:text-sm text-gray-500 truncate">{customer.company}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-blue-600 text-sm sm:text-base">
                            {safeToFixed(customer.total)} DH
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {customer.orders} <span className="hidden sm:inline">commandes</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Détails Top Clients</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="text-center py-6 sm:py-8">
                    <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 text-sm sm:text-base">Aucune donnée disponible</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  )
}

