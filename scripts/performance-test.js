// Script de test de performance avec 5000 produits
// À exécuter dans la console du navigateur

console.log('⚡ TEST DE PERFORMANCE - 5000 Produits')

// Configuration des tests
const TEST_CONFIG = {
  searchTerms: ['Samsung', 'Pro', 'Premium', 'Smart', 'Ultra'],
  categories: ['Électronique', 'Vêtements', 'Informatique'],
  priceRanges: [
    { min: 0, max: 100 },
    { min: 100, max: 500 },
    { min: 500, max: 1000 }
  ],
  pageSize: 20,
  maxPages: 10
}

// Métriques de performance
let performanceMetrics = {
  tests: [],
  summary: {}
}

// Fonction pour mesurer le temps d'exécution
function measureTime(name, fn) {
  return new Promise(async (resolve) => {
    const startTime = performance.now()
    const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0
    
    try {
      const result = await fn()
      const endTime = performance.now()
      const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0
      
      const metrics = {
        name,
        duration: endTime - startTime,
        memoryUsed: endMemory - startMemory,
        success: true,
        result
      }
      
      performanceMetrics.tests.push(metrics)
      console.log(`✅ ${name}: ${metrics.duration.toFixed(2)}ms`)
      resolve(metrics)
      
    } catch (error) {
      const endTime = performance.now()
      const metrics = {
        name,
        duration: endTime - startTime,
        success: false,
        error: error.message
      }
      
      performanceMetrics.tests.push(metrics)
      console.error(`❌ ${name}: ${error.message}`)
      resolve(metrics)
    }
  })
}

// Test 1: Chargement initial de la page produits
async function testInitialLoad() {
  return measureTime('Chargement initial page produits', async () => {
    const response = await fetch('/api/products?page=1&limit=20')
    const data = await response.json()
    return {
      productsCount: data.products?.length || 0,
      totalCount: data.totalCount || 0,
      hasNextPage: data.hasNextPage
    }
  })
}

// Test 2: Recherche par nom
async function testSearch() {
  const results = []
  
  for (const term of TEST_CONFIG.searchTerms) {
    const result = await measureTime(`Recherche "${term}"`, async () => {
      const response = await fetch(`/api/products?search=${encodeURIComponent(term)}&limit=20`)
      const data = await response.json()
      return {
        searchTerm: term,
        resultsCount: data.products?.length || 0,
        totalMatches: data.totalCount || 0
      }
    })
    results.push(result)
  }
  
  return results
}

// Test 3: Filtrage par catégorie
async function testCategoryFilter() {
  const results = []
  
  for (const category of TEST_CONFIG.categories) {
    const result = await measureTime(`Filtre catégorie "${category}"`, async () => {
      const response = await fetch(`/api/products?category=${encodeURIComponent(category)}&limit=20`)
      const data = await response.json()
      return {
        category,
        resultsCount: data.products?.length || 0,
        totalMatches: data.totalCount || 0
      }
    })
    results.push(result)
  }
  
  return results
}

// Test 4: Filtrage par prix
async function testPriceFilter() {
  const results = []
  
  for (const range of TEST_CONFIG.priceRanges) {
    const result = await measureTime(`Filtre prix ${range.min}-${range.max}`, async () => {
      const response = await fetch(`/api/products?minPrice=${range.min}&maxPrice=${range.max}&limit=20`)
      const data = await response.json()
      return {
        priceRange: range,
        resultsCount: data.products?.length || 0,
        totalMatches: data.totalCount || 0
      }
    })
    results.push(result)
  }
  
  return results
}

// Test 5: Pagination (charger plusieurs pages)
async function testPagination() {
  const results = []
  
  for (let page = 1; page <= TEST_CONFIG.maxPages; page++) {
    const result = await measureTime(`Page ${page}`, async () => {
      const response = await fetch(`/api/products?page=${page}&limit=${TEST_CONFIG.pageSize}`)
      const data = await response.json()
      return {
        page,
        productsCount: data.products?.length || 0,
        loadTime: response.headers.get('x-response-time') || 'N/A'
      }
    })
    results.push(result)
    
    // Pause entre les pages pour simuler l'utilisation réelle
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return results
}

// Test 6: Recherche complexe (combinaison de filtres)
async function testComplexSearch() {
  const complexQueries = [
    { search: 'Samsung', category: 'Électronique', minPrice: 100, maxPrice: 1000 },
    { search: 'Pro', category: 'Informatique', minPrice: 500 },
    { category: 'Vêtements', maxPrice: 200 }
  ]
  
  const results = []
  
  for (const query of complexQueries) {
    const queryString = new URLSearchParams(query).toString()
    const result = await measureTime(`Recherche complexe: ${JSON.stringify(query)}`, async () => {
      const response = await fetch(`/api/products?${queryString}&limit=20`)
      const data = await response.json()
      return {
        query,
        resultsCount: data.products?.length || 0,
        totalMatches: data.totalCount || 0
      }
    })
    results.push(result)
  }
  
  return results
}

// Test 7: Stress test - Requêtes rapides successives
async function testStress() {
  console.log('🔥 Stress test - 20 requêtes rapides...')
  
  const promises = []
  for (let i = 0; i < 20; i++) {
    promises.push(
      measureTime(`Stress ${i + 1}`, async () => {
        const response = await fetch(`/api/products?page=${(i % 5) + 1}&limit=10`)
        const data = await response.json()
        return data.products?.length || 0
      })
    )
  }
  
  const results = await Promise.all(promises)
  return results
}

// Fonction principale de test
async function runPerformanceTests() {
  console.log('🚀 === DÉBUT DES TESTS DE PERFORMANCE ===\n')
  
  const startTime = Date.now()
  
  try {
    // Test 1: Chargement initial
    console.log('1️⃣ Test chargement initial...')
    await testInitialLoad()
    
    // Test 2: Recherche
    console.log('\n2️⃣ Test recherche...')
    await testSearch()
    
    // Test 3: Filtres catégorie
    console.log('\n3️⃣ Test filtres catégorie...')
    await testCategoryFilter()
    
    // Test 4: Filtres prix
    console.log('\n4️⃣ Test filtres prix...')
    await testPriceFilter()
    
    // Test 5: Pagination
    console.log('\n5️⃣ Test pagination...')
    await testPagination()
    
    // Test 6: Recherche complexe
    console.log('\n6️⃣ Test recherche complexe...')
    await testComplexSearch()
    
    // Test 7: Stress test
    console.log('\n7️⃣ Stress test...')
    await testStress()
    
    // Calculer les statistiques finales
    const endTime = Date.now()
    const totalDuration = endTime - startTime
    
    calculateSummary(totalDuration)
    displayResults()
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error)
  }
}

