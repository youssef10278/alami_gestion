import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Liste des produits avec recherche et filtres
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const page = parseInt(searchParams.get('page') || '1')
    const limitParam = searchParams.get('limit')

    // ✅ FIX: Support pour récupérer TOUS les produits sans limite
    const getAllProducts = limitParam === 'all' || limitParam === '0'
    const limit = getAllProducts ? undefined : parseInt(limitParam || '100')
    const skip = getAllProducts ? undefined : (page - 1) * (limit || 100)

    const where: any = {
      isActive: true,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    // ✅ FIX: Requête conditionnelle selon si on veut tous les produits ou avec pagination
    const queryOptions: any = {
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    }

    // Ajouter skip et take seulement si on ne veut pas tous les produits
    if (!getAllProducts) {
      queryOptions.skip = skip
      queryOptions.take = limit
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany(queryOptions),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        total,
        page: getAllProducts ? 1 : page,
        limit: getAllProducts ? total : limit,
        totalPages: getAllProducts ? 1 : Math.ceil(total / (limit || 100)),
        showingAll: getAllProducts,
      },
    })
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Les vendeurs peuvent aussi créer des produits
    if (session.role !== 'OWNER' && session.role !== 'SELLER') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { sku, name, description, purchasePrice, price, stock, minStock, categoryId, image } = body



    // Validation
    if (!sku || !name || !price) {
      return NextResponse.json(
        { error: 'SKU, nom et prix sont requis' },
        { status: 400 }
      )
    }

    // Validation du prix d'achat
    if (purchasePrice && parseFloat(purchasePrice) < 0) {
      return NextResponse.json(
        { error: 'Le prix d\'achat ne peut pas être négatif' },
        { status: 400 }
      )
    }

    // Vérifier si le SKU existe déjà
    const existingProductBySku = await prisma.product.findUnique({
      where: { sku },
    })

    if (existingProductBySku) {
      return NextResponse.json(
        { error: 'Un produit avec ce SKU existe déjà' },
        { status: 400 }
      )
    }

    // Vérifier si le nom existe déjà (insensible à la casse)
    const existingProductByName = await prisma.product.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    })

    if (existingProductByName) {
      return NextResponse.json(
        { error: 'Un produit avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    // Créer le produit
    const product = await prisma.product.create({
      data: {
        sku,
        name,
        description,
        purchasePrice: parseFloat(purchasePrice) || 0,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 10,
        categoryId: categoryId || null,
        image: image || null,
      },
      include: {
        category: true,
      },
    })

    // Créer un mouvement de stock initial si stock > 0
    if (parseInt(stock) > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          quantity: parseInt(stock),
          type: 'IN',
          reason: 'Stock initial',
        },
      })
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du produit' },
      { status: 500 }
    )
  }
}

