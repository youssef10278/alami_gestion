import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Générer le prochain numéro de facture
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'INVOICE' // 'INVOICE' ou 'CREDIT_NOTE'

    // Récupérer les paramètres de l'entreprise pour les préfixes
    const companySettings = await prisma.companySettings.findFirst()

    // Déterminer le préfixe selon le type et les paramètres
    const prefix = type === 'CREDIT_NOTE'
      ? (companySettings?.creditNotePrefix || 'FAV')
      : (companySettings?.invoicePrefix || 'FAC')

    // Trouver la dernière facture avec ce préfixe
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: prefix,
        },
      },
      orderBy: { invoiceNumber: 'desc' },
      select: {
        invoiceNumber: true,
      },
    })

    let nextNumber: string

    if (lastInvoice) {
      // Extraire le numéro de la dernière facture
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1])
      nextNumber = `${prefix}-${(lastNumber + 1).toString().padStart(8, '0')}`
    } else {
      // Première facture
      nextNumber = `${prefix}-00000001`
    }

    return NextResponse.json({
      nextNumber,
      prefix,
      type,
    })
  } catch (error) {
    console.error('Error generating next invoice number:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du numéro de facture' },
      { status: 500 }
    )
  }
}

// POST - Vérifier la disponibilité d'un numéro de facture
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { invoiceNumber } = await request.json()

    if (!invoiceNumber) {
      return NextResponse.json(
        { error: 'Numéro de facture requis' },
        { status: 400 }
      )
    }

    // Vérifier si le numéro existe déjà
    const existingInvoice = await prisma.invoice.findUnique({
      where: { invoiceNumber },
      select: {
        id: true,
        invoiceNumber: true,
        type: true,
        customerName: true,
      },
    })

    if (existingInvoice) {
      return NextResponse.json({
        available: false,
        message: 'Ce numéro de facture est déjà utilisé',
        existingInvoice: {
          id: existingInvoice.id,
          invoiceNumber: existingInvoice.invoiceNumber,
          type: existingInvoice.type,
          customerName: existingInvoice.customerName,
        },
      })
    }

    return NextResponse.json({
      available: true,
      message: 'Ce numéro de facture est disponible',
      invoiceNumber,
    })
  } catch (error) {
    console.error('Error checking invoice number availability:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du numéro de facture' },
      { status: 500 }
    )
  }
}
