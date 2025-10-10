import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Récupérer une vente spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const saleId = params.id

    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        customer: true,
        seller: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            product: true,
          },
        },
        creditPayments: true,
        documents: true,
      },
    })

    if (!sale) {
      return NextResponse.json({ error: 'Vente non trouvée' }, { status: 404 })
    }

    // Vérifier les permissions : vendeur ne peut voir que ses ventes
    if (session.role === 'SELLER' && sale.sellerId !== session.userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    return NextResponse.json(sale)
  } catch (error) {
    console.error('Get sale error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la vente' },
      { status: 500 }
    )
  }
}

// PUT - Modifier une vente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const saleId = params.id
    const body = await request.json()
    const { customerId, items, paymentMethod, amountPaid, notes, reason } = body

    // Validation des données
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Produits requis' },
        { status: 400 }
      )
    }

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { error: 'Raison de modification requise (minimum 5 caractères)' },
        { status: 400 }
      )
    }

    // Récupérer la vente existante
    const existingSale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    })

    if (!existingSale) {
      return NextResponse.json({ error: 'Vente non trouvée' }, { status: 404 })
    }

    // Vérifier les permissions
    const canModify = 
      session.role === 'OWNER' || 
      (session.role === 'SELLER' && existingSale.sellerId === session.userId)

    if (!canModify) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Vérifier si la vente peut être modifiée
    const timeSinceCreation = Date.now() - new Date(existingSale.createdAt).getTime()
    const maxEditTime = 24 * 60 * 60 * 1000 // 24 heures en millisecondes

    // Seul le propriétaire peut modifier après 24h
    if (session.role === 'SELLER' && timeSinceCreation > maxEditTime) {
      return NextResponse.json(
        { error: 'Modification impossible : délai de 24h dépassé. Contactez le propriétaire.' },
        { status: 403 }
      )
    }

    // Vérifier si la vente a des paiements de crédit
    const creditPayments = await prisma.creditPayment.count({
      where: { saleId: saleId },
    })

    if (creditPayments > 0) {
      return NextResponse.json(
        { error: 'Impossible de modifier une vente avec des paiements de crédit enregistrés' },
        { status: 400 }
      )
    }

    // Calculer les nouveaux totaux
    let newTotal = 0
    const newSaleItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        return NextResponse.json(
          { error: `Produit ${item.productId} non trouvé` },
          { status: 400 }
        )
      }

      const unitPrice = item.customPrice !== undefined ? item.customPrice : Number(product.price)
      const itemTotal = unitPrice * item.quantity
      newTotal += itemTotal

      newSaleItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: unitPrice,
        total: itemTotal,
      })
    }

    const newPaidAmount = Number(amountPaid) || 0
    const newCreditAmount = Math.max(0, newTotal - newPaidAmount)

    // Validation : crédit nécessite un client
    if (!customerId && paymentMethod === 'CREDIT') {
      return NextResponse.json(
        { error: 'Le paiement à crédit nécessite un client enregistré' },
        { status: 400 }
      )
    }

    // Effectuer la modification avec transaction
    const updatedSale = await prisma.$transaction(async (tx) => {
      // 1. Restaurer le stock des anciens items
      for (const oldItem of existingSale.items) {
        await tx.product.update({
          where: { id: oldItem.productId },
          data: {
            stock: {
              increment: oldItem.quantity,
            },
          },
        })

        // Créer un mouvement de stock pour la restauration
        await tx.stockMovement.create({
          data: {
            productId: oldItem.productId,
            quantity: oldItem.quantity,
            type: 'IN',
            reason: `Correction vente #${existingSale.saleNumber} - Restauration`,
            reference: `CORRECTION-${saleId}`,
          },
        })
      }

      // 2. Vérifier le stock pour les nouveaux items
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        })

        if (!product || product.stock < item.quantity) {
          throw new Error(`Stock insuffisant pour ${product?.name || 'produit inconnu'}`)
        }
      }

      // 3. Supprimer les anciens items
      await tx.saleItem.deleteMany({
        where: { saleId: saleId },
      })

      // 4. Restaurer le crédit du client si nécessaire
      if (existingSale.creditAmount > 0 && existingSale.customerId) {
        await tx.customer.update({
          where: { id: existingSale.customerId },
          data: {
            creditUsed: {
              decrement: existingSale.creditAmount,
            },
          },
        })
      }

      // 5. Mettre à jour la vente
      const sale = await tx.sale.update({
        where: { id: saleId },
        data: {
          customerId: customerId || null,
          totalAmount: newTotal,
          paidAmount: newPaidAmount,
          creditAmount: newCreditAmount,
          paymentMethod: paymentMethod || 'CASH',
          status: newCreditAmount > 0 ? 'PENDING' : 'COMPLETED',
          notes: notes || null,
          updatedAt: new Date(),
          items: {
            create: newSaleItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
          seller: {
            select: { name: true },
          },
        },
      })

      // 6. Décrémenter le stock pour les nouveaux items
      for (const item of items) {
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
            quantity: item.quantity,
            type: 'OUT',
            reason: `Correction vente #${sale.saleNumber}`,
            reference: `CORRECTION-${saleId}`,
          },
        })
      }

      // 7. Mettre à jour le crédit du nouveau client si nécessaire
      if (newCreditAmount > 0 && customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            creditUsed: {
              increment: newCreditAmount,
            },
          },
        })
      }

      // 8. Créer un log de modification
      await tx.stockMovement.create({
        data: {
          productId: sale.items[0].productId, // Utiliser le premier produit comme référence
          quantity: 0,
          type: 'CORRECTION',
          reason: `Modification vente par ${session.role === 'OWNER' ? 'Propriétaire' : 'Vendeur'}: ${reason}`,
          reference: `EDIT-${saleId}-${Date.now()}`,
        },
      })

      return sale
    })

    return NextResponse.json({
      sale: updatedSale,
      message: 'Vente modifiée avec succès',
    })
  } catch (error) {
    console.error('Update sale error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la modification de la vente' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une vente
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const saleId = params.id
    const { searchParams } = new URL(request.url)
    const reason = searchParams.get('reason')

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { error: 'Raison de suppression requise (minimum 5 caractères)' },
        { status: 400 }
      )
    }

    // Récupérer la vente existante
    const existingSale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
        creditPayments: true,
        documents: true,
      },
    })

    if (!existingSale) {
      return NextResponse.json({ error: 'Vente non trouvée' }, { status: 404 })
    }

    // Vérifier les permissions
    const canDelete = 
      session.role === 'OWNER' || 
      (session.role === 'SELLER' && existingSale.sellerId === session.userId)

    if (!canDelete) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Vérifier si la vente peut être supprimée
    const timeSinceCreation = Date.now() - new Date(existingSale.createdAt).getTime()
    const maxDeleteTime = 2 * 60 * 60 * 1000 // 2 heures en millisecondes

    // Seul le propriétaire peut supprimer après 2h
    if (session.role === 'SELLER' && timeSinceCreation > maxDeleteTime) {
      return NextResponse.json(
        { error: 'Suppression impossible : délai de 2h dépassé. Contactez le propriétaire.' },
        { status: 403 }
      )
    }

    // Vérifier s'il y a des paiements de crédit
    if (existingSale.creditPayments.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une vente avec des paiements de crédit enregistrés' },
        { status: 400 }
      )
    }

    // Vérifier s'il y a des documents générés
    if (existingSale.documents.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une vente avec des documents générés' },
        { status: 400 }
      )
    }

    // Effectuer la suppression avec transaction
    await prisma.$transaction(async (tx) => {
      // 1. Restaurer le stock
      for (const item of existingSale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        })

        // Créer un mouvement de stock pour la restauration
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            type: 'IN',
            reason: `Suppression vente #${existingSale.saleNumber} - ${reason}`,
            reference: `DELETE-${saleId}`,
          },
        })
      }

      // 2. Restaurer le crédit du client si nécessaire
      if (existingSale.creditAmount > 0 && existingSale.customerId) {
        await tx.customer.update({
          where: { id: existingSale.customerId },
          data: {
            creditUsed: {
              decrement: existingSale.creditAmount,
            },
          },
        })
      }

      // 3. Supprimer les items de vente
      await tx.saleItem.deleteMany({
        where: { saleId: saleId },
      })

      // 4. Supprimer la vente
      await tx.sale.delete({
        where: { id: saleId },
      })

      // 5. Créer un log de suppression
      if (existingSale.items.length > 0) {
        await tx.stockMovement.create({
          data: {
            productId: existingSale.items[0].productId,
            quantity: 0,
            type: 'DELETION',
            reason: `Suppression vente #${existingSale.saleNumber} par ${session.role === 'OWNER' ? 'Propriétaire' : 'Vendeur'}: ${reason}`,
            reference: `DELETE-${saleId}-${Date.now()}`,
          },
        })
      }
    })

    return NextResponse.json({
      message: 'Vente supprimée avec succès',
      saleNumber: existingSale.saleNumber,
    })
  } catch (error) {
    console.error('Delete sale error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la vente' },
      { status: 500 }
    )
  }
}
