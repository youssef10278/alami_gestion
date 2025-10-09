import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Statistiques des fournisseurs
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Compter les fournisseurs actifs
    const totalSuppliers = await prisma.supplier.count({
      where: { isActive: true },
    })

    // Calculer le total dû = Total des chèques ISSUED (non encaissés)
    const issuedChecks = await prisma.check.aggregate({
      where: {
        status: 'ISSUED',
      },
      _sum: {
        amount: true,
      },
    })
    const totalDebt = Number(issuedChecks._sum.amount || 0)

    // Calculer le total payé ce mois (transactions + chèques)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Paiements via transactions
    const paymentsThisMonth = await prisma.supplierTransaction.aggregate({
      where: {
        type: 'PAYMENT',
        status: 'COMPLETED',
        date: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    })

    // Chèques ENCAISSÉS ce mois (seulement CASHED, pas ISSUED)
    const checksThisMonth = await prisma.check.aggregate({
      where: {
        status: 'CASHED',
        cashDate: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    })

    const totalPaidThisMonth =
      Number(paymentsThisMonth._sum.amount || 0) +
      Number(checksThisMonth._sum.amount || 0)

    // Compter les chèques en attente
    const pendingChecks = await prisma.check.count({
      where: {
        status: 'ISSUED',
      },
    })

    return NextResponse.json({
      totalSuppliers,
      totalDebt,
      totalPaidThisMonth,
      pendingChecks,
    })
  } catch (error) {
    console.error('Get supplier stats error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}

