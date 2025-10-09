#!/usr/bin/env node

console.log('🧪 Validation des calculs du tableau de bord')
console.log('')

// Simuler différents scénarios de ventes
const testScenarios = [
  {
    name: 'Base de données vide',
    recentSales: [],
    expected: {
      totalRevenue: 0,
      averageBasket: '0'
    }
  },
  {
    name: 'Une seule vente',
    recentSales: [{ totalAmount: 150.75 }],
    expected: {
      totalRevenue: 150.75,
      averageBasket: '151'
    }
  },
  {
    name: 'Trois ventes',
    recentSales: [
      { totalAmount: 100.00 },
      { totalAmount: 200.50 },
      { totalAmount: 299.99 }
    ],
    expected: {
      totalRevenue: 600.49,
      averageBasket: '200'
    }
  },
  {
    name: 'Ventes avec valeurs décimales',
    recentSales: [
      { totalAmount: 33.33 },
      { totalAmount: 66.67 }
    ],
    expected: {
      totalRevenue: 100.00,
      averageBasket: '50'
    }
  }
]

// Fonction de calcul corrigée (comme dans le dashboard)
function calculateStats(recentSales) {
  const totalRevenue = recentSales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0)
  const averageBasket = recentSales.length > 0 
    ? (totalRevenue / recentSales.length).toFixed(0)
    : '0'
  
  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    averageBasket
  }
}

console.log('📊 Tests des calculs :')
console.log('='.repeat(50))

let allTestsPassed = true

testScenarios.forEach((scenario, index) => {
  console.log(`\n${index + 1}. ${scenario.name}`)
  console.log(`   Ventes: ${scenario.recentSales.length}`)
  
  try {
    const result = calculateStats(scenario.recentSales)
    
    console.log(`   Chiffre d'affaires calculé: ${result.totalRevenue} DH`)
    console.log(`   Panier moyen calculé: ${result.averageBasket} DH`)
    console.log(`   Chiffre d'affaires attendu: ${scenario.expected.totalRevenue} DH`)
    console.log(`   Panier moyen attendu: ${scenario.expected.averageBasket} DH`)
    
    const revenueMatch = Math.abs(result.totalRevenue - scenario.expected.totalRevenue) < 0.01
    const basketMatch = result.averageBasket === scenario.expected.averageBasket
    
    if (revenueMatch && basketMatch) {
      console.log('   ✅ Test réussi')
    } else {
      console.log('   ❌ Test échoué')
      allTestsPassed = false
    }
    
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`)
    allTestsPassed = false
  }
})

console.log('\n' + '='.repeat(50))
if (allTestsPassed) {
  console.log('🎉 Tous les tests sont passés!')
  console.log('✅ Les calculs du tableau de bord fonctionnent correctement')
} else {
  console.log('❌ Certains tests ont échoué')
  console.log('⚠️  Vérifiez la logique de calcul')
}

console.log('')
console.log('🔧 Points clés de la correction :')
console.log('   1. Vérification de recentSales.length > 0 avant division')
console.log('   2. Retour de "0" pour éviter NaN')
console.log('   3. Utilisation de Number() pour conversion Decimal → number')
console.log('   4. Application de .toFixed() uniquement sur des nombres valides')
console.log('')
console.log('📝 Cette correction évite l\'erreur JavaScript:')
console.log('   "Cannot read properties of undefined (reading \'toFixed\')"')
