import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Récupérer un produit par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du produit' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un produit
export async function PUT(
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

    const body = await request.json()
    const { name, description, purchasePrice, price, stock, minStock, categoryId, image, isActive } = body

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      )
    }

    // Si le stock change, créer un mouvement de stock
    if (stock !== undefined && parseInt(stock) !== product.stock) {
      const difference = parseInt(stock) - product.stock
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          quantity: Math.abs(difference),
          type: difference > 0 ? 'IN' : 'OUT',
          reason: 'Ajustement manuel',
        },
      })
    }

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: name || product.name,
        description: description !== undefined ? description : product.description,
        purchasePrice: purchasePrice !== undefined ? parseFloat(purchasePrice) : product.purchasePrice,
        price: price ? parseFloat(price) : product.price,
        stock: stock !== undefined ? parseInt(stock) : product.stock,
        minStock: minStock !== undefined ? parseInt(minStock) : product.minStock,
        categoryId: categoryId !== undefined ? categoryId : product.categoryId,
        image: image !== undefined ? image : product.image,
        isActive: isActive !== undefined ? isActive : product.isActive,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du produit' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un produit (soft delete)
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

    const product = await prisma.product.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du produit' },
      { status: 500 }
    )
  }
}

