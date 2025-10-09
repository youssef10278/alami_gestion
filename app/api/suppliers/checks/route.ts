import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Liste des chèques
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const supplierId = searchParams.get('supplierId')
    const status = searchParams.get('status')

    const where: any = {}

    if (supplierId) {
      where.supplierId = supplierId
    }

    if (status && status !== 'all') {
      where.status = status
    }

    const checks = await prisma.check.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        transaction: {
          select: {
            id: true,
            transactionNumber: true,
            description: true,
          },
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    })

    return NextResponse.json(checks)
  } catch (error) {
    console.error('Get checks error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des chèques' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour le statut d'un chèque
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, cashDate } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID et statut requis' },
        { status: 400 }
      )
    }

    // Récupérer le chèque actuel
    const currentCheck = await prisma.check.findUnique({
      where: { id },
      include: { supplier: true },
    })

    if (!currentCheck) {
      return NextResponse.json(
        { error: 'Chèque non trouvé' },
        { status: 404 }
      )
    }

    // Gérer les changements de statut avec impact sur le solde
    const needsTransaction =
      (currentCheck.status === 'ISSUED' && status === 'CANCELLED') || // Annuler un chèque émis
      (currentCheck.status === 'CANCELLED' && status === 'ISSUED') || // Réactiver un chèque annulé
      (currentCheck.status === 'CASHED' && status === 'ISSUED') ||    // Annuler un encaissement
      (currentCheck.status === 'BOUNCED' && status === 'ISSUED')      // Réactiver un chèque rejeté

    if (needsTransaction) {
      await prisma.$transaction(async (tx) => {
        // Mettre à jour le chèque
        await tx.check.update({
          where: { id },
          data: {
            status,
            cashDate: cashDate ? new Date(cashDate) : null,
          },
        })

        const totalDebt = Number(currentCheck.supplier.totalDebt)
        let newTotalPaid = Number(currentCheck.supplier.totalPaid)

        // ISSUED → CANCELLED/BOUNCED : Annuler le paiement
        if (currentCheck.status === 'ISSUED' && (status === 'CANCELLED' || status === 'BOUNCED')) {
          newTotalPaid -= Number(currentCheck.amount)
        }
        // CANCELLED/CASHED/BOUNCED → ISSUED : Réactiver le paiement
        else if ((currentCheck.status === 'CANCELLED' || currentCheck.status === 'CASHED' || currentCheck.status === 'BOUNCED') && status === 'ISSUED') {
          newTotalPaid += Number(currentCheck.amount)
        }

        // Recalculer le balance : totalDebt - totalPaid
        const newBalance = totalDebt - newTotalPaid

        await tx.supplier.update({
          where: { id: currentCheck.supplierId },
          data: {
            balance: newBalance,
            totalPaid: newTotalPaid,
          },
        })
      })
    } else {
      // Mise à jour simple du statut (sans impact sur le solde)
      await prisma.check.update({
        where: { id },
        data: {
          status,
          cashDate: cashDate ? new Date(cashDate) : (status === 'CASHED' ? new Date() : null),
        },
      })
    }

    const updatedCheck = await prisma.check.findUnique({
      where: { id },
      include: {
        supplier: true,
        transaction: true,
      },
    })

    return NextResponse.json(updatedCheck)
  } catch (error) {
    console.error('Update check error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du chèque' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau chèque
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const {
      supplierId,
      checkNumber,
      amount,
      bankName,
      accountNumber,
      issueDate,
      dueDate,
      notes,
    } = body

    // Validation
    if (!supplierId || !checkNumber || !amount || !bankName || !dueDate) {
      return NextResponse.json(
        { error: 'Données manquantes (supplierId, checkNumber, amount, bankName, dueDate requis)' },
        { status: 400 }
      )
    }

    if (parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Le montant doit être supérieur à 0' },
        { status: 400 }
      )
    }

    // Vérifier que le fournisseur existe
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    })

    if (!supplier) {
      return NextResponse.json(
        { error: 'Fournisseur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que le numéro de chèque n'existe pas déjà
    const existingCheck = await prisma.check.findFirst({
      where: {
        checkNumber,
        supplierId,
      },
    })

    if (existingCheck) {
      return NextResponse.json(
        { error: 'Un chèque avec ce numéro existe déjà pour ce fournisseur' },
        { status: 400 }
      )
    }

    // Créer le chèque et mettre à jour le fournisseur dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer le chèque
      const check = await tx.check.create({
        data: {
          supplierId,
          checkNumber,
          amount: parseFloat(amount),
          bankName,
          accountNumber: accountNumber || null,
          issueDate: new Date(issueDate || new Date()),
          dueDate: new Date(dueDate),
          status: 'ISSUED', // Par défaut, le chèque est émis
          notes: notes || null,
        },
        include: {
          supplier: true,
        },
      })

      // Mettre à jour le solde du fournisseur
      // Quand on donne un chèque au fournisseur, on réduit notre dette envers lui
      // balance = totalDebt - totalPaid
      // Si balance > 0 : on doit de l'argent au fournisseur
      // Si balance < 0 : le fournisseur nous doit de l'argent (paiement anticipé)
      // Si balance = 0 : on est à jour

      const newTotalPaid = Number(supplier.totalPaid) + parseFloat(amount)
      const newBalance = Number(supplier.totalDebt) - newTotalPaid

      await tx.supplier.update({
        where: { id: supplierId },
        data: {
          balance: newBalance,
          totalPaid: newTotalPaid,
        },
      })

      return check
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Create check error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du chèque' },
      { status: 500 }
    )
  }
}
