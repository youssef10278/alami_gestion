import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validation pour les paramètres de l'entreprise
const companySettingsSchema = z.object({
  companyName: z.string().min(1, 'Le nom de l\'entreprise est requis'),
  companyLogo: z.string().optional(),
  companyICE: z.string().optional(),
  companyEmail: z.string().optional().refine((email) => !email || z.string().email().safeParse(email).success, {
    message: "Format d'email invalide"
  }),
  companyPhone: z.string().optional(),
  companyAddress: z.string().optional(),
  companyWebsite: z.string().optional().refine((url) => !url || z.string().url().safeParse(url).success, {
    message: "Format d'URL invalide"
  }),
  companyTaxId: z.string().optional(),
  invoicePrefix: z.string().min(1, 'Le préfixe de facture est requis').default('FAC'),
  creditNotePrefix: z.string().min(1, 'Le préfixe de facture d\'avoir est requis').default('FAV'),
  defaultTaxRate: z.coerce.number().min(0).max(100).default(20),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankRIB: z.string().optional(),
  legalMentions: z.string().optional(),
})

// GET - Récupérer les paramètres de l'entreprise
export async function GET() {
  try {
    console.log('🔍 GET /api/settings/company - Début')

    // Vérifier la session
    const session = await getSession()
    console.log('👤 Session:', session ? `User ${session.userId} (${session.role})` : 'Aucune session')

    if (!session) {
      console.log('❌ Pas de session - Non authentifié')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Permettre l'accès aux OWNER et SELLER (lecture seule pour SELLER)
    if (session.role !== 'OWNER' && session.role !== 'SELLER') {
      console.log('❌ Rôle non autorisé:', session.role)
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    console.log('✅ Authentification OK - Récupération des paramètres...')

    // Récupérer les paramètres ou créer des paramètres par défaut
    let settings = await prisma.companySettings.findFirst()

    if (!settings) {
      console.log('⚠️ Aucun paramètre trouvé - Création des paramètres par défaut...')

      try {
        // Créer des paramètres par défaut avec tous les champs requis
        settings = await prisma.companySettings.create({
          data: {
            companyName: 'Mon Entreprise',
            invoicePrefix: 'FAC',
            creditNotePrefix: 'FAV',
            defaultTaxRate: 20,
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
            termsAndConditionsText: 'Conditions générales de vente disponibles sur demande.'
          }
        })
        console.log('✅ Paramètres par défaut créés avec succès')
      } catch (createError: any) {
        console.error('❌ Erreur lors de la création des paramètres:', createError)

        // Retourner des paramètres par défaut en mémoire si la création échoue
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
          termsAndConditionsText: 'Conditions générales de vente disponibles sur demande.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _isDefault: true
        })
      }
    } else {
      console.log('✅ Paramètres trouvés:', settings.id)
    }

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('❌ Error fetching company settings:', error)
    console.error('Stack:', error.stack)

    // Retourner des paramètres par défaut même en cas d'erreur
    return NextResponse.json({
      id: 'fallback',
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
      termsAndConditionsText: 'Conditions générales de vente disponibles sur demande.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _isFallback: true,
      _error: error.message
    })
  }
}

// PUT - Mettre à jour les paramètres de l'entreprise
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const validationResult = companySettingsSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data

    // Vérifier s'il existe déjà des paramètres
    const existingSettings = await prisma.companySettings.findFirst()

    let settings
    if (existingSettings) {
      // Mettre à jour les paramètres existants
      settings = await prisma.companySettings.update({
        where: { id: existingSettings.id },
        data: {
          companyName: validatedData.companyName,
          companyLogo: validatedData.companyLogo || null,
          companyICE: validatedData.companyICE || null,
          companyEmail: validatedData.companyEmail || null,
          companyPhone: validatedData.companyPhone || null,
          companyAddress: validatedData.companyAddress || null,
          companyWebsite: validatedData.companyWebsite || null,
          companyTaxId: validatedData.companyTaxId || null,
          invoicePrefix: validatedData.invoicePrefix,
          creditNotePrefix: validatedData.creditNotePrefix,
          defaultTaxRate: validatedData.defaultTaxRate,
          bankName: validatedData.bankName || null,
          bankAccount: validatedData.bankAccount || null,
          bankRIB: validatedData.bankRIB || null,
          legalMentions: validatedData.legalMentions || null,
        }
      })
    } else {
      // Créer de nouveaux paramètres avec tous les champs requis
      settings = await prisma.companySettings.create({
        data: {
          companyName: validatedData.companyName,
          companyLogo: validatedData.companyLogo || null,
          companyICE: validatedData.companyICE || null,
          companyEmail: validatedData.companyEmail || null,
          companyPhone: validatedData.companyPhone || null,
          companyAddress: validatedData.companyAddress || null,
          companyWebsite: validatedData.companyWebsite || null,
          companyTaxId: validatedData.companyTaxId || null,
          invoicePrefix: validatedData.invoicePrefix,
          creditNotePrefix: validatedData.creditNotePrefix,
          defaultTaxRate: validatedData.defaultTaxRate,
          bankName: validatedData.bankName || null,
          bankAccount: validatedData.bankAccount || null,
          bankRIB: validatedData.bankRIB || null,
          legalMentions: validatedData.legalMentions || null,
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
          termsAndConditionsText: 'Conditions générales de vente disponibles sur demande.'
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating company settings:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    )
  }
}
