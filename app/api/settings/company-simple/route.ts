import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Version simplifiée de l'API company settings pour diagnostic
export async function GET() {
  try {
    // Étape 1: Vérifier la session
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Étape 2: Essayer de récupérer les paramètres
    let settings = await prisma.companySettings.findFirst()
    
    // Étape 3: Si aucun paramètre n'existe, retourner des valeurs par défaut statiques
    if (!settings) {
      return NextResponse.json({
        id: 'default',
        companyName: 'Mon Entreprise',
        companyLogo: null,
        companyICE: null,
        companyEmail: null,
        companyPhone: null,
        companyAddress: null,
        companyWebsite: null,
        companyTaxId: null,
        invoicePrefix: 'FAC',
        creditNotePrefix: 'FAV',
        defaultTaxRate: 20,
        bankName: null,
        bankAccount: null,
        bankRIB: null,
        legalMentions: null,
        // Paramètres de design par défaut
        invoiceTheme: 'modern',
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
        // Paramètres spécifiques aux devis
        quoteTheme: 'modern',
        showValidityPeriod: true,
        validityPeriodText: 'Ce devis est valable 30 jours à compter de la date d\'émission.',
        showTermsAndConditions: true,
        termsAndConditionsText: 'Conditions générales de vente disponibles sur demande.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Simple company settings error:', error)
    
    // En cas d'erreur, retourner quand même des paramètres par défaut
    return NextResponse.json({
      error: 'Erreur lors de la récupération des paramètres',
      fallback: true,
      details: error.message,
      defaultSettings: {
        id: 'fallback',
        companyName: 'Mon Entreprise',
        invoicePrefix: 'FAC',
        creditNotePrefix: 'FAV',
        defaultTaxRate: 20,
        invoiceTheme: 'modern',
        primaryColor: '#2563EB',
        secondaryColor: '#10B981',
        quoteTheme: 'modern',
        showValidityPeriod: true,
        validityPeriodText: 'Ce devis est valable 30 jours à compter de la date d\'émission.',
        showTermsAndConditions: true,
        termsAndConditionsText: 'Conditions générales de vente disponibles sur demande.'
      }
    }, { status: 200 }) // Retourner 200 même en cas d'erreur pour éviter le crash
  }
}

// PUT simplifié - juste pour tester
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    
    // Essayer de mettre à jour ou créer
    const existingSettings = await prisma.companySettings.findFirst()
    
    let settings
    if (existingSettings) {
      settings = await prisma.companySettings.update({
        where: { id: existingSettings.id },
        data: {
          companyName: body.companyName || 'Mon Entreprise',
          invoicePrefix: body.invoicePrefix || 'FAC',
          creditNotePrefix: body.creditNotePrefix || 'FAV',
          defaultTaxRate: body.defaultTaxRate || 20
        }
      })
    } else {
      settings = await prisma.companySettings.create({
        data: {
          companyName: body.companyName || 'Mon Entreprise',
          invoicePrefix: body.invoicePrefix || 'FAC',
          creditNotePrefix: body.creditNotePrefix || 'FAV',
          defaultTaxRate: body.defaultTaxRate || 20,
          // Valeurs par défaut minimales
          invoiceTheme: 'modern',
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
          quoteTheme: 'modern',
          showValidityPeriod: true,
          validityPeriodText: 'Ce devis est valable 30 jours à compter de la date d\'émission.',
          showTermsAndConditions: true,
          termsAndConditionsText: 'Conditions générales de vente disponibles sur demande.'
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Simple company settings PUT error:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la mise à jour des paramètres',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
