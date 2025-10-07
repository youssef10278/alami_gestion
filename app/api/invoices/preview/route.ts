import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { generateManualInvoicePDF } from '@/lib/pdf-generator'
import { getCompanySettings, formatCompanySettingsForPDF } from '@/lib/company-settings'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { designSettings } = body

    // Données de test pour l'aperçu
    const previewInvoiceData = {
      invoiceNumber: 'APERCU-001',
      type: 'INVOICE' as const,
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      customer: {
        name: 'Client Exemple SARL',
        company: 'Exemple Company',
        email: 'client@exemple.com',
        phone: '0522 123 456',
        address: '123 Avenue Mohammed V\nCasablanca 20000\nMaroc',
        taxId: 'IF123456789'
      },
      items: [
        {
          productName: 'Produit Exemple 1',
          productSku: 'PROD-001',
          description: 'Description du produit exemple',
          quantity: 2,
          unitPrice: 1500.00,
          discountAmount: 100.00,
          total: 2900.00
        },
        {
          productName: 'Service Exemple',
          productSku: 'SERV-001',
          description: 'Service de consultation',
          quantity: 1,
          unitPrice: 800.00,
          discountAmount: 0,
          total: 800.00
        },
        {
          productName: 'Produit Premium',
          productSku: 'PREM-001',
          description: 'Produit haut de gamme avec garantie',
          quantity: 1,
          unitPrice: 2200.00,
          discountAmount: 200.00,
          total: 2000.00
        }
      ],
      subtotal: 5700.00,
      discountAmount: 300.00,
      taxRate: 20,
      taxAmount: 1080.00,
      total: 6480.00,
      notes: 'Ceci est un aperçu de votre design de facture personnalisé. Merci pour votre confiance !',
      terms: 'Paiement à 30 jours. Pénalités de retard : 1,5% par mois de retard.'
    }

    // Récupérer les informations de l'entreprise
    let companyInfo
    try {
      const settings = await getCompanySettings()
      companyInfo = formatCompanySettingsForPDF(settings)
    } catch (error) {
      console.error('Error fetching company settings:', error)
      companyInfo = {
        name: 'Votre Entreprise',
        address: 'Votre Adresse\nVotre Ville\nMaroc',
        phone: '+212 XXX XXX XXX',
        email: 'contact@votre-entreprise.com',
        ice: 'XXXXXXXXXXXXXXXXX',
        taxId: 'IFXXXXXXXXX',
        website: 'www.votre-entreprise.com',
        logo: undefined
      }
    }

    // Générer le PDF avec les paramètres de design personnalisés
    const pdfDoc = await generateManualInvoicePDF(
      previewInvoiceData, 
      companyInfo,
      designSettings // Passer les paramètres de design
    )
    
    const pdfBuffer = pdfDoc.output('arraybuffer')

    // Retourner le PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="apercu-facture-design.pdf"',
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    })

  } catch (error) {
    console.error('Error generating invoice preview:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération de l\'aperçu',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

// GET - Générer un aperçu avec les paramètres actuels
export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Récupérer les paramètres de design actuels
    const settings = await getCompanySettings()
    
    const designSettings = {
      invoiceTheme: settings.invoiceTheme || 'modern',
      primaryColor: settings.primaryColor || '#2563EB',
      secondaryColor: settings.secondaryColor || '#10B981',
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
      watermarkText: settings.watermarkText || '',
      customCSS: settings.customCSS || ''
    }

    // Données de test pour l'aperçu
    const previewInvoiceData = {
      invoiceNumber: 'APERCU-ACTUEL',
      type: 'INVOICE' as const,
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      customer: {
        name: 'Client Actuel SARL',
        company: 'Actuel Company',
        email: 'client@actuel.com',
        phone: '0522 987 654',
        address: '456 Boulevard Hassan II\nRabat 10000\nMaroc',
        taxId: 'IF987654321'
      },
      items: [
        {
          productName: 'Design Personnalisé',
          productSku: 'DESIGN-001',
          description: 'Aperçu avec vos paramètres actuels',
          quantity: 1,
          unitPrice: 1000.00,
          discountAmount: 0,
          total: 1000.00
        }
      ],
      subtotal: 1000.00,
      discountAmount: 0,
      taxRate: 20,
      taxAmount: 200.00,
      total: 1200.00,
      notes: 'Aperçu généré avec vos paramètres de design actuels.',
      terms: 'Conditions de paiement standard.'
    }

    // Récupérer les informations de l'entreprise
    const companyInfo = formatCompanySettingsForPDF(settings)

    // Générer le PDF
    const pdfDoc = await generateManualInvoicePDF(
      previewInvoiceData, 
      companyInfo,
      designSettings
    )
    
    const pdfBuffer = pdfDoc.output('arraybuffer')

    // Retourner le PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="apercu-design-actuel.pdf"',
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    })

  } catch (error) {
    console.error('Error generating current design preview:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération de l\'aperçu',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
