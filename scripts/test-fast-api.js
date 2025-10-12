#!/usr/bin/env node

/**
 * 🚀 TEST SIMPLE DE L'API RAPIDE CORRIGÉE
 * 
 * Teste l'API /api/products/fast après correction du champ 'color'
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function testFastAPI() {
  console.log('🚀 === TEST API RAPIDE CORRIGÉE ===\n')

  try {
    console.log('📡 Test de l\'API /api/products/fast...')
    
    const start = Date.now()
    const response = await fetch(`${BASE_URL}/api/products/fast?limit=100&cache=true`)
    const end = Date.now()
    const responseTime = end - start

    console.log(`⏱️ Temps de réponse: ${responseTime}ms`)
    console.log(`📊 Status: ${response.status} ${response.statusText}`)

    if (response.ok) {
      const data = await response.json()
      console.log(`✅ Succès !`)
      console.log(`📦 Produits reçus: ${data.products?.length || 0}`)
      console.log(`💾 Cache utilisé: ${data.pagination?.cached ? 'Oui' : 'Non'}`)
      
      if (data.products && data.products.length > 0) {
        const firstProduct = data.products[0]
        console.log(`\n📋 Premier produit:`)
        console.log(`   ID: ${firstProduct.id}`)
        console.log(`   Nom: ${firstProduct.name}`)
        console.log(`   SKU: ${firstProduct.sku}`)
        console.log(`   Prix: ${firstProduct.price}€`)
        console.log(`   Stock: ${firstProduct.stock}`)
        console.log(`   Catégorie: ${firstProduct.category?.name || 'Aucune'}`)
      }

      // Test du cache
      console.log(`\n💾 Test du cache...`)
      const cacheStart = Date.now()
      const cacheResponse = await fetch(`${BASE_URL}/api/products/fast?limit=100&cache=true`)
      const cacheEnd = Date.now()
      const cacheTime = cacheEnd - cacheStart

      if (cacheResponse.ok) {
        const cacheData = await cacheResponse.json()
        console.log(`⚡ Temps avec cache: ${cacheTime}ms`)
        console.log(`💾 Cache hit: ${cacheData.pagination?.cached ? 'Oui' : 'Non'}`)
        
        if (cacheData.pagination?.cached && cacheTime < responseTime) {
          const improvement = Math.round((responseTime / cacheTime) * 100) / 100
          console.log(`🚀 Amélioration cache: ${improvement}x plus rapide`)
        }
      }

      // Évaluation des performances
      console.log(`\n📊 Évaluation des performances:`)
      if (responseTime < 500) {
        console.log(`🎉 EXCELLENT: < 500ms`)
      } else if (responseTime < 1000) {
        console.log(`✅ BON: < 1 seconde`)
      } else if (responseTime < 2000) {
        console.log(`⚠️ ACCEPTABLE: < 2 secondes`)
      } else {
        console.log(`❌ LENT: > 2 secondes`)
      }

    } else {
      const errorText = await response.text()
      console.log(`❌ Erreur: ${errorText}`)
    }

  } catch (error) {
    console.log(`❌ Erreur de connexion: ${error.message}`)
    console.log(`💡 Vérifiez que le serveur est démarré avec 'npm run dev'`)
  }
}

// Test de comparaison avec l'API standard
async function compareAPIs() {
  console.log('\n\n⚖️ === COMPARAISON DES APIs ===')

  try {
    // Test API standard
    console.log('\n📊 Test API standard (/api/products)...')
    const start1 = Date.now()
    const response1 = await fetch(`${BASE_URL}/api/products?limit=100`)
    const end1 = Date.now()
    const time1 = end1 - start1

    let data1 = null
    if (response1.ok) {
      data1 = await response1.json()
      console.log(`   Temps: ${time1}ms`)
      console.log(`   Produits: ${data1.products?.length || 0}`)
    } else {
      console.log(`   Erreur: ${response1.status}`)
    }

    // Test API rapide
    console.log('\n🚀 Test API rapide (/api/products/fast)...')
    const start2 = Date.now()
    const response2 = await fetch(`${BASE_URL}/api/products/fast?limit=100`)
    const end2 = Date.now()
    const time2 = end2 - start2

    let data2 = null
    if (response2.ok) {
      data2 = await response2.json()
      console.log(`   Temps: ${time2}ms`)
      console.log(`   Produits: ${data2.products?.length || 0}`)
    } else {
      console.log(`   Erreur: ${response2.status}`)
    }

    // Comparaison
    if (data1 && data2) {
      console.log(`\n📈 Comparaison:`)
      if (time2 < time1) {
        const improvement = Math.round((time1 / time2) * 100) / 100
        console.log(`✅ API rapide ${improvement}x plus rapide`)
        console.log(`⏱️ Gain: ${time1 - time2}ms`)
      } else {
        console.log(`⚠️ API rapide pas plus rapide`)
      }
    }

  } catch (error) {
    console.log(`❌ Erreur lors de la comparaison: ${error.message}`)
  }
}

// Fonction principale
async function main() {
  await testFastAPI()
  await compareAPIs()
  
  console.log('\n\n🎯 === RÉSUMÉ ===')
  console.log('✅ Test de l\'API rapide terminé')
  console.log('🔧 Correction du champ "color" appliquée')
  console.log('📊 Vérifiez les performances ci-dessus')
  console.log('')
  console.log('💡 Si l\'API fonctionne bien:')
  console.log('   - Le problème de champ "color" est résolu')
  console.log('   - L\'API rapide est opérationnelle')
  console.log('   - Le cache fonctionne correctement')
  console.log('')
  console.log('🚀 Prochaine étape: Tester dans la page Nouvelle Vente')
}

// Exécuter si appelé directement
if (require.main === module) {
  main()
}

module.exports = { testFastAPI, compareAPIs, main }
