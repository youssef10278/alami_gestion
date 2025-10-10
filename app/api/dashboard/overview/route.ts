import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Récupérer les statistiques générales du dashboard
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer toutes les statistiques en parallèle
    const [
      totalProducts,
      totalCustomers,
      totalSales,
      completedSales,
      lowStockProducts,
      recentSales,
      salesAggregation,
      creditUsed,
    ] = await Promise.all([
      // Nombre total de produits actifs
      prisma.product.count({ 
        where: { isActive: true } 
      }),

      // Nombre total de clients
      prisma.customer.count(),

      // Nombre total de ventes (toutes)
      prisma.sale.count(),

      // Nombre de ventes complétées
      prisma.sale.count({ 
        where: { status: 'COMPLETED' } 
      }),

      // Produits en stock faible
      prisma.product.count({
        where: {
          isActive: true,
          stock: {
            lte: prisma.product.fields.minStock,
          },
        },
      }),

      // Ventes récentes
      prisma.sale.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              company: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
      }),

      // Agrégation des ventes pour revenus et montants payés
      prisma.sale.aggregate({
        _sum: {
          totalAmount: true,
          paidAmount: true,
          creditAmount: true,
        },
      }),

      // Crédit total utilisé par les clients
      prisma.customer.aggregate({
        _sum: {
          creditUsed: true,
        },
      }),
    ])

    // Calculer les statistiques
    const totalRevenue = Number(salesAggregation._sum.totalAmount || 0)
    const totalPaid = Number(salesAggregation._sum.paidAmount || 0)
    const totalCreditAmount = Number(salesAggregation._sum.creditAmount || 0)
    const totalCreditUsed = Number(creditUsed._sum.creditUsed || 0)

    // Statistiques supplémentaires
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0
    const paymentRate = totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0

    const stats = {
      // Statistiques de base
      totalProducts,
      totalCustomers,
      totalSales,
      completedSales,
      lowStockProducts,

      // Statistiques financières
      totalRevenue,
      totalPaid,
      totalCreditAmount,
      creditUsed: totalCreditUsed,

      // Métriques calculées
      averageOrderValue,
      paymentRate,
      pendingSales: totalSales - completedSales,

      // Données détaillées
      recentSales: recentSales.map(sale => ({
        id: sale.id,
        saleNumber: sale.saleNumber,
        totalAmount: Number(sale.totalAmount),
        paidAmount: Number(sale.paidAmount),
        creditAmount: Number(sale.creditAmount),
        status: sale.status,
        paymentMethod: sale.paymentMethod,
        createdAt: sale.createdAt,
        customer: sale.customer,
        seller: sale.seller,
        itemsCount: sale.items.length,
        items: sale.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          total: Number(item.total),
          product: item.product,
        })),
      })),

      // Métadonnées
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard overview error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}
