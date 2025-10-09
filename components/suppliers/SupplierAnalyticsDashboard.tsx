'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  Clock, XCircle, DollarSign, FileText 
} from 'lucide-react'
import { toast } from 'sonner'

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
    total: number
    count: number
    issued: number
    cashed: number
  }>
  statusDistribution: Array<{
    name: string
    value: number
    count: number
    color: string
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
      supplier: string
      amount: number
      dueDate: string
      daysOverdue: number
    }>
    upcoming: Array<{
      id: string
      checkNumber: string
      supplier: string
      amount: number
      dueDate: string
      daysUntilDue: number
    }>
  }
}

export default function SupplierAnalyticsDashboard() {
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
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Aucune donnée disponible</p>
      </div>
    )
  }

  const { summary, monthlyData, statusDistribution, topSuppliers, alerts } = analytics

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Chèques
            </CardTitle>
            <FileText className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {summary.totalAmount.toFixed(2)} DH
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {summary.totalChecks} chèque{summary.totalChecks > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        {/* Émis */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Chèques Émis
            </CardTitle>
            <Clock className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {summary.issuedAmount.toFixed(2)} DH
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {summary.issuedCount} en attente
            </p>
          </CardContent>
        </Card>

        {/* Encaissés */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Chèques Encaissés
            </CardTitle>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {summary.cashedAmount.toFixed(2)} DH
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {summary.cashedCount} encaissé{summary.cashedCount > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        {/* En retard */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              En Retard
            </CardTitle>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {summary.overdueAmount.toFixed(2)} DH
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {summary.overdueCount} chèque{summary.overdueCount > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertes */}
      {(alerts.overdue.length > 0 || alerts.upcoming.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chèques en retard */}
          {alerts.overdue.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Chèques en Retard ({alerts.overdue.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {alerts.overdue.map((check) => (
                    <div key={check.id} className="bg-white p-3 rounded-lg border border-red-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{check.checkNumber}</p>
                          <p className="text-sm text-gray-600">{check.supplier}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">{check.amount.toFixed(2)} DH</p>
                          <p className="text-xs text-red-500">
                            {check.daysOverdue} jour{check.daysOverdue > 1 ? 's' : ''} de retard
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chèques à venir */}
          {alerts.upcoming.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-700 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Échéance Prochaine ({alerts.upcoming.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {alerts.upcoming.map((check) => (
                    <div key={check.id} className="bg-white p-3 rounded-lg border border-orange-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{check.checkNumber}</p>
                          <p className="text-sm text-gray-600">{check.supplier}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">{check.amount.toFixed(2)} DH</p>
                          <p className="text-xs text-orange-500">
                            Dans {check.daysUntilDue} jour{check.daysUntilDue > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution mensuelle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Évolution Mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(2)} DH`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                />
                <Legend />
                <Bar dataKey="total" fill="#8b5cf6" name="Montant total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par statut */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Répartition par Statut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toFixed(2)} DH`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 Fournisseurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-600" />
            Top 5 Fournisseurs (par montant)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topSuppliers.map((supplier, index) => (
              <div key={supplier.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{supplier.name}</p>
                  {supplier.company && (
                    <p className="text-sm text-gray-500">{supplier.company}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-violet-600">{supplier.totalAmount.toFixed(2)} DH</p>
                  <p className="text-xs text-gray-500">{supplier.checkCount} chèque{supplier.checkCount > 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

