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
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Récupérer les paramètres ou créer des paramètres par défaut
    let settings = await prisma.companySettings.findFirst()
    
    if (!settings) {
      // Créer des paramètres par défaut
      settings = await prisma.companySettings.create({
        data: {
          companyName: 'Mon Entreprise',
          invoicePrefix: 'FAC',
          creditNotePrefix: 'FAV',
          defaultTaxRate: 20,
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching company settings:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    )
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
      // Créer de nouveaux paramètres
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
