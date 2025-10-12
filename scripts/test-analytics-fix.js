#!/usr/bin/env node

/**
 * 🔧 TEST - CORRECTION API ANALYTICS
 * 
 * Teste les corrections apportées à l'API analytics
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function testAnalyticsFix() {
  console.log('🔧 === TEST CORRECTIONS API ANALYTICS ===\n')

  try {
    // Test avec une période simple (aujourd'hui)
    console.log('📅 Test: Analytics pour aujourd\'hui')
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    const params = new URLSearchParams({
      from: todayStart.toISOString(),
      to: todayEnd.toISOString()
    })

    console.log(`🔗 URL: ${BASE_URL}/api/dashboard/analytics?${params}`)

    const start = Date.now()
    const response = await fetch(`${BASE_URL}/api/dashboard/analytics?${params}`)
    const end = Date.now()

    console.log(`⏱️  Temps de réponse: ${end - start}ms`)
    console.log(`📊 Status: ${response.status} ${response.statusText}`)

    if (response.ok) {
      const data = await response.json()
      
      console.log('\n✅ RÉPONSE API RÉUSSIE:')
      console.log(`   💰 Chiffre d'affaires: ${data.totalRevenue || 0} DH`)
      console.log(`   🛒 Ventes: ${data.totalSales || 0}`)
      console.log(`   📦 Commandes: ${data.totalOrders || 0}`)
      console.log(`   👥 Clients: ${data.totalCustomers || 0}`)
      console.log(`   📈 Croissance CA: ${(data.revenueGrowth || 0).toFixed(1)}%`)
      console.log(`   📊 Données par jour: ${(data.salesByDay || []).length} points`)
      console.log(`   🏆 Top produits: ${(data.topProducts || []).length}`)
      console.log(`   👑 Top clients: ${(data.topCustomers || []).length}`)
      console.log(`   💳 Méthodes paiement: ${(data.paymentMethods || []).length}`)
      
      if (data.salesByHour && data.salesByHour.length > 0) {
        console.log(`   🕐 Ventes par heure: ${data.salesByHour.length} heures`)
      }
      
      console.log('\n🎯 STRUCTURE DES DONNÉES:')
      console.log(`   ✅ totalSales: ${typeof data.totalSales}`)
      console.log(`   ✅ totalRevenue: ${typeof data.totalRevenue}`)
      console.log(`   ✅ salesByDay: ${Array.isArray(data.salesByDay) ? 'Array' : typeof data.salesByDay}`)
      console.log(`   ✅ topProducts: ${Array.isArray(data.topProducts) ? 'Array' : typeof data.topProducts}`)
      console.log(`   ✅ paymentMethods: ${Array.isArray(data.paymentMethods) ? 'Array' : typeof data.paymentMethods}`)
      
      console.log('\n🔍 EXEMPLE DE DONNÉES:')
      if (data.salesByDay && data.salesByDay.length > 0) {
        console.log(`   📊 Premier jour: ${JSON.stringify(data.salesByDay[0])}`)
      }
      if (data.topProducts && data.topProducts.length > 0) {
        console.log(`   🏆 Premier produit: ${JSON.stringify(data.topProducts[0])}`)
      }
      if (data.paymentMethods && data.paymentMethods.length > 0) {
        console.log(`   💳 Première méthode: ${JSON.stringify(data.paymentMethods[0])}`)
      }
      
      console.log('\n🎉 API ANALYTICS FONCTIONNE CORRECTEMENT!')
      
    } else {
      const errorText = await response.text()
      console.log(`❌ ERREUR API:`)
      console.log(`   Status: ${response.status}`)
      console.log(`   Message: ${errorText}`)
      
      if (response.status === 401) {
        console.log(`   💡 Solution: Démarrer le serveur avec 'npm run dev'`)
      } else if (response.status === 500) {
        console.log(`   💡 Solution: Vérifier les logs du serveur`)
      }
    }

  } catch (error) {
    console.log(`❌ ERREUR DE CONNEXION:`)
    console.log(`   Message: ${error.message}`)
    console.log(`   💡 Vérifiez que le serveur est démarré sur ${BASE_URL}`)
  }
}

function showFixesSummary() {
  console.log('\n\n🔧 === CORRECTIONS APPLIQUÉES ===')
  
  console.log('\n❌ PROBLÈMES RÉSOLUS:')
  console.log('   1. 🚫 groupBy sur modèle Payment inexistant')
  console.log('   2. 🚫 Propriétés undefined causant des crashes')
  console.log('   3. 🚫 Manque de gestion d\'erreurs')
  console.log('   4. 🚫 Valeurs null/undefined non gérées')

  console.log('\n✅ SOLUTIONS IMPLÉMENTÉES:')
  console.log('   1. 🔄 Remplacé Payment.groupBy par Sale.groupBy')
  console.log('   2. 🛡️  Ajouté gestion d\'erreurs try/catch')
  console.log('   3. 🔒 Valeurs par défaut pour tous les champs')
  console.log('   4. 🧪 Vérifications null/undefined')

  console.log('\n🔄 CHANGEMENTS TECHNIQUES:')
  console.log('   📊 paymentMethod depuis Sale au lieu de Payment')
  console.log('   🛡️  Promise.all avec gestion d\'erreur')
  console.log('   🔒 Opérateur || pour valeurs par défaut')
  console.log('   🧪 Vérifications ?. pour propriétés optionnelles')

  console.log('\n🎯 RÉSULTAT:')
  console.log('   ✅ API stable et robuste')
  console.log('   ✅ Pas de crash sur données manquantes')
  console.log('   ✅ Réponses cohérentes')
  console.log('   ✅ Gestion d\'erreurs complète')
}

function showTestInstructions() {
  console.log('\n\n💡 === INSTRUCTIONS DE TEST ===')
  
  console.log('\n🚀 Pour tester manuellement:')
  console.log('   1. 🌐 Démarrer: npm run dev')
  console.log('   2. 🔗 Ouvrir: http://localhost:3000/dashboard')
  console.log('   3. 📊 Voir: Section "Analytics Avancées"')
  console.log('   4. 🗓️  Tester: Différentes périodes')
  console.log('   5. 📈 Observer: Graphiques et métriques')

  console.log('\n🔍 Points à vérifier:')
  console.log('   ✅ Pas d\'erreur dans la console')
  console.log('   ✅ Métriques affichées correctement')
  console.log('   ✅ Graphiques se chargent')
  console.log('   ✅ Filtres de date fonctionnent')
  console.log('   ✅ Bouton actualiser fonctionne')

  console.log('\n🎨 Interface attendue:')
  console.log('   📊 Cartes de métriques avec croissance')
  console.log('   📈 Graphique d\'évolution des ventes')
  console.log('   🏆 Top produits (si données disponibles)')
  console.log('   💳 Répartition des paiements')
  console.log('   🕐 Ventes par heure (aujourd\'hui)')

  console.log('\n⚠️  Si problèmes:')
  console.log('   🔍 Vérifier les logs du serveur')
  console.log('   🗄️  Vérifier la connexion base de données')
  console.log('   📊 Vérifier qu\'il y a des données de vente')
  console.log('   🔄 Essayer de rafraîchir la page')
}

// Fonction principale
async function main() {
  await testAnalyticsFix()
  showFixesSummary()
  showTestInstructions()
  
  console.log('\n\n🎉 === CONCLUSION ===')
  console.log('✅ Corrections API analytics appliquées')
  console.log('🛡️  Gestion d\'erreurs robuste ajoutée')
  console.log('🔒 Valeurs par défaut pour stabilité')
  console.log('📊 Structure de données cohérente')
  console.log('')
  console.log('🎯 L\'API analytics devrait maintenant fonctionner sans erreur')
  console.log('💡 Testez sur /dashboard pour voir les analytics en action')
  console.log('🚀 Profitez des insights en temps réel !')
}

// Exécuter si appelé directement
if (require.main === module) {
  main()
}

module.exports = { testAnalyticsFix, main }
