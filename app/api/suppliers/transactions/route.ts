import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Liste des transactions
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const supplierId = searchParams.get('supplierId')
    const type = searchParams.get('type')

    const where: any = {}

    if (supplierId) {
      where.supplierId = supplierId
    }

    if (type && type !== 'all') {
      where.type = type
    }

    const transactions = await prisma.supplierTransaction.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        checks: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des transactions' },
      { status: 500 }
    )
  }
}

// POST - Créer une transaction
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const {
      supplierId,
      type,
      amount,
      description,
      date,
      paymentMethod,
      notes,
      checkData, // { checkNumber, bankName, dueDate, accountNumber }
    } = body

    // Validation
    if (!supplierId || !type || !amount || !description) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Le montant doit être positif' },
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

    // Générer le numéro de transaction
    const lastTransaction = await prisma.supplierTransaction.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { transactionNumber: true },
    })

    const transactionNumber = lastTransaction
      ? `TRN-${(parseInt(lastTransaction.transactionNumber.split('-')[1]) + 1).toString().padStart(6, '0')}`
      : 'TRN-000001'

    // Créer la transaction avec mise à jour du solde
    const result = await prisma.$transaction(async (tx) => {
      // Créer la transaction
      const transaction = await tx.supplierTransaction.create({
        data: {
          transactionNumber,
          supplierId,
          type,
          amount,
          description,
          date: date ? new Date(date) : new Date(),
          paymentMethod: paymentMethod || null,
          notes: notes || null,
        },
        include: {
          supplier: true,
        },
      })

      // Mettre à jour le solde du fournisseur
      let newBalance = Number(supplier.balance)
      let newTotalDebt = Number(supplier.totalDebt)
      let newTotalPaid = Number(supplier.totalPaid)

      if (type === 'PURCHASE') {
        // Achat : augmente la dette
        newBalance += Number(amount)
        newTotalDebt += Number(amount)
      } else if (type === 'PAYMENT') {
        // Paiement : diminue la dette
        newBalance -= Number(amount)
        newTotalPaid += Number(amount)
      } else if (type === 'ADJUSTMENT') {
        // Ajustement : modifie le solde
        newBalance += Number(amount)
      }

      await tx.supplier.update({
        where: { id: supplierId },
        data: {
          balance: newBalance,
          totalDebt: newTotalDebt,
          totalPaid: newTotalPaid,
        },
      })

      // Si c'est un paiement par chèque, créer le chèque
      let check = null
      if (type === 'PAYMENT' && paymentMethod === 'CHECK' && checkData) {
        const { checkNumber, bankName, dueDate, accountNumber } = checkData

        if (!checkNumber || !bankName || !dueDate) {
          throw new Error('Données du chèque incomplètes')
        }

        check = await tx.check.create({
          data: {
            checkNumber,
            supplierId,
            transactionId: transaction.id,
            amount,
            bankName,
            dueDate: new Date(dueDate),
            accountNumber: accountNumber || null,
            status: 'ISSUED',
          },
        })
      }

      return { transaction, check }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Create transaction error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la transaction' },
      { status: 500 }
    )
  }
}

