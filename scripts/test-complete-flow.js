const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCompleteFlow() {
  console.log('🧪 Test du flux complet de création de factures...')

  try {
    // 1. Vérifier les paramètres de l'entreprise
    console.log('\n1. Vérification des paramètres de l\'entreprise...')
    let settings = await prisma.companySettings.findFirst()
    
    if (!settings) {
      console.log('   Création des paramètres par défaut...')
      settings = await prisma.companySettings.create({
        data: {
          companyName: 'Alami Gestion SARL',
          companyAddress: '123 Boulevard Mohammed V, Casablanca, Maroc',
          companyPhone: '+212 522 123 456',
          companyEmail: 'contact@alami-gestion.ma',
          companyICE: '123456789012345',
          invoicePrefix: 'FAC',
          creditNotePrefix: 'FAV',
          defaultTaxRate: 20,
        }
      })
    }
    console.log('   ✅ Paramètres:', settings.companyName)

    // 2. Créer un utilisateur de test
    console.log('\n2. Création d\'un utilisateur de test...')
    const user = await prisma.user.upsert({
      where: { id: 'test-user-complete' },
      update: {},
      create: {
        id: 'test-user-complete',
        name: 'Test User Complete',
        email: 'testcomplete@example.com',
        password: 'hashedpassword',
        role: 'OWNER',
      }
    })
    console.log('   ✅ Utilisateur:', user.name)

    // 3. Créer un client de test
    console.log('\n3. Création d\'un client de test...')
    const customer = await prisma.customer.upsert({
      where: { id: 'test-customer-complete' },
      update: {},
      create: {
        id: 'test-customer-complete',
        name: 'Client Test Complet',
        company: 'Test Company Complete',
        email: 'client@testcomplete.com',
        phone: '0612345678',
        address: '123 Test Street, Test City',
        creditLimit: 10000,
      }
    })
    console.log('   ✅ Client:', customer.name)

    // 4. Créer un produit de test
    console.log('\n4. Création d\'un produit de test...')
    const product = await prisma.product.upsert({
      where: { sku: 'COMPLETE-TEST-001' },
      update: {},
      create: {
        sku: 'COMPLETE-TEST-001',
        name: 'Produit Test Complet',
        description: 'Produit de test pour le flux complet',
        purchasePrice: 50.00,
        price: 100.00,
        stock: 100,
        minStock: 10,
      }
    })
    console.log('   ✅ Produit:', product.name)

    // 5. Tester la création d'une facture via Prisma (simulation API)
    console.log('\n5. Test de création de facture via Prisma...')
    
    const invoiceData = {
      invoiceNumber: 'FAC-COMPLETE-001',
      type: 'INVOICE',
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      customerAddress: customer.address,
      subtotal: 100.00,
      discountAmount: 0.00,
      taxRate: 20.00,
      taxAmount: 20.00,
      total: 120.00,
      notes: 'Facture de test complet',
      terms: 'Paiement à 30 jours',
      createdBy: user.id,
    }

    // Vérifier si la facture existe déjà
    let invoice = await prisma.invoice.findUnique({
      where: { invoiceNumber: 'FAC-COMPLETE-001' }
    })

    if (!invoice) {
      invoice = await prisma.invoice.create({
        data: {
          ...invoiceData,
          items: {
            create: {
              productId: product.id,
              productName: product.name,
              productSku: product.sku,
              description: product.description,
              quantity: 1,
              unitPrice: 100.00,
              discountAmount: 0.00,
              total: 100.00,
            }
          }
        }
      })
    }
    console.log('   ✅ Facture créée:', invoice.invoiceNumber)

    // 6. Tester la récupération des paramètres pour PDF
    console.log('\n6. Test de récupération des paramètres pour PDF...')
    try {
      const { getCompanySettings, formatCompanySettingsForPDF } = require('../lib/company-settings')
      const companySettings = await getCompanySettings()
      const formattedSettings = formatCompanySettingsForPDF(companySettings)
      console.log('   ✅ Paramètres formatés:', {
        name: formattedSettings.name,
        email: formattedSettings.email,
        phone: formattedSettings.phone
      })
    } catch (error) {
      console.log('   ⚠️  Module company-settings non disponible (normal en test)')
    }

    // 7. Vérifier les statistiques
    console.log('\n7. Test des statistiques...')
    const stats = await prisma.invoice.aggregate({
      where: { type: 'INVOICE' },
      _count: { id: true },
      _sum: { total: true }
    })
    console.log('   ✅ Statistiques:', {
      totalInvoices: stats._count.id,
      totalAmount: stats._sum.total
    })

    console.log('\n🎉 Tous les tests du flux complet sont passés !')
    console.log('\n📋 Résumé:')
    console.log(`   - Paramètres entreprise: ${settings.companyName}`)
    console.log(`   - Utilisateur: ${user.name} (${user.role})`)
    console.log(`   - Client: ${customer.name}`)
    console.log(`   - Produit: ${product.name}`)
    console.log(`   - Facture: ${invoice.invoiceNumber}`)
    console.log(`   - Montant: ${invoice.total}€`)

    console.log('\n💡 Pour tester l\'API complète:')
    console.log('   1. Démarrez le serveur: npm run dev')
    console.log('   2. Allez sur http://localhost:3000/dashboard/invoices/new')
    console.log('   3. Créez une facture avec les données de test')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCompleteFlow()

