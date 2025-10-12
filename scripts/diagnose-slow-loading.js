#!/usr/bin/env node

/**
 * 🔍 DIAGNOSTIC COMPLET - CHARGEMENT LENT (10 SECONDES)
 * 
 * Brainstorming des causes possibles :
 * 
 * 🗄️ BASE DE DONNÉES
 * - Requête Prisma non optimisée
 * - Manque d'index sur les colonnes utilisées
 * - Trop de données à charger (limit=all)
 * - Jointures coûteuses (include: category)
 * - Base de données surchargée
 * 
 * 🌐 RÉSEAU
 * - Connexion lente à la base de données
 * - Latence réseau élevée
 * - Timeout de connexion
 * - Bande passante limitée
 * 
 * 🔧 APPLICATION
 * - Sérialisation JSON lente
 * - Mémoire insuffisante
 * - Processus bloquant
 * - Garbage collection
 * 
 * 🖥️ SERVEUR
 * - CPU surchargé
 * - RAM insuffisante
 * - Disque lent
 * - Trop de connexions simultanées
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function diagnoseProblem() {
  console.log('🔍 === DIAGNOSTIC CHARGEMENT LENT (10 SECONDES) ===\n')

  // Test 1: Mesurer le temps de réponse API
  console.log('⏱️ Test 1: Temps de réponse API')
  try {
    const start = Date.now()
    const response = await fetch(`${BASE_URL}/api/products?limit=100`)
    const end = Date.now()
    const apiTime = end - start

    console.log(`   API Response Time: ${apiTime}ms`)
    
    if (response.ok) {
      const parseStart = Date.now()
      const data = await response.json()
      const parseEnd = Date.now()
      const parseTime = parseEnd - parseStart

      console.log(`   JSON Parse Time: ${parseTime}ms`)
      console.log(`   Products Count: ${data.products?.length || 0}`)
      console.log(`   Total Time: ${apiTime + parseTime}ms`)
      
      // Analyser les performances
      if (apiTime > 5000) {
        console.log('   🚨 PROBLÈME: API très lente (>5s)')
        console.log('   💡 Causes possibles:')
        console.log('      - Base de données surchargée')
        console.log('      - Requête Prisma non optimisée')
        console.log('      - Connexion réseau lente')
      } else if (apiTime > 2000) {
        console.log('   ⚠️ ATTENTION: API lente (>2s)')
      } else {
        console.log('   ✅ API rapide (<2s)')
      }

      if (parseTime > 1000) {
        console.log('   🚨 PROBLÈME: Parsing JSON lent (>1s)')
        console.log('   💡 Causes possibles:')
        console.log('      - Trop de données à parser')
        console.log('      - Mémoire insuffisante')
        console.log('      - CPU surchargé')
      }
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`)
  }

  // Test 2: Comparer différentes limites
  console.log('\n📊 Test 2: Impact de la limite de produits')
  const limits = [10, 50, 100, 500, 'all']
  
  for (const limit of limits) {
    try {
      const start = Date.now()
      const response = await fetch(`${BASE_URL}/api/products?limit=${limit}`)
      const data = await response.json()
      const end = Date.now()
      const time = end - start

      console.log(`   Limit ${limit}: ${time}ms (${data.products?.length || 0} produits)`)
      
      if (limit === 'all' && time > 5000) {
        console.log('   🚨 PROBLÈME IDENTIFIÉ: limit=all trop lent')
        console.log('   💡 Solution: Implémenter pagination ou cache')
      }
    } catch (error) {
      console.log(`   Limit ${limit}: Erreur - ${error.message}`)
    }
  }

  // Test 3: Tester l'API optimisée
  console.log('\n🚀 Test 3: API optimisée vs standard')
  try {
    // API standard
    const start1 = Date.now()
    const response1 = await fetch(`${BASE_URL}/api/products?limit=500`)
    const data1 = await response1.json()
    const end1 = Date.now()
    const time1 = end1 - start1

    // API optimisée
    const start2 = Date.now()
    const response2 = await fetch(`${BASE_URL}/api/products/sales?limit=500`)
    const data2 = await response2.json()
    const end2 = Date.now()
    const time2 = end2 - start2

    console.log(`   API Standard: ${time1}ms (${data1.products?.length || 0} produits)`)
    console.log(`   API Optimisée: ${time2}ms (${data2.products?.length || 0} produits)`)
    
    if (time2 < time1) {
      const improvement = Math.round((time1 / time2) * 100) / 100
      console.log(`   ✅ Amélioration: ${improvement}x plus rapide`)
    } else {
      console.log(`   ⚠️ API optimisée pas plus rapide`)
    }
  } catch (error) {
    console.log(`   ❌ Erreur test API optimisée: ${error.message}`)
  }

  // Test 4: Analyser la structure des données
  console.log('\n📋 Test 4: Analyse de la structure des données')
  try {
    const response = await fetch(`${BASE_URL}/api/products?limit=1`)
    const data = await response.json()
    
    if (data.products && data.products.length > 0) {
      const product = data.products[0]
      const productSize = JSON.stringify(product).length
      
      console.log(`   Taille d'un produit: ${productSize} caractères`)
      console.log(`   Champs inclus: ${Object.keys(product).join(', ')}`)
      
      if (product.category) {
        console.log(`   Jointure category: Oui (${Object.keys(product.category).join(', ')})`)
      }
      
      // Estimer la taille totale pour 1000 produits
      const estimatedSize = productSize * 1000
      console.log(`   Taille estimée 1000 produits: ${Math.round(estimatedSize / 1024)}KB`)
      
      if (estimatedSize > 1024 * 1024) { // > 1MB
        console.log('   🚨 PROBLÈME: Données trop volumineuses (>1MB)')
        console.log('   💡 Solutions:')
        console.log('      - Réduire les champs sélectionnés')
        console.log('      - Supprimer les jointures inutiles')
        console.log('      - Implémenter la pagination')
      }
    }
  } catch (error) {
    console.log(`   ❌ Erreur analyse données: ${error.message}`)
  }
}

// Test de performance locale
function testLocalPerformance() {
  console.log('\n\n💻 === TEST PERFORMANCE LOCALE ===')
  
  // Test 1: Création d'objets
  console.log('\n🔧 Test 1: Création d\'objets JavaScript')
  const start1 = Date.now()
  const products = Array(5000).fill(null).map((_, i) => ({
    id: `product-${i}`,
    name: `Produit ${i}`,
    sku: `SKU-${i}`,
    price: Math.random() * 100,
    stock: Math.floor(Math.random() * 50),
    category: {
      id: `cat-${i % 10}`,
      name: `Catégorie ${i % 10}`
    }
  }))
  const end1 = Date.now()
  console.log(`   Création 5000 objets: ${end1 - start1}ms`)

  // Test 2: Sérialisation JSON
  console.log('\n📄 Test 2: Sérialisation JSON')
  const start2 = Date.now()
  const json = JSON.stringify(products)
  const end2 = Date.now()
  console.log(`   Sérialisation: ${end2 - start2}ms`)
  console.log(`   Taille JSON: ${Math.round(json.length / 1024)}KB`)

  // Test 3: Parsing JSON
  console.log('\n🔍 Test 3: Parsing JSON')
  const start3 = Date.now()
  const parsed = JSON.parse(json)
  const end3 = Date.now()
  console.log(`   Parsing: ${end3 - start3}ms`)

  // Test 4: Filtrage
  console.log('\n🔎 Test 4: Filtrage des données')
  const start4 = Date.now()
  const filtered = parsed.filter(p => p.stock > 10)
  const end4 = Date.now()
  console.log(`   Filtrage: ${end4 - start4}ms`)
  console.log(`   Résultats: ${filtered.length} produits`)

  const totalTime = (end1 - start1) + (end2 - start2) + (end3 - start3) + (end4 - start4)
  console.log(`\n📊 Temps total local: ${totalTime}ms`)
  
  if (totalTime > 1000) {
    console.log('🚨 PROBLÈME: Performance locale lente')
    console.log('💡 Causes possibles:')
    console.log('   - CPU surchargé')
    console.log('   - Mémoire insuffisante')
    console.log('   - Trop de données à traiter')
  } else {
    console.log('✅ Performance locale correcte')
  }
}

// Recommandations basées sur les tests
function showRecommendations() {
  console.log('\n\n💡 === RECOMMANDATIONS D\'OPTIMISATION ===')
  
  console.log('\n🎯 Solutions prioritaires:')
  console.log('')
  console.log('1. 🗄️ OPTIMISATION BASE DE DONNÉES')
  console.log('   - Ajouter des index sur les colonnes utilisées')
  console.log('   - Optimiser la requête Prisma')
  console.log('   - Réduire les jointures (category)')
  console.log('   - Utiliser select au lieu d\'include')
  console.log('')
  console.log('2. 📊 RÉDUCTION DES DONNÉES')
  console.log('   - Implémenter pagination intelligente')
  console.log('   - Charger seulement les champs nécessaires')
  console.log('   - Limiter à 200-500 produits max')
  console.log('   - Cache côté serveur')
  console.log('')
  console.log('3. 🚀 OPTIMISATIONS FRONTEND')
  console.log('   - Lazy loading des produits')
  console.log('   - Virtualisation de la liste')
  console.log('   - Debounce de la recherche')
  console.log('   - Cache localStorage')
  console.log('')
  console.log('4. 🔧 OPTIMISATIONS SERVEUR')
  console.log('   - Connection pooling')
  console.log('   - Compression gzip')
  console.log('   - CDN pour les assets')
  console.log('   - Monitoring des performances')

  console.log('\n🛠️ Actions immédiates:')
  console.log('')
  console.log('✅ 1. Modifier l\'API pour utiliser select au lieu d\'include')
  console.log('✅ 2. Ajouter des index manquants en base')
  console.log('✅ 3. Limiter le nombre de produits chargés')
  console.log('✅ 4. Implémenter un cache Redis')
  console.log('✅ 5. Optimiser la requête Prisma')
}

// Exécuter tous les diagnostics
async function runFullDiagnosis() {
  await diagnoseProblem()
  testLocalPerformance()
  showRecommendations()
  
  console.log('\n\n🎯 === CONCLUSION ===')
  console.log('🔍 Diagnostic terminé')
  console.log('📊 Analysez les résultats ci-dessus')
  console.log('💡 Appliquez les recommandations prioritaires')
  console.log('⚡ Objectif: Réduire de 10s à <2s')
}

// Exécuter si appelé directement
if (require.main === module) {
  runFullDiagnosis()
}

module.exports = {
  diagnoseProblem,
  testLocalPerformance,
  runFullDiagnosis
}
