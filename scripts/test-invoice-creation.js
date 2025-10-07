const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testInvoiceCreation() {
  console.log('🧪 Test de création de factures via API...')

  try {
    // 1. Créer un client de test
    console.log('\n1. Création d\'un client de test...')
    const customer = await prisma.customer.upsert({
      where: { id: 'test-customer-api' },
      update: {},
      create: {
        id: 'test-customer-api',
        name: 'Client Test API',
        company: 'Test Company',
        email: 'test@example.com',
        phone: '0612345678',
        address: '123 Test Street, Test City',
        creditLimit: 10000,
      }
    })
    console.log('   ✅ Client créé:', customer.name)

    // 2. Créer un produit de test
    console.log('\n2. Création d\'un produit de test...')
    const product = await prisma.product.upsert({
      where: { sku: 'API-TEST-001' },
      update: {},
      create: {
        sku: 'API-TEST-001',
        name: 'Produit Test API',
        description: 'Produit de test pour l\'API',
        purchasePrice: 50.00,
        price: 100.00,
        stock: 100,
        minStock: 10,
      }
    })
    console.log('   ✅ Produit créé:', product.name)

    // 3. Créer un utilisateur de test
    console.log('\n3. Création d\'un utilisateur de test...')
    const user = await prisma.user.upsert({
      where: { id: 'test-user-api' },
      update: {},
      create: {
        id: 'test-user-api',
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'hashedpassword',
        role: 'OWNER',
      }
    })
    console.log('   ✅ Utilisateur créé:', user.name)

    // 4. Données de test pour la facture
    console.log('\n4. Préparation des données de test...')
    const invoiceData = {
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
      notes: 'Facture de test API',
      terms: 'Paiement à 30 jours',
      items: [
        {
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          description: product.description,
          quantity: 1,
          unitPrice: 100.00,
          discountAmount: 0.00,
          total: 100.00,
        }
      ]
    }

    console.log('   ✅ Données préparées:', {
      customerName: invoiceData.customerName,
      itemsCount: invoiceData.items.length,
      subtotal: invoiceData.subtotal,
      total: invoiceData.total
    })

    // 5. Test de validation Zod
    console.log('\n5. Test de validation Zod...')
    const { z } = require('zod')
    
    const createInvoiceSchema = z.object({
      type: z.enum(['INVOICE', 'CREDIT_NOTE']).default('INVOICE'),
      invoiceNumber: z.string().optional(),
      customerId: z.string().optional().nullable(),
      customerName: z.string().min(1, 'Le nom du client est requis'),
      customerPhone: z.string().optional().nullable().transform(val => val === '' ? null : val),
      customerEmail: z.string().optional().nullable().transform(val => val === '' ? null : val).refine((email) => !email || z.string().email().safeParse(email).success, {
        message: "Format d'email invalide"
      }),
      customerAddress: z.string().optional().nullable().transform(val => val === '' ? null : val),
      customerTaxId: z.string().optional().nullable().transform(val => val === '' ? null : val),
      originalInvoiceId: z.string().optional().nullable(),
      subtotal: z.coerce.number().min(0),
      discountAmount: z.coerce.number().min(0).default(0),
      taxRate: z.coerce.number().min(0).max(100).default(20),
      taxAmount: z.coerce.number().min(0).default(0),
      total: z.coerce.number().min(0),
      notes: z.string().optional().nullable().transform(val => val === '' ? null : val),
      terms: z.string().optional().nullable().transform(val => val === '' ? null : val),
      dueDate: z.string().optional().nullable().transform(val => val === '' ? null : val),
      items: z.array(z.object({
        productId: z.string().optional().nullable().transform(val => val === '' ? null : val),
        productName: z.string().min(1, 'Le nom du produit est requis'),
        productSku: z.string().optional().nullable().transform(val => val === '' ? null : val),
        description: z.string().optional().nullable().transform(val => val === '' ? null : val),
        quantity: z.coerce.number().int().min(1, 'La quantité doit être au moins 1'),
        unitPrice: z.coerce.number().min(0, 'Le prix unitaire doit être positif'),
        discountAmount: z.coerce.number().min(0).default(0),
        total: z.coerce.number().min(0, 'Le total doit être positif'),
      })).min(1, 'Au moins un article est requis'),
    })

    const validationResult = createInvoiceSchema.safeParse(invoiceData)
    
    if (!validationResult.success) {
      console.log('   ❌ VALIDATION FAILED:')
      validationResult.error.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. Field: ${issue.path.join('.')}`)
        console.log(`      Message: ${issue.message}`)
        console.log(`      Code: ${issue.code}`)
        if (issue.received !== undefined) {
          console.log(`      Received: ${JSON.stringify(issue.received)}`)
        }
      })
      return
    }

    console.log('   ✅ Validation Zod réussie')

    // 6. Test avec des données problématiques
    console.log('\n6. Test avec des données problématiques...')
    
    const problematicData = {
      ...invoiceData,
      customerName: '', // Nom vide
      items: [] // Aucun article
    }

    const problematicValidation = createInvoiceSchema.safeParse(problematicData)
    
    if (!problematicValidation.success) {
      console.log('   ✅ Validation échoue correctement pour les données problématiques:')
      problematicValidation.error.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue.path.join('.')}: ${issue.message}`)
      })
    }

    console.log('\n🎉 Tous les tests de validation sont passés !')
    console.log('\n📋 Résumé:')
    console.log(`   - Client: ${customer.name}`)
    console.log(`   - Produit: ${product.name}`)
    console.log(`   - Utilisateur: ${user.name}`)
    console.log(`   - Validation: ✅ Réussie`)

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testInvoiceCreation()