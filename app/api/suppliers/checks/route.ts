import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Liste des chèques
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const supplierId = searchParams.get('supplierId')
    const status = searchParams.get('status')

    const where: any = {}

    if (supplierId) {
      where.supplierId = supplierId
    }

    if (status && status !== 'all') {
      where.status = status
    }

    const checks = await prisma.check.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        transaction: {
          select: {
            id: true,
            transactionNumber: true,
            description: true,
          },
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    })

    return NextResponse.json(checks)
  } catch (error) {
    console.error('Get checks error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des chèques' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour le statut d'un chèque
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, cashDate } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID et statut requis' },
        { status: 400 }
      )
    }

    // Récupérer le chèque actuel
    const currentCheck = await prisma.check.findUnique({
      where: { id },
      include: { supplier: true },
    })

    if (!currentCheck) {
      return NextResponse.json(
        { error: 'Chèque non trouvé' },
        { status: 404 }
      )
    }

    // Gérer les changements de statut avec impact sur le solde
    const needsTransaction =
      (currentCheck.status === 'ISSUED' && status === 'CANCELLED') || // Annuler un chèque émis
      (currentCheck.status === 'CANCELLED' && status === 'ISSUED') || // Réactiver un chèque annulé
      (currentCheck.status === 'CASHED' && status === 'ISSUED') ||    // Annuler un encaissement
      (currentCheck.status === 'BOUNCED' && status === 'ISSUED')      // Réactiver un chèque rejeté

    if (needsTransaction) {
      await prisma.$transaction(async (tx) => {
        // Mettre à jour le chèque
        await tx.check.update({
          where: { id },
          data: {
            status,
            cashDate: cashDate ? new Date(cashDate) : null,
          },
        })

        let newBalance = Number(currentCheck.supplier.balance)
        let newTotalPaid = Number(currentCheck.supplier.totalPaid)

        // ISSUED → CANCELLED/BOUNCED : Remettre le montant au solde
        if (currentCheck.status === 'ISSUED' && (status === 'CANCELLED' || status === 'BOUNCED')) {
          newBalance += Number(currentCheck.amount)
          newTotalPaid -= Number(currentCheck.amount)
        }
        // CANCELLED/CASHED/BOUNCED → ISSUED : Retirer le montant du solde
        else if ((currentCheck.status === 'CANCELLED' || currentCheck.status === 'CASHED' || currentCheck.status === 'BOUNCED') && status === 'ISSUED') {
          newBalance -= Number(currentCheck.amount)
          newTotalPaid += Number(currentCheck.amount)
        }

        await tx.supplier.update({
          where: { id: currentCheck.supplierId },
          data: {
            balance: newBalance,
            totalPaid: newTotalPaid,
          },
        })
      })
    } else {
      // Mise à jour simple du statut (sans impact sur le solde)
      await prisma.check.update({
        where: { id },
        data: {
          status,
          cashDate: cashDate ? new Date(cashDate) : (status === 'CASHED' ? new Date() : null),
        },
      })
    }

    const updatedCheck = await prisma.check.findUnique({
      where: { id },
      include: {
        supplier: true,
        transaction: true,
      },
    })

    return NextResponse.json(updatedCheck)
  } catch (error) {
    console.error('Update check error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du chèque' },
      { status: 500 }
    )
  }
}

