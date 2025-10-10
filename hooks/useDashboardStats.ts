'use client'

import { useState, useEffect, useCallback } from 'react'

interface DashboardStats {
  totalProducts: number
  totalCustomers: number
  totalSales: number
  totalRevenue: number
  totalPaid: number
  creditUsed: number
  lowStockProducts: number
  recentSales: any[]
  loading: boolean
  error: string | null
}

interface SalesAnalytics {
  dailySales: Array<{
    date: string
    sales: number
    revenue: number
  }>
  monthlySales: Array<{
    month: string
    sales: number
    revenue: number
  }>
  topProducts: Array<{
    id: string
    name: string
    totalSold: number
    revenue: number
  }>
  topCustomers: Array<{
    id: string
    name: string
    totalPurchases: number
    totalSpent: number
  }>
}

// Gestionnaire global d'événements pour les mises à jour
class DashboardEventManager {
  private listeners: Set<() => void> = new Set()

  subscribe(callback: () => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  notify() {
    this.listeners.forEach(callback => callback())
  }
}

export const dashboardEventManager = new DashboardEventManager()

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCustomers: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalPaid: 0,
    creditUsed: 0,
    lowStockProducts: 0,
    recentSales: [],
    loading: true,
    error: null
  })

  const fetchStats = useCallback(async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch('/api/dashboard/overview', {
        cache: 'no-store' // Toujours récupérer les données fraîches
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques')
      }
      
      const data = await response.json()
      setStats(prev => ({ ...prev, ...data, loading: false }))
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setStats(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }))
    }
  }, [])

  const refreshStats = useCallback(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    // Charger les stats au montage
    fetchStats()

    // S'abonner aux événements de mise à jour
    const unsubscribe = dashboardEventManager.subscribe(refreshStats)

    return unsubscribe
  }, [fetchStats, refreshStats])

  return {
    ...stats,
    refreshStats
  }
}

export function useSalesAnalytics() {
  const [analytics, setAnalytics] = useState<SalesAnalytics & { loading: boolean; error: string | null }>({
    dailySales: [],
    monthlySales: [],
    topProducts: [],
    topCustomers: [],
    loading: true,
    error: null
  })

  const fetchAnalytics = useCallback(async () => {
    try {
      setAnalytics(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch('/api/dashboard/stats', {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des analytics')
      }
      
      const data = await response.json()
      setAnalytics(prev => ({ ...prev, ...data, loading: false }))
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setAnalytics(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }))
    }
  }, [])

  const refreshAnalytics = useCallback(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  useEffect(() => {
    // Charger les analytics au montage
    fetchAnalytics()

    // S'abonner aux événements de mise à jour
    const unsubscribe = dashboardEventManager.subscribe(refreshAnalytics)

    return unsubscribe
  }, [fetchAnalytics, refreshAnalytics])

  return {
    ...analytics,
    refreshAnalytics
  }
}

// Fonction utilitaire pour notifier les mises à jour après modification/suppression de vente
export function notifyDashboardUpdate() {
  dashboardEventManager.notify()
}

// Hook pour les composants qui modifient les ventes
export function useSaleActions() {
  const updateSale = useCallback(async (saleId: string, data: any) => {
    try {
      const response = await fetch(`/api/sales/${saleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la modification')
      }

      const result = await response.json()
      
      // Notifier la mise à jour du dashboard
      notifyDashboardUpdate()
      
      return result
    } catch (error) {
      throw error
    }
  }, [])

  const deleteSale = useCallback(async (saleId: string, reason: string) => {
    try {
      const response = await fetch(`/api/sales/${saleId}?reason=${encodeURIComponent(reason)}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la suppression')
      }

      const result = await response.json()
      
      // Notifier la mise à jour du dashboard
      notifyDashboardUpdate()
      
      return result
    } catch (error) {
      throw error
    }
  }, [])

  return {
    updateSale,
    deleteSale
  }
}
