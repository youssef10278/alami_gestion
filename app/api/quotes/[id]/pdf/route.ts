import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateInvoicePDF } from '@/lib/pdf-generator'
import { getCompanySettings } from '@/lib/company-settings'

// GET - Générer le PDF d'un devis
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('📄 GET /api/quotes/[id]/pdf - Début')
    
    const session = await getSession()
    if (!session) {
      console.log('❌ Pas de session')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { id: quoteId } = await params
    console.log('🔍 Quote ID:', quoteId)

    // Récupérer le devis avec toutes ses relations
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!quote) {
      console.log('❌ Devis non trouvé')
      return NextResponse.json({ error: 'Devis non trouvé' }, { status: 404 })
    }

    console.log('✅ Devis trouvé:', quote.quoteNumber)

    // Préparer les données pour le PDF
    const pdfData = {
      documentNumber: quote.quoteNumber,
      date: quote.createdAt,
      dueDate: quote.validUntil,
      customer: {
        name: quote.customer?.name || quote.customerName,
        company: quote.customer?.company,
        phone: quote.customer?.phone || quote.customerPhone,
        email: quote.customer?.email || quote.customerEmail,
        address: quote.customer?.address || quote.customerAddress,
      },
      items: quote.items.map((item) => ({
        name: item.productName,
        sku: item.productSku || '',
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount || 0),
        total: Number(item.total),
      })),
      subtotal: Number(quote.subtotal),
      discountAmount: Number(quote.discount || 0),
      taxRate: Number(quote.tax || 0),
      taxAmount: Number(quote.taxAmount || 0),
      total: Number(quote.total),
      notes: quote.notes || undefined,
      terms: quote.terms || undefined,
    }

    console.log('📦 Données PDF préparées')

    // Récupérer les paramètres de l'entreprise et de design
    let designSettings
    try {
      const settings = await getCompanySettings()
      console.log('✅ Paramètres récupérés')

      // Utiliser les paramètres de design de DEVIS (pas de facture)
      designSettings = {
        quoteTheme: settings.quoteTheme || 'modern',
        primaryColor: settings.primaryColor || '#2563EB',
        secondaryColor: settings.secondaryColor || '#10B981',
        tableHeaderColor: settings.tableHeaderColor || settings.secondaryColor || '#10B981',
        sectionColor: settings.sectionColor || settings.secondaryColor || '#10B981',
        accentColor: settings.accentColor || '#F59E0B',
        textColor: settings.textColor || '#1F2937',
        headerTextColor: settings.headerTextColor || '#FFFFFF',
        sectionTextColor: settings.sectionTextColor || '#FFFFFF',
        backgroundColor: settings.backgroundColor || '#FFFFFF',
        headerStyle: settings.headerStyle || 'gradient',
        logoPosition: settings.logoPosition || 'left',
        logoSize: settings.logoSize || 'medium',
        fontFamily: settings.fontFamily || 'helvetica',
        fontSize: settings.fontSize || 'normal',
        borderRadius: settings.borderRadius || 'rounded',
        showWatermark: settings.showWatermark || false,
        watermarkText: settings.watermarkText || 'DEVIS',
        customCSS: settings.customCSS || '',
        // Paramètres spécifiques aux devis
        showValidityPeriod: settings.showValidityPeriod ?? true,
        validityPeriodText: settings.validityPeriodText || 'Ce devis est valable 30 jours à compter de la date d\'émission.',
        showTermsAndConditions: settings.showTermsAndConditions ?? true,
        termsAndConditionsText: settings.termsAndConditionsText || 'Conditions générales de vente disponibles sur demande.'
      }

      console.log('🎨 Paramètres de design de devis appliqués:', {
        theme: designSettings.quoteTheme,
        primaryColor: designSettings.primaryColor,
        showValidityPeriod: designSettings.showValidityPeriod,
        showTermsAndConditions: designSettings.showTermsAndConditions
      })
    } catch (error) {
      console.error('⚠️ Erreur lors de la récupération des paramètres:', error)
      designSettings = {
        quoteTheme: 'modern',
        primaryColor: '#2563EB',
        secondaryColor: '#10B981',
        tableHeaderColor: '#10B981',
        sectionColor: '#10B981',
        accentColor: '#F59E0B',
        textColor: '#1F2937',
        headerTextColor: '#FFFFFF',
        sectionTextColor: '#FFFFFF',
        backgroundColor: '#FFFFFF',
        headerStyle: 'gradient',
        logoPosition: 'left',
        logoSize: 'medium',
        fontFamily: 'helvetica',
        fontSize: 'normal',
        borderRadius: 'rounded',
        showWatermark: false,
        watermarkText: 'DEVIS',
        customCSS: '',
        showValidityPeriod: true,
        validityPeriodText: 'Ce devis est valable 30 jours à compter de la date d\'émission.',
        showTermsAndConditions: true,
        termsAndConditionsText: 'Conditions générales de vente disponibles sur demande.'
      }
    }

    // Générer le PDF avec le type 'quote' et les paramètres de design
    console.log('📄 Génération du PDF...')
    const pdfDoc = await generateInvoicePDF(pdfData, 'quote', designSettings)
    console.log('✅ PDF généré')

    // Retourner le PDF
    const pdfBuffer = pdfDoc.output('arraybuffer')
    console.log('✅ Buffer créé, taille:', pdfBuffer.byteLength, 'bytes')
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${quote.quoteNumber}.pdf"`,
      },
    })

  } catch (error: any) {
    console.error('❌ Error generating quote PDF:', error)
    console.error('Stack:', error.stack)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération du PDF',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

