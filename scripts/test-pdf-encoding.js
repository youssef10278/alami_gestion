/**
 * Script de test pour vérifier l'encodage des PDFs
 * Teste la génération de factures avec des caractères spéciaux
 */

const { PrismaClient } = require('@prisma/client')
const { generateManualInvoicePDF } = require('../lib/pdf-generator')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function testPDFEncoding() {
  console.log('🧪 Test de l\'encodage PDF...')

  try {
    // Données de test avec caractères spéciaux
    const testData = {
      invoiceNumber: 'FAC-000001',
      type: 'INVOICE',
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      customer: {
        name: 'Fatima Zahra',
        phone: '0623456789',
        email: 'fatima@fzcommerce.com',
        address: '456 Avenue Hassan II, Rabat\nMaroc',
        taxId: 'TF123456789'
      },
      items: [
        {
          productName: 'Téléphone Samsung Galaxy',
          productSku: 'TEL-001',
          description: 'Smartphone dernière génération',
          quantity: 2,
          unitPrice: 2500.00,
          discountAmount: 100.00,
          total: 4900.00
        },
        {
          productName: 'Écouteurs Bluetooth',
          productSku: 'ECO-002',
          description: 'Écouteurs sans fil haute qualité',
          quantity: 1,
          unitPrice: 350.00,
          discountAmount: 0,
          total: 350.00
        }
      ],
      subtotal: 5250.00,
      discountAmount: 100.00,
      taxRate: 20,
      taxAmount: 1030.00,
      total: 6180.00,
      notes: 'Merci pour votre confiance ! Garantie 2 ans incluse.',
      terms: 'Paiement à 30 jours. Pénalités de retard : 1,5% par mois.'
    }

    // Données d'entreprise avec caractères spéciaux
    const companyInfo = {
      name: 'Alami Gestion SARL',
      address: '123 Boulevard Mohammed V\nCasablanca 20000\nMaroc',
      phone: '+212 522 123 456',
      email: 'contact@alami-gestion.ma',
      ice: '123456789012345'
    }

    console.log('📄 Génération du PDF de test...')
    
    // Générer le PDF
    const pdfDoc = await generateManualInvoicePDF(testData, companyInfo)
    
    // Sauvegarder le PDF
    const outputDir = path.join(__dirname, '../test-output')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    const outputPath = path.join(outputDir, 'test-encoding-facture.pdf')
    const pdfBuffer = pdfDoc.output('arraybuffer')
    fs.writeFileSync(outputPath, Buffer.from(pdfBuffer))
    
    console.log('✅ PDF généré avec succès !')
    console.log(`📁 Fichier sauvegardé : ${outputPath}`)
    console.log('')
    console.log('🔍 Vérifications à effectuer :')
    console.log('- Les caractères français (é, è, à, ç) s\'affichent correctement')
    console.log('- Les caractères arabes sont translittérés ou affichés correctement')
    console.log('- Aucun caractère bizarre ou incompréhensible')
    console.log('- Le nom "Fatima Zahra" s\'affiche correctement')
    console.log('- L\'adresse avec "Mohammed V" s\'affiche correctement')
    console.log('')
    
    // Test avec facture d'avoir
    console.log('📄 Génération d\'une facture d\'avoir...')
    const creditNoteData = {
      ...testData,
      invoiceNumber: 'FAV-000001',
      type: 'CREDIT_NOTE',
      originalInvoice: {
        invoiceNumber: 'FAC-000001'
      },
      notes: 'Remboursement suite à retour de marchandise défectueuse.'
    }
    
    const creditNotePdf = await generateManualInvoicePDF(creditNoteData, companyInfo)
    const creditNoteOutputPath = path.join(outputDir, 'test-encoding-avoir.pdf')
    const creditNotePdfBuffer = creditNotePdf.output('arraybuffer')
    fs.writeFileSync(creditNoteOutputPath, Buffer.from(creditNotePdfBuffer))
    
    console.log('✅ Facture d\'avoir générée avec succès !')
    console.log(`📁 Fichier sauvegardé : ${creditNoteOutputPath}`)
    
  } catch (error) {
    console.error('❌ Erreur lors du test :', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le test
if (require.main === module) {
  testPDFEncoding()
    .then(() => {
      console.log('')
      console.log('🎉 Test terminé avec succès !')
      console.log('Ouvrez les fichiers PDF générés pour vérifier l\'encodage.')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Échec du test :', error)
      process.exit(1)
    })
}

module.exports = { testPDFEncoding }
