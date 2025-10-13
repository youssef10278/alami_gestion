import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Récupérer une facture spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const invoiceId = params.id

    // Récupérer la facture avec toutes ses relations
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: {
          orderBy: { createdAt: 'asc' }
        },
        customer: true,
        originalInvoice: {
          select: {
            id: true,
            invoiceNumber: true,
            total: true,
            createdAt: true
          }
        },
        creditNotes: {
          select: {
            id: true,
            invoiceNumber: true,
            total: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la facture' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une facture
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const invoiceId = params.id

    // Vérifier que la facture existe
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        _count: {
          select: {
            creditNotes: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })
    }

    // Vérifier s'il y a des factures d'avoir associées
    if (invoice._count.creditNotes > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une facture qui a des factures d\'avoir associées' },
        { status: 400 }
      )
    }

    // Supprimer la facture (les items seront supprimés automatiquement grâce à onDelete: Cascade)
    await prisma.invoice.delete({
      where: { id: invoiceId },
    })

    return NextResponse.json({ message: 'Facture supprimée avec succès' })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la facture' },
      { status: 500 }
    )
  }
}