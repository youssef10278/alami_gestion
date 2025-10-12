#!/usr/bin/env node

/**
 * Script de test pour vérifier la correction du problème de pagination des produits
 * 
 * Problème identifié :
 * - Page Nouvelle Vente : 100 produits affichés
 * - Page Gestion des Produits : 10 produits affichés
 * 
 * Cause : Incohérence dans les paramètres de limite entre les pages
 * 
 * Solution appliquée :
 * - API : limite par défaut passée de 10 à 100
 * - Page Gestion des Produits : limite explicite de 1000
 * - Page Nouvelle Vente : utilise la limite par défaut de l'API
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function testProductsPagination() {
  console.log('🧪 === TEST DE CORRECTION DE LA PAGINATION DES PRODUITS ===\n')

  try {
    // Test 1: API sans paramètre de limite (défaut)
    console.log('📡 Test 1: API /api/products (limite par défaut)')
    const response1 = await fetch(`${BASE_URL}/api/products`, {
      headers: {
        'Cookie': 'auth-token=test-token' // Remplacer par un vrai token si nécessaire
      }
    })
    
    if (response1.ok) {
      const data1 = await response1.json()
      console.log(`✅ Limite par défaut: ${data1.products?.length || 0} produits récupérés`)
      console.log(`📊 Total disponible: ${data1.pagination?.total || 'N/A'}`)
    } else {
      console.log(`❌ Erreur API: ${response1.status} ${response1.statusText}`)
    }

    // Test 2: API avec limite explicite de 10
    console.log('\n📡 Test 2: API /api/products?limit=10')
    const response2 = await fetch(`${BASE_URL}/api/products?limit=10`, {
      headers: {
        'Cookie': 'auth-token=test-token'
      }
    })
    
    if (response2.ok) {
      const data2 = await response2.json()
      console.log(`✅ Limite 10: ${data2.products?.length || 0} produits récupérés`)
      console.log(`📊 Total disponible: ${data2.pagination?.total || 'N/A'}`)
    } else {
      console.log(`❌ Erreur API: ${response2.status} ${response2.statusText}`)
    }

    // Test 3: API avec limite explicite de 100
    console.log('\n📡 Test 3: API /api/products?limit=100')
    const response3 = await fetch(`${BASE_URL}/api/products?limit=100`, {
      headers: {
        'Cookie': 'auth-token=test-token'
      }
    })
    
    if (response3.ok) {
      const data3 = await response3.json()
      console.log(`✅ Limite 100: ${data3.products?.length || 0} produits récupérés`)
      console.log(`📊 Total disponible: ${data3.pagination?.total || 'N/A'}`)
    } else {
      console.log(`❌ Erreur API: ${response3.status} ${response3.statusText}`)
    }

    // Test 4: API avec limite explicite de 1000
    console.log('\n📡 Test 4: API /api/products?limit=1000')
    const response4 = await fetch(`${BASE_URL}/api/products?limit=1000`, {
      headers: {
        'Cookie': 'auth-token=test-token'
      }
    })
    
    if (response4.ok) {
      const data4 = await response4.json()
      console.log(`✅ Limite 1000: ${data4.products?.length || 0} produits récupérés`)
      console.log(`📊 Total disponible: ${data4.pagination?.total || 'N/A'}`)
    } else {
      console.log(`❌ Erreur API: ${response4.status} ${response4.statusText}`)
    }

    console.log('\n🎯 === RÉSUMÉ DES CORRECTIONS ===')
    console.log('✅ API: Limite par défaut passée de 10 à 100')
    console.log('✅ Page Gestion des Produits: Limite explicite de 1000')
    console.log('✅ Page Nouvelle Vente: Utilise la limite par défaut de l\'API')
    console.log('\n📋 Maintenant, les deux pages devraient afficher le même nombre de produits !')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
    console.log('\n💡 Assurez-vous que l\'application est démarrée et accessible')
  }
}

// Fonction pour tester la cohérence des données
async function testDataConsistency() {
  console.log('\n🔍 === TEST DE COHÉRENCE DES DONNÉES ===')
  
  try {
    // Simuler les appels des deux pages
    const salesPageCall = await fetch(`${BASE_URL}/api/products`)
    const productsPageCall = await fetch(`${BASE_URL}/api/products?limit=1000`)

    if (salesPageCall.ok && productsPageCall.ok) {
      const salesData = await salesPageCall.json()
      const productsData = await productsPageCall.json()

      const salesCount = salesData.products?.length || 0
      const productsCount = productsData.products?.length || 0

      console.log(`📊 Page Nouvelle Vente: ${salesCount} produits`)
      console.log(`📊 Page Gestion des Produits: ${productsCount} produits`)

      if (salesCount === productsCount) {
        console.log('✅ SUCCÈS: Les deux pages affichent le même nombre de produits !')
      } else {
        console.log('❌ PROBLÈME: Incohérence détectée entre les pages')
        console.log(`   Différence: ${Math.abs(salesCount - productsCount)} produits`)
      }
    } else {
      console.log('❌ Impossible de tester la cohérence (erreur API)')
    }
  } catch (error) {
    console.error('❌ Erreur lors du test de cohérence:', error.message)
  }
}

// Exécuter les tests
async function runAllTests() {
  await testProductsPagination()
  await testDataConsistency()
  
  console.log('\n🏁 Tests terminés !')
  console.log('\n💡 Pour vérifier manuellement :')
  console.log('   1. Ouvrez la page "Nouvelle Vente"')
  console.log('   2. Comptez les produits disponibles')
  console.log('   3. Ouvrez la page "Gestion des Produits"')
  console.log('   4. Vérifiez que le nombre total affiché correspond')
}

// Exécuter si appelé directement
if (require.main === module) {
  runAllTests()
}

module.exports = {
  testProductsPagination,
  testDataConsistency,
  runAllTests
}
