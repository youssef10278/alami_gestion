'use client'

import AnalyticsEmergency from './AnalyticsEmergency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

export default function DashboardAnalyticsWrapperEmergency() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg font-semibold">Analytics Avancées</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-gray-600">
          Analysez vos performances par période personnalisée
        </p>
        
        <AnalyticsEmergency />
      </CardContent>
    </Card>
  )
}
