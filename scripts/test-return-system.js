/**
 * 🧪 SCRIPT DE TEST - SYSTÈME DE RETOUR COMPLET
 * 
 * Teste le nouveau système de retour pour les factures d'avoir
 */

const testReturnSystem = async () => {
  console.log('🧪 === TEST SYSTÈME DE RETOUR COMPLET ===\n')

  try {
    // 1. Créer une facture d'avoir avec différents types de retours
    console.log('📝 1. Création facture d\'avoir avec retours mixtes...')
    
    const creditNoteData = {
      type: 'CREDIT_NOTE',
      invoiceNumber: 'FAV-TEST-001',
      customerName: 'Client Test Retour',
      customerPhone: '0612345678',
      customerEmail: 'test@retour.com',
      subtotal: 300,
      discountAmount: 0,
      taxRate: 20,
      taxAmount: 60,
      total: -360, // Négatif pour facture d'avoir
      notes: 'Test système de retour complet',
      items: [
        {
          productId: 'cmgo9qb2y0009pa01wzyr4jk2', // Produit existant
          productName: 'Produit Bon État',
          productSku: 'TEST-001',
          description: 'Retour en bon état',
          quantity: 2,
          unitPrice: 50,
          discountAmount: 0,
          total: 100,
          returnStatus: 'GOOD',
          returnReason: 'Client satisfait, retour normal'
        },
        {
          productId: 'cmgo9qb2y0009pa01wzyr4jk2', // Même produit
          productName: 'Produit Défectueux',
          productSku: 'TEST-002',
          description: 'Retour défectueux',
          quantity: 1,
          unitPrice: 100,
          discountAmount: 0,
          total: 100,
          returnStatus: 'DEFECTIVE',
          returnReason: 'Rayure sur le produit'
        },
        {
          productId: 'cmgo9qb2y0009pa01wzyr4jk2', // Même produit
          productName: 'Produit Inutilisable',
          productSku: 'TEST-003',
          description: 'Retour inutilisable',
          quantity: 1,
          unitPrice: 100,
          discountAmount: 0,
          total: 100,
          returnStatus: 'UNUSABLE',
          returnReason: 'Produit cassé irréparable'
        }
      ]
    }

    const response = await fetch('http://localhost:3000/api/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'session=test-session' // Simuler une session
      },
      body: JSON.stringify(creditNoteData)
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Erreur création facture:', error)
      return
    }

    const invoice = await response.json()
    console.log('✅ Facture d\'avoir créée:', invoice.invoiceNumber)
    console.log('📦 Articles avec retours:', invoice.items?.length || 0)
    console.log('🔄 Retours traités:', invoice.productReturns?.length || 0)

    // 2. Vérifier les retours créés
    console.log('\n📊 2. Vérification des retours...')
    
    const returnsResponse = await fetch(`http://localhost:3000/api/product-returns?invoiceId=${invoice.id}`, {
      headers: {
        'Cookie': 'session=test-session'
      }
    })

    if (returnsResponse.ok) {
      const returnsData = await returnsResponse.json()
      console.log('✅ Retours récupérés:', returnsData.returns?.length || 0)
      
      returnsData.returns?.forEach((ret, index) => {
        console.log(`   ${index + 1}. ${ret.returnStatus}: ${ret.quantity}x ${ret.product?.name}`)
        console.log(`      Stock vendable: ${ret.product?.stock}`)
        console.log(`      Stock défectueux: ${ret.product?.defectiveStock}`)
        console.log(`      Quantité restockée: ${ret.restockedQuantity}`)
        if (ret.reason) console.log(`      Raison: ${ret.reason}`)
        console.log('')
      })
    }

    // 3. Vérifier l'impact sur le stock du produit
    console.log('📈 3. Vérification impact stock...')
    
    const productResponse = await fetch(`http://localhost:3000/api/products/cmgo9qb2y0009pa01wzyr4jk2`, {
      headers: {
        'Cookie': 'session=test-session'
      }
    })

    if (productResponse.ok) {
      const product = await productResponse.json()
      console.log('✅ État du stock après retours:')
      console.log(`   Stock vendable: ${product.stock}`)
      console.log(`   Stock défectueux: ${product.defectiveStock}`)
      console.log(`   Stock total: ${product.stock + product.defectiveStock}`)
    }

    // 4. Test de validation des retours
    console.log('\n🔍 4. Test validation retours...')
    
    const invalidReturnData = {
      invoiceId: invoice.id,
      returns: [
        {
          productId: 'invalid-product-id',
          quantity: 1,
          returnStatus: 'GOOD'
        }
      ]
    }

    const validationResponse = await fetch('http://localhost:3000/api/product-returns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'session=test-session'
      },
      body: JSON.stringify(invalidReturnData)
    })

    if (!validationResponse.ok) {
      console.log('✅ Validation fonctionne - retour invalide rejeté')
    } else {
      console.log('⚠️ Validation échouée - retour invalide accepté')
    }

    console.log('\n🎉 === TEST SYSTÈME DE RETOUR TERMINÉ ===')
    console.log('✅ Fonctionnalités testées:')
    console.log('   - Création facture d\'avoir avec retours')
    console.log('   - Traitement automatique des 3 types de retours')
    console.log('   - Mise à jour automatique des stocks')
    console.log('   - Récupération des retours via API')
    console.log('   - Validation des données de retour')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

// Exécuter le test
testReturnSystem()
