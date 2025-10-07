const fetch = require('node-fetch')

async function testAPIRequest() {
  console.log('🧪 Test de requête API pour création de factures...')

  try {
    // Données de test
    const invoiceData = {
      type: 'INVOICE',
      customerId: null,
      customerName: 'Client Test API',
      customerPhone: '0612345678',
      customerEmail: 'test@example.com',
      customerAddress: '123 Test Street, Test City',
      customerTaxId: null,
      subtotal: 100.00,
      discountAmount: 0.00,
      taxRate: 20.00,
      taxAmount: 20.00,
      total: 120.00,
      notes: 'Facture de test API',
      terms: 'Paiement à 30 jours',
      dueDate: null,
      items: [
        {
          productId: null,
          productName: 'Produit Test',
          productSku: 'TEST-001',
          description: 'Description du produit test',
          quantity: 1,
          unitPrice: 100.00,
          discountAmount: 0.00,
          total: 100.00,
        }
      ]
    }

    console.log('📤 Envoi des données:', JSON.stringify(invoiceData, null, 2))

    // Test de l'API
    const response = await fetch('http://localhost:3000/api/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: En production, il faudrait un vrai token d'authentification
      },
      body: JSON.stringify(invoiceData),
    })

    console.log('\n📥 Réponse du serveur:')
    console.log('Status:', response.status)
    console.log('Status Text:', response.statusText)

    const responseData = await response.text()
    console.log('Body:', responseData)

    if (response.ok) {
      console.log('\n✅ Requête réussie !')
    } else {
      console.log('\n❌ Requête échouée')
      
      try {
        const errorData = JSON.parse(responseData)
        console.log('Erreur détaillée:', JSON.stringify(errorData, null, 2))
      } catch (e) {
        console.log('Impossible de parser la réponse d\'erreur')
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Le serveur n\'est pas démarré. Démarrez-le avec:')
      console.log('   npm run dev')
    }
  }
}

testAPIRequest()

