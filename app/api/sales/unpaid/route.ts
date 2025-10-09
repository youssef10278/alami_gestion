import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Récupérer les ventes impayées d'un client
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json(
        { error: 'customerId requis' },
        { status: 400 }
      )
    }

    // Récupérer les ventes impayées ou partiellement payées
    const unpaidSales = await prisma.sale.findMany({
      where: {
        customerId,
        status: {
          in: ['PENDING', 'PARTIAL'],
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Calculer le solde restant pour chaque vente
    const salesWithBalance = unpaidSales.map((sale) => {
      const balance = Number(sale.totalAmount) - Number(sale.paidAmount)
      return {
        ...sale,
        balance,
      }
    })

    return NextResponse.json({
      sales: salesWithBalance,
      totalBalance: salesWithBalance.reduce((sum, sale) => sum + sale.balance, 0),
    })
  } catch (error) {
    console.error('Get unpaid sales error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des ventes impayées' },
      { status: 500 }
    )
  }
}

