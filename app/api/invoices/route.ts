import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validation pour la création d'une facture
const createInvoiceSchema = z.object({
  type: z.enum(['INVOICE', 'CREDIT_NOTE']).default('INVOICE'),
  invoiceNumber: z.string().optional(), // Optionnel, généré automatiquement si non fourni
  customerId: z.string().optional().nullable(),
  customerName: z.string().min(1, 'Le nom du client est requis'),
  customerPhone: z.string().optional().nullable().transform(val => val === '' ? null : val),
  customerEmail: z.string().optional().nullable().transform(val => val === '' ? null : val).refine((email) => !email || z.string().email().safeParse(email).success, {
    message: "Format d'email invalide"
  }),
  customerAddress: z.string().optional().nullable().transform(val => val === '' ? null : val),
  customerTaxId: z.string().optional().nullable().transform(val => val === '' ? null : val),
  originalInvoiceId: z.string().optional().nullable(), // Pour les factures d'avoir
  subtotal: z.coerce.number().min(0),
  discountAmount: z.coerce.number().min(0).default(0),
  taxRate: z.coerce.number().min(0).max(100).default(20),
  taxAmount: z.coerce.number().min(0).default(0),
  total: z.coerce.number().min(0),
  notes: z.string().optional().nullable().transform(val => val === '' ? null : val),
  terms: z.string().optional().nullable().transform(val => val === '' ? null : val),
  dueDate: z.string().optional().nullable().transform(val => val === '' ? null : val), // ISO date string
  items: z.array(z.object({
    productId: z.string().optional().nullable().transform(val => val === '' ? null : val),
    productName: z.string().min(1, 'Le nom du produit est requis'),
    productSku: z.string().optional().nullable().transform(val => val === '' ? null : val),
    description: z.string().optional().nullable().transform(val => val === '' ? null : val),
    quantity: z.coerce.number().int().min(1, 'La quantité doit être au moins 1'),
    unitPrice: z.coerce.number().min(0, 'Le prix unitaire doit être positif'),
    discountAmount: z.coerce.number().min(0).default(0),
    total: z.coerce.number().min(0, 'Le total doit être positif'),
  })).min(1, 'Au moins un article est requis'),
})

// GET - Liste des factures avec pagination et filtres
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') // 'INVOICE' ou 'CREDIT_NOTE'
    const customerId = searchParams.get('customerId')

    const skip = (page - 1) * limit

    // Construire les filtres
    const where: any = {}

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (type) {
      where.type = type
    }

    if (customerId) {
      where.customerId = customerId
    }

    // Récupérer les factures avec pagination
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              company: true,
              email: true,
            },
          },
          originalInvoice: {
            select: {
              id: true,
              invoiceNumber: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
          _count: {
            select: {
              creditNotes: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ])

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des factures' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle facture
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    console.log('=== INVOICE CREATION DEBUG ===')
    console.log('Received invoice data:', JSON.stringify(body, null, 2))
    console.log('Data types:')
    console.log('- customerName:', typeof body.customerName, '=', body.customerName)
    console.log('- items length:', Array.isArray(body.items) ? body.items.length : 'not array')
    console.log('- subtotal:', typeof body.subtotal, '=', body.subtotal)
    console.log('- total:', typeof body.total, '=', body.total)

    const validationResult = createInvoiceSchema.safeParse(body)
    if (!validationResult.success) {
      console.log('❌ VALIDATION FAILED:')
      validationResult.error.issues.forEach((issue, index) => {
        console.log(`${index + 1}. Field: ${issue.path.join('.')}`)
        console.log(`   Message: ${issue.message}`)
        console.log(`   Code: ${issue.code}`)
        if (issue.received !== undefined) {
          console.log(`   Received: ${JSON.stringify(issue.received)}`)
        }
      })
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            received: err.received
          }))
        },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data

    // Récupérer les paramètres de l'entreprise pour les préfixes
    const companySettings = await prisma.companySettings.findFirst()

    // Générer le numéro de facture si non fourni
    let invoiceNumber = validatedData.invoiceNumber
    if (!invoiceNumber) {
      // Utiliser les préfixes configurés ou les valeurs par défaut
      const prefix = validatedData.type === 'CREDIT_NOTE'
        ? (companySettings?.creditNotePrefix || 'FAV')
        : (companySettings?.invoicePrefix || 'FAC')

      const lastInvoice = await prisma.invoice.findFirst({
        where: {
          invoiceNumber: {
            startsWith: prefix,
          },
        },
        orderBy: { invoiceNumber: 'desc' },
      })

      if (lastInvoice) {
        const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1])
        invoiceNumber = `${prefix}-${(lastNumber + 1).toString().padStart(8, '0')}`
      } else {
        invoiceNumber = `${prefix}-00000001`
      }
    }

    // Vérifier l'unicité du numéro de facture
    const existingInvoice = await prisma.invoice.findUnique({
      where: { invoiceNumber },
    })

    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Ce numéro de facture existe déjà' },
        { status: 400 }
      )
    }

    // Créer la facture avec ses articles
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        type: validatedData.type,
        customerId: validatedData.customerId || null,
        customerName: validatedData.customerName,
        customerPhone: validatedData.customerPhone || null,
        customerEmail: validatedData.customerEmail || null,
        customerAddress: validatedData.customerAddress || null,
        customerTaxId: validatedData.customerTaxId || null,
        originalInvoiceId: validatedData.originalInvoiceId || null,
        subtotal: validatedData.subtotal,
        discountAmount: validatedData.discountAmount,
        taxRate: validatedData.taxRate,
        taxAmount: validatedData.taxAmount,
        total: validatedData.total,
        notes: validatedData.notes || null,
        terms: validatedData.terms || null,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        createdBy: session.userId,
        items: {
          create: validatedData.items.map(item => ({
            productId: item.productId || null,
            productName: item.productName,
            productSku: item.productSku || null,
            description: item.description || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountAmount: item.discountAmount,
            total: item.total,
          })),
        },
      },
      include: {
        customer: true,
        originalInvoice: {
          select: {
            id: true,
            invoiceNumber: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de la facture' },
      { status: 500 }
    )
  }
}
