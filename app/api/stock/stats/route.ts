import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Statistiques de stock
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Statistiques générales
    const [
      totalProducts,
      activeProducts,
      totalStockValue,
      lowStockCount,
      outOfStockCount,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.aggregate({
        where: { isActive: true },
        _sum: {
          stock: true,
        },
      }),
      prisma.product.count({
        where: {
          isActive: true,
          stock: {
            lte: prisma.product.fields.minStock,
          },
        },
      }),
      prisma.product.count({
        where: {
          isActive: true,
          stock: 0,
        },
      }),
    ])

    // Mouvements récents par jour
    const movements = await prisma.stockMovement.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        type: true,
        quantity: true,
        createdAt: true,
      },
    })

    // Grouper par jour
    const movementsByDay: { [key: string]: { in: number; out: number } } = {}
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      movementsByDay[dateKey] = { in: 0, out: 0 }
    }

    movements.forEach((movement) => {
      const dateKey = movement.createdAt.toISOString().split('T')[0]
      if (movementsByDay[dateKey]) {
        if (movement.type === 'IN') {
          movementsByDay[dateKey].in += movement.quantity
        } else {
          movementsByDay[dateKey].out += movement.quantity
        }
      }
    })

    const movementsData = Object.entries(movementsByDay).map(([date, data]) => ({
      date,
      in: data.in,
      out: data.out,
      net: data.in - data.out,
    }))

    // Top produits par mouvement
    const topMovements = await prisma.stockMovement.groupBy({
      by: ['productId'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    })

    const topMovementsWithDetails = await Promise.all(
      topMovements.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, sku: true, stock: true },
        })
        return {
          name: product?.name || 'Produit supprimé',
          sku: product?.sku || '',
          stock: product?.stock || 0,
          movements: item._sum.quantity || 0,
        }
      })
    )

    // Valeur du stock par catégorie
    const categories = await prisma.category.findMany({
      include: {
        products: {
          where: { isActive: true },
          select: {
            stock: true,
            price: true,
          },
        },
      },
    })

    const stockByCategory = categories.map((category) => {
      const totalValue = category.products.reduce(
        (sum, product) => sum + product.stock * Number(product.price),
        0
      )
      const totalQuantity = category.products.reduce(
        (sum, product) => sum + product.stock,
        0
      )
      return {
        name: category.name,
        value: totalValue,
        quantity: totalQuantity,
        products: category.products.length,
      }
    })

    return NextResponse.json({
      summary: {
        totalProducts,
        activeProducts,
        totalStock: totalStockValue._sum.stock || 0,
        lowStockCount,
        outOfStockCount,
      },
      movementsByDay: movementsData,
      topMovements: topMovementsWithDetails,
      stockByCategory,
    })
  } catch (error) {
    console.error('Get stock stats error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}

