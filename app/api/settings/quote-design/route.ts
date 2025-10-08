import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Récupérer les paramètres de design du devis
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer les paramètres de l'entreprise (qui incluent les paramètres de design)
    const companySettings = await prisma.companySettings.findFirst()

    if (!companySettings) {
      // Retourner les paramètres par défaut si aucun n'existe
      return NextResponse.json({
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
        fontFamily: 'Inter',
        fontSize: 'medium',
        borderRadius: 'medium',
        showWatermark: false,
        watermarkText: 'DEVIS',
        customCSS: '',
        showValidityPeriod: true,
        validityPeriodText: 'Ce devis est valable 30 jours à compter de la date d\'émission.',
        showTermsAndConditions: true,
        termsAndConditionsText: 'Conditions générales de vente disponibles sur demande.'
      })
    }

    // Extraire les paramètres de design du devis
    const designSettings = {
      quoteTheme: companySettings.quoteTheme,
      primaryColor: companySettings.primaryColor,
      secondaryColor: companySettings.secondaryColor,
      tableHeaderColor: companySettings.tableHeaderColor,
      sectionColor: companySettings.sectionColor,
      accentColor: companySettings.accentColor,
      textColor: companySettings.textColor,
      headerTextColor: companySettings.headerTextColor,
      sectionTextColor: companySettings.sectionTextColor,
      backgroundColor: companySettings.backgroundColor,
      headerStyle: companySettings.headerStyle,
      logoPosition: companySettings.logoPosition,
      logoSize: companySettings.logoSize,
      fontFamily: companySettings.fontFamily,
      fontSize: companySettings.fontSize,
      borderRadius: companySettings.borderRadius,
      showWatermark: companySettings.showWatermark,
      watermarkText: companySettings.watermarkText,
      customCSS: companySettings.customCSS,
      showValidityPeriod: companySettings.showValidityPeriod,
      validityPeriodText: companySettings.validityPeriodText,
      showTermsAndConditions: companySettings.showTermsAndConditions,
      termsAndConditionsText: companySettings.termsAndConditionsText
    }

    return NextResponse.json(designSettings)
  } catch (error) {
    console.error('Get quote design settings error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    )
  }
}

// POST - Sauvegarder les paramètres de design du devis
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Seuls les propriétaires peuvent modifier les paramètres
    if (session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const settings = await request.json()

    // Vérifier si des paramètres d'entreprise existent déjà
    const existingSettings = await prisma.companySettings.findFirst()

    if (existingSettings) {
      // Mettre à jour les paramètres existants
      await prisma.companySettings.update({
        where: { id: existingSettings.id },
        data: {
          quoteTheme: settings.quoteTheme,
          primaryColor: settings.primaryColor,
          secondaryColor: settings.secondaryColor,
          tableHeaderColor: settings.tableHeaderColor,
          sectionColor: settings.sectionColor,
          accentColor: settings.accentColor,
          textColor: settings.textColor,
          headerTextColor: settings.headerTextColor,
          sectionTextColor: settings.sectionTextColor,
          backgroundColor: settings.backgroundColor,
          headerStyle: settings.headerStyle,
          logoPosition: settings.logoPosition,
          logoSize: settings.logoSize,
          fontFamily: settings.fontFamily,
          fontSize: settings.fontSize,
          borderRadius: settings.borderRadius,
          showWatermark: settings.showWatermark,
          watermarkText: settings.watermarkText,
          customCSS: settings.customCSS,
          showValidityPeriod: settings.showValidityPeriod,
          validityPeriodText: settings.validityPeriodText,
          showTermsAndConditions: settings.showTermsAndConditions,
          termsAndConditionsText: settings.termsAndConditionsText,
          updatedAt: new Date()
        }
      })
    } else {
      // Créer de nouveaux paramètres
      await prisma.companySettings.create({
        data: {
          quoteTheme: settings.quoteTheme || 'modern',
          primaryColor: settings.primaryColor || '#2563EB',
          secondaryColor: settings.secondaryColor || '#10B981',
          tableHeaderColor: settings.tableHeaderColor || '#10B981',
          sectionColor: settings.sectionColor || '#10B981',
          accentColor: settings.accentColor || '#F59E0B',
          textColor: settings.textColor || '#1F2937',
          headerTextColor: settings.headerTextColor || '#FFFFFF',
          sectionTextColor: settings.sectionTextColor || '#FFFFFF',
          backgroundColor: settings.backgroundColor || '#FFFFFF',
          headerStyle: settings.headerStyle || 'gradient',
          logoPosition: settings.logoPosition || 'left',
          logoSize: settings.logoSize || 'medium',
          fontFamily: settings.fontFamily || 'Inter',
          fontSize: settings.fontSize || 'medium',
          borderRadius: settings.borderRadius || 'medium',
          showWatermark: settings.showWatermark || false,
          watermarkText: settings.watermarkText || 'DEVIS',
          customCSS: settings.customCSS || '',
          showValidityPeriod: settings.showValidityPeriod ?? true,
          validityPeriodText: settings.validityPeriodText || 'Ce devis est valable 30 jours à compter de la date d\'émission.',
          showTermsAndConditions: settings.showTermsAndConditions ?? true,
          termsAndConditionsText: settings.termsAndConditionsText || 'Conditions générales de vente disponibles sur demande.'
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Paramètres de design du devis sauvegardés'
    })
  } catch (error) {
    console.error('Save quote design settings error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde des paramètres' },
      { status: 500 }
    )
  }
}

// DELETE - Réinitialiser les paramètres de design du devis
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Seuls les propriétaires peuvent réinitialiser les paramètres
    if (session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Réinitialiser les paramètres de design du devis aux valeurs par défaut
    const existingSettings = await prisma.companySettings.findFirst()

    if (existingSettings) {
      await prisma.companySettings.update({
        where: { id: existingSettings.id },
        data: {
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
          fontFamily: 'Inter',
          fontSize: 'medium',
          borderRadius: 'medium',
          showWatermark: false,
          watermarkText: 'DEVIS',
          customCSS: '',
          showValidityPeriod: true,
          validityPeriodText: 'Ce devis est valable 30 jours à compter de la date d\'émission.',
          showTermsAndConditions: true,
          termsAndConditionsText: 'Conditions générales de vente disponibles sur demande.',
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Paramètres de design du devis réinitialisés'
    })
  } catch (error) {
    console.error('Reset quote design settings error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation des paramètres' },
      { status: 500 }
    )
  }
}
