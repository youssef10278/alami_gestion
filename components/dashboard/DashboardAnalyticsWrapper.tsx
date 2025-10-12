'use client'

import { useState } from 'react'
import DateRangeFilter, { DateRange } from './DateRangeFilter'
import AnalyticsEmergency from './AnalyticsEmergency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, BarChart3, AlertCircle } from 'lucide-react'
import { startOfDay, endOfDay } from 'date-fns'

export default function DashboardAnalyticsWrapper() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  })

  const { analytics, loading, error, refresh } = useDashboardAnalytics(dateRange)

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange)
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres de date */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  📊 Analytics Avancées
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Analysez vos performances par période personnalisée
                </p>
              </div>
            </div>
            <Button
              onClick={refresh}
              disabled={loading}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-gray-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filtres de date */}
      <DateRangeFilter 
        onDateRangeChange={handleDateRangeChange}
        className="shadow-lg"
      />

      {/* Contenu des analytics */}
      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <div className="text-center">
                <h3 className="font-medium">Erreur de chargement</h3>
                <p className="text-sm text-red-500 mt-1">{error}</p>
                <Button
                  onClick={refresh}
                  variant="outline"
                  size="sm"
                  className="mt-3 border-red-200 text-red-600 hover:bg-red-100"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : analytics ? (
        <AnalyticsCharts analytics={analytics} loading={loading} />
      ) : (
        <AnalyticsCharts analytics={{} as any} loading={true} />
      )}

      {/* Informations supplémentaires */}
      {analytics && !loading && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-0 shadow-lg">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  ✅ Données mises à jour en temps réel
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>📦 {analytics.totalProducts} produits</span>
                <span>👥 {analytics.totalCustomers} clients</span>
                {analytics.lowStockProducts > 0 && (
                  <span className="text-orange-600 font-medium">
                    ⚠️ {analytics.lowStockProducts} stock faible
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
