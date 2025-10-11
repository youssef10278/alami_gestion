#!/usr/bin/env node

/**
 * Script de test pour tester l'API de génération de bon de livraison
 * et vérifier que le logo s'affiche correctement
 */

const fs = require('fs')
const path = require('path')

async function testDeliveryNoteAPI() {
  console.log('🧪 Test de l\'API de génération de bon de livraison')
  console.log('=' .repeat(60))

  try {
    // 1. Tester l'API de récupération des paramètres
    console.log('📋 1. Test de l\'API des paramètres d\'entreprise...')
    
    const settingsResponse = await fetch('http://localhost:3000/api/settings/company')
    if (!settingsResponse.ok) {
      throw new Error(`Erreur API paramètres: ${settingsResponse.status}`)
    }
    
    const settings = await settingsResponse.json()
    console.log('✅ Paramètres récupérés:', {
      name: settings.companyName,
      hasLogo: !!settings.companyLogo,
      logoUrl: settings.companyLogo,
      address: settings.companyAddress,
      phone: settings.companyPhone,
      email: settings.companyEmail
    })

    // 2. Tester l'API de récupération des ventes
    console.log('\n📦 2. Test de l\'API des ventes...')
    
    const salesResponse = await fetch('http://localhost:3000/api/sales?limit=1')
    if (!salesResponse.ok) {
      throw new Error(`Erreur API ventes: ${salesResponse.status}`)
    }
    
    const salesData = await salesResponse.json()
    const sales = salesData.sales || []
    
    if (sales.length === 0) {
      console.log('⚠️ Aucune vente trouvée, impossible de tester la génération')
      return
    }
    
    const testSale = sales[0]
    console.log('✅ Vente trouvée:', {
      id: testSale.id,
      saleNumber: testSale.saleNumber,
      status: testSale.status,
      itemsCount: testSale.items?.length || 0
    })

    // 3. Tester la génération du bon de livraison
    console.log('\n📄 3. Test de génération du bon de livraison...')
    
    const deliveryNoteResponse = await fetch(`http://localhost:3000/api/sales/${testSale.id}/delivery-note`)
    if (!deliveryNoteResponse.ok) {
      const errorText = await deliveryNoteResponse.text()
      throw new Error(`Erreur génération bon de livraison: ${deliveryNoteResponse.status} - ${errorText}`)
    }
    
    const pdfBuffer = await deliveryNoteResponse.arrayBuffer()
    console.log('✅ Bon de livraison généré avec succès, taille:', pdfBuffer.byteLength, 'bytes')

    // 4. Sauvegarder le PDF pour inspection
    const outputDir = path.join(__dirname, '..', 'test-outputs')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const outputPath = path.join(outputDir, `delivery-note-api-test-${Date.now()}.pdf`)
    fs.writeFileSync(outputPath, Buffer.from(pdfBuffer))
    console.log('💾 PDF sauvegardé:', outputPath)

    // 5. Résumé du test
    console.log('\n📊 4. Résumé du test API:')
    console.log('=' .repeat(40))
    console.log(`✅ Paramètres entreprise: ${settings.companyName}`)
    console.log(`✅ Logo configuré: ${settings.companyLogo ? 'OUI' : 'NON'}`)
    console.log(`✅ Vente testée: ${testSale.saleNumber}`)
    console.log(`✅ PDF généré: ${pdfBuffer.byteLength} bytes`)
    console.log(`✅ Fichier sauvegardé: ${outputPath}`)
    
    if (settings.companyLogo) {
      console.log('\n🎯 Vérifiez le fichier PDF pour confirmer que le logo s\'affiche correctement!')
      console.log(`🔗 URL du logo: ${settings.companyLogo}`)
    } else {
      console.log('\n⚠️ Aucun logo configuré - le PDF devrait afficher un cercle avec initiale')
      console.log('💡 Pour tester avec un logo, ajoutez-en un dans les paramètres de l\'entreprise')
    }

  } catch (error) {
    console.error('❌ Erreur lors du test API:', error)
    console.error('Stack trace:', error.stack)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Assurez-vous que le serveur de développement est démarré:')
      console.log('   npm run dev')
    }
  }
}

// Exécuter le test
testDeliveryNoteAPI()
  .then(() => {
    console.log('\n✅ Test API terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test API échoué:', error)
    process.exit(1)
  })
