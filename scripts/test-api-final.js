/**
 * Test final de l'API de bon de livraison
 */

const fetch = require('node-fetch')

async function testAPIFinal() {
  try {
    console.log('🧪 Test final de l\'API de bon de livraison\n')

    // Attendre que le serveur soit prêt
    console.log('⏳ Attente du serveur...')
    await new Promise(resolve => setTimeout(resolve, 5000))

    // ID de la vente de test
    const saleId = 'cmgghk6uj0001ts4wp20yskt8'
    const apiUrl = `http://localhost:3000/api/sales/${saleId}/delivery-note`

    console.log(`📡 Test de l'API: ${apiUrl}`)
    console.log('⏳ Envoi de la requête...')

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
        'User-Agent': 'Test-Script/1.0'
      }
    })

    console.log(`📊 Statut de la réponse: ${response.status} ${response.statusText}`)
    console.log(`📋 Headers de réponse:`)
    for (const [key, value] of response.headers.entries()) {
      console.log(`   ${key}: ${value}`)
    }

    if (response.ok) {
      console.log('✅ Réponse réussie!')
      
      const buffer = await response.buffer()
      console.log(`📄 Taille du PDF: ${buffer.length} bytes`)

      if (buffer.length > 0) {
        // Sauvegarder le PDF pour vérification
        const fs = require('fs')
        const path = require('path')
        
        const outputPath = path.join(__dirname, '..', 'test-delivery-note-final.pdf')
        fs.writeFileSync(outputPath, buffer)
        
        console.log(`💾 PDF sauvegardé: ${outputPath}`)
        console.log('🎉 Test API réussi!')
        
        // Vérifier que c'est bien un PDF
        const pdfHeader = buffer.slice(0, 4).toString()
        if (pdfHeader === '%PDF') {
          console.log('✅ Format PDF valide confirmé')
        } else {
          console.log('❌ Format PDF invalide, header:', pdfHeader)
        }
      } else {
        console.log('❌ PDF vide reçu')
      }

    } else {
      console.log('❌ Erreur de l\'API:')
      const errorText = await response.text()
      console.log('📄 Réponse d\'erreur:')
      console.log(errorText)
      
      try {
        const errorJson = JSON.parse(errorText)
        console.log('📋 Détails de l\'erreur:', errorJson)
      } catch (e) {
        console.log('📋 Réponse non-JSON:', errorText)
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
    console.error('❌ Stack:', error.stack)
  }
}

testAPIFinal().catch(console.error)
