import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Liste des mouvements de stock
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const productId = searchParams.get('productId')
    const type = searchParams.get('type') // "IN" or "OUT"
    const skip = (page - 1) * limit

    const where: any = {}

    if (productId) {
      where.productId = productId
    }

    if (type) {
      where.type = type
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: {
            select: {
              name: true,
              sku: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.stockMovement.count({ where }),
    ])

    return NextResponse.json({
      movements,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get stock movements error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des mouvements' },
      { status: 500 }
    )
  }
}

// POST - Créer un mouvement de stock manuel
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Seul le propriétaire peut créer des mouvements manuels
    if (session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { productId, quantity, type, reason } = body

    if (!productId || !quantity || !type) {
      return NextResponse.json(
        { error: 'Produit, quantité et type requis' },
        { status: 400 }
      )
    }

    if (!['IN', 'OUT'].includes(type)) {
      return NextResponse.json(
        { error: 'Type invalide (IN ou OUT)' },
        { status: 400 }
      )
    }

    // Vérifier que le produit existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      )
    }

    // Si c'est une sortie, vérifier le stock disponible
    if (type === 'OUT' && product.stock < quantity) {
      return NextResponse.json(
        { error: 'Stock insuffisant' },
        { status: 400 }
      )
    }

    // Créer le mouvement et mettre à jour le stock
    const movement = await prisma.$transaction(async (tx) => {
      // Créer le mouvement
      const newMovement = await tx.stockMovement.create({
        data: {
          productId,
          quantity,
          type,
          reason: reason || (type === 'IN' ? 'Ajout manuel' : 'Retrait manuel'),
          userId: session.userId,
        },
        include: {
          product: {
            select: {
              name: true,
              sku: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
      })

      // Mettre à jour le stock du produit
      const newStock = type === 'IN' 
        ? product.stock + quantity 
        : product.stock - quantity

      await tx.product.update({
        where: { id: productId },
        data: { stock: newStock },
      })

      return newMovement
    })

    return NextResponse.json(movement, { status: 201 })
  } catch (error) {
    console.error('Create stock movement error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du mouvement' },
      { status: 500 }
    )
  }
}

