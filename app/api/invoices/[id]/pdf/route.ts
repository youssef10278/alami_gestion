import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateManualInvoicePDF } from '@/lib/pdf-generator'
import { getCompanySettings } from '@/lib/company-settings'

// GET - Générer le PDF d'une facture
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { id: invoiceId } = await params

    // Récupérer la facture avec toutes ses relations
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        originalInvoice: {
          select: {
            id: true,
            invoiceNumber: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })
    }

    // Préparer les données pour le générateur PDF
    const pdfData = {
      invoiceNumber: invoice.invoiceNumber,
      type: invoice.type,
      date: invoice.createdAt,
      dueDate: invoice.dueDate,
      customer: {
        name: invoice.customerName,
        phone: invoice.customerPhone,
        email: invoice.customerEmail,
        address: invoice.customerAddress,
        taxId: invoice.customerTaxId,
      },
      items: invoice.items.map(item => ({
        productName: item.productName,
        productSku: item.productSku,
        description: item.description,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        discountAmount: Number(item.discountAmount),
        total: Number(item.total),
      })),
      subtotal: Number(invoice.subtotal),
      discountAmount: Number(invoice.discountAmount),
      taxRate: Number(invoice.taxRate),
      taxAmount: Number(invoice.taxAmount),
      total: Number(invoice.total),
      notes: invoice.notes,
      terms: invoice.terms,
      originalInvoice: invoice.originalInvoice ? {
        invoiceNumber: invoice.originalInvoice.invoiceNumber,
      } : undefined,
    }

    // Récupérer les paramètres de l'entreprise et de design
    let companyInfo
    let designSettings
    try {
      const settings = await getCompanySettings()

      // Informations de l'entreprise
      companyInfo = {
        name: settings.companyName || 'Mon Entreprise',
        address: settings.companyAddress || 'Adresse non définie',
        phone: settings.companyPhone || 'Téléphone non défini',
        email: settings.companyEmail || 'Email non défini',
        ice: settings.companyICE || 'ICE non défini',
        taxId: settings.companyTaxId || 'ID fiscal non défini',
        website: settings.companyWebsite || '',
        logo: settings.companyLogo || undefined
      }

      // Paramètres de design
      designSettings = {
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

      console.log('🎨 Paramètres de design appliqués:', JSON.stringify(designSettings, null, 2))
    } catch (error) {
      console.error('Error fetching settings:', error)
      companyInfo = undefined
      designSettings = undefined
    }

    // Générer le PDF avec les paramètres de design
    const pdfDoc = await generateManualInvoicePDF(pdfData, companyInfo, designSettings)

    // Retourner le PDF
    const pdfBuffer = pdfDoc.output('arraybuffer')
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    )
  }
}