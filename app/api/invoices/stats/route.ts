import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Statistiques des factures
export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Récupérer les statistiques
    const [
      totalInvoices,
      totalCreditNotes,
      totalInvoiceAmount,
      totalCreditAmount,
    ] = await Promise.all([
      prisma.invoice.count({
        where: { type: 'INVOICE' }
      }),
      prisma.invoice.count({
        where: { type: 'CREDIT_NOTE' }
      }),
      prisma.invoice.aggregate({
        where: { type: 'INVOICE' },
        _sum: { total: true }
      }),
      prisma.invoice.aggregate({
        where: { type: 'CREDIT_NOTE' },
        _sum: { total: true }
      }),
    ])

    const invoiceAmount = Number(totalInvoiceAmount._sum.total) || 0
    const creditAmount = Number(totalCreditAmount._sum.total) || 0
    const netAmount = invoiceAmount - creditAmount

    return NextResponse.json({
      overview: {
        totalInvoices,
        totalCreditNotes,
        totalInvoiceAmount: invoiceAmount,
        totalCreditAmount: creditAmount,
        netAmount,
      }
    })
  } catch (error) {
    console.error('Error fetching invoice stats:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}