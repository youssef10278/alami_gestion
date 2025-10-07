import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH - Mettre à jour le statut d'encaissement d'un chèque
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, cashedDate, notes } = body

    // Vérifier que le chèque existe
    const existingCheck = await prisma.saleCheck.findUnique({
      where: { id }
    })

    if (!existingCheck) {
      return NextResponse.json(
        { error: 'Chèque non trouvé' },
        { status: 404 }
      )
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    // Si le chèque est encaissé, ajouter la date d'encaissement
    if (status === 'CASHED') {
      updateData.cashedDate = cashedDate ? new Date(cashedDate) : new Date()
    } else if (status === 'PENDING') {
      // Si on remet en attente, supprimer la date d'encaissement
      updateData.cashedDate = null
    }

    // Ajouter les notes si fournies
    if (notes !== undefined) {
      updateData.notes = notes
    }

    // Mettre à jour le chèque
    const updatedCheck = await prisma.saleCheck.update({
      where: { id },
      data: updateData,
      include: {
        sale: {
          include: {
            customer: true,
            seller: true
          }
        }
      }
    })

    return NextResponse.json(updatedCheck)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du chèque:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du chèque' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un chèque
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Vérifier que le chèque existe
    const existingCheck = await prisma.saleCheck.findUnique({
      where: { id }
    })

    if (!existingCheck) {
      return NextResponse.json(
        { error: 'Chèque non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer le chèque
    await prisma.saleCheck.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Chèque supprimé avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression du chèque:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du chèque' },
      { status: 500 }
    )
  }
}

// GET - Récupérer un chèque spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const check = await prisma.saleCheck.findUnique({
      where: { id },
      include: {
        sale: {
          include: {
            customer: true,
            seller: true,
            items: {
              include: {
                product: true
              }
            }
          }
        }
      }
    })

    if (!check) {
      return NextResponse.json(
        { error: 'Chèque non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(check)
  } catch (error) {
    console.error('Erreur lors de la récupération du chèque:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du chèque' },
      { status: 500 }
    )
  }
}
