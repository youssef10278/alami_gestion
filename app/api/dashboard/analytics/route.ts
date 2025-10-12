import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, subDays, format, eachDayOfInterval, eachHourOfInterval, startOfHour } from 'date-fns'

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

    // Requêtes parallèles pour optimiser les performances avec gestion d'erreur
    let results
    try {
      results = await Promise.all([
      // Période actuelle
      prisma.sale.count({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: fromDate, lte: toDate }
        }
      }),
      
      prisma.sale.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: fromDate, lte: toDate }
        },
        _sum: { totalAmount: true }
      }),
      
      prisma.sale.count({
        where: {
          createdAt: { gte: fromDate, lte: toDate }
        }
      }),
      
      // Période précédente
      prisma.sale.count({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: previousFromDate, lte: previousToDate }
        }
      }),
      
      prisma.sale.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: previousFromDate, lte: previousToDate }
        },
        _sum: { totalAmount: true }
      }),
      
      prisma.sale.count({
        where: {
          createdAt: { gte: previousFromDate, lte: previousToDate }
        }
      }),
      
      // Ventes par jour
      prisma.sale.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: fromDate, lte: toDate }
        },
        select: {
          createdAt: true,
          totalAmount: true
        }
      }),
      
      // Top produits
      prisma.saleItem.groupBy({
        by: ['productId'],
        where: {
          sale: {
            status: 'COMPLETED',
            createdAt: { gte: fromDate, lte: toDate }
          }
        },
        _sum: {
          quantity: true,
          totalPrice: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      }),
      
      // Top clients
      prisma.sale.groupBy({
        by: ['customerId'],
        where: {
          status: 'COMPLETED',
          customerId: { not: null },
          createdAt: { gte: fromDate, lte: toDate }
        },
        _count: true,
        _sum: {
          totalAmount: true
        },
        orderBy: {
          _sum: {
            totalAmount: 'desc'
          }
        },
        take: 5
      }),
      
      // Méthodes de paiement
      prisma.sale.groupBy({
        by: ['paymentMethod'],
        where: {
          status: 'COMPLETED',
          createdAt: { gte: fromDate, lte: toDate }
        },
        _count: true,
        _sum: {
          totalAmount: true
        }
      }),
      
      // Produits total
      prisma.product.count({
        where: { isActive: true }
      }),
      
      // Stock faible - Correction de la requête
      prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM "Product"
        WHERE "isActive" = true
        AND "stock" <= "minStock"
      `,
      
      // Clients total
      prisma.customer.count(),
      
      // Nouveaux clients
      prisma.customer.count({
        where: {
          createdAt: { gte: fromDate, lte: toDate }
        }
      }),
      
      // Statuts des ventes
      prisma.sale.groupBy({
        by: ['status'],
        where: {
          createdAt: { gte: fromDate, lte: toDate }
        },
        _count: true
      })
    ])
    } catch (dbError) {
      console.error('Erreur base de données:', dbError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des données' },
        { status: 500 }
      )
    }

    // Destructurer les résultats
    const [
      currentSales,
      currentRevenue,
      currentOrders,
      previousSales,
      previousRevenue,
      previousOrders,
      salesByDay,
      topProducts,
      topCustomers,
      paymentMethods,
      totalProducts,
      lowStockProducts,
      totalCustomers,
      newCustomers,
      salesStatus
    ] = results

    // Traitement des données pour les graphiques
    const days = eachDayOfInterval({ start: fromDate, end: toDate })
    const salesByDayData = days.map(day => {
      const dayStart = startOfDay(day)
      const dayEnd = endOfDay(day)
      
      const daySales = salesByDay.filter(sale => 
        sale.createdAt >= dayStart && sale.createdAt <= dayEnd
      )
      
      return {
        date: format(day, 'yyyy-MM-dd'),
        sales: daySales.length,
        revenue: daySales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0),
        orders: daySales.length
      }
    })

    // Ventes par heure (pour la journée actuelle si période = aujourd'hui)
    const isToday = format(fromDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && 
                   format(toDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    
    let salesByHourData: Array<{ hour: number; sales: number; orders: number }> = []
    
    if (isToday) {
      const hours = eachHourOfInterval({ 
        start: startOfDay(new Date()), 
        end: new Date() 
      })
      
      salesByHourData = hours.map(hour => {
        const hourStart = startOfHour(hour)
        const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000)
        
        const hourSales = salesByDay.filter(sale => 
          sale.createdAt >= hourStart && sale.createdAt < hourEnd
        )
        
        return {
          hour: hour.getHours(),
          sales: hourSales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0),
          orders: hourSales.length
        }
      })
    }

    // Enrichir les top produits avec les noms
    let topProductsWithNames = []
    try {
      topProductsWithNames = await Promise.all(
        (topProducts || []).map(async (item) => {
          try {
            const product = await prisma.product.findUnique({
              where: { id: item.productId },
              select: { name: true }
            })
            return {
              id: item.productId,
              name: product?.name || 'Produit supprimé',
              quantity: item._sum.quantity || 0,
              revenue: Number(item._sum.totalPrice || 0)
            }
          } catch (error) {
            console.error('Erreur produit:', error)
            return {
              id: item.productId,
              name: 'Erreur de chargement',
              quantity: item._sum.quantity || 0,
              revenue: Number(item._sum.totalPrice || 0)
            }
          }
        })
      )
    } catch (error) {
      console.error('Erreur enrichissement produits:', error)
      topProductsWithNames = []
    }

    // Enrichir les top clients avec les noms
    let topCustomersWithNames = []
    try {
      const customerResults = await Promise.all(
        (topCustomers || []).map(async (item) => {
          if (!item.customerId) return null
          try {
            const customer = await prisma.customer.findUnique({
              where: { id: item.customerId },
              select: { name: true }
            })
            return {
              id: item.customerId,
              name: customer?.name || 'Client supprimé',
              orders: item._count,
              revenue: Number(item._sum.totalAmount || 0)
            }
          } catch (error) {
            console.error('Erreur client:', error)
            return {
              id: item.customerId,
              name: 'Erreur de chargement',
              orders: item._count,
              revenue: Number(item._sum.totalAmount || 0)
            }
          }
        })
      )
      topCustomersWithNames = customerResults.filter(Boolean)
    } catch (error) {
      console.error('Erreur enrichissement clients:', error)
      topCustomersWithNames = []
    }

    // Calculer les croissances avec valeurs par défaut
    const currentRevenueValue = Number(currentRevenue?._sum?.totalAmount || 0)
    const previousRevenueValue = Number(previousRevenue?._sum?.totalAmount || 0)

    const salesGrowth = (previousSales || 0) > 0 ? (((currentSales || 0) - (previousSales || 0)) / (previousSales || 0)) * 100 : 0
    const revenueGrowth = previousRevenueValue > 0 ? ((currentRevenueValue - previousRevenueValue) / previousRevenueValue) * 100 : 0
    const ordersGrowth = (previousOrders || 0) > 0 ? (((currentOrders || 0) - (previousOrders || 0)) / (previousOrders || 0)) * 100 : 0

    // Organiser les statuts des ventes avec gestion d'erreur
    const statusCounts = (salesStatus || []).reduce((acc, status) => {
      if (status && status.status) {
        acc[status.status] = status._count || 0
      }
      return acc
    }, {} as Record<string, number>)

    const analytics = {
      totalSales: currentSales || 0,
      totalRevenue: currentRevenueValue || 0,
      totalOrders: currentOrders || 0,
      averageOrderValue: (currentSales || 0) > 0 ? currentRevenueValue / (currentSales || 1) : 0,

      salesGrowth: salesGrowth || 0,
      revenueGrowth: revenueGrowth || 0,
      ordersGrowth: ordersGrowth || 0,

      salesByDay: salesByDayData || [],
      salesByHour: salesByHourData || [],

      topProducts: topProductsWithNames || [],
      topCustomers: topCustomersWithNames || [],

      paymentMethods: (paymentMethods || []).map(pm => ({
        method: pm?.paymentMethod || 'UNKNOWN',
        count: pm?._count || 0,
        amount: Number(pm?._sum?.totalAmount || 0)
      })),

      lowStockProducts: Number((lowStockProducts as any)?.[0]?.count || 0),
      totalProducts: totalProducts || 0,
      totalCustomers: totalCustomers || 0,
      newCustomers: newCustomers || 0,

      completedSales: statusCounts.COMPLETED || 0,
      pendingSales: statusCounts.PENDING || 0,
      cancelledSales: statusCounts.CANCELLED || 0
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Erreur API analytics:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
