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

    // Calculer le total dû
    const debtResult = await prisma.supplier.aggregate({
      where: { isActive: true },
      _sum: {
        balance: true,
      },
    })
    const totalDebt = Number(debtResult._sum.balance || 0)

    // Calculer le total payé ce mois
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
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
    const totalPaidThisMonth = Number(paymentsThisMonth._sum.amount || 0)

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

