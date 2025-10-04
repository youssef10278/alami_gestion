import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Statistiques avancées pour le dashboard
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')

    // Date de début
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Ventes par jour
    const salesByDay = await prisma.sale.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _sum: {
        totalAmount: true,
      },
      _count: true,
    })

    // Formater les ventes par jour
    const salesData = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const daySales = await prisma.sale.aggregate({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
        _sum: {
          totalAmount: true,
        },
        _count: true,
      })

      salesData.push({
        date: date.toISOString().split('T')[0],
        total: Number(daySales._sum.totalAmount) || 0,
        count: daySales._count || 0,
      })
    }

    // Top produits vendus
    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        total: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    })

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, sku: true },
        })
        return {
          name: product?.name || 'Produit supprimé',
          sku: product?.sku || '',
          quantity: item._sum.quantity || 0,
          total: Number(item._sum.total) || 0,
        }
      })
    )

    // Top clients
    const topCustomers = await prisma.sale.groupBy({
      by: ['customerId'],
      _sum: {
        totalAmount: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          totalAmount: 'desc',
        },
      },
      take: 5,
    })

    const topCustomersWithDetails = await Promise.all(
      topCustomers.map(async (item) => {
        const customer = await prisma.customer.findUnique({
          where: { id: item.customerId },
          select: { name: true, company: true },
        })
        return {
          name: customer?.name || 'Client supprimé',
          company: customer?.company,
          total: Number(item._sum.totalAmount) || 0,
          orders: item._count || 0,
        }
      })
    )

    // Répartition des méthodes de paiement
    const paymentMethods = await prisma.sale.groupBy({
      by: ['paymentMethod'],
      _sum: {
        totalAmount: true,
      },
      _count: true,
    })

    const paymentMethodsData = paymentMethods.map((item) => ({
      method: item.paymentMethod,
      total: Number(item._sum.totalAmount) || 0,
      count: item._count || 0,
    }))

    // Catégories de produits
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    const categoriesData = categories.map((cat) => ({
      name: cat.name,
      products: cat._count.products,
    }))

    return NextResponse.json({
      salesByDay: salesData || [],
      topProducts: topProductsWithDetails || [],
      topCustomers: topCustomersWithDetails || [],
      paymentMethods: paymentMethodsData || [],
      categories: categoriesData || [],
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}

