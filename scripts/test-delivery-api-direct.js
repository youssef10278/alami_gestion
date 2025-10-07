/**
 * Test direct de l'API de bon de livraison
 */

const fetch = require('node-fetch')

async function testDeliveryAPI() {
  try {
    console.log('🧪 Test direct de l\'API de bon de livraison\n')

    // ID de la vente de test (récupéré du check-sales.js)
    const saleId = 'cmggg7imi0009tshcrcjjy9wt'
    const apiUrl = `http://localhost:3000/api/sales/${saleId}/delivery-note`

    console.log(`📡 Test de l'API: ${apiUrl}`)
    console.log('⏳ Envoi de la requête...')

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf'
      }
    })

    console.log(`📊 Statut de la réponse: ${response.status}`)
    console.log(`📋 Headers:`)
    for (const [key, value] of response.headers.entries()) {
      console.log(`   ${key}: ${value}`)
    }

    if (response.ok) {
      console.log('✅ Réponse réussie!')
      
      const buffer = await response.buffer()
      console.log(`📄 Taille du PDF: ${buffer.length} bytes`)

      // Sauvegarder le PDF pour vérification
      const fs = require('fs')
      const path = require('path')
      
      const outputPath = path.join(__dirname, '..', 'test-delivery-note-api.pdf')
      fs.writeFileSync(outputPath, buffer)
      
      console.log(`💾 PDF sauvegardé: ${outputPath}`)
      console.log('🎉 Test API réussi!')

    } else {
      console.log('❌ Erreur de l\'API:')
      const errorText = await response.text()
      console.log(errorText)
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

testDeliveryAPI().catch(console.error)
