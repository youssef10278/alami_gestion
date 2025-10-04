'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { Package, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

const COLORS = ['#4DA6FF', '#FF6B6B', '#4ECDC4', '#FFD93D', '#A8E6CF', '#95E1D3']

interface StockStats {
  summary: {
    totalProducts: number
    activeProducts: number
    totalStock: number
    lowStockCount: number
    outOfStockCount: number
  }
  movementsByDay: {
    date: string
    in: number
    out: number
    net: number
  }[]
  topMovements: {
    name: string
    sku: string
    stock: number
    movements: number
  }[]
  stockByCategory: {
    name: string
    value: number
    quantity: number
    products: number
  }[]
}

export default function StockStatsPage() {
  const [stats, setStats] = useState<StockStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/stock/stats?days=${period}`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Chargement des statistiques...</p>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Statistiques de Stock
          </h1>
          <p className="text-gray-600 mt-1">
            Analysez les mouvements et la valeur de votre stock
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="14">14 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">90 derniers jours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Produits Actifs
            </CardTitle>
            <Package className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.summary.activeProducts}</div>
            <p className="text-xs text-gray-500 mt-1">
              sur {stats.summary.totalProducts} total
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Stock Total
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.summary.totalStock}
            </div>
            <p className="text-xs text-gray-500 mt-1">unités</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Stock Bas
            </CardTitle>
            <TrendingDown className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.summary.lowStockCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">produits</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Rupture
            </CardTitle>
            <Package className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.summary.outOfStockCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">produits</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Valeur Stock
            </CardTitle>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {stats.stockByCategory
                .reduce((sum, cat) => sum + cat.value, 0)
                .toFixed(0)}{' '}
              DH
            </div>
            <p className="text-xs text-gray-500 mt-1">valeur totale</p>
          </CardContent>
        </Card>
      </div>

      {/* Mouvements par jour */}
      {stats.movementsByDay && stats.movementsByDay.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Mouvements de Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.movementsByDay}>
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
                  labelFormatter={(label) => {
                    const date = new Date(label)
                    return date.toLocaleDateString('fr-FR')
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="in"
                  stroke="#4ECDC4"
                  strokeWidth={2}
                  name="Entrées"
                />
                <Line
                  type="monotone"
                  dataKey="out"
                  stroke="#FF6B6B"
                  strokeWidth={2}
                  name="Sorties"
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="#4DA6FF"
                  strokeWidth={2}
                  name="Net"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top produits par mouvement */}
        {stats.topMovements && stats.topMovements.length > 0 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle>Top 10 Produits - Mouvements</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topMovements}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="movements" fill="#4DA6FF" name="Mouvements" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Stock par catégorie */}
        {stats.stockByCategory && stats.stockByCategory.length > 0 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle>Valeur du Stock par Catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.stockByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.stockByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)} DH`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

