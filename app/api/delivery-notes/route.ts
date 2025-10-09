import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Liste des bons de livraison
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const skip = (page - 1) * limit

    // Récupérer toutes les ventes qui ont un bon de livraison généré
    const [deliveryNotes, total] = await Promise.all([
      prisma.sale.findMany({
        where: {
          deliveryNoteGenerated: true,
          status: 'COMPLETED'
        },
        include: {
          customer: {
            select: {
              name: true,
              company: true,
            }
          },
          seller: {
            select: {
              name: true,
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  sku: true,
                }
              }
            }
          }
        },
        orderBy: { deliveryNoteGeneratedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.sale.count({
        where: {
          deliveryNoteGenerated: true,
          status: 'COMPLETED'
        }
      })
    ])

    // Transformer les données pour correspondre au format attendu
    const formattedDeliveryNotes = deliveryNotes.map(sale => ({
      id: sale.id,
      documentNumber: `BL-${sale.saleNumber}`,
      saleNumber: sale.saleNumber,
      type: 'DELIVERY_NOTE',
      createdAt: sale.deliveryNoteGeneratedAt || sale.createdAt,
      totalAmount: sale.totalAmount,
      status: 'DELIVERED',
      customer: sale.customer ? {
        name: sale.customer.name,
        company: sale.customer.company
      } : {
        name: 'Client de passage',
        company: null
      },
      seller: sale.seller ? {
        name: sale.seller.name
      } : null,
      items: sale.items.map(item => ({
        productName: item.product.name,
        productSku: item.product.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      }))
    }))

    return NextResponse.json({
      deliveryNotes: formattedDeliveryNotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching delivery notes:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des bons de livraison' },
      { status: 500 }
    )
  }
}

