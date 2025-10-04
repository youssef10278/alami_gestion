import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Liste des ventes
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const customerId = searchParams.get('customerId')
    const skip = (page - 1) * limit

    const where: any = {}

    if (customerId) {
      where.customerId = customerId
    }

    // Si vendeur, voir seulement ses ventes
    if (session.role === 'SELLER') {
      where.sellerId = session.userId
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          customer: true,
          seller: {
            select: { name: true },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.sale.count({ where }),
    ])

    return NextResponse.json({
      sales,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get sales error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des ventes' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle vente
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { customerId, items, paymentMethod, amountPaid, notes } = body

    // Validation : produits requis
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Produits requis' },
        { status: 400 }
      )
    }

    // Validation : crédit nécessite un client
    if (!customerId && paymentMethod === 'CREDIT') {
      return NextResponse.json(
        { error: 'Le paiement à crédit nécessite un client enregistré' },
        { status: 400 }
      )
    }

    // Calculer le total
    let total = 0
    const saleItems: Array<{
      productId: string
      quantity: number
      unitPrice: number
      total: number
    }> = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        return NextResponse.json(
          { error: `Produit ${item.productId} non trouvé` },
          { status: 400 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${product.name}` },
          { status: 400 }
        )
      }

      const itemTotal = Number(product.price) * item.quantity
      total += itemTotal

      saleItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: Number(product.price),
        total: itemTotal,
      })
    }

    const paidAmount = parseFloat(amountPaid) || 0
    const creditAmount = total - paidAmount

    // Vérifier la limite de crédit si paiement à crédit ET client enregistré
    if (creditAmount > 0 && customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      })

      if (!customer) {
        return NextResponse.json(
          { error: 'Client non trouvé' },
          { status: 404 }
        )
      }

      if (customer.isBlocked) {
        return NextResponse.json(
          { error: 'Client bloqué' },
          { status: 400 }
        )
      }

      const newCreditUsed = Number(customer.creditUsed) + creditAmount
      if (newCreditUsed > Number(customer.creditLimit)) {
        return NextResponse.json(
          { error: 'Limite de crédit dépassée' },
          { status: 400 }
        )
      }
    }

    // Générer le numéro de vente
    const lastSale = await prisma.sale.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { saleNumber: true },
    })

    const saleNumber = lastSale
      ? `VNT-${(parseInt(lastSale.saleNumber.split('-')[1]) + 1).toString().padStart(6, '0')}`
      : 'VNT-000001'

    // Créer la vente avec transaction
    const sale = await prisma.$transaction(async (tx) => {
      // Créer la vente
      const newSale = await tx.sale.create({
        data: {
          saleNumber,
          customerId: customerId || null, // null pour client de passage
          sellerId: session.userId,
          totalAmount: total,
          paidAmount: paidAmount,
          creditAmount,
          paymentMethod: paymentMethod || 'CASH',
          status: creditAmount > 0 ? 'PENDING' : 'COMPLETED',
          notes: notes || null,
          items: {
            create: saleItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
        },
      })

      // Mettre à jour le stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })

        // Créer un mouvement de stock
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            type: 'OUT',
            reason: `Vente #${newSale.id.substring(0, 8)}`,
          },
        })
      }

      // Mettre à jour le crédit du client (seulement si client enregistré)
      if (creditAmount > 0 && customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            creditUsed: {
              increment: creditAmount,
            },
          },
        })
      }

      return newSale
    })

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    console.error('Create sale error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la vente' },
      { status: 500 }
    )
  }
}

