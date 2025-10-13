import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

/**
 * 🔄 API GESTION DES RETOURS PRODUITS
 * 
 * Gère le système complet de retour des produits avec impact sur le stock
 */

// Schema de validation pour traitement des retours
const processReturnsSchema = z.object({
  invoiceId: z.string().min(1, 'ID facture requis'),
  returns: z.array(z.object({
    productId: z.string().min(1, 'ID produit requis'),
    quantity: z.number().int().min(1, 'Quantité doit être >= 1'),
    returnStatus: z.enum(['GOOD', 'DEFECTIVE', 'UNUSABLE']),
    reason: z.string().optional(),
  })).min(1, 'Au moins un retour requis'),
})

// POST - Traiter les retours d'une facture d'avoir
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    console.log('🔄 === TRAITEMENT RETOURS PRODUITS ===')
    console.log('Données reçues:', JSON.stringify(body, null, 2))

    const validationResult = processReturnsSchema.safeParse(body)
    if (!validationResult.success) {
      console.log('❌ VALIDATION ÉCHOUÉE:', validationResult.error.issues)
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          }))
        },
        { status: 400 }
      )
    }

    const { invoiceId, returns } = validationResult.data

    // Vérifier que la facture existe et est de type CREDIT_NOTE
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })
    }

    if (invoice.type !== 'CREDIT_NOTE') {
      return NextResponse.json(
        { error: 'Seules les factures d\'avoir peuvent avoir des retours' },
        { status: 400 }
      )
    }

    // Traiter chaque retour dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      const processedReturns = []
      const stockUpdates = []

      for (const returnData of returns) {
        // Vérifier que le produit existe dans la facture
        const invoiceItem = invoice.items.find(item => item.productId === returnData.productId)
        if (!invoiceItem) {
          throw new Error(`Produit ${returnData.productId} non trouvé dans la facture`)
        }

        if (returnData.quantity > invoiceItem.quantity) {
          throw new Error(`Quantité retour (${returnData.quantity}) > quantité facturée (${invoiceItem.quantity})`)
        }

        // Créer l'enregistrement de retour
        const productReturn = await tx.productReturn.create({
          data: {
            invoiceId,
            productId: returnData.productId,
            quantity: returnData.quantity,
            returnStatus: returnData.returnStatus,
            reason: returnData.reason || null,
            restockedQuantity: 0, // Sera mis à jour selon le statut
            processedAt: new Date(),
          }
        })

        // Calculer l'impact sur le stock selon le statut
        let stockUpdate = null
        let restockedQuantity = 0

        switch (returnData.returnStatus) {
          case 'GOOD':
            // Retour en stock vendable
            restockedQuantity = returnData.quantity
            stockUpdate = await tx.product.update({
              where: { id: returnData.productId },
              data: {
                stock: { increment: returnData.quantity }
              }
            })
            stockUpdates.push({
              productId: returnData.productId,
              type: 'GOOD_RETURN',
              quantity: returnData.quantity,
              newStock: stockUpdate.stock
            })
            break

          case 'DEFECTIVE':
            // Retour en stock défectueux
            restockedQuantity = 0 // Pas de stock vendable
            stockUpdate = await tx.product.update({
              where: { id: returnData.productId },
              data: {
                defectiveStock: { increment: returnData.quantity }
              }
            })
            stockUpdates.push({
              productId: returnData.productId,
              type: 'DEFECTIVE_RETURN',
              quantity: returnData.quantity,
              newDefectiveStock: stockUpdate.defectiveStock
            })
            break

          case 'UNUSABLE':
            // Pas de retour en stock
            restockedQuantity = 0
            stockUpdates.push({
              productId: returnData.productId,
              type: 'UNUSABLE_RETURN',
              quantity: returnData.quantity,
              note: 'Produit détruit/inutilisable'
            })
            break
        }

        // Mettre à jour la quantité restockée
        await tx.productReturn.update({
          where: { id: productReturn.id },
          data: { restockedQuantity }
        })

        processedReturns.push({
          ...productReturn,
          restockedQuantity,
          stockUpdate
        })
      }

      return { processedReturns, stockUpdates }
    })

    console.log('✅ RETOURS TRAITÉS AVEC SUCCÈS')
    console.log('Retours créés:', result.processedReturns.length)
    console.log('Mises à jour stock:', result.stockUpdates)

    return NextResponse.json({
      message: 'Retours traités avec succès',
      processedReturns: result.processedReturns.length,
      stockUpdates: result.stockUpdates,
      details: result.processedReturns
    })

  } catch (error) {
    console.error('❌ Erreur traitement retours:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors du traitement des retours' },
      { status: 500 }
    )
  }
}

// GET - Liste des retours avec filtres
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('invoiceId')
    const productId = searchParams.get('productId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (invoiceId) where.invoiceId = invoiceId
    if (productId) where.productId = productId
    if (status) where.returnStatus = status

    const [returns, total] = await Promise.all([
      prisma.productReturn.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              stock: true,
              defectiveStock: true
            }
          },
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              type: true,
              customerName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.productReturn.count({ where })
    ])

    return NextResponse.json({
      returns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('❌ Erreur récupération retours:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des retours' },
      { status: 500 }
    )
  }
}
