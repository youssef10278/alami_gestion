import { NextRequest, NextResponse } from 'next/server'
import { generateManualInvoicePDF } from '@/lib/pdf-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { logoUrl } = body

    // Données de test pour la facture
    const testInvoiceData = {
      invoiceNumber: 'TEST-LOGO-001',
      type: 'INVOICE' as const,
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      customer: {
        name: 'Client Test Logo',
        company: 'Test Company SARL',
        email: 'test@example.com',
        phone: '0522123456',
        address: 'Rue de test\nCasablanca 20000\nMaroc',
        taxId: 'IF123456789'
      },
      items: [
        {
          productName: 'Produit Test',
          productSku: 'TEST-001',
          description: 'Produit pour tester le logo',
          quantity: 1,
          unitPrice: 100.00,
          discountAmount: 0,
          total: 100.00
        }
      ],
      subtotal: 100.00,
      discountAmount: 0,
      taxRate: 20,
      taxAmount: 20.00,
      total: 120.00,
      notes: 'Test du logo dans la facture PDF',
      terms: 'Conditions de test'
    }

    // Informations de l'entreprise avec le logo
    const companyInfo = {
      name: 'Société Test Logo',
      address: 'Adresse de test\nVille de test\nMaroc',
      phone: '+212 522 123 456',
      email: 'contact@test.com',
      ice: '1234567890123',
      taxId: 'IF123456789',
      website: 'www.test.com',
      logo: logoUrl || '/uploads/logos/default-logo.png' // Utiliser le logo fourni ou un logo par défaut
    }

    console.log('Generating PDF with logo:', companyInfo.logo)

    // Générer le PDF
    const pdfDoc = await generateManualInvoicePDF(testInvoiceData, companyInfo)
    const pdfBuffer = pdfDoc.output('arraybuffer')

    // Retourner le PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test-logo-facture.pdf"',
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    })

  } catch (error) {
    console.error('Error generating test PDF with logo:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération du PDF de test',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

// GET - Générer un PDF de test avec logo par défaut
export async function GET() {
  try {
    // Données de test pour la facture
    const testInvoiceData = {
      invoiceNumber: 'TEST-LOGO-DEFAULT',
      type: 'INVOICE' as const,
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      customer: {
        name: 'Client Test Logo',
        company: 'Test Company SARL',
        email: 'test@example.com',
        phone: '0522123456',
        address: 'Rue de test\nCasablanca 20000\nMaroc',
        taxId: 'IF123456789'
      },
      items: [
        {
          productName: 'Produit Test Logo',
          productSku: 'TEST-LOGO-001',
          description: 'Test d\'affichage du logo',
          quantity: 2,
          unitPrice: 150.00,
          discountAmount: 10.00,
          total: 290.00
        }
      ],
      subtotal: 300.00,
      discountAmount: 10.00,
      taxRate: 20,
      taxAmount: 58.00,
      total: 348.00,
      notes: 'Test du système de logo dans les factures PDF',
      terms: 'Paiement à 30 jours'
    }

    // Informations de l'entreprise avec logo de test
    const companyInfo = {
      name: 'Alami Gestion SARL',
      address: 'Avenue Mohammed V\nCasablanca 20000\nMaroc',
      phone: '+212 522 123 456',
      email: 'contact@alami-gestion.com',
      ice: '1234567890123',
      taxId: 'IF123456789',
      website: 'www.alami-gestion.com',
      logo: 'https://via.placeholder.com/100x100/4DA6FF/FFFFFF?text=AG' // Logo de test
    }

    console.log('Generating default test PDF with logo:', companyInfo.logo)

    // Générer le PDF
    const pdfDoc = await generateManualInvoicePDF(testInvoiceData, companyInfo)
    const pdfBuffer = pdfDoc.output('arraybuffer')

    // Retourner le PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test-logo-default.pdf"',
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    })

  } catch (error) {
    console.error('Error generating default test PDF:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération du PDF de test par défaut',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
