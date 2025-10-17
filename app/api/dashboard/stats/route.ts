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
      // Mode période prédéfinie - Utilisation de dates locales pour éviter les décalages
      const now = new Date()
      const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      endDate = new Date(todayLocal)
      endDate.setHours(23, 59, 59, 999)

      startDate = new Date(todayLocal)
      startDate.setDate(todayLocal.getDate() - days + 1)
      startDate.setHours(0, 0, 0, 0)

      console.log('Fetching stats for', days, 'days from', startDate.toLocaleDateString('fr-FR'), 'to', endDate.toLocaleDateString('fr-FR'))
      console.log('Today is:', todayLocal.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
    }

    // Ventes par jour - Version robuste avec support des plages personnalisées
    const salesData = []
    try {
      // Calculer le nombre de jours dans la plage
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

      for (let i = 0; i < daysDiff; i++) {
        // Créer la date en ajoutant des jours à la date de début
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        date.setHours(0, 0, 0, 0)

        const nextDate = new Date(date)
        nextDate.setDate(date.getDate() + 1)
        nextDate.setHours(0, 0, 0, 0)

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

        const dateString = date.toISOString().split('T')[0]
        console.log(`Date générée: ${dateString} (${date.toLocaleDateString('fr-FR', { weekday: 'long' })})`)

        salesData.push({
          date: dateString,
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

    // Top clients - Version améliorée qui gère les ventes sans client
    let topCustomersWithDetails = []
    try {
      // D'abord, récupérer les ventes avec clients
      const topCustomersWithId = await prisma.sale.groupBy({
        by: ['customerId'],
        where: {
          customerId: {
            not: null
          }
        },
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

      // Ensuite, récupérer les ventes sans client (ventes directes)
      const salesWithoutCustomer = await prisma.sale.aggregate({
        where: {
          customerId: null
        },
        _sum: {
          totalAmount: true,
        },
        _count: true,
      })

      // Traiter les clients avec ID
      const customersWithDetails = await Promise.all(
        topCustomersWithId.map(async (item) => {
          const customer = await prisma.customer.findUnique({
            where: { id: item.customerId! },
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

      // Ajouter les ventes sans client si elles existent
      if (salesWithoutCustomer._count > 0) {
        customersWithDetails.push({
          name: 'Ventes directes',
          company: 'Sans client assigné',
          total: Number(salesWithoutCustomer._sum.totalAmount) || 0,
          orders: salesWithoutCustomer._count || 0,
        })
      }

      // Trier par total et prendre les 5 premiers
      topCustomersWithDetails = customersWithDetails
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)

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

    // Retourner uniquement les données réelles

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

