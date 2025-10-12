'use client'

import { useState, useEffect, useCallback } from 'react'
import { DateRange } from '@/components/dashboard/DateRangeFilter'

export interface DashboardAnalytics {
  // Métriques principales
  totalSales: number
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  
  // Comparaison avec période précédente
  salesGrowth: number
  revenueGrowth: number
  ordersGrowth: number
  
  // Données pour graphiques
  salesByDay: Array<{
    date: string
    sales: number
    revenue: number
    orders: number
  }>
  
  salesByHour: Array<{
    hour: number
    sales: number
    orders: number
  }>
  
  topProducts: Array<{
    id: string
    name: string
    quantity: number
    revenue: number
  }>
  
  topCustomers: Array<{
    id: string
    name: string
    orders: number
    revenue: number
  }>
  
  // Métriques de paiement
  paymentMethods: Array<{
    method: string
    count: number
    amount: number
  }>
  
  // Stock et produits
  lowStockProducts: number
  totalProducts: number
  
  // Clients
  totalCustomers: number
  newCustomers: number
  
  // Statut des ventes
  completedSales: number
  pendingSales: number
  cancelledSales: number
}

export function useDashboardAnalytics(dateRange: DateRange) {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString()
      })

      const response = await fetch(`/api/dashboard/analytics?${params}`)
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      console.error('Erreur lors du chargement des analytics:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const refresh = useCallback(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    analytics,
    loading,
    error,
    refresh
  }
}
