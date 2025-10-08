import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Route de diagnostic pour identifier le problème avec l'API company settings
export async function GET(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    step: 'START',
    success: false,
    error: null,
    details: {}
  }

  try {
    // ÉTAPE 1: Vérifier la session
    diagnostics.step = 'SESSION_CHECK'
    const session = await getSession()
    diagnostics.details.session = {
      exists: !!session,
      userId: session?.userId || null,
      role: session?.role || null
    }

    if (!session) {
      diagnostics.details.session.error = 'No session found'
      return NextResponse.json(diagnostics, { status: 200 })
    }

    // ÉTAPE 2: Vérifier la connexion Prisma
    diagnostics.step = 'PRISMA_CONNECTION'
    try {
      await prisma.$connect()
      diagnostics.details.prisma = { connected: true }
    } catch (error: any) {
      diagnostics.details.prisma = { 
        connected: false, 
        error: error.message 
      }
      return NextResponse.json(diagnostics, { status: 200 })
    }

    // ÉTAPE 3: Vérifier l'existence de la table CompanySettings
    diagnostics.step = 'TABLE_CHECK'
    try {
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'company_settings'
        );
      `
      diagnostics.details.table = { 
        exists: tableExists,
        name: 'company_settings'
      }
    } catch (error: any) {
      diagnostics.details.table = { 
        exists: false, 
        error: error.message 
      }
    }

    // ÉTAPE 4: Vérifier les colonnes de la table
    diagnostics.step = 'COLUMNS_CHECK'
    try {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'company_settings'
        ORDER BY ordinal_position;
      `
      diagnostics.details.columns = columns
    } catch (error: any) {
      diagnostics.details.columns = { 
        error: error.message 
      }
    }

    // ÉTAPE 5: Compter les enregistrements
    diagnostics.step = 'COUNT_RECORDS'
    try {
      const count = await prisma.companySettings.count()
      diagnostics.details.records = { count }
    } catch (error: any) {
      diagnostics.details.records = { 
        count: 0, 
        error: error.message 
      }
    }

    // ÉTAPE 6: Essayer de récupérer un enregistrement
    diagnostics.step = 'FETCH_RECORD'
    try {
      const settings = await prisma.companySettings.findFirst()
      diagnostics.details.fetch = { 
        success: true, 
        hasRecord: !!settings,
        recordId: settings?.id || null
      }
    } catch (error: any) {
      diagnostics.details.fetch = { 
        success: false, 
        error: error.message 
      }
    }

    // ÉTAPE 7: Essayer de créer un enregistrement minimal
    diagnostics.step = 'CREATE_MINIMAL'
    try {
      // Vérifier d'abord s'il y a déjà un enregistrement
      const existingCount = await prisma.companySettings.count()
      
      if (existingCount === 0) {
        const newSettings = await prisma.companySettings.create({
          data: {
            companyName: 'Test Company',
            invoicePrefix: 'FAC',
            creditNotePrefix: 'FAV',
            defaultTaxRate: 20
          }
        })
        diagnostics.details.create = { 
          success: true, 
          recordId: newSettings.id 
        }
      } else {
        diagnostics.details.create = { 
          skipped: true, 
          reason: 'Record already exists' 
        }
      }
    } catch (error: any) {
      diagnostics.details.create = { 
        success: false, 
        error: error.message 
      }
    }

    // ÉTAPE 8: Test final - récupération complète
    diagnostics.step = 'FINAL_TEST'
    try {
      const finalSettings = await prisma.companySettings.findFirst()
      diagnostics.details.finalTest = { 
        success: true, 
        hasRecord: !!finalSettings 
      }
      diagnostics.success = true
    } catch (error: any) {
      diagnostics.details.finalTest = { 
        success: false, 
        error: error.message 
      }
    }

    diagnostics.step = 'COMPLETED'
    return NextResponse.json(diagnostics, { status: 200 })

  } catch (error: any) {
    diagnostics.error = error.message
    diagnostics.details.globalError = {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
    
    return NextResponse.json(diagnostics, { status: 200 })
  } finally {
    try {
      await prisma.$disconnect()
    } catch (error) {
      // Ignore disconnect errors
    }
  }
}

// POST - Forcer la création des paramètres par défaut
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Supprimer tous les enregistrements existants
    await prisma.companySettings.deleteMany()

    // Créer un nouvel enregistrement avec TOUS les champs
    const settings = await prisma.companySettings.create({
      data: {
        companyName: 'Mon Entreprise',
        invoicePrefix: 'FAC',
        creditNotePrefix: 'FAV',
        defaultTaxRate: 20,
        // Tous les champs de design
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
        // Champs spécifiques aux devis
        quoteTheme: 'modern',
        showValidityPeriod: true,
        validityPeriodText: 'Ce devis est valable 30 jours à compter de la date d\'émission.',
        showTermsAndConditions: true,
        termsAndConditionsText: 'Conditions générales de vente disponibles sur demande.'
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Paramètres créés avec succès',
      settings 
    })

  } catch (error: any) {
    console.error('Force create error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        name: error.name,
        stack: error.stack
      }
    }, { status: 500 })
  }
}
