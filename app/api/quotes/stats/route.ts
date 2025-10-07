import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Statistiques des devis
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Total des devis
    const totalQuotes = await prisma.quote.count()

    // Devis en attente (DRAFT + SENT)
    const pendingQuotes = await prisma.quote.count({
      where: {
        status: {
          in: ['DRAFT', 'SENT'],
        },
      },
    })

    // Devis acceptés
    const acceptedQuotes = await prisma.quote.count({
      where: { status: 'ACCEPTED' },
    })

    // Devis convertis
    const convertedQuotes = await prisma.quote.count({
      where: { status: 'CONVERTED' },
    })

    // Valeur totale des devis en attente
    const pendingValue = await prisma.quote.aggregate({
      where: {
        status: {
          in: ['DRAFT', 'SENT'],
        },
      },
      _sum: {
        total: true,
      },
    })

    // Valeur totale des devis convertis
    const convertedValue = await prisma.quote.aggregate({
      where: { status: 'CONVERTED' },
      _sum: {
        total: true,
      },
    })

    // Taux de conversion
    const conversionRate = totalQuotes > 0 
      ? ((convertedQuotes / totalQuotes) * 100).toFixed(1)
      : '0.0'

    return NextResponse.json({
      totalQuotes,
      pendingQuotes,
      acceptedQuotes,
      convertedQuotes,
      pendingValue: pendingValue._sum.total || 0,
      convertedValue: convertedValue._sum.total || 0,
      conversionRate,
    })
  } catch (error) {
    console.error('Get quote stats error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}

