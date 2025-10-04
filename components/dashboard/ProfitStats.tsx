'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, ShoppingCart, Percent } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ProfitData {
  summary: {
    totalRevenue: number
    totalCost: number
    totalProfit: number
    profitMargin: number
    salesCount: number
  }
  profitChart: Array<{
    date: string
    revenue: number
    cost: number
    profit: number
  }>
  topProducts: Array<{
    name: string
    profit: number
    quantity: number
  }>
}

export default function ProfitStats() {
  const [data, setData] = useState<ProfitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    fetchProfitStats()
  }, [period])

  const fetchProfitStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/stats/profit?period=${period}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching profit stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass animate-pulse">
              <CardContent className="pt-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune donnée disponible
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sélecteur de période */}
      <div className="flex justify-end">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">7 derniers jours</option>
          <option value="30">30 derniers jours</option>
          <option value="90">90 derniers jours</option>
          <option value="365">1 an</option>
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Chiffre d'affaires */}
        <Card className="glass hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Chiffre d'affaires
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {data.summary.totalRevenue.toFixed(2)} DH
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coût total */}
        <Card className="glass hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Coût total
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {data.summary.totalCost.toFixed(2)} DH
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bénéfice */}
        <Card className="glass hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Bénéfice net
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {data.summary.totalProfit.toFixed(2)} DH
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marge bénéficiaire */}
        <Card className="glass hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Marge bénéficiaire
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {data.summary.profitMargin.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Percent className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique d'évolution */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Évolution des bénéfices</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.profitChart}>
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
                formatter={(value: number) => `${value.toFixed(2)} DH`}
                labelFormatter={(label) => {
                  const date = new Date(label)
                  return date.toLocaleDateString('fr-FR')
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                name="Chiffre d'affaires"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#F97316"
                name="Coût"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#10B981"
                name="Bénéfice"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top produits par bénéfice */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Top 10 produits par bénéfice</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={150}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(2)} DH`}
              />
              <Legend />
              <Bar
                dataKey="profit"
                fill="#10B981"
                name="Bénéfice"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

