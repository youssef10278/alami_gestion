import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Liste des produits avec stock bas
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Produits avec stock bas (stock <= minStock)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          {
            stock: {
              lte: prisma.product.fields.minStock,
            },
          },
        ],
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { stock: 'asc' },
        { name: 'asc' },
      ],
    })

    // Filtrer manuellement car Prisma ne supporte pas la comparaison entre champs
    const alerts = lowStockProducts.filter(
      (product) => product.stock <= product.minStock
    )

    // Produits en rupture de stock
    const outOfStock = alerts.filter((product) => product.stock === 0)

    // Produits critiques (stock < 50% du minStock)
    const critical = alerts.filter(
      (product) => product.stock > 0 && product.stock < product.minStock * 0.5
    )

    // Produits en alerte (stock entre 50% et 100% du minStock)
    const warning = alerts.filter(
      (product) =>
        product.stock >= product.minStock * 0.5 && product.stock <= product.minStock
    )

    return NextResponse.json({
      total: alerts.length,
      outOfStock: outOfStock.length,
      critical: critical.length,
      warning: warning.length,
      products: alerts.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        stock: product.stock,
        minStock: product.minStock,
        category: product.category?.name || 'Sans catégorie',
        status:
          product.stock === 0
            ? 'OUT_OF_STOCK'
            : product.stock < product.minStock * 0.5
            ? 'CRITICAL'
            : 'WARNING',
        percentage: (product.stock / product.minStock) * 100,
      })),
    })
  } catch (error) {
    console.error('Get stock alerts error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des alertes' },
      { status: 500 }
    )
  }
}

