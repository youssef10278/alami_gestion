import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateDeliveryNotePDF } from '@/lib/delivery-note-generator'
import { uploadPDF, deleteImage } from '@/lib/cloudinary'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id: saleId } = await params

    // Récupérer la vente avec toutes les informations nécessaires
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

    if (!sale) {
      return NextResponse.json({ error: 'Vente non trouvée' }, { status: 404 })
    }

    // Vérifier que la vente n'est pas annulée
    if (sale.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Impossible de générer un bon de livraison pour une vente annulée' },
        { status: 400 }
      )
    }

    // Récupérer les paramètres de l'entreprise
    const companySettings = await prisma.companySettings.findFirst()

    // Vérifier les données requises
    if (!sale.seller) {
      return NextResponse.json(
        { error: 'Vendeur manquant pour cette vente' },
        { status: 400 }
      )
    }

    if (!sale.items || sale.items.length === 0) {
      return NextResponse.json(
        { error: 'Aucun article dans cette vente' },
        { status: 400 }
      )
    }

    // Préparer les données pour le PDF
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
        unitPrice: Number(item.unitPrice) || 0,
        total: Number(item.total) || 0,
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

    // Générer le PDF (retourne Uint8Array)
    const pdfUint8Array = await generateDeliveryNotePDF(deliveryNoteData)

    // Convertir Uint8Array en Buffer
    const pdfBuffer = Buffer.from(pdfUint8Array)

    // Créer un nom de fichier unique
    const filename = `bon-livraison-${sale.saleNumber}-${Date.now()}`

    // Upload vers Cloudinary
    const uploadResult = await uploadPDF(
      pdfBuffer,
      filename,
      'alami-gestion/delivery-notes'
    )

    // Retourner l'URL du PDF
    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      filename: `${filename}.pdf`
    })

  } catch (error) {
    console.error('Error sharing delivery note:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors du partage du bon de livraison',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer le PDF temporaire de Cloudinary
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get('publicId')

    if (!publicId) {
      return NextResponse.json({ error: 'publicId manquant' }, { status: 400 })
    }

    // Supprimer de Cloudinary
    await deleteImage(publicId)

    return NextResponse.json({
      success: true,
      message: 'PDF supprimé avec succès'
    })

  } catch (error) {
    console.error('Error deleting delivery note:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la suppression du PDF',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

