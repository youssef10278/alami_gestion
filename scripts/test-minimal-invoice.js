// Test avec des données minimales valides
const testData = {
  customerName: 'Test Client',
  subtotal: 100,
  total: 120,
  items: [
    {
      productName: 'Produit Test',
      quantity: 1,
      unitPrice: 100,
      total: 100
    }
  ]
}

console.log('🧪 Test avec données minimales valides:')
console.log(JSON.stringify(testData, null, 2))

// Test avec des données vides (cas d'erreur)
const emptyData = {
  customerName: '',
  subtotal: 0,
  total: 0,
  items: []
}

console.log('\n❌ Test avec données vides:')
console.log(JSON.stringify(emptyData, null, 2))

console.log('\n📋 Instructions:')
console.log('1. Allez sur http://localhost:3002')
console.log('2. Connectez-vous avec admin@alami.ma / admin123')
console.log('3. Allez dans Factures > Nouvelle facture')
console.log('4. Remplissez au minimum:')
console.log('   - Nom du client: "Test Client"')
console.log('   - Ajoutez au moins un article')
console.log('5. Cliquez sur "Créer la facture"')
console.log('6. Vérifiez les logs du serveur pour voir les données reçues')
