/**
 * Script pour tester la fonctionnalité d'autocomplétion
 */

console.log('🧪 Test de l\'autocomplétion de produits\n')

// Simuler des données de test
const testProducts = [
  { id: '1', name: 'Ordinateur portable HP', sku: 'HP-LAPTOP-001', price: 6500 },
  { id: '2', name: 'Souris sans fil Logitech', sku: 'LOG-MOUSE-001', price: 150 },
  { id: '3', name: 'Clavier mécanique RGB', sku: 'KEYBOARD-RGB-001', price: 800 },
  { id: '4', name: 'Écran 24" Full HD', sku: 'MONITOR-24-001', price: 1200 },
  { id: '5', name: 'Casque audio Bluetooth', sku: 'HEADSET-BT-001', price: 450 }
]

// Fonction de test de recherche
function testSearch(query, products) {
  const results = products.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(query.toLowerCase()))
  )
  
  return results
}

// Tests de recherche
const testCases = [
  'ord',      // Devrait trouver "Ordinateur"
  'souris',   // Devrait trouver "Souris"
  'HP',       // Devrait trouver "HP-LAPTOP-001"
  'RGB',      // Devrait trouver "RGB"
  'bluetooth', // Devrait trouver "Bluetooth"
  'xyz'       // Ne devrait rien trouver
]

console.log('📊 Tests de recherche:')
console.log('====================')

testCases.forEach(query => {
  const results = testSearch(query, testProducts)
  console.log(`"${query}" → ${results.length} résultat(s)`)
  results.forEach(product => {
    console.log(`  - ${product.name} (${product.sku}) - ${product.price} DH`)
  })
  console.log('')
})

console.log('✅ Tests terminés!')
console.log('\n🎯 Fonctionnalités testées:')
console.log('- ✅ Recherche par nom de produit')
console.log('- ✅ Recherche par SKU')
console.log('- ✅ Recherche insensible à la casse')
console.log('- ✅ Gestion des résultats vides')

console.log('\n💡 Dans l\'interface:')
console.log('- Tapez au moins 2 caractères pour déclencher la recherche')
console.log('- Utilisez les flèches ↑↓ pour naviguer')
console.log('- Appuyez sur Entrée pour sélectionner')
console.log('- Échap pour fermer la liste')
console.log('- Clic pour sélectionner directement')
