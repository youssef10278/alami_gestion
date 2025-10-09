'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

import { safeToFixed, safeNumber } from '@/lib/utils'
interface AnalyticsData {
  summary: {
    totalAmount: number
    totalChecks: number
    issuedAmount: number
    issuedCount: number
    cashedAmount: number
    cashedCount: number
    cancelledAmount: number
    cancelledCount: number
    bouncedAmount: number
    bouncedCount: number
    overdueAmount: number
    overdueCount: number
    upcomingAmount: number
    upcomingCount: number
    averageCheckAmount: number
    cashingRate: number
  }
  monthlyData: Array<{
    month: string
    amount: number
    count: number
  }>
  statusDistribution: Array<{
    name: string
    value: number
  }>
  topSuppliers: Array<{
    id: string
    name: string
    company: string | null
    totalAmount: number
    checkCount: number
    issuedAmount: number
    cashedAmount: number
  }>
  alerts: {
    overdue: Array<{
      id: string
      checkNumber: string
      supplier: { id: string; name: string; company: string | null }
      amount: number
      dueDate: string
      daysOverdue: number
    }>
    upcoming: Array<{
      id: string
      checkNumber: string
      supplier: { id: string; name: string; company: string | null }
      amount: number
      dueDate: string
      daysUntilDue: number
    }>
  }
}

