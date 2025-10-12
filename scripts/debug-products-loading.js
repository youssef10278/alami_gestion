#!/usr/bin/env node

/**
 * Script de diagnostic pour déboguer le problème de chargement des produits
 * 
 * Problème rapporté :
 * - La page Nouvelle Vente affiche "0 produit disponible"
 * - Message "Aucun produit disponible"
 * - Les produits ne se chargent plus
 * 
 * Tests à effectuer :
 * 1. Vérifier l'API originale /api/products
 * 2. Vérifier l'API optimisée /api/products/sales
 * 3. Vérifier les données en base
 * 4. Vérifier l'authentification
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function debugProductsLoading() {
  console.log('🔍 === DIAGNOSTIC CHARGEMENT DES PRODUITS ===\n')

  try {
    // Test 1: API originale sans authentification
    console.log('📡 Test 1: API originale /api/products?limit=all')
    try {
      const response1 = await fetch(`${BASE_URL}/api/products?limit=all`)
      console.log(`   Status: ${response1.status} ${response1.statusText}`)
      
      if (response1.ok) {
        const data1 = await response1.json()
        console.log(`   ✅ Produits récupérés: ${data1.products?.length || 0}`)
        console.log(`   📊 Total en base: ${data1.pagination?.total || 'N/A'}`)
        
        if (data1.products?.length > 0) {
          const firstProduct = data1.products[0]
          console.log(`   📦 Premier produit: ${firstProduct.name} (Stock: ${firstProduct.stock})`)
        }
      } else {
        const errorData = await response1.json().catch(() => ({}))
        console.log(`   ❌ Erreur: ${errorData.error || 'Erreur inconnue'}`)
      }
    } catch (error) {
      console.log(`   ❌ Erreur réseau: ${error.message}`)
    }

    // Test 2: API optimisée
    console.log('\n📡 Test 2: API optimisée /api/products/sales')
    try {
      const response2 = await fetch(`${BASE_URL}/api/products/sales?limit=500&cache=true`)
      console.log(`   Status: ${response2.status} ${response2.statusText}`)
      
      if (response2.ok) {
        const data2 = await response2.json()
        console.log(`   ✅ Produits récupérés: ${data2.products?.length || 0}`)
        console.log(`   📊 Total en base: ${data2.pagination?.total || 'N/A'}`)
        console.log(`   💾 Cache utilisé: ${data2.pagination?.cached ? 'Oui' : 'Non'}`)
        
        if (data2.products?.length > 0) {
          const firstProduct = data2.products[0]
          console.log(`   📦 Premier produit: ${firstProduct.name} (Stock: ${firstProduct.stock})`)
        }
      } else {
        const errorData = await response2.json().catch(() => ({}))
        console.log(`   ❌ Erreur: ${errorData.error || 'Erreur inconnue'}`)
      }
    } catch (error) {
      console.log(`   ❌ Erreur réseau: ${error.message}`)
    }

    // Test 3: API avec différents paramètres
    console.log('\n📡 Test 3: API avec paramètres variés')
    
    const testCases = [
      { url: '/api/products?limit=10', desc: 'Limite 10' },
      { url: '/api/products?limit=100', desc: 'Limite 100' },
      { url: '/api/products', desc: 'Sans paramètre' },
      { url: '/api/products/sales?limit=10', desc: 'Sales API limite 10' },
      { url: '/api/products/sales', desc: 'Sales API sans paramètre' }
    ]

    for (const testCase of testCases) {
      try {
        const response = await fetch(`${BASE_URL}${testCase.url}`)
        const data = await response.json()
        console.log(`   ${testCase.desc}: ${response.status} - ${data.products?.length || 0} produits`)
      } catch (error) {
        console.log(`   ${testCase.desc}: Erreur - ${error.message}`)
      }
    }

    // Test 4: Vérification des conditions de filtrage
    console.log('\n🔍 Test 4: Analyse des conditions de filtrage')
    
    try {
      const response = await fetch(`${BASE_URL}/api/products?limit=all`)
      if (response.ok) {
        const data = await response.json()
        const products = data.products || []
        
        console.log(`   📊 Total produits: ${products.length}`)
        
        // Analyser les produits
        const activeProducts = products.filter(p => p.isActive)
        const inStockProducts = products.filter(p => p.stock > 0)
        const zeroStockProducts = products.filter(p => p.stock === 0)
        const nullStockProducts = products.filter(p => p.stock === null || p.stock === undefined)
        
        console.log(`   ✅ Produits actifs: ${activeProducts.length}`)
        console.log(`   📦 Produits en stock (> 0): ${inStockProducts.length}`)
        console.log(`   📭 Produits stock zéro: ${zeroStockProducts.length}`)
        console.log(`   ❓ Produits stock null/undefined: ${nullStockProducts.length}`)
        
        if (products.length > 0) {
          console.log('\n   📋 Échantillon de produits:')
          products.slice(0, 3).forEach((product, index) => {
            console.log(`      ${index + 1}. ${product.name}`)
            console.log(`         - ID: ${product.id}`)
            console.log(`         - Actif: ${product.isActive}`)
            console.log(`         - Stock: ${product.stock}`)
            console.log(`         - SKU: ${product.sku || 'N/A'}`)
          })
        }
      }
    } catch (error) {
      console.log(`   ❌ Erreur lors de l'analyse: ${error.message}`)
    }

  } catch (error) {
    console.error('❌ Erreur générale lors du diagnostic:', error.message)
  }
}

// Test de l'authentification
async function testAuthentication() {
  console.log('\n\n🔐 === TEST D\'AUTHENTIFICATION ===')
  
  try {
    // Test sans cookie d'authentification
    console.log('\n📡 Test sans authentification')
    const response1 = await fetch(`${BASE_URL}/api/products`)
    console.log(`   Status: ${response1.status} ${response1.statusText}`)
    
    if (response1.status === 401) {
      console.log(`   ✅ Authentification requise (normal)`)
    } else if (response1.ok) {
      console.log(`   ⚠️  API accessible sans authentification`)
    } else {
      console.log(`   ❌ Erreur inattendue`)
    }

    // Test avec cookie factice
    console.log('\n📡 Test avec cookie factice')
    const response2 = await fetch(`${BASE_URL}/api/products`, {
      headers: {
        'Cookie': 'auth-token=fake-token'
      }
    })
    console.log(`   Status: ${response2.status} ${response2.statusText}`)
    
  } catch (error) {
    console.log(`   ❌ Erreur lors du test d'authentification: ${error.message}`)
  }
}

// Recommandations de débogage
function showDebuggingRecommendations() {
  console.log('\n\n💡 === RECOMMANDATIONS DE DÉBOGAGE ===')
  
  console.log('\n🔍 Étapes de débogage recommandées:')
  console.log('')
  console.log('1. 🗄️  Vérifier la base de données:')
  console.log('   - Ouvrir un client de base de données')
  console.log('   - Exécuter: SELECT COUNT(*) FROM "Product" WHERE "isActive" = true;')
  console.log('   - Vérifier: SELECT * FROM "Product" LIMIT 5;')
  console.log('')
  console.log('2. 🔐 Vérifier l\'authentification:')
  console.log('   - Ouvrir les DevTools du navigateur')
  console.log('   - Onglet Network lors du chargement de la page')
  console.log('   - Vérifier les cookies et headers')
  console.log('')
  console.log('3. 📡 Tester les APIs directement:')
  console.log('   - Ouvrir http://localhost:3000/api/products dans le navigateur')
  console.log('   - Vérifier la réponse JSON')
  console.log('')
  console.log('4. 🔄 Vider le cache:')
  console.log('   - Redémarrer le serveur de développement')
  console.log('   - Vider le cache du navigateur (Ctrl+Shift+R)')
  console.log('')
  console.log('5. 📝 Vérifier les logs:')
  console.log('   - Console du navigateur (F12)')
  console.log('   - Logs du serveur Next.js')
  console.log('   - Logs de la base de données')
}

// Solutions possibles
function showPossibleSolutions() {
  console.log('\n\n🛠️  === SOLUTIONS POSSIBLES ===')
  
  console.log('\n🔧 Solutions à essayer:')
  console.log('')
  console.log('1. 📦 Problème de stock:')
  console.log('   - Tous vos produits ont peut-être stock = 0')
  console.log('   - L\'API /products/sales filtre stock > 0')
  console.log('   - Solution: Utiliser l\'API originale temporairement')
  console.log('')
  console.log('2. 🔐 Problème d\'authentification:')
  console.log('   - Session expirée ou invalide')
  console.log('   - Solution: Se reconnecter à l\'application')
  console.log('')
  console.log('3. 🗄️  Problème de base de données:')
  console.log('   - Base de données vide ou inaccessible')
  console.log('   - Solution: Vérifier la connexion DB')
  console.log('')
  console.log('4. 🔄 Problème de cache:')
  console.log('   - Cache corrompu ou expiré')
  console.log('   - Solution: Redémarrer l\'application')
  console.log('')
  console.log('5. 🐛 Bug dans le code:')
  console.log('   - Erreur dans les modifications récentes')
  console.log('   - Solution: Revenir à l\'API originale')
}

// Exécuter tous les tests
async function runAllTests() {
  await debugProductsLoading()
  await testAuthentication()
  showDebuggingRecommendations()
  showPossibleSolutions()
  
  console.log('\n\n🎯 === RÉSUMÉ ===')
  console.log('✅ Diagnostic terminé')
  console.log('📊 Vérifiez les résultats ci-dessus')
  console.log('🔍 Suivez les recommandations de débogage')
  console.log('🛠️  Essayez les solutions proposées')
  console.log('')
  console.log('💡 Si le problème persiste, vérifiez:')
  console.log('   - La base de données contient des produits')
  console.log('   - L\'authentification fonctionne')
  console.log('   - Les APIs répondent correctement')
}

// Exécuter si appelé directement
if (require.main === module) {
  runAllTests()
}

module.exports = {
  debugProductsLoading,
  testAuthentication,
  runAllTests
}
