import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Détails d'un fournisseur
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id: params.id },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
          take: 50,
        },
        checks: {
          orderBy: { dueDate: 'desc' },
          take: 50,
        },
        _count: {
          select: {
            transactions: true,
            checks: true,
          },
        },
      },
    })

    if (!supplier) {
      return NextResponse.json(
        { error: 'Fournisseur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Get supplier error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du fournisseur' },
      { status: 500 }
    )
  }
}

