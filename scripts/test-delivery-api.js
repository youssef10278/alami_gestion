/**
 * Script pour tester l'API de bon de livraison
 */

async function testDeliveryAPI() {
  try {
    console.log('🧪 Test de l\'API de bon de livraison\n')

    // ID de vente à tester (remplacez par un ID réel)
    const saleId = 'cmggfdh8r0009tsr0kiixp48k' // L'ID de l'erreur

    console.log('📞 Appel API:', `http://localhost:3000/api/sales/${saleId}/delivery-note`)

    const response = await fetch(`http://localhost:3000/api/sales/${saleId}/delivery-note`)
    
    console.log('📊 Statut de la réponse:', response.status)
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()))

    if (response.ok) {
      console.log('✅ Succès! PDF généré')
      const blob = await response.blob()
      console.log('📄 Taille du PDF:', blob.size, 'bytes')
    } else {
      console.log('❌ Erreur HTTP:', response.status)
      const errorText = await response.text()
      console.log('❌ Détails de l\'erreur:', errorText)
      
      try {
        const errorJson = JSON.parse(errorText)
        console.log('❌ Erreur JSON:', errorJson)
      } catch (e) {
        console.log('❌ Erreur non-JSON:', errorText)
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

// Vérifier si nous sommes dans un environnement Node.js
if (typeof window === 'undefined') {
  // Node.js - utiliser node-fetch
  const fetch = require('node-fetch')
  testDeliveryAPI().catch(console.error)
} else {
  // Navigateur
  testDeliveryAPI().catch(console.error)
}
