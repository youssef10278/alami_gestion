import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { Decimal } from '@prisma/client/runtime/library'

// GET - Statistiques de bénéfices
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // jours

    // Date de début selon la période
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // Récupérer toutes les ventes de la période
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                purchasePrice: true,
                price: true,
              },
            },
          },
        },
      },
    })

    // Calculer les bénéfices
    let totalRevenue = new Decimal(0)
    let totalCost = new Decimal(0)
    let totalProfit = new Decimal(0)
    let profitByDay: { [key: string]: { revenue: number; cost: number; profit: number } } = {}

    sales.forEach((sale) => {
      const saleDate = sale.createdAt.toISOString().split('T')[0]

      if (!profitByDay[saleDate]) {
        profitByDay[saleDate] = { revenue: 0, cost: 0, profit: 0 }
      }

      sale.items.forEach((item) => {
        const quantity = item.quantity
        const salePrice = new Decimal(item.unitPrice)
        const purchasePrice = item.product.purchasePrice

        const itemRevenue = salePrice.mul(quantity)
        const itemCost = purchasePrice.mul(quantity)
        const itemProfit = itemRevenue.sub(itemCost)

        totalRevenue = totalRevenue.add(itemRevenue)
        totalCost = totalCost.add(itemCost)
        totalProfit = totalProfit.add(itemProfit)

        profitByDay[saleDate].revenue += parseFloat(itemRevenue.toString())
        profitByDay[saleDate].cost += parseFloat(itemCost.toString())
        profitByDay[saleDate].profit += parseFloat(itemProfit.toString())
      })
    })

    // Calculer la marge moyenne
    const profitMargin = totalRevenue.toNumber() > 0
      ? (totalProfit.toNumber() / totalRevenue.toNumber()) * 100
      : 0

    // Convertir profitByDay en tableau pour les graphiques
    const profitChart = Object.entries(profitByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        revenue: Math.round(data.revenue * 100) / 100,
        cost: Math.round(data.cost * 100) / 100,
        profit: Math.round(data.profit * 100) / 100,
      }))

    // Top produits par bénéfice
    const productProfits: { [key: string]: { name: string; profit: number; quantity: number } } = {}

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const productId = item.productId
        const quantity = item.quantity
        const salePrice = new Decimal(item.unitPrice)
        const purchasePrice = item.product.purchasePrice
        const itemProfit = salePrice.sub(purchasePrice).mul(quantity)

        if (!productProfits[productId]) {
          productProfits[productId] = {
            name: item.product.name || 'Produit inconnu',
            profit: 0,
            quantity: 0,
          }
        }

        productProfits[productId].profit += parseFloat(itemProfit.toString())
        productProfits[productId].quantity += quantity
      })
    })

    const topProducts = Object.values(productProfits)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10)
      .map((p) => ({
        ...p,
        profit: Math.round(p.profit * 100) / 100,
      }))

    return NextResponse.json({
      summary: {
        totalRevenue: Math.round(totalRevenue.toNumber() * 100) / 100,
        totalCost: Math.round(totalCost.toNumber() * 100) / 100,
        totalProfit: Math.round(totalProfit.toNumber() * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100,
        salesCount: sales.length,
      },
      profitChart,
      topProducts,
    })
  } catch (error) {
    console.error('Get profit stats error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}

