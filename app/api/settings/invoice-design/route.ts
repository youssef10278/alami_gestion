import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Fonction pour normaliser les couleurs hexadécimales
const normalizeHexColor = (color: string): string => {
  if (!color) return '#000000'

  // Supprimer les espaces
  color = color.trim()

  // Ajouter # si manquant
  if (!color.startsWith('#')) {
    color = '#' + color
  }

  // Convertir 3 caractères en 6 caractères (#RGB -> #RRGGBB)
  if (color.length === 4) {
    color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3]
  }

  // Vérifier le format final
  if (!/^#[0-9A-F]{6}$/i.test(color)) {
    return '#000000' // Couleur par défaut si invalide
  }

  return color.toUpperCase()
}

const invoiceDesignSchema = z.object({
  invoiceTheme: z.string().default('modern'),
  primaryColor: z.string().transform(normalizeHexColor).default('#2563EB'),
  secondaryColor: z.string().transform(normalizeHexColor).default('#10B981'),
  tableHeaderColor: z.string().transform(normalizeHexColor).default('#10B981'),
  sectionColor: z.string().transform(normalizeHexColor).default('#10B981'),
  accentColor: z.string().transform(normalizeHexColor).default('#F59E0B'),
  textColor: z.string().transform(normalizeHexColor).default('#1F2937'),
  headerTextColor: z.string().transform(normalizeHexColor).default('#FFFFFF'),
  sectionTextColor: z.string().transform(normalizeHexColor).default('#FFFFFF'),
  backgroundColor: z.string().transform(normalizeHexColor).default('#FFFFFF'),
  headerStyle: z.enum(['gradient', 'solid', 'minimal']).default('gradient'),
  logoPosition: z.enum(['left', 'center', 'right']).default('left'),
  logoSize: z.enum(['small', 'medium', 'large']).default('medium'),
  fontFamily: z.enum(['helvetica', 'times', 'courier']).default('helvetica'),
  fontSize: z.enum(['small', 'normal', 'large']).default('normal'),
  borderRadius: z.enum(['none', 'rounded', 'full']).default('rounded'),
  showWatermark: z.boolean().default(false),
  watermarkText: z.string().nullable().optional().transform(val => val === null ? undefined : val),
  customCSS: z.string().nullable().optional().transform(val => val === null ? undefined : val),
})

// GET - Récupérer les paramètres de design
export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Récupérer les paramètres de l'entreprise
    const settings = await prisma.companySettings.findFirst()
    
    if (!settings) {
      // Retourner les paramètres par défaut
      return NextResponse.json({
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
        watermarkText: '',
        customCSS: ''
      })
    }

    // Retourner les paramètres de design
    return NextResponse.json({
      invoiceTheme: settings.invoiceTheme,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      tableHeaderColor: settings.tableHeaderColor || settings.secondaryColor,
      sectionColor: settings.sectionColor || settings.secondaryColor,
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
      customCSS: settings.customCSS
    })

  } catch (error) {
    console.error('Error fetching invoice design settings:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour les paramètres de design
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    console.log('📥 Données reçues:', JSON.stringify(body, null, 2))

    const validationResult = invoiceDesignSchema.safeParse(body)

    if (!validationResult.success) {
      console.error('❌ Erreur de validation:', validationResult.error.issues)
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            received: err.code === 'invalid_type' ? typeof body[err.path[0]] : body[err.path[0]]
          })),
          receivedData: body
        },
        { status: 400 }
      )
    }

    console.log('✅ Données validées:', JSON.stringify(validationResult.data, null, 2))

    const validatedData = validationResult.data

    // Vérifier s'il existe déjà des paramètres
    const existingSettings = await prisma.companySettings.findFirst()

    let settings
    if (existingSettings) {
      // Mettre à jour les paramètres existants
      settings = await prisma.companySettings.update({
        where: { id: existingSettings.id },
        data: {
          invoiceTheme: validatedData.invoiceTheme,
          primaryColor: validatedData.primaryColor,
          secondaryColor: validatedData.secondaryColor,
          tableHeaderColor: validatedData.tableHeaderColor,
          sectionColor: validatedData.sectionColor,
          accentColor: validatedData.accentColor,
          textColor: validatedData.textColor,
          headerTextColor: validatedData.headerTextColor,
          sectionTextColor: validatedData.sectionTextColor,
          backgroundColor: validatedData.backgroundColor,
          headerStyle: validatedData.headerStyle,
          logoPosition: validatedData.logoPosition,
          logoSize: validatedData.logoSize,
          fontFamily: validatedData.fontFamily,
          fontSize: validatedData.fontSize,
          borderRadius: validatedData.borderRadius,
          showWatermark: validatedData.showWatermark,
          watermarkText: validatedData.watermarkText || null,
          customCSS: validatedData.customCSS || null,
        }
      })
    } else {
      // Créer de nouveaux paramètres avec les valeurs de design
      settings = await prisma.companySettings.create({
        data: {
          companyName: 'Mon Entreprise',
          invoicePrefix: 'FAC',
          creditNotePrefix: 'FAV',
          defaultTaxRate: 20,
          invoiceTheme: validatedData.invoiceTheme,
          primaryColor: validatedData.primaryColor,
          secondaryColor: validatedData.secondaryColor,
          tableHeaderColor: validatedData.tableHeaderColor,
          sectionColor: validatedData.sectionColor,
          accentColor: validatedData.accentColor,
          textColor: validatedData.textColor,
          headerTextColor: validatedData.headerTextColor,
          sectionTextColor: validatedData.sectionTextColor,
          backgroundColor: validatedData.backgroundColor,
          headerStyle: validatedData.headerStyle,
          logoPosition: validatedData.logoPosition,
          logoSize: validatedData.logoSize,
          fontFamily: validatedData.fontFamily,
          fontSize: validatedData.fontSize,
          borderRadius: validatedData.borderRadius,
          showWatermark: validatedData.showWatermark,
          watermarkText: validatedData.watermarkText || null,
          customCSS: validatedData.customCSS || null,
        }
      })
    }

    return NextResponse.json({
      message: 'Paramètres de design sauvegardés avec succès',
      settings: {
        invoiceTheme: settings.invoiceTheme,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        tableHeaderColor: settings.tableHeaderColor || settings.secondaryColor,
        sectionColor: settings.sectionColor || settings.secondaryColor,
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
        customCSS: settings.customCSS
      }
    })

  } catch (error) {
    console.error('Error saving invoice design settings:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde des paramètres' },
      { status: 500 }
    )
  }
}

// DELETE - Réinitialiser aux paramètres par défaut
export async function DELETE() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Réinitialiser aux valeurs par défaut
    const existingSettings = await prisma.companySettings.findFirst()
    
    if (existingSettings) {
      await prisma.companySettings.update({
        where: { id: existingSettings.id },
        data: {
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
          watermarkText: null,
          customCSS: null,
        }
      })
    }

    return NextResponse.json({
      message: 'Paramètres réinitialisés aux valeurs par défaut'
    })

  } catch (error) {
    console.error('Error resetting invoice design settings:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation' },
      { status: 500 }
    )
  }
}
