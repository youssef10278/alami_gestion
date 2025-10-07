/**
 * Script de test pour générer un PDF avec des paramètres de design personnalisés
 */

const { generateManualInvoicePDF } = require('../lib/pdf-generator')
const fs = require('fs')
const path = require('path')

async function testPDFWithDesign() {
  console.log('🧪 Test de génération PDF avec design personnalisé...')

  try {
    // Données de test pour la facture
    const testInvoiceData = {
      invoiceNumber: 'TEST-001',
      type: 'INVOICE',
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      customer: {
        name: 'Client Test SARL',
        company: 'Test Company',
        email: 'test@example.com',
        phone: '0522 123 456',
        address: '123 Avenue Test\nCasablanca 20000\nMaroc',
        taxId: 'IF123456789'
      },
      items: [
        {
          productName: 'Produit Test 1',
          productSku: 'TEST-001',
          description: 'Description du produit test',
          quantity: 2,
          unitPrice: 1500.00,
          discountAmount: 100.00,
          total: 2900.00
        },
        {
          productName: 'Service Test',
          productSku: 'SERV-001',
          description: 'Service de test',
          quantity: 1,
          unitPrice: 800.00,
          discountAmount: 0,
          total: 800.00
        }
      ],
      subtotal: 3700.00,
      discountAmount: 100.00,
      taxRate: 20,
      taxAmount: 720.00,
      total: 4320.00,
      notes: 'Ceci est un test avec design personnalisé',
      terms: 'Conditions de test'
    }

    // Informations de l'entreprise de test
    const testCompanyInfo = {
      name: 'Entreprise Test',
      address: 'Adresse Test\nVille Test\nMaroc',
      phone: '+212 XXX XXX XXX',
      email: 'test@entreprise.com',
      ice: 'XXXXXXXXXXXXXXXXX',
      taxId: 'IFXXXXXXXXX',
      website: 'www.entreprise-test.com',
      logo: undefined
    }

    // Paramètres de design personnalisés
    const customDesignSettings = {
      invoiceTheme: 'modern',
      primaryColor: '#FF6B35',      // Orange vif
      secondaryColor: '#05FFAC',    // Vert fluo (comme dans la DB)
      accentColor: '#FFD23F',       // Jaune
      textColor: '#2C3E50',         // Bleu foncé
      headerTextColor: '#FFFFFF',   // Blanc
      sectionTextColor: '#000000',  // Noir
      backgroundColor: '#FFFFFF',   // Blanc
      headerStyle: 'gradient',
      logoPosition: 'left',
      logoSize: 'medium',
      fontFamily: 'helvetica',
      fontSize: 'normal',
      borderRadius: 'rounded',
      showWatermark: true,
      watermarkText: 'TEST DESIGN',
      customCSS: ''
    }

    console.log('🎨 Paramètres de design utilisés :')
    console.log(JSON.stringify(customDesignSettings, null, 2))

    // Générer le PDF
    console.log('📄 Génération du PDF...')
    const pdfDoc = await generateManualInvoicePDF(testInvoiceData, testCompanyInfo, customDesignSettings)

    // Sauvegarder le PDF
    const outputPath = path.join(__dirname, '..', 'test-design-output.pdf')
    const pdfBuffer = pdfDoc.output('arraybuffer')
    fs.writeFileSync(outputPath, Buffer.from(pdfBuffer))

    console.log('✅ PDF généré avec succès !')
    console.log(`📁 Fichier sauvegardé : ${outputPath}`)
    console.log('')
    console.log('🔍 Vérifiez le PDF pour voir si les couleurs personnalisées sont appliquées :')
    console.log('- En-têtes de tableau en vert fluo (#05FFAC)')
    console.log('- Texte des sections en noir (#000000)')
    console.log('- Filigrane "TEST DESIGN" visible')

  } catch (error) {
    console.error('❌ Erreur lors du test :', error)
    throw error
  }
}

// Exécuter le test
if (require.main === module) {
  testPDFWithDesign()
    .then(() => {
      console.log('🎉 Test terminé !')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Erreur :', error)
      process.exit(1)
    })
}

module.exports = { testPDFWithDesign }