export default function CheckAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/suppliers/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        toast.error('Erreur lors du chargement des analytics')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Erreur lors du chargement des analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Aucune donnée disponible</p>
      </div>
    )
  }

  const { summary, monthlyData, statusDistribution, topSuppliers, alerts } = analytics

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/suppliers/checks">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  📊 Analytics des Chèques
                </h1>
                <p className="text-gray-600 mt-1">Suivi et analyse des chèques fournisseurs</p>
              </div>
            </div>
            <Button onClick={fetchAnalytics} variant="outline">
              🔄 Actualiser
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Chèques */}
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Chèques</CardTitle>
              <DollarSign className="w-5 h-5 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{summary.totalChecks}</div>
              <p className="text-xs text-gray-500 mt-1">{safeToFixed(summary.totalAmount)} DH</p>
              <p className="text-xs text-violet-600 mt-2">
                Moyenne: {safeToFixed(summary.averageCheckAmount)} DH
              </p>
            </CardContent>
          </Card>

          {/* Chèques Émis */}
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Chèques Émis</CardTitle>
              <Clock className="w-5 h-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{summary.issuedCount}</div>
              <p className="text-xs text-gray-500 mt-1">{safeToFixed(summary.issuedAmount)} DH</p>
              <p className="text-xs text-orange-600 mt-2">En attente d'encaissement</p>
            </CardContent>
          </Card>

          {/* Chèques Encaissés */}
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Chèques Encaissés</CardTitle>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{summary.cashedCount}</div>
              <p className="text-xs text-gray-500 mt-1">{safeToFixed(summary.cashedAmount)} DH</p>
              <p className="text-xs text-green-600 mt-2">
                Taux: {safeToFixed(summary.cashingRate, 1)}%
              </p>
            </CardContent>
          </Card>

          {/* Chèques en Retard */}
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Chèques en Retard</CardTitle>
              <AlertCircle className="w-5 h-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{summary.overdueCount}</div>
              <p className="text-xs text-gray-500 mt-1">{safeToFixed(summary.overdueAmount)} DH</p>
              <p className="text-xs text-red-600 mt-2">Échéance dépassée</p>
            </CardContent>
          </Card>
        </div>

        {/* Alertes */}
        {(alerts.overdue.length > 0 || alerts.upcoming.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Chèques en Retard */}
            {alerts.overdue.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Chèques en Retard ({alerts.overdue.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {alerts.overdue.map((check) => (
                      <div key={check.id} className="bg-white p-3 rounded-lg border border-red-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">{check.checkNumber}</p>
                            <p className="text-sm text-gray-600">
                              {check.supplier.name}
                              {check.supplier.company && ` - ${check.supplier.company}`}
                            </p>
                          </div>
                          <Badge variant="destructive">{check.daysOverdue}j de retard</Badge>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-lg font-bold text-red-600">
                            {safeToFixed(check.amount)} DH
                          </span>
                          <span className="text-xs text-gray-500">
                            Échéance: {format(new Date(check.dueDate), 'dd MMM yyyy', { locale: fr })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chèques à Venir */}
            {alerts.upcoming.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-900 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Chèques à Venir (7 jours) ({alerts.upcoming.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {alerts.upcoming.map((check) => (
                      <div key={check.id} className="bg-white p-3 rounded-lg border border-yellow-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">{check.checkNumber}</p>
                            <p className="text-sm text-gray-600">
                              {check.supplier.name}
                              {check.supplier.company && ` - ${check.supplier.company}`}
                            </p>
                          </div>
                          <Badge className="bg-yellow-500">Dans {check.daysUntilDue}j</Badge>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-lg font-bold text-yellow-600">
                            {safeToFixed(check.amount)} DH
                          </span>
                          <span className="text-xs text-gray-500">
                            Échéance: {format(new Date(check.dueDate), 'dd MMM yyyy', { locale: fr })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Distribution par Statut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Répartition par Statut */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Répartition par Statut</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Émis */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">🟡 Émis</span>
                    <span className="text-sm font-bold text-orange-600">
                      {summary.issuedCount} ({safeToFixed(summary.issuedAmount)} DH)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${summary.totalChecks > 0 ? (summary.issuedCount / summary.totalChecks) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Encaissés */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">🟢 Encaissés</span>
                    <span className="text-sm font-bold text-green-600">
                      {summary.cashedCount} ({safeToFixed(summary.cashedAmount)} DH)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${summary.totalChecks > 0 ? (summary.cashedCount / summary.totalChecks) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Annulés */}
                {summary.cancelledCount > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">⚫ Annulés</span>
                      <span className="text-sm font-bold text-gray-600">
                        {summary.cancelledCount} ({safeToFixed(summary.cancelledAmount)} DH)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gray-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${summary.totalChecks > 0 ? (summary.cancelledCount / summary.totalChecks) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Rejetés */}
                {summary.bouncedCount > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">🔴 Rejetés</span>
                      <span className="text-sm font-bold text-red-600">
                        {summary.bouncedCount} ({safeToFixed(summary.bouncedAmount)} DH)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-red-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${summary.totalChecks > 0 ? (summary.bouncedCount / summary.totalChecks) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Indicateurs Clés */}
          <Card>
            <CardHeader>
              <CardTitle>📈 Indicateurs Clés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Taux d'encaissement */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Taux d'Encaissement</p>
                      <p className="text-3xl font-bold text-green-600">{safeToFixed(summary.cashingRate, 1)}%</p>
                    </div>
                    <TrendingUp className="w-12 h-12 text-green-500 opacity-50" />
                  </div>
                </div>

                {/* Montant moyen */}
                <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Montant Moyen par Chèque</p>
                      <p className="text-3xl font-bold text-violet-600">{safeToFixed(summary.averageCheckAmount)} DH</p>
                    </div>
                    <DollarSign className="w-12 h-12 text-violet-500 opacity-50" />
                  </div>
                </div>

                {/* Chèques à venir */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">À Venir (7 jours)</p>
                      <p className="text-3xl font-bold text-blue-600">{summary.upcomingCount}</p>
                      <p className="text-xs text-gray-500 mt-1">{safeToFixed(summary.upcomingAmount)} DH</p>
                    </div>
                    <Clock className="w-12 h-12 text-blue-500 opacity-50" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Fournisseurs */}
        <Card>
          <CardHeader>
            <CardTitle>🏆 Top Fournisseurs par Montant de Chèques</CardTitle>
          </CardHeader>
          <CardContent>
            {topSuppliers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucun fournisseur avec des chèques</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rang
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fournisseur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre de Chèques
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Émis
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Encaissés
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topSuppliers.map((supplier, index) => (
                      <tr key={supplier.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {index === 0 && <span className="text-2xl">🥇</span>}
                            {index === 1 && <span className="text-2xl">🥈</span>}
                            {index === 2 && <span className="text-2xl">🥉</span>}
                            {index > 2 && <span className="text-sm font-medium text-gray-500">#{index + 1}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                            {supplier.company && (
                              <div className="text-sm text-gray-500">{supplier.company}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline">{supplier.checkCount}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900">
                            {safeToFixed(supplier.totalAmount)} DH
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-orange-600">
                            {safeToFixed(supplier.issuedAmount)} DH
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-green-600">
                            {safeToFixed(supplier.cashedAmount)} DH
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Évolution Mensuelle */}
        {monthlyData.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>📅 Évolution Mensuelle des Chèques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((month) => (
                  <div key={month.month}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{month.month}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-violet-600">
                          {month.count} chèques
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({safeToFixed(month.amount)} DH)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${monthlyData.length > 0 ? (month.amount / Math.max(...monthlyData.map(m => m.amount))) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

