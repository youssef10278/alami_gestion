import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateDeliveryNotePDF } from '@/lib/delivery-note-generator'
import { getSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const saleId = params.id
    console.log('🔍 Génération bon de livraison pour vente:', saleId)

    // Vérifier l'authentification
    const session = await getSession()
    if (!session) {
      console.log('❌ Utilisateur non authentifié')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer la vente avec tous les détails
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        customer: true,
        seller: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    console.log('📊 Vente trouvée:', {
      id: sale?.id,
      saleNumber: sale?.saleNumber,
      status: sale?.status,
      itemsCount: sale?.items?.length,
      hasCustomer: !!sale?.customer,
      hasSeller: !!sale?.seller
    })

    if (!sale) {
      console.log('❌ Vente non trouvée')
      return NextResponse.json(
        { error: 'Vente non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier que la vente est finalisée
    if (sale.status !== 'COMPLETED') {
      console.log('❌ Vente non finalisée, statut:', sale.status)
      return NextResponse.json(
        { error: 'La vente doit être finalisée pour générer un bon de livraison' },
        { status: 400 }
      )
    }

    // Récupérer les paramètres de l'entreprise
    console.log('🏢 Récupération des paramètres de l\'entreprise...')
    const companySettings = await prisma.companySettings.findFirst()
    console.log('🏢 Paramètres trouvés:', !!companySettings)

    // Vérifier les données requises
    if (!sale.seller) {
      console.log('❌ Vendeur manquant')
      return NextResponse.json(
        { error: 'Vendeur manquant pour cette vente' },
        { status: 400 }
      )
    }

    if (!sale.items || sale.items.length === 0) {
      console.log('❌ Aucun article dans la vente')
      return NextResponse.json(
        { error: 'Aucun article dans cette vente' },
        { status: 400 }
      )
    }

    // Préparer les données pour le PDF
    console.log('📋 Préparation des données PDF...')
    const deliveryNoteData = {
      saleNumber: sale.saleNumber,
      customerName: sale.customer?.name || 'Client de passage',
      customerAddress: sale.customer?.address,
      customerPhone: sale.customer?.phone,
      sellerName: sale.seller.name,
      items: sale.items.map(item => ({
        productName: item.product?.name || 'Produit inconnu',
        productSku: item.product?.sku,
        quantity: item.quantity,
        description: item.product?.description
      })),
      notes: sale.notes,
      createdAt: sale.createdAt,
      companySettings: companySettings ? {
        name: companySettings.companyName,
        address: companySettings.companyAddress,
        phone: companySettings.companyPhone,
        email: companySettings.companyEmail,
        logo: companySettings.companyLogo,
        primaryColor: companySettings.primaryColor
      } : undefined
    }

    console.log('📋 Données préparées:', {
      saleNumber: deliveryNoteData.saleNumber,
      customerName: deliveryNoteData.customerName,
      sellerName: deliveryNoteData.sellerName,
      itemsCount: deliveryNoteData.items.length
    })

    // Générer le PDF
    console.log('📄 Génération du PDF...')
    const pdfBuffer = await generateDeliveryNotePDF(deliveryNoteData)
    console.log('📄 PDF généré avec succès, taille:', pdfBuffer.length, 'bytes')

    // Marquer le bon de livraison comme généré
    console.log('💾 Mise à jour de la vente...')
    await prisma.sale.update({
      where: { id: saleId },
      data: {
        deliveryNoteGenerated: true,
        deliveryNoteGeneratedAt: new Date()
      }
    })
    console.log('💾 Vente mise à jour avec succès')

    // Retourner le PDF
    console.log('📤 Envoi du PDF au client')
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="bon-livraison-${sale.saleNumber}.pdf"`
      }
    })

  } catch (error) {
    console.error('❌ Erreur lors de la génération du bon de livraison:', error)
    console.error('❌ Stack trace:', error.stack)
    return NextResponse.json(
      {
        error: 'Erreur lors de la génération du bon de livraison',
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const saleId = params.id

    // Marquer le bon de livraison comme généré (sans télécharger)
    const sale = await prisma.sale.update({
      where: { id: saleId },
      data: {
        deliveryNoteGenerated: true,
        deliveryNoteGeneratedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Bon de livraison marqué comme généré',
      sale
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du bon de livraison:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}
