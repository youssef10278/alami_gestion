/**
 * Script pour tester directement le générateur PDF
 */

// Simuler les données d'un bon de livraison
const testData = {
  saleNumber: 'VTE-00000001',
  customerName: 'SARL TECH SOLUTIONS',
  customerAddress: '123 Avenue Mohammed V, Casablanca',
  customerPhone: '+212 522 123 456',
  sellerName: 'Ahmed Alami',
  items: [
    {
      productName: 'Ordinateur portable HP',
      productSku: 'HP-LAPTOP-001',
      quantity: 1,
      description: 'Ordinateur portable HP 15.6" Intel Core i5, 8GB RAM, 256GB SSD'
    },
    {
      productName: 'Souris sans fil Logitech',
      productSku: 'LOG-MOUSE-001',
      quantity: 1,
      description: 'Souris optique sans fil avec récepteur USB'
    },
    {
      productName: 'Clavier mécanique RGB',
      productSku: 'KEYBOARD-RGB-001',
      quantity: 1,
      description: 'Clavier mécanique avec rétroéclairage RGB et switches bleus'
    }
  ],
  notes: 'Livraison urgente - Contacter le client avant livraison',
  createdAt: new Date(),
  companySettings: {
    name: 'ALAMI GESTION',
    address: '456 Boulevard Zerktouni, Casablanca',
    phone: '+212 522 987 654',
    email: 'contact@alamigestion.ma',
    primaryColor: '#10B981'
  }
}

async function testPDFGenerator() {
  try {
    console.log('🧪 Test du générateur PDF de bon de livraison\n')

    // Importer le générateur
    const { generateDeliveryNotePDF } = require('../lib/delivery-note-generator.ts')

    console.log('📊 Données de test:')
    console.log(`   Numéro: ${testData.saleNumber}`)
    console.log(`   Client: ${testData.customerName}`)
    console.log(`   Vendeur: ${testData.sellerName}`)
    console.log(`   Articles: ${testData.items.length}`)

    console.log('\n📄 Génération du PDF...')
    const pdfBuffer = await generateDeliveryNotePDF(testData)

    console.log('✅ PDF généré avec succès!')
    console.log(`📊 Taille: ${pdfBuffer.length} bytes`)

    // Sauvegarder le PDF pour test
    const fs = require('fs')
    const path = require('path')
    
    const outputPath = path.join(__dirname, '..', 'test-delivery-note.pdf')
    fs.writeFileSync(outputPath, pdfBuffer)
    
    console.log(`💾 PDF sauvegardé: ${outputPath}`)
    console.log('🎉 Test réussi!')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
    console.error('❌ Stack:', error.stack)
  }
}

testPDFGenerator().catch(console.error)
