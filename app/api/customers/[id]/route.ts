import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Récupérer un client par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        sales: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            seller: {
              select: { name: true },
            },
          },
        },
        creditPayments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { sales: true },
        },
      },
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Get customer error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du client' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un client
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { name, company, email, phone, address, ice, creditLimit, isBlocked } = body

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      )
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name: name || customer.name,
        company: company !== undefined ? company : customer.company,
        email: email !== undefined ? email : customer.email,
        phone: phone !== undefined ? phone : customer.phone,
        address: address !== undefined ? address : customer.address,
        ice: ice !== undefined ? ice : customer.ice,
        creditLimit: creditLimit !== undefined ? parseFloat(creditLimit) : customer.creditLimit,
        isBlocked: isBlocked !== undefined ? isBlocked : customer.isBlocked,
      },
    })

    return NextResponse.json(updatedCustomer)
  } catch (error) {
    console.error('Update customer error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du client' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un client
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (session.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Vérifier si le client a des ventes
    const salesCount = await prisma.sale.count({
      where: { customerId: params.id },
    })

    if (salesCount > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un client avec des ventes' },
        { status: 400 }
      )
    }

    await prisma.customer.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete customer error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du client' },
      { status: 500 }
    )
  }
}

