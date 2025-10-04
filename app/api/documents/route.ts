import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Liste des documents
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')
    const skip = (page - 1) * limit

    const where: any = {}

    if (type) {
      where.type = type
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          sale: {
            include: {
              customer: {
                select: {
                  name: true,
                  company: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.document.count({ where }),
    ])

    return NextResponse.json({
      documents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des documents' },
      { status: 500 }
    )
  }
}

// POST - Créer un document
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { saleId, type } = body

    if (!saleId || !type) {
      return NextResponse.json(
        { error: 'Vente et type de document requis' },
        { status: 400 }
      )
    }

    if (!['INVOICE', 'QUOTE', 'DELIVERY_NOTE'].includes(type)) {
      return NextResponse.json(
        { error: 'Type de document invalide' },
        { status: 400 }
      )
    }

    // Vérifier que la vente existe
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!sale) {
      return NextResponse.json({ error: 'Vente non trouvée' }, { status: 404 })
    }

    // Générer le numéro de document
    const lastDocument = await prisma.document.findFirst({
      where: { type },
      orderBy: { createdAt: 'desc' },
      select: { documentNumber: true },
    })

    const prefix = type === 'INVOICE' ? 'FAC' : type === 'QUOTE' ? 'DEV' : 'BL'
    const documentNumber = lastDocument
      ? `${prefix}-${(parseInt(lastDocument.documentNumber.split('-')[1]) + 1)
          .toString()
          .padStart(6, '0')}`
      : `${prefix}-000001`

    // Créer le document
    const document = await prisma.document.create({
      data: {
        documentNumber,
        type,
        saleId,
      },
      include: {
        sale: {
          include: {
            customer: {
              select: {
                name: true,
                company: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Create document error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du document' },
      { status: 500 }
    )
  }
}

