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
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')

    // Déterminer les dates de début et fin
    let startDate: Date
    let endDate: Date

    if (startDateParam && endDateParam) {
      // Mode plage personnalisée
      startDate = new Date(startDateParam)
      endDate = new Date(endDateParam)
      endDate.setHours(23, 59, 59, 999) // Fin de journée
      console.log('Fetching stats for custom range:', startDateParam, 'to', endDateParam)
    } else {
      // Mode période prédéfinie
      endDate = new Date()
      endDate.setHours(23, 59, 59, 999)
      startDate = new Date()
      startDate.setDate(startDate.getDate() - days + 1) // +1 pour inclure aujourd'hui
      startDate.setHours(0, 0, 0, 0)
      console.log('Fetching stats for', days, 'days from', startDate, 'to', endDate)
    }

    // Ventes par jour - Version robuste avec support des plages personnalisées
    const salesData = []
    try {
      // Calculer le nombre de jours dans la plage
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
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
    } catch (error) {
      console.error('Error fetching sales data:', error)
      // Données de fallback
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        salesData.push({
          date: date.toISOString().split('T')[0],
          total: 0,
          count: 0,
        })
      }
    }

    // Top produits vendus
    let topProductsWithDetails = []
    try {
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

      topProductsWithDetails = await Promise.all(
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
    } catch (error) {
      console.error('Error fetching top products:', error)
      topProductsWithDetails = []
    }

    // Top clients
    let topCustomersWithDetails = []
    try {
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

      topCustomersWithDetails = await Promise.all(
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
    } catch (error) {
      console.error('Error fetching top customers:', error)
      topCustomersWithDetails = []
    }

    // Répartition des méthodes de paiement
    let paymentMethodsData = []
    try {
      const paymentMethods = await prisma.sale.groupBy({
        by: ['paymentMethod'],
        _sum: {
          totalAmount: true,
        },
        _count: true,
      })

      paymentMethodsData = paymentMethods.map((item) => ({
        method: item.paymentMethod,
        total: Number(item._sum.totalAmount) || 0,
        count: item._count || 0,
      }))
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      paymentMethodsData = []
    }

    // Catégories de produits
    let categoriesData = []
    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { products: true },
          },
        },
      })

      categoriesData = categories.map((cat) => ({
        name: cat.name,
        products: cat._count.products,
      }))
    } catch (error) {
      console.error('Error fetching categories:', error)
      categoriesData = []
    }

    // Si aucune donnée, créer des données de démonstration
    const hasData = salesData.some(d => d.total > 0) ||
                   topProductsWithDetails.length > 0 ||
                   topCustomersWithDetails.length > 0

    if (!hasData) {
      console.log('No real data found, generating demo data')

      // Données de démonstration pour les ventes
      const demoSalesData = []
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        demoSalesData.push({
          date: date.toISOString().split('T')[0],
          total: Math.floor(Math.random() * 5000) + 1000,
          count: Math.floor(Math.random() * 20) + 5,
        })
      }

      // Données de démonstration pour les produits
      const demoProducts = [
        { name: 'Produit A', sku: 'PRD-001', quantity: 150, total: 7500 },
        { name: 'Produit B', sku: 'PRD-002', quantity: 120, total: 6000 },
        { name: 'Produit C', sku: 'PRD-003', quantity: 100, total: 5000 },
        { name: 'Produit D', sku: 'PRD-004', quantity: 80, total: 4000 },
        { name: 'Produit E', sku: 'PRD-005', quantity: 60, total: 3000 },
      ]

      // Données de démonstration pour les clients
      const demoCustomers = [
        { name: 'Client Premium', company: 'Entreprise A', total: 15000, orders: 25 },
        { name: 'Client Gold', company: 'Entreprise B', total: 12000, orders: 20 },
        { name: 'Client Silver', company: 'Entreprise C', total: 8000, orders: 15 },
        { name: 'Client Bronze', company: null, total: 5000, orders: 10 },
        { name: 'Client Standard', company: 'Entreprise D', total: 3000, orders: 8 },
      ]

      // Données de démonstration pour les méthodes de paiement
      const demoPaymentMethods = [
        { method: 'CASH', total: 25000, count: 45 },
        { method: 'CARD', total: 18000, count: 30 },
        { method: 'TRANSFER', total: 12000, count: 15 },
        { method: 'CREDIT', total: 8000, count: 10 },
      ]

      // Données de démonstration pour les catégories
      const demoCategories = [
        { name: 'Électronique', products: 25 },
        { name: 'Vêtements', products: 18 },
        { name: 'Maison & Jardin', products: 15 },
        { name: 'Sports & Loisirs', products: 12 },
        { name: 'Livres', products: 8 },
      ]

      return NextResponse.json({
        salesByDay: demoSalesData,
        topProducts: demoProducts,
        topCustomers: demoCustomers,
        paymentMethods: demoPaymentMethods,
        categories: demoCategories,
        isDemoData: true,
      })
    }

    return NextResponse.json({
      salesByDay: salesData || [],
      topProducts: topProductsWithDetails || [],
      topCustomers: topCustomersWithDetails || [],
      paymentMethods: paymentMethodsData || [],
      categories: categoriesData || [],
      isDemoData: false,
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}

