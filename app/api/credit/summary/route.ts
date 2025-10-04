import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Résumé du crédit
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Statistiques globales
    const [
      totalCustomers,
      customersWithCredit,
      blockedCustomers,
      totalCreditLimit,
      totalCreditUsed,
      recentPayments,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({
        where: {
          creditUsed: {
            gt: 0,
          },
        },
      }),
      prisma.customer.count({
        where: {
          isBlocked: true,
        },
      }),
      prisma.customer.aggregate({
        _sum: {
          creditLimit: true,
        },
      }),
      prisma.customer.aggregate({
        _sum: {
          creditUsed: true,
        },
      }),
      prisma.creditPayment.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          customer: true,
        },
      }),
    ])

    // Clients avec crédit élevé (> 80% de la limite)
    const customersHighCredit = await prisma.customer.findMany({
      where: {
        creditLimit: {
          gt: 0,
        },
      },
    })

    const highCreditCustomers = customersHighCredit.filter((customer) => {
      const percentage = (Number(customer.creditUsed) / Number(customer.creditLimit)) * 100
      return percentage > 80
    })

    return NextResponse.json({
      totalCustomers,
      customersWithCredit,
      blockedCustomers,
      highCreditCustomers: highCreditCustomers.length,
      totalCreditLimit: Number(totalCreditLimit._sum.creditLimit) || 0,
      totalCreditUsed: Number(totalCreditUsed._sum.creditUsed) || 0,
      totalCreditAvailable:
        (Number(totalCreditLimit._sum.creditLimit) || 0) -
        (Number(totalCreditUsed._sum.creditUsed) || 0),
      recentPayments,
    })
  } catch (error) {
    console.error('Get credit summary error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du résumé' },
      { status: 500 }
    )
  }
}

