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

    // Calculer le total dû (seulement les soldes positifs = ce qu'on doit)
    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true },
      select: { balance: true },
    })

    // Somme des soldes positifs uniquement (ce qu'on doit aux fournisseurs)
    const totalDebt = suppliers.reduce((sum, s) => {
      const balance = Number(s.balance)
      return sum + (balance > 0 ? balance : 0)
    }, 0)

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

    // Chèques créés ce mois (ISSUED ou CASHED)
    const checksThisMonth = await prisma.check.aggregate({
      where: {
        status: {
          in: ['ISSUED', 'CASHED'],
        },
        issueDate: {
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

