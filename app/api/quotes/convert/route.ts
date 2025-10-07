import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// POST - Convertir un devis en vente
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { quoteId, paymentMethod, paidAmount } = body

    if (!quoteId || !paymentMethod) {
      return NextResponse.json(
        { error: 'ID du devis et mode de paiement requis' },
        { status: 400 }
      )
    }

    // Récupérer le devis
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!quote) {
      return NextResponse.json({ error: 'Devis non trouvé' }, { status: 404 })
    }

    if (quote.status === 'CONVERTED') {
      return NextResponse.json(
        { error: 'Ce devis a déjà été converti en vente' },
        { status: 400 }
      )
    }

    if (quote.status === 'REJECTED' || quote.status === 'EXPIRED') {
      return NextResponse.json(
        { error: 'Impossible de convertir un devis rejeté ou expiré' },
        { status: 400 }
      )
    }

    // Vérifier le stock pour tous les produits
    for (const item of quote.items) {
      if (item.product && item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${item.productName}` },
          { status: 400 }
        )
      }
    }

    // Générer le numéro de vente
    const lastSale = await prisma.sale.findFirst({
      orderBy: { saleNumber: 'desc' },
    })

    const saleNumber = lastSale
      ? `VNT-${(parseInt(lastSale.saleNumber.split('-')[1]) + 1).toString().padStart(6, '0')}`
      : 'VNT-000001'

    // Calculer les montants
    const totalAmount = Number(quote.total)
    const paid = paidAmount !== undefined ? Number(paidAmount) : totalAmount
    const creditAmount = totalAmount - paid

    // Créer la vente dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer la vente
      const sale = await tx.sale.create({
        data: {
          saleNumber,
          customerId: quote.customerId,
          sellerId: session.userId,
          totalAmount,
          paidAmount: paid,
          creditAmount,
          paymentMethod,
          status: creditAmount > 0 ? 'PENDING' : 'COMPLETED',
          items: {
            create: quote.items.map((item) => ({
              productId: item.productId!,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
            })),
          },
        },
        include: {
          customer: true,
          seller: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      // Mettre à jour le stock
      for (const item of quote.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })

          // Créer un mouvement de stock
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: -item.quantity,
              type: 'OUT',
              reason: 'Vente',
              reference: saleNumber,
            },
          })
        }
      }

      // Mettre à jour le crédit du client si nécessaire
      if (quote.customerId && creditAmount > 0) {
        await tx.customer.update({
          where: { id: quote.customerId },
          data: {
            creditUsed: {
              increment: creditAmount,
            },
          },
        })
      }

      // Mettre à jour le devis
      await tx.quote.update({
        where: { id: quoteId },
        data: {
          status: 'CONVERTED',
          convertedToSaleId: sale.id,
        },
      })

      return sale
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Convert quote error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la conversion du devis' },
      { status: 500 }
    )
  }
}

