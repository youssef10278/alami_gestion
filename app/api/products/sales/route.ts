import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// Cache simple en mémoire pour les produits de vente
let productsCache: any = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * API optimisée pour la page Nouvelle Vente
 * - Cache en mémoire pour éviter les requêtes répétées
 * - Champs optimisés (seulement ce qui est nécessaire pour la vente)
 * - Tri par popularité/stock pour afficher les produits les plus pertinents en premier
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const limit = parseInt(searchParams.get('limit') || '200')
    const useCache = searchParams.get('cache') !== 'false'

    // Vérifier le cache si activé et pas de recherche spécifique
    const now = Date.now()
    if (useCache && !search && !categoryId && productsCache && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('📦 Utilisation du cache produits pour la vente')
      return NextResponse.json({
        products: productsCache.slice(0, limit),
        pagination: {
          total: productsCache.length,
          page: 1,
          limit: limit,
          totalPages: Math.ceil(productsCache.length / limit),
          cached: true,
          cacheAge: Math.round((now - cacheTimestamp) / 1000)
        }
      })
    }

    // Construire les conditions de recherche
    const where: any = {
      isActive: true,
      // ✅ TEMPORAIRE: Permettre tous les produits actifs pour déboguer
      // stock: {
      //   gt: 0 // Seulement les produits en stock pour la vente
      // }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId
    }

    // Requête optimisée avec seulement les champs nécessaires pour la vente
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        sku: true,
        barcode: true,
        price: true,
        stock: true,
        image: true,
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        // Champs pour le tri par popularité
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { stock: 'desc' }, // Produits avec plus de stock en premier
        { updatedAt: 'desc' }, // Produits récemment mis à jour
        { name: 'asc' } // Tri alphabétique en dernier
      ],
      take: limit === 0 ? undefined : limit
    })

    // Mettre à jour le cache si pas de recherche spécifique
    if (!search && !categoryId) {
      productsCache = products
      cacheTimestamp = now
      console.log(`📦 Cache produits mis à jour: ${products.length} produits`)
    }

    const total = await prisma.product.count({ where })

    return NextResponse.json({
      products,
      pagination: {
        total,
        page: 1,
        limit: limit || total,
        totalPages: limit ? Math.ceil(total / limit) : 1,
        cached: false,
        optimized: true
      }
    })

  } catch (error) {
    console.error('Erreur API produits vente:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    )
  }
}

/**
 * Endpoint pour vider le cache (utile après ajout/modification de produits)
 */
export async function DELETE() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    productsCache = null
    cacheTimestamp = 0
    
    return NextResponse.json({ 
      message: 'Cache produits vidé',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors du vidage du cache:', error)
    return NextResponse.json(
      { error: 'Erreur lors du vidage du cache' },
      { status: 500 }
    )
  }
}
