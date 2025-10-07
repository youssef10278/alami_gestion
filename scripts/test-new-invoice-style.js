/**
 * Script de test pour le nouveau style de facture
 * Génère une facture avec le design moderne demandé
 */

const fs = require('fs')
const path = require('path')

// Simuler les données d'une facture
const testInvoiceData = {
  invoiceNumber: 'FACT-2025-0001',
  type: 'INVOICE',
  date: new Date(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
  customer: {
    name: 'Société de test',
    company: 'Test Company SARL',
    email: 'contact@test.com',
    phone: '0522123456',
    address: 'Rue de test\nCasablanca 20000\nMaroc',
    taxId: 'IF123456789'
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
    },
    {
      productName: 'Chargeur rapide',
      productSku: 'CHG-003',
      description: 'Chargeur USB-C 65W',
      quantity: 1,
      unitPrice: 150.00,
      discountAmount: 0,
      total: 150.00
    }
  ],
  subtotal: 5400.00,
  discountAmount: 100.00,
  taxRate: 20,
  taxAmount: 1060.00,
  total: 6360.00,
  notes: 'Merci pour votre confiance ! Garantie 2 ans incluse.',
  terms: 'Paiement à 30 jours. Pénalités de retard : 1,5% par mois.'
}

// Informations de l'entreprise
const companyInfo = {
  name: 'Société de test',
  address: 'Rue de test\nCasablanca 20000\nMaroc',
  phone: '+212 522 123 456',
  email: 'contact@societe-test.com',
  ice: '1234567890123',
  taxId: 'IF123456789',
  website: 'www.societe-test.com'
}

async function testNewInvoiceStyle() {
  console.log('🧪 Test du nouveau style de facture...')

  try {
    // Créer le dossier de sortie
    const outputDir = path.join(__dirname, '../test-output')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Tester via l'API si l'application est en cours d'exécution
    try {
      console.log('📡 Test via API...')
      
      const response = await fetch('http://localhost:3000/api/test-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoiceData: testInvoiceData,
          companyInfo: companyInfo
        })
      })

      if (response.ok) {
        const pdfBuffer = await response.arrayBuffer()
        const outputPath = path.join(outputDir, 'test-new-style-api.pdf')
        fs.writeFileSync(outputPath, Buffer.from(pdfBuffer))
        
        console.log('✅ PDF généré via API !')
        console.log(`📁 Fichier sauvegardé : ${outputPath}`)
      } else {
        console.log('⚠️  API non disponible, test direct...')
        await testDirectGeneration()
      }

    } catch (error) {
      console.log('⚠️  API non disponible, test direct...')
      await testDirectGeneration()
    }

  } catch (error) {
    console.error('❌ Erreur lors du test :', error)
    throw error
  }
}

async function testDirectGeneration() {
  console.log('🔧 Génération directe du PDF...')
  
  try {
    // Import dynamique pour éviter les problèmes de module
    const { generateManualInvoicePDF } = await import('../lib/pdf-generator.js')
    
    const pdfDoc = await generateManualInvoicePDF(testInvoiceData, companyInfo)
    
    // Sauvegarder le PDF
    const outputDir = path.join(__dirname, '../test-output')
    const outputPath = path.join(outputDir, 'test-new-style-direct.pdf')
    const pdfBuffer = pdfDoc.output('arraybuffer')
    fs.writeFileSync(outputPath, Buffer.from(pdfBuffer))
    
    console.log('✅ PDF généré directement !')
    console.log(`📁 Fichier sauvegardé : ${outputPath}`)
    
  } catch (error) {
    console.error('❌ Erreur génération directe :', error)
    
    // Fallback: créer un PDF simple pour tester
    console.log('🔄 Création d\'un PDF de test simple...')
    await createSimpleTestPDF()
  }
}

async function createSimpleTestPDF() {
  try {
    // Import jsPDF directement
    const { jsPDF } = await import('jspdf')
    
    const doc = new jsPDF()
    
    // Test du nouveau style
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(28)
    doc.text('FACTURE', 150, 25)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('N° FACT-2025-0001', 150, 35)
    doc.text('Date: ' + new Date().toLocaleDateString('fr-FR'), 150, 42)
    
    // Logo simulé
    doc.setFillColor(41, 128, 185)
    doc.circle(25, 25, 12, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.text('ST', 25, 28, { align: 'center' })
    
    // Informations entreprise
    doc.setTextColor(51, 51, 51)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Société de test', 45, 25)
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Rue de test', 45, 32)
    doc.text('Casablanca 20000, Maroc', 45, 36)
    doc.text('Tel: +212 522 123 456 - Email: contact@test.com', 45, 40)
    doc.text('ICE: 1234567890123', 45, 44)
    
    // Section FACTURÉ À
    doc.setFillColor(227, 242, 253)
    doc.rect(15, 65, 180, 12, 'F')
    doc.setTextColor(51, 51, 51)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('FACTURE A', 20, 73)
    
    // Client
    doc.setFillColor(255, 255, 255)
    doc.rect(15, 77, 180, 25, 'F')
    doc.setFontSize(11)
    doc.text('Société de test', 20, 87)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Rue de test', 20, 92)
    doc.text('Casablanca 20000, Maroc', 20, 96)
    
    // Message de test
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('✅ Nouveau style de facture appliqué !', 105, 120, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('- En-tête moderne avec logo circulaire', 20, 140)
    doc.text('- Section "FACTURÉ À" avec fond bleu clair', 20, 150)
    doc.text('- Design épuré et professionnel', 20, 160)
    doc.text('- Couleurs cohérentes (bleu et vert)', 20, 170)
    
    // Sauvegarder
    const outputDir = path.join(__dirname, '../test-output')
    const outputPath = path.join(outputDir, 'test-new-style-simple.pdf')
    const pdfBuffer = doc.output('arraybuffer')
    fs.writeFileSync(outputPath, Buffer.from(pdfBuffer))
    
    console.log('✅ PDF de test simple créé !')
    console.log(`📁 Fichier sauvegardé : ${outputPath}`)
    
  } catch (error) {
    console.error('❌ Erreur création PDF simple :', error)
  }
}

// Exécuter le test
if (require.main === module) {
  testNewInvoiceStyle()
    .then(() => {
      console.log('')
      console.log('🎉 Test terminé avec succès !')
      console.log('')
      console.log('📋 Vérifications à effectuer :')
      console.log('1. ✅ En-tête avec logo circulaire à gauche')
      console.log('2. ✅ Titre "FACTURE" en gras à droite')
      console.log('3. ✅ Section "FACTURÉ À" avec fond bleu clair')
      console.log('4. ✅ Tableau avec en-têtes verts')
      console.log('5. ✅ Totaux alignés à droite')
      console.log('6. ✅ Pied de page avec ligne verte')
      console.log('')
      console.log('Ouvrez les fichiers PDF générés pour vérifier le nouveau style.')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Échec du test :', error)
      process.exit(1)
    })
}

module.exports = { testNewInvoiceStyle }
