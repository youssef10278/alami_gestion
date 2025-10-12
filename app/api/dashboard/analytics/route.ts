import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, subDays, format, eachDayOfInterval } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')

    if (!fromParam || !toParam) {
      return NextResponse.json({ error: 'Paramètres de date manquants' }, { status: 400 })
    }

    const fromDate = new Date(fromParam)
    const toDate = new Date(toParam)

    // Calculer la période précédente pour les comparaisons
    const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
    const previousFromDate = subDays(fromDate, daysDiff)
    const previousToDate = subDays(toDate, daysDiff)

    try {
      // Version ultra-simplifiée avec timeout et gestion d'erreur
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000) // 5 secondes max
      })

      // Requête principale avec timeout
      const salesPromise = prisma.sale.findMany({
        where: {
          OR: [
            { createdAt: { gte: fromDate, lte: toDate } },
            { createdAt: { gte: previousFromDate, lte: previousToDate } }
          ]
        },
        select: {
          id: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          customerId: true,
          paymentMethod: true
        },
        take: 1000 // Limiter pour éviter les problèmes de mémoire
      })

      const allSales = await Promise.race([salesPromise, timeoutPromise]) as any[]

      // Traitement local ultra-rapide
      const currentSales = allSales.filter(sale => 
        sale.createdAt >= fromDate && sale.createdAt <= toDate && sale.status === 'COMPLETED'
      )
      const previousSales = allSales.filter(sale => 
        sale.createdAt >= previousFromDate && sale.createdAt <= previousToDate && sale.status === 'COMPLETED'
      )

      // Calculs simples
      const currentSalesCount = currentSales.length
      const currentRevenueSum = currentSales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0)
      const previousSalesCount = previousSales.length
      const previousRevenueSum = previousSales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0)

      // Croissances
      const salesGrowth = previousSalesCount > 0 ? ((currentSalesCount - previousSalesCount) / previousSalesCount) * 100 : 0
      const revenueGrowth = previousRevenueSum > 0 ? ((currentRevenueSum - previousRevenueSum) / previousRevenueSum) * 100 : 0

      // Données par jour (simplifié)
      const salesByDayData = eachDayOfInterval({ start: fromDate, end: toDate }).map(day => {
        const dayStart = startOfDay(day)
        const dayEnd = endOfDay(day)
        
        const daySales = currentSales.filter(sale => 
          sale.createdAt >= dayStart && sale.createdAt <= dayEnd
        )
        
        return {
          date: format(day, 'yyyy-MM-dd'),
          sales: daySales.length,
          revenue: daySales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0)
        }
      })

      // Méthodes de paiement (simplifié)
      const paymentMethodsMap = currentSales.reduce((acc, sale) => {
        const method = sale.paymentMethod || 'UNKNOWN'
        if (!acc[method]) {
          acc[method] = { count: 0, amount: 0 }
        }
        acc[method].count++
        acc[method].amount += Number(sale.totalAmount || 0)
        return acc
      }, {} as Record<string, { count: number; amount: number }>)

      const paymentMethods = Object.entries(paymentMethodsMap).map(([method, data]) => ({
        method,
        count: data.count,
        amount: data.amount
      }))

      // Réponse simplifiée et rapide
      const analytics = {
        totalSales: currentSalesCount,
        totalRevenue: currentRevenueSum,
        totalOrders: currentSalesCount,
        averageOrderValue: currentSalesCount > 0 ? currentRevenueSum / currentSalesCount : 0,
        
        salesGrowth: Number(salesGrowth.toFixed(1)),
        revenueGrowth: Number(revenueGrowth.toFixed(1)),
        ordersGrowth: Number(salesGrowth.toFixed(1)),
        
        salesByDay: salesByDayData,
        salesByHour: [], // Désactivé pour la stabilité
        
        topProducts: [], // Désactivé temporairement
        topCustomers: [], // Désactivé temporairement
        
        paymentMethods,
        
        lowStockProducts: 0,
        totalProducts: 0,
        totalCustomers: 0,
        newCustomers: 0,
        
        completedSales: currentSalesCount,
        pendingSales: 0,
        cancelledSales: 0
      }

      return NextResponse.json(analytics, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

    } catch (dbError) {
      console.error('Erreur base de données:', dbError)
      
      // Réponse de fallback ultra-simple
      const fallbackAnalytics = {
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
      }

      return NextResponse.json(fallbackAnalytics, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }

  } catch (error) {
    console.error('Erreur API analytics:', error)
    
    // Réponse d'erreur simple
    const errorAnalytics = {
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
    }

    return NextResponse.json(errorAnalytics, { 
      status: 200, // Retourner 200 avec des données vides plutôt qu'une erreur
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}
