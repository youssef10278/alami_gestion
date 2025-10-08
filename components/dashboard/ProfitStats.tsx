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
      {/* Sélecteur de période - Responsive */}
      <div className="flex justify-center md:justify-end">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base w-full max-w-xs md:w-auto"
        >
          <option value="7">7 derniers jours</option>
          <option value="30">30 derniers jours</option>
          <option value="90">90 derniers jours</option>
          <option value="365">1 an</option>
        </select>
      </div>

      {/* KPIs avec design Business Moderne - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Chiffre d'affaires */}
        <Card className="group relative overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[var(--color-sales)]/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-[var(--color-sales)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="relative pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">
                  Chiffre d'affaires
                </p>
                <p className="text-xl md:text-2xl font-bold text-[var(--color-sales)] group-hover:scale-105 transition-transform duration-300">
                  {data.summary.totalRevenue.toFixed(2)} DH
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-[var(--color-sales)] rounded-full animate-pulse"></div>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    {data.summary.salesCount} vente{data.summary.salesCount > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="p-2 md:p-3 bg-[var(--color-sales)]/10 border border-[var(--color-sales)]/20 rounded-lg md:rounded-xl group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-[var(--color-sales)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coût total */}
        <Card className="group relative overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[var(--color-warning)]/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-[var(--color-warning)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="relative pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">
                  Coût total
                </p>
                <p className="text-2xl font-bold text-[var(--color-warning)] group-hover:scale-105 transition-transform duration-300">
                  {data.summary.totalCost.toFixed(2)} DH
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-[var(--color-warning)] rounded-full animate-pulse"></div>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    Coûts d'achat
                  </span>
                </div>
              </div>
              <div className="p-3 bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="w-6 h-6 text-[var(--color-warning)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bénéfice */}
        <Card className="group relative overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[var(--color-success-green)]/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-[var(--color-success-green)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="relative pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">
                  Bénéfice net
                </p>
                <p className="text-2xl font-bold text-[var(--color-success-green)] group-hover:scale-105 transition-transform duration-300">
                  {data.summary.totalProfit.toFixed(2)} DH
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-[var(--color-success-green)] rounded-full animate-pulse"></div>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    Profit réalisé
                  </span>
                </div>
              </div>
              <div className="p-3 bg-[var(--color-success-green)]/10 border border-[var(--color-success-green)]/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-[var(--color-success-green)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marge bénéficiaire */}
        <Card className="group relative overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[var(--color-business-blue)]/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-[var(--color-business-blue)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="relative pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">
                  Marge bénéficiaire
                </p>
                <p className="text-2xl font-bold text-[var(--color-business-blue)] group-hover:scale-105 transition-transform duration-300">
                  {data.summary.profitMargin.toFixed(1)}%
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-[var(--color-business-blue)] rounded-full animate-pulse"></div>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    Rentabilité
                  </span>
                </div>
              </div>
              <div className="p-3 bg-[var(--color-business-blue)]/10 border border-[var(--color-business-blue)]/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Percent className="w-6 h-6 text-[var(--color-business-blue)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique d'évolution Business Moderne */}
      <Card className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg">
        <CardHeader className="border-b border-[hsl(var(--border))] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-business-blue)]/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-[var(--color-business-blue)]" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-[hsl(var(--foreground))]">
                Évolution des bénéfices
              </CardTitle>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                Analyse de la rentabilité sur la période sélectionnée
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.profitChart} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getDate()}/${date.getMonth() + 1}`
                }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} DH`}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(2)} DH`, '']}
                labelFormatter={(label) => {
                  const date = new Date(label)
                  return date.toLocaleDateString('fr-FR')
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-sales)"
                name="Chiffre d'affaires"
                strokeWidth={3}
                dot={{ fill: 'var(--color-sales)', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: 'var(--color-sales)', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="var(--color-warning)"
                name="Coût"
                strokeWidth={3}
                dot={{ fill: 'var(--color-warning)', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: 'var(--color-warning)', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="var(--color-success-green)"
                name="Bénéfice"
                strokeWidth={3}
                dot={{ fill: 'var(--color-success-green)', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: 'var(--color-success-green)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top produits par bénéfice Business Moderne */}
      <Card className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg">
        <CardHeader className="border-b border-[hsl(var(--border))] pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--color-success-green)]/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-[var(--color-success-green)]" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-[hsl(var(--foreground))]">
                  Top 10 produits par bénéfice
                </CardTitle>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                  Produits les plus rentables de votre catalogue
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                Total analysé
              </div>
              <div className="text-lg font-bold text-[var(--color-success-green)]">
                {data.topProducts.length} produit{data.topProducts.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {data.topProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-[var(--color-success-green)]/5 rounded-full w-fit mx-auto mb-4">
                <TrendingUp className="w-16 h-16 text-[var(--color-success-green)]/50" />
              </div>
              <p className="text-[hsl(var(--foreground))] font-medium">
                Aucun produit rentable trouvé
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                Les produits avec bénéfices apparaîtront ici
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.topProducts} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value} DH`}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={180}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(2)} DH`, 'Bénéfice']}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar
                  dataKey="profit"
                  fill="var(--color-success-green)"
                  name="Bénéfice"
                  radius={[0, 8, 8, 0]}
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

