import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Récupérer tous les chèques
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}

    // Filtrer par statut si spécifié
    if (status && status !== 'ALL') {
      where.status = status
    }

    // Recherche par numéro de chèque ou émetteur
    if (search) {
      where.OR = [
        { checkNumber: { contains: search, mode: 'insensitive' } },
        { issuer: { contains: search, mode: 'insensitive' } },
        { beneficiary: { contains: search, mode: 'insensitive' } }
      ]
    }

    const checks = await prisma.saleCheck.findMany({
      where,
      include: {
        sale: {
          include: {
            customer: true,
            seller: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(checks)
  } catch (error) {
    console.error('Erreur lors de la récupération des chèques:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des chèques' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau chèque (lors d'une vente)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      saleId,
      checkNumber,
      issuer,
      beneficiary,
      checkDate,
      amount,
      notes
    } = body

    // Vérifier que la vente existe
    const sale = await prisma.sale.findUnique({
      where: { id: saleId }
    })

    if (!sale) {
      return NextResponse.json(
        { error: 'Vente non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier qu'il n'y a pas déjà un chèque pour cette vente
    const existingCheck = await prisma.saleCheck.findUnique({
      where: { saleId }
    })

    if (existingCheck) {
      return NextResponse.json(
        { error: 'Un chèque existe déjà pour cette vente' },
        { status: 400 }
      )
    }

    // Créer le chèque
    const check = await prisma.saleCheck.create({
      data: {
        saleId,
        checkNumber,
        issuer,
        beneficiary,
        checkDate: new Date(checkDate),
        amount: parseFloat(amount),
        notes
      },
      include: {
        sale: {
          include: {
            customer: true,
            seller: true
          }
        }
      }
    })

    return NextResponse.json(check, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du chèque:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du chèque' },
      { status: 500 }
    )
  }
}