// Calculer le résumé des performances
function calculateSummary(totalDuration) {
  const successfulTests = performanceMetrics.tests.filter(t => t.success)
  const failedTests = performanceMetrics.tests.filter(t => !t.success)
  
  const durations = successfulTests.map(t => t.duration)
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
  const maxDuration = Math.max(...durations)
  const minDuration = Math.min(...durations)
  
  performanceMetrics.summary = {
    totalTests: performanceMetrics.tests.length,
    successfulTests: successfulTests.length,
    failedTests: failedTests.length,
    totalDuration,
    avgDuration,
    maxDuration,
    minDuration,
    successRate: (successfulTests.length / performanceMetrics.tests.length) * 100
  }
}

// Afficher les résultats
function displayResults() {
  console.log('\n📊 === RÉSULTATS DES TESTS DE PERFORMANCE ===')
  
  const s = performanceMetrics.summary
  
  console.log(`\n📈 Statistiques générales:`)
  console.log(`  Tests exécutés: ${s.totalTests}`)
  console.log(`  Succès: ${s.successfulTests} (${s.successRate.toFixed(1)}%)`)
  console.log(`  Échecs: ${s.failedTests}`)
  console.log(`  Durée totale: ${(s.totalDuration / 1000).toFixed(2)}s`)
  
  console.log(`\n⏱️ Temps de réponse:`)
  console.log(`  Moyenne: ${s.avgDuration.toFixed(2)}ms`)
  console.log(`  Maximum: ${s.maxDuration.toFixed(2)}ms`)
  console.log(`  Minimum: ${s.minDuration.toFixed(2)}ms`)
  
  // Tests les plus lents
  const slowestTests = performanceMetrics.tests
    .filter(t => t.success)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5)
  
  console.log(`\n🐌 Tests les plus lents:`)
  slowestTests.forEach((test, index) => {
    console.log(`  ${index + 1}. ${test.name}: ${test.duration.toFixed(2)}ms`)
  })
  
  // Recommandations
  console.log(`\n💡 Recommandations:`)
  if (s.avgDuration > 1000) {
    console.log(`  ⚠️ Temps de réponse moyen élevé (${s.avgDuration.toFixed(2)}ms)`)
    console.log(`     - Considérer l'ajout d'index sur la base de données`)
    console.log(`     - Implémenter la pagination côté serveur`)
    console.log(`     - Ajouter un cache Redis`)
  }
  
  if (s.maxDuration > 3000) {
    console.log(`  ⚠️ Certaines requêtes très lentes (${s.maxDuration.toFixed(2)}ms)`)
    console.log(`     - Optimiser les requêtes de recherche`)
    console.log(`     - Limiter les résultats de recherche`)
  }
  
  if (s.successRate < 95) {
    console.log(`  ⚠️ Taux de succès faible (${s.successRate.toFixed(1)}%)`)
    console.log(`     - Vérifier la stabilité du serveur`)
    console.log(`     - Implémenter des retry automatiques`)
  }
  
  console.log(`\n✅ Tests terminés! Données sauvegardées dans window.performanceMetrics`)
}

// Fonction pour exporter les résultats
function exportResults() {
  const results = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    metrics: performanceMetrics
  }
  
  const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `performance-test-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  console.log('📁 Résultats exportés en JSON')
}

// Rendre les fonctions disponibles globalement
window.runPerformanceTests = runPerformanceTests
window.exportResults = exportResults
window.performanceMetrics = performanceMetrics

console.log('✅ Script de test de performance chargé!')
console.log('\n🎯 Pour commencer les tests:')
console.log('runPerformanceTests()')
console.log('\n📁 Pour exporter les résultats:')
console.log('exportResults()')

console.log('\n⚠️ PRÉREQUIS:')
console.log('- Avoir généré 5000 produits de test')
console.log('- Être sur la page /dashboard/products')
console.log('- Avoir une connexion stable')
