import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Liste des paiements de crédit
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}

    if (customerId) {
      where.customerId = customerId
    }

    const [payments, total] = await Promise.all([
      prisma.creditPayment.findMany({
        where,
        include: {
          customer: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.creditPayment.count({ where }),
    ])

    return NextResponse.json({
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get credit payments error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paiements' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau paiement de crédit
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { customerId, amount, paymentMethod, notes } = body

    if (!customerId || !amount) {
      return NextResponse.json(
        { error: 'Client et montant requis' },
        { status: 400 }
      )
    }

    const paymentAmount = parseFloat(amount)

    if (paymentAmount <= 0) {
      return NextResponse.json(
        { error: 'Le montant doit être supérieur à 0' },
        { status: 400 }
      )
    }

    // Vérifier le client
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      )
    }

    if (Number(customer.creditUsed) <= 0) {
      return NextResponse.json(
        { error: 'Ce client n\'a pas de crédit à rembourser' },
        { status: 400 }
      )
    }

    if (paymentAmount > Number(customer.creditUsed)) {
      return NextResponse.json(
        { error: 'Le montant dépasse le crédit utilisé' },
        { status: 400 }
      )
    }

    // Créer le paiement et mettre à jour le crédit
    const payment = await prisma.$transaction(async (tx) => {
      // Créer le paiement
      const newPayment = await tx.creditPayment.create({
        data: {
          customerId,
          amount: paymentAmount,
          paymentMethod: paymentMethod || 'CASH',
          notes: notes || null,
        },
        include: {
          customer: true,
        },
      })

      // Mettre à jour le crédit du client
      await tx.customer.update({
        where: { id: customerId },
        data: {
          creditUsed: {
            decrement: paymentAmount,
          },
        },
      })

      // Débloquer le client si le crédit est maintenant sous la limite
      const updatedCustomer = await tx.customer.findUnique({
        where: { id: customerId },
      })

      if (updatedCustomer && updatedCustomer.isBlocked) {
        const newCreditUsed = Number(updatedCustomer.creditUsed) - paymentAmount
        if (newCreditUsed <= Number(updatedCustomer.creditLimit)) {
          await tx.customer.update({
            where: { id: customerId },
            data: { isBlocked: false },
          })
        }
      }

      return newPayment
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Create credit payment error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    )
  }
}

