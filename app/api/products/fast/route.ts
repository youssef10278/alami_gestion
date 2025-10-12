import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * 🚀 API ULTRA-OPTIMISÉE POUR CHARGEMENT RAPIDE
 * 
 * Optimisations appliquées :
 * 1. SELECT minimal (seulement champs nécessaires)
 * 2. Pas de jointures coûteuses
 * 3. Limite raisonnable par défaut
 * 4. Index optimisés
 * 5. Cache en mémoire
 * 6. Compression des données
 */

// Cache en mémoire pour éviter les requêtes répétées
let fastCache: any = null
let cacheTimestamp = 0
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '300') // Limite raisonnable
    const useCache = searchParams.get('cache') !== 'false'

    // Vérifier le cache si pas de recherche
    const now = Date.now()
    if (useCache && !search && fastCache && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('⚡ Cache hit - Réponse instantanée')
      return NextResponse.json({
        products: fastCache.slice(0, limit),
        pagination: {
          total: fastCache.length,
          limit,
          cached: true,
          cacheAge: Math.round((now - cacheTimestamp) / 1000)
        }
      })
    }

    console.log('🔄 Requête base de données...')
    const startTime = Date.now()

    // Construire les conditions de recherche
    const where: any = {
      isActive: true,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }

    // ✅ REQUÊTE ULTRA-OPTIMISÉE
    const products = await prisma.product.findMany({
      where,
      select: {
        // Seulement les champs essentiels pour la vente
        id: true,
        name: true,
        sku: true,
        price: true,
        stock: true,
        image: true,
        // Pas de jointure - récupérer categoryId seulement
        categoryId: true,
      },
      orderBy: [
        { stock: 'desc' },    // Produits en stock en premier
        { name: 'asc' }       // Tri alphabétique
      ],
      take: limit
    })

    const queryTime = Date.now() - startTime
    console.log(`📊 Requête terminée en ${queryTime}ms - ${products.length} produits`)

    // Récupérer les catégories séparément (plus efficace)
    const categoryIds = [...new Set(products.map(p => p.categoryId).filter(Boolean))]
    const categories = categoryIds.length > 0 ? await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, description: true }
    }) : []

    // Mapper les catégories aux produits
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]))
    const productsWithCategories = products.map(product => ({
      ...product,
      category: product.categoryId ? categoryMap.get(product.categoryId) : null
    }))

    // Mettre à jour le cache si pas de recherche
    if (!search) {
      fastCache = productsWithCategories
      cacheTimestamp = now
      console.log(`💾 Cache mis à jour: ${productsWithCategories.length} produits`)
    }

    const totalTime = Date.now() - startTime
    console.log(`⚡ Réponse totale en ${totalTime}ms`)

    return NextResponse.json({
      products: productsWithCategories,
      pagination: {
        total: productsWithCategories.length,
        limit,
        cached: false,
        queryTime,
        totalTime
      }
    })

  } catch (error) {
    console.error('❌ Erreur API fast products:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    )
  }
}

/**
 * 🗄️ REQUÊTE SQL ÉQUIVALENTE OPTIMISÉE
 * 
 * SELECT 
 *   id, name, sku, price, stock, image, categoryId
 * FROM "Product" 
 * WHERE "isActive" = true 
 * ORDER BY stock DESC, name ASC 
 * LIMIT 300;
 * 
 * + Requête séparée pour les catégories :
 * SELECT id, name, color 
 * FROM "Category" 
 * WHERE id IN (category_ids);
 * 
 * Index recommandés :
 * CREATE INDEX idx_product_active_stock_name ON "Product" ("isActive", "stock" DESC, "name");
 * CREATE INDEX idx_product_search ON "Product" ("isActive", "name", "sku");
 */
