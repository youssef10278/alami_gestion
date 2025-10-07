import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Liste des devis
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { quoteNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
      ]
    }

    const quotes = await prisma.quote.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(quotes)
  } catch (error) {
    console.error('Get quotes error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des devis' },
      { status: 500 }
    )
  }
}

// POST - Créer un devis
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📝 Creating quote with body:', JSON.stringify(body, null, 2))

    const {
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      validUntil,
      items,
      discount,
      tax,
      notes,
      terms,
    } = body

    if (!customerName || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Nom du client et articles requis' },
        { status: 400 }
      )
    }

    if (!validUntil) {
      return NextResponse.json(
        { error: 'Date de validité requise' },
        { status: 400 }
      )
    }

    // Générer le numéro de devis
    const lastQuote = await prisma.quote.findFirst({
      orderBy: { quoteNumber: 'desc' },
    })

    const quoteNumber = lastQuote
      ? `DEV-${(parseInt(lastQuote.quoteNumber.split('-')[1]) + 1).toString().padStart(6, '0')}`
      : 'DEV-000001'

    // Calculer les totaux
    let subtotal = 0
    const quoteItems = items.map((item: any) => {
      const qty = Number(item.quantity)
      const price = Number(item.unitPrice)
      const disc = Number(item.discount || 0)
      const itemTotal = qty * price - disc
      subtotal += itemTotal
      return {
        productId: item.productId || null,
        productName: item.productName,
        productSku: item.productSku || null,
        quantity: qty,
        unitPrice: price,
        discount: disc,
        total: itemTotal,
      }
    })

    const discountAmount = Number(discount || 0)
    const taxAmount = Number(tax || 0)
    const total = subtotal - discountAmount + taxAmount

    console.log('💰 Calculated totals:', { subtotal, discountAmount, taxAmount, total })
    console.log('📦 Quote items:', quoteItems)

    // Préparer la date de validité
    const validUntilDate = new Date(validUntil)
    console.log('📅 Valid until date:', validUntilDate)

    // Créer le devis
    console.log('🔨 Creating quote in database...')
    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        customerId: customerId || null,
        customerName,
        customerPhone: customerPhone || null,
        customerEmail: customerEmail || null,
        customerAddress: customerAddress || null,
        validUntil: validUntilDate,
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total,
        notes: notes || null,
        terms: terms || null,
        items: {
          create: quoteItems,
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    console.log('✅ Quote created successfully:', quote.quoteNumber)
    return NextResponse.json(quote)
  } catch (error: any) {
    console.error('❌ Create quote error:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du devis' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un devis
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const {
      id,
      status,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      validUntil,
      items,
      discount,
      tax,
      notes,
      terms,
    } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    // Vérifier que le devis existe
    const existingQuote = await prisma.quote.findUnique({
      where: { id },
    })

    if (!existingQuote) {
      return NextResponse.json({ error: 'Devis non trouvé' }, { status: 404 })
    }

    // Si on met à jour les items, recalculer les totaux
    let updateData: any = {}

    if (status) {
      updateData.status = status
    }

    if (customerName !== undefined) updateData.customerName = customerName
    if (customerPhone !== undefined) updateData.customerPhone = customerPhone
    if (customerEmail !== undefined) updateData.customerEmail = customerEmail
    if (customerAddress !== undefined) updateData.customerAddress = customerAddress
    if (validUntil !== undefined) updateData.validUntil = new Date(validUntil)
    if (notes !== undefined) updateData.notes = notes
    if (terms !== undefined) updateData.terms = terms

    if (items) {
      // Supprimer les anciens items et créer les nouveaux
      await prisma.quoteItem.deleteMany({
        where: { quoteId: id },
      })

      let subtotal = 0
      const quoteItems = items.map((item: any) => {
        const itemTotal = item.quantity * item.unitPrice - (item.discount || 0)
        subtotal += itemTotal
        return {
          productId: item.productId || null,
          productName: item.productName,
          productSku: item.productSku || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          total: itemTotal,
        }
      })

      const discountAmount = discount || 0
      const taxAmount = tax || 0
      const total = subtotal - discountAmount + taxAmount

      updateData.subtotal = subtotal
      updateData.discount = discountAmount
      updateData.tax = taxAmount
      updateData.total = total
      updateData.items = {
        create: quoteItems,
      }
    }

    const quote = await prisma.quote.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Update quote error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du devis' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un devis
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    // Vérifier que le devis n'est pas converti
    const quote = await prisma.quote.findUnique({
      where: { id },
    })

    if (!quote) {
      return NextResponse.json({ error: 'Devis non trouvé' }, { status: 404 })
    }

    if (quote.status === 'CONVERTED') {
      return NextResponse.json(
        { error: 'Impossible de supprimer un devis converti en vente' },
        { status: 400 }
      )
    }

    await prisma.quote.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete quote error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du devis' },
      { status: 500 }
    )
  }
}

