/**
 * Script de test pour générer une facture PDF avec montant en lettres
 * Usage: node scripts/test-invoice-with-words.js
 */

const { generateManualInvoicePDF } = require('../lib/pdf-generator.ts')
const fs = require('fs')
const path = require('path')

console.log('🧪 Test de génération de facture avec montant en lettres\n')

// Données de test pour la facture
const testInvoiceData = {
  invoiceNumber: 'FAC-000123',
  type: 'INVOICE',
  date: new Date(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
  customer: {
    name: 'Société Test SARL',
    phone: '+212 6 12 34 56 78',
    email: 'contact@societe-test.ma',
    address: '123 Boulevard Hassan II\nRabat 10000\nMaroc',
    taxId: 'IF12345678'
  },
  items: [
    {
      productName: 'Ordinateur portable HP',
      productSku: 'HP-LAPTOP-001',
      description: 'Ordinateur portable HP 15.6" Intel Core i5',
      quantity: 2,
      unitPrice: 6500.00,
      discountAmount: 0,
      total: 13000.00
    },
    {
      productName: 'Souris sans fil',
      productSku: 'MOUSE-WIRELESS-001',
      description: 'Souris optique sans fil 2.4GHz',
      quantity: 3,
      unitPrice: 150.00,
      discountAmount: 0,
      total: 450.00
    },
    {
      productName: 'Clavier mécanique',
      productSku: 'KEYBOARD-MECH-001',
      description: 'Clavier mécanique RGB rétroéclairé',
      quantity: 1,
      unitPrice: 800.00,
      discountAmount: 50.00,
      total: 750.00
    }
  ],
  subtotal: 14200.00,
  discountAmount: 50.00,
  taxRate: 20,
  taxAmount: 2830.00,
  total: 16980.00,
  notes: 'Merci pour votre confiance. Facture de test avec montant en lettres.',
  terms: 'Paiement à 30 jours. Pénalités de retard : 3% par mois.'
}

// Informations de l'entreprise de test
const testCompanyInfo = {
  name: 'Alami Gestion SARL',
  address: '456 Avenue Mohammed V\nCasablanca 20000\nMaroc',
  phone: '+212 5 22 12 34 56',
  email: 'contact@alami-gestion.ma',
  ice: 'ICE001234567890123',
  taxId: 'IF87654321',
  website: 'www.alami-gestion.ma',
  logo: undefined
}

// Paramètres de design de test
const testDesignSettings = {
  primaryColor: '#2563EB',
  secondaryColor: '#10B981',
  tableHeaderColor: '#10B981',
  sectionColor: '#10B981',
  accentColor: '#F59E0B',
  textColor: '#1F2937',
  headerTextColor: '#FFFFFF',
  sectionTextColor: '#FFFFFF',
  backgroundColor: '#FFFFFF',
  headerStyle: 'gradient',
  logoPosition: 'left',
  logoSize: 'medium',
  fontFamily: 'helvetica',
  fontSize: 'normal',
  borderRadius: 'rounded',
  showWatermark: false,
  watermarkText: ''
}

async function generateTestInvoice() {
  try {
    console.log('📄 Génération de la facture de test...')
    
    // Générer le PDF
    const pdfDoc = await generateManualInvoicePDF(
      testInvoiceData,
      testCompanyInfo,
      testDesignSettings
    )
    
    // Créer le dossier de sortie s'il n'existe pas
    const outputDir = path.join(__dirname, '..', 'test-output')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    // Sauvegarder le PDF
    const outputPath = path.join(outputDir, 'test-invoice-with-words.pdf')
    const pdfBuffer = pdfDoc.output('arraybuffer')
    fs.writeFileSync(outputPath, Buffer.from(pdfBuffer))
    
    console.log(`✅ Facture générée avec succès: ${outputPath}`)
    console.log(`💰 Montant total: ${testInvoiceData.total.toFixed(2)} DH`)
    
    // Afficher le montant en lettres pour vérification
    const { formatAmountInWords } = require('../lib/number-to-words.ts')
    const amountInWords = formatAmountInWords(testInvoiceData.total)
    console.log(`📝 Montant en lettres: ${amountInWords}`)
    
    console.log('\n🎯 Points à vérifier dans le PDF:')
    console.log('- Le montant en lettres apparaît dans un cadre gris clair')
    console.log('- Le texte est en italique et bien formaté')
    console.log('- La position est correcte (après le total TTC)')
    console.log('- Le texte se divise sur plusieurs lignes si nécessaire')
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error)
    process.exit(1)
  }
}

// Exécuter le test
generateTestInvoice()
