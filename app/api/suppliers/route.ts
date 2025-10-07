import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Liste des fournisseurs
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    const where: any = {}

    // Filtre par recherche
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Filtre par statut
    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    } else if (status === 'with_debt') {
      where.balance = { gt: 0 }
    } else if (status === 'clear') {
      where.balance = { lte: 0 }
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      include: {
        _count: {
          select: {
            transactions: true,
            checks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error('Get suppliers error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des fournisseurs' },
      { status: 500 }
    )
  }
}

// POST - Créer un fournisseur
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { name, company, email, phone, address, taxId, notes } = body

    // Validation
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Le nom et le téléphone sont requis' },
        { status: 400 }
      )
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        company: company || null,
        email: email || null,
        phone,
        address: address || null,
        taxId: taxId || null,
        notes: notes || null,
      },
    })

    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error('Create supplier error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du fournisseur' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un fournisseur
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, company, email, phone, address, taxId, notes, isActive } = body

    // Validation
    if (!id || !name || !phone) {
      return NextResponse.json(
        { error: 'ID, nom et téléphone sont requis' },
        { status: 400 }
      )
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name,
        company: company || null,
        email: email || null,
        phone,
        address: address || null,
        taxId: taxId || null,
        notes: notes || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Update supplier error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du fournisseur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un fournisseur
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      )
    }

    // Vérifier s'il y a des transactions
    const transactionCount = await prisma.supplierTransaction.count({
      where: { supplierId: id },
    })

    if (transactionCount > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un fournisseur avec des transactions' },
        { status: 400 }
      )
    }

    await prisma.supplier.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete supplier error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du fournisseur' },
      { status: 500 }
    )
  }
}

