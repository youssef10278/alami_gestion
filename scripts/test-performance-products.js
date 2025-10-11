/**
 * Script de test pour vérifier les performances de génération de produits
 * Usage: node scripts/test-performance-products.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testProductGeneration() {
  console.log('🧪 Test de performance - Génération de produits')
  console.log('=' .repeat(50))

  try {
    // 1. Compter les produits existants
    const initialCount = await prisma.product.count()
    console.log(`📊 Produits existants: ${initialCount}`)

    // 2. Compter les produits de test existants
    const testProductsCount = await prisma.product.count({
      where: {
        sku: {
          startsWith: 'TEST-'
        }
      }
    })
    console.log(`🧪 Produits de test existants: ${testProductsCount}`)

    // 3. Tester la vitesse de requête sur les produits
    console.log('\n⏱️ Test de vitesse de requête...')
    
    const startQuery = Date.now()
    const products = await prisma.product.findMany({
      take: 100,
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    const queryTime = Date.now() - startQuery
    
    console.log(`✅ Requête de 100 produits avec catégories: ${queryTime}ms`)
    console.log(`📦 Produits récupérés: ${products.length}`)

    // 4. Test de recherche
    console.log('\n🔍 Test de recherche...')
    
    const startSearch = Date.now()
    const searchResults = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'test', mode: 'insensitive' } },
          { sku: { contains: 'TEST', mode: 'insensitive' } }
        ]
      },
      take: 50
    })
    const searchTime = Date.now() - startSearch
    
    console.log(`✅ Recherche "test": ${searchTime}ms`)
    console.log(`🔍 Résultats trouvés: ${searchResults.length}`)

    // 5. Test de pagination
    console.log('\n📄 Test de pagination...')
    
    const startPagination = Date.now()
    const paginatedResults = await prisma.product.findMany({
      skip: 100,
      take: 20,
      orderBy: {
        name: 'asc'
      }
    })
    const paginationTime = Date.now() - startPagination
    
    console.log(`✅ Pagination (skip 100, take 20): ${paginationTime}ms`)
    console.log(`📄 Produits récupérés: ${paginatedResults.length}`)

    // 6. Test de comptage avec filtres
    console.log('\n🔢 Test de comptage avec filtres...')
    
    const startCount = Date.now()
    const [totalProducts, activeProducts, lowStockProducts] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({
        where: {
          isActive: true,
          stock: {
            lte: 10
          }
        }
      })
    ])
    const countTime = Date.now() - startCount
    
    console.log(`✅ Comptages multiples: ${countTime}ms`)
    console.log(`📊 Total: ${totalProducts}, Actifs: ${activeProducts}, Stock faible: ${lowStockProducts}`)

    // 7. Recommandations de performance
    console.log('\n💡 Recommandations de performance:')
    
    if (queryTime > 100) {
      console.log('⚠️  Requête lente détectée. Considérez l\'ajout d\'index.')
    } else {
      console.log('✅ Vitesse de requête acceptable')
    }
    
    if (searchTime > 200) {
      console.log('⚠️  Recherche lente. Considérez l\'utilisation d\'un moteur de recherche full-text.')
    } else {
      console.log('✅ Vitesse de recherche acceptable')
    }
    
    if (totalProducts > 10000) {
      console.log('📈 Grande base de données détectée. Considérez la pagination côté serveur.')
    }

    console.log('\n🎯 Résumé des performances:')
    console.log(`• Requête simple: ${queryTime}ms`)
    console.log(`• Recherche: ${searchTime}ms`) 
    console.log(`• Pagination: ${paginationTime}ms`)
    console.log(`• Comptages: ${countTime}ms`)
    console.log(`• Total produits: ${totalProducts}`)

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Fonction pour nettoyer les produits de test
async function cleanTestProducts() {
  console.log('🧹 Nettoyage des produits de test...')
  
  try {
    const result = await prisma.product.deleteMany({
      where: {
        sku: {
          startsWith: 'TEST-'
        }
      }
    })
    
    console.log(`✅ ${result.count} produits de test supprimés`)
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
  }
}

// Exécution du script
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--clean')) {
    await cleanTestProducts()
  } else {
    await testProductGeneration()
  }
}

main().catch(console.error)
