const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testRealCreditNoteCreation() {
  try {
    console.log('🧪 === TEST RÉEL DE CRÉATION FACTURE D\'AVOIR ===\n')

    // Récupérer un utilisateur existant
    const user = await prisma.user.findFirst()
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données')
      return
    }
    console.log(`👤 Utilisateur trouvé: ${user.name} (${user.id})`)

    // Test direct avec Prisma (simulation de l'API)
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: 'FAV-TEST-001',
        type: 'CREDIT_NOTE', // ← Point critique
        customerName: 'Client Test',
        customerPhone: '0522123456',
        customerEmail: 'test@example.com',
        customerAddress: 'Adresse test',
        customerTaxId: '123456789012345',
        subtotal: 100.00,
        discountAmount: 0,
        taxRate: 20,
        taxAmount: 20.00,
        total: 120.00,
        notes: 'Test de création facture d\'avoir',
        createdBy: user.id,
        items: {
          create: [{
            productName: 'Produit Test',
            productSku: 'TEST-001',
            description: 'Description test',
            quantity: 1,
            unitPrice: 100.00,
            discountAmount: 0,
            total: 100.00,
          }]
        }
      },
      include: {
        items: true
      }
    })

    console.log('✅ Facture créée avec succès!')
    console.log(`   ID: ${invoice.id}`)
    console.log(`   Numéro: ${invoice.invoiceNumber}`)
    console.log(`   Type: ${invoice.type}`) // ← Vérification critique
    console.log(`   Client: ${invoice.customerName}`)
    console.log(`   Total: ${invoice.total} MAD`)
    console.log('')

    // Vérifier que la facture est bien de type CREDIT_NOTE
    if (invoice.type === 'CREDIT_NOTE') {
      console.log('✅ SUCCESS: La facture a été créée avec le bon type CREDIT_NOTE')
      console.log('🎯 Le problème n\'est PAS dans la base de données')
      console.log('💡 Le problème est probablement dans l\'interface utilisateur')
    } else {
      console.log('❌ ERROR: La facture a été créée avec le mauvais type:', invoice.type)
    }

    // Nettoyer (supprimer la facture de test)
    await prisma.invoice.delete({
      where: { id: invoice.id }
    })
    console.log('🧹 Facture de test supprimée')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRealCreditNoteCreation()
