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

      // Timeout pour éviter les blocages
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 secondes max

      const response = await fetch(`/api/dashboard/analytics?${params}`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      console.error('Erreur lors du chargement des analytics:', err)

      if (err instanceof Error && err.name === 'AbortError') {
        setError('Timeout - Requête trop longue')
      } else {
        setError(err instanceof Error ? err.message : 'Erreur de connexion')
      }

      // Données de fallback en cas d'erreur
      setAnalytics({
        totalSales: 0,
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        salesGrowth: 0,
        revenueGrowth: 0,
        ordersGrowth: 0,
        salesByDay: [],
        salesByHour: [],
        topProducts: [],
        topCustomers: [],
        paymentMethods: [],
        lowStockProducts: 0,
        totalProducts: 0,
        totalCustomers: 0,
        newCustomers: 0,
        completedSales: 0,
        pendingSales: 0,
        cancelledSales: 0
      })
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
