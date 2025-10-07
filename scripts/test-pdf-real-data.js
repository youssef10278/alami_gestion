/**
 * Script de test pour vérifier la génération PDF avec de vraies données
 * Utilise les données de l'application pour tester l'encodage
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function testPDFWithRealData() {
  console.log('🧪 Test PDF avec données réelles...')

  try {
    // Récupérer une facture existante
    const invoice = await prisma.invoice.findFirst({
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
        originalInvoice: true
      }
    })

    if (!invoice) {
      console.log('⚠️  Aucune facture trouvée. Création d\'une facture de test...')
      
      // Créer une facture de test
      const testInvoice = await createTestInvoice()
      await testPDFGeneration(testInvoice)
    } else {
      console.log(`📄 Facture trouvée: ${invoice.invoiceNumber}`)
      await testPDFGeneration(invoice)
    }

  } catch (error) {
    console.error('❌ Erreur lors du test :', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function createTestInvoice() {
  console.log('🔨 Création d\'une facture de test...')
  
  // Créer un client de test
  const customer = await prisma.customer.upsert({
    where: { email: 'fatima.test@example.com' },
    update: {},
    create: {
      name: 'Fatima Zahra',
      company: 'FZ Commerce SARL',
      email: 'fatima.test@example.com',
      phone: '0623456789',
      address: '456 Avenue Hassan II\nRabat 10000\nMaroc'
    }
  })

  // Créer des produits de test
  const product1 = await prisma.product.upsert({
    where: { sku: 'TEL-TEST-001' },
    update: {},
    create: {
      sku: 'TEL-TEST-001',
      name: 'Téléphone Samsung Galaxy',
      description: 'Smartphone dernière génération',
      price: 2500.00,
      stock: 10
    }
  })

  const product2 = await prisma.product.upsert({
    where: { sku: 'ECO-TEST-002' },
    update: {},
    create: {
      sku: 'ECO-TEST-002',
      name: 'Écouteurs Bluetooth',
      description: 'Écouteurs sans fil haute qualité',
      price: 350.00,
      stock: 5
    }
  })

  // Créer la facture
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'FAC-TEST-001',
      type: 'INVOICE',
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      customerAddress: customer.address,
      subtotal: 5250.00,
      discountAmount: 100.00,
      taxRate: 20,
      taxAmount: 1030.00,
      total: 6180.00,
      notes: 'Merci pour votre confiance ! Garantie 2 ans incluse.',
      terms: 'Paiement à 30 jours. Pénalités de retard : 1,5% par mois.',
      createdBy: 'test-user',
      items: {
        create: [
          {
            productId: product1.id,
            productName: product1.name,
            productSku: product1.sku,
            description: product1.description,
            quantity: 2,
            unitPrice: 2500.00,
            discountAmount: 100.00,
            total: 4900.00
          },
          {
            productId: product2.id,
            productName: product2.name,
            productSku: product2.sku,
            description: product2.description,
            quantity: 1,
            unitPrice: 350.00,
            discountAmount: 0,
            total: 350.00
          }
        ]
      }
    },
    include: {
      items: {
        include: {
          product: true
        }
      },
      customer: true
    }
  })

  console.log(`✅ Facture de test créée: ${invoice.invoiceNumber}`)
  return invoice
}

async function testPDFGeneration(invoice) {
  console.log(`📄 Test de génération PDF pour: ${invoice.invoiceNumber}`)

  try {
    // Simuler l'appel API
    const response = await fetch(`http://localhost:3000/api/invoices/${invoice.id}/pdf`, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf'
      }
    })

    if (response.ok) {
      const pdfBuffer = await response.arrayBuffer()
      
      // Sauvegarder le PDF
      const outputDir = path.join(__dirname, '../test-output')
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }
      
      const outputPath = path.join(outputDir, `test-real-${invoice.invoiceNumber}.pdf`)
      fs.writeFileSync(outputPath, Buffer.from(pdfBuffer))
      
      console.log('✅ PDF généré avec succès !')
      console.log(`📁 Fichier sauvegardé : ${outputPath}`)
      
      // Afficher les informations de test
      console.log('')
      console.log('🔍 Données testées :')
      console.log(`- Client: ${invoice.customerName}`)
      console.log(`- Email: ${invoice.customerEmail}`)
      console.log(`- Téléphone: ${invoice.customerPhone}`)
      console.log(`- Adresse: ${invoice.customerAddress?.replace(/\n/g, ', ')}`)
      console.log(`- Articles: ${invoice.items.length}`)
      console.log(`- Total: ${invoice.total} EUR`)
      
    } else {
      console.error('❌ Erreur lors de la génération PDF:', response.status, response.statusText)
      
      // Fallback: test direct avec les données
      console.log('🔄 Test direct avec les données...')
      await testDirectPDFGeneration(invoice)
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'appel API:', error.message)
    
    // Fallback: test direct avec les données
    console.log('🔄 Test direct avec les données...')
    await testDirectPDFGeneration(invoice)
  }
}

async function testDirectPDFGeneration(invoice) {
  // Import dynamique pour éviter les problèmes de module
  const { generateManualInvoicePDF } = await import('../lib/pdf-generator.js')
  
  const pdfData = {
    invoiceNumber: invoice.invoiceNumber,
    type: invoice.type,
    date: invoice.createdAt,
    dueDate: invoice.dueDate,
    customer: {
      name: invoice.customerName,
      phone: invoice.customerPhone,
      email: invoice.customerEmail,
      address: invoice.customerAddress,
      taxId: invoice.customerTaxId
    },
    items: invoice.items.map(item => ({
      productName: item.productName,
      productSku: item.productSku,
      description: item.description,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      discountAmount: Number(item.discountAmount),
      total: Number(item.total)
    })),
    subtotal: Number(invoice.subtotal),
    discountAmount: Number(invoice.discountAmount),
    taxRate: Number(invoice.taxRate),
    taxAmount: Number(invoice.taxAmount),
    total: Number(invoice.total),
    notes: invoice.notes,
    terms: invoice.terms
  }

  const pdfDoc = await generateManualInvoicePDF(pdfData)
  
  // Sauvegarder le PDF
  const outputDir = path.join(__dirname, '../test-output')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const outputPath = path.join(outputDir, `test-direct-${invoice.invoiceNumber}.pdf`)
  const pdfBuffer = pdfDoc.output('arraybuffer')
  fs.writeFileSync(outputPath, Buffer.from(pdfBuffer))
  
  console.log('✅ PDF direct généré avec succès !')
  console.log(`📁 Fichier sauvegardé : ${outputPath}`)
}

// Exécuter le test
if (require.main === module) {
  testPDFWithRealData()
    .then(() => {
      console.log('')
      console.log('🎉 Test terminé avec succès !')
      console.log('Vérifiez les fichiers PDF générés pour confirmer que l\'encodage est correct.')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Échec du test :', error)
      process.exit(1)
    })
}

module.exports = { testPDFWithRealData }
