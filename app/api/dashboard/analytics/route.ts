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
      // OPTIMISATION: Une seule requête pour toutes les ventes
      const allSales = await prisma.sale.findMany({
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
        }
      })

      // Traitement local des données (pas de requêtes supplémentaires)
      const currentSales = allSales.filter(sale => 
        sale.createdAt >= fromDate && sale.createdAt <= toDate && sale.status === 'COMPLETED'
      )
      const previousSales = allSales.filter(sale => 
        sale.createdAt >= previousFromDate && sale.createdAt <= previousToDate && sale.status === 'COMPLETED'
      )
      const currentOrders = allSales.filter(sale => 
        sale.createdAt >= fromDate && sale.createdAt <= toDate
      )
      const previousOrders = allSales.filter(sale => 
        sale.createdAt >= previousFromDate && sale.createdAt <= previousToDate
      )

      // Calculs locaux
      const currentSalesCount = currentSales.length
      const currentRevenueSum = currentSales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0)
      const currentOrdersCount = currentOrders.length
      
      const previousSalesCount = previousSales.length
      const previousRevenueSum = previousSales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0)
      const previousOrdersCount = previousOrders.length

      // Calculs de croissance
      const salesGrowth = previousSalesCount > 0 ? ((currentSalesCount - previousSalesCount) / previousSalesCount) * 100 : 0
      const revenueGrowth = previousRevenueSum > 0 ? ((currentRevenueSum - previousRevenueSum) / previousRevenueSum) * 100 : 0
      const ordersGrowth = previousOrdersCount > 0 ? ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100 : 0

      // Données par jour (traitement local)
      const salesByDayData = eachDayOfInterval({ start: fromDate, end: toDate }).map(day => {
        const dayStart = startOfDay(day)
        const dayEnd = endOfDay(day)
        
        const daySales = currentSales.filter(sale => 
          sale.createdAt >= dayStart && sale.createdAt <= dayEnd
        )
        
        return {
          date: format(day, 'yyyy-MM-dd'),
          sales: daySales.length,
          revenue: daySales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0),
          orders: daySales.length
        }
      })

      // Méthodes de paiement (traitement local)
      const paymentMethodsMap = currentSales.reduce((acc, sale) => {
        const method = sale.paymentMethod
        if (!acc[method]) {
          acc[method] = { count: 0, amount: 0 }
        }
        acc[method].count++
        acc[method].amount += Number(sale.totalAmount)
        return acc
      }, {} as Record<string, { count: number; amount: number }>)

      const paymentMethods = Object.entries(paymentMethodsMap).map(([method, data]) => ({
        method,
        count: data.count,
        amount: data.amount
      }))

      // Statuts des ventes (traitement local)
      const statusCounts = currentOrders.reduce((acc, sale) => {
        acc[sale.status] = (acc[sale.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // SEULEMENT 3 requêtes supplémentaires au lieu de 15+
      const [topProducts, totalProducts, totalCustomers] = await Promise.all([
        // Top produits (si nécessaire)
        currentSalesCount > 0 ? prisma.saleItem.groupBy({
          by: ['productId'],
          where: {
            sale: {
              status: 'COMPLETED',
              createdAt: { gte: fromDate, lte: toDate }
            }
          },
          _sum: {
            quantity: true,
            total: true
          },
          orderBy: {
            _sum: {
              quantity: 'desc'
            }
          },
          take: 5
        }).catch(() => []) : Promise.resolve([]),
        
        // Métriques générales
        prisma.product.count({ where: { isActive: true } }).catch(() => 0),
        prisma.customer.count().catch(() => 0)
      ])

      // Enrichir les top produits (si disponibles)
      let topProductsWithNames = []
      if (topProducts.length > 0) {
        try {
          const productIds = topProducts.map(item => item.productId)
          const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true }
          })
          
          topProductsWithNames = topProducts.map(item => {
            const product = products.find(p => p.id === item.productId)
            return {
              id: item.productId,
              name: product?.name || 'Produit supprimé',
              quantity: item._sum.quantity || 0,
              revenue: Number(item._sum.total || 0)
            }
          })
        } catch (error) {
          console.error('Erreur enrichissement produits:', error)
          topProductsWithNames = []
        }
      }

      // Top clients (traitement local des ventes existantes)
      const customerSales = currentSales.filter(sale => sale.customerId).reduce((acc, sale) => {
        const customerId = sale.customerId!
        if (!acc[customerId]) {
          acc[customerId] = { orders: 0, revenue: 0 }
        }
        acc[customerId].orders++
        acc[customerId].revenue += Number(sale.totalAmount)
        return acc
      }, {} as Record<string, { orders: number; revenue: number }>)

      const topCustomersData = Object.entries(customerSales)
        .sort(([,a], [,b]) => b.revenue - a.revenue)
        .slice(0, 5)
        .map(([customerId, data]) => ({
          id: customerId,
          name: 'Client', // Nom générique pour éviter une requête supplémentaire
          orders: data.orders,
          revenue: data.revenue
        }))

      const analytics = {
        totalSales: currentSalesCount,
        totalRevenue: currentRevenueSum,
        totalOrders: currentOrdersCount,
        averageOrderValue: currentSalesCount > 0 ? currentRevenueSum / currentSalesCount : 0,
        
        salesGrowth,
        revenueGrowth,
        ordersGrowth,
        
        salesByDay: salesByDayData,
        salesByHour: [], // Désactivé pour réduire la complexité
        
        topProducts: topProductsWithNames,
        topCustomers: topCustomersData,
        
        paymentMethods,
        
        lowStockProducts: 0, // Désactivé pour réduire les requêtes
        totalProducts,
        totalCustomers,
        newCustomers: 0, // Désactivé pour réduire les requêtes
        
        completedSales: statusCounts.COMPLETED || 0,
        pendingSales: statusCounts.PENDING || 0,
        cancelledSales: statusCounts.CANCELLED || 0
      }

      return NextResponse.json(analytics)

    } catch (dbError) {
      console.error('Erreur base de données:', dbError)
      
      // Réponse de fallback en cas d'erreur
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

      return NextResponse.json(fallbackAnalytics)
    }

  } catch (error) {
    console.error('Erreur API analytics:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
