/**
 * Script pour diagnostiquer les erreurs de bon de livraison
 */

const { PrismaClient } = require('@prisma/client')

async function debugDeliveryNote() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Diagnostic du système de bons de livraison\n')

    // 1. Vérifier la connexion à la base de données
    console.log('1. Test de connexion à la base de données...')
    await prisma.$connect()
    console.log('✅ Connexion réussie\n')

    // 2. Vérifier les ventes existantes
    console.log('2. Vérification des ventes...')
    const sales = await prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        seller: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })
    
    console.log(`📊 Nombre de ventes trouvées: ${sales.length}`)
    
    if (sales.length === 0) {
      console.log('❌ Aucune vente trouvée dans la base de données')
      return
    }

    // 3. Analyser la première vente
    const sale = sales[0]
    console.log('\n3. Analyse de la vente la plus récente:')
    console.log(`   ID: ${sale.id}`)
    console.log(`   Numéro: ${sale.saleNumber}`)
    console.log(`   Statut: ${sale.status}`)
    console.log(`   Client: ${sale.customer?.name || 'Client de passage'}`)
    console.log(`   Vendeur: ${sale.seller?.name || 'N/A'}`)
    console.log(`   Articles: ${sale.items?.length || 0}`)
    console.log(`   Bon de livraison généré: ${sale.deliveryNoteGenerated || false}`)

    // 4. Vérifier les champs requis
    console.log('\n4. Vérification des champs requis:')
    const issues = []
    
    if (!sale.saleNumber) issues.push('saleNumber manquant')
    if (!sale.seller) issues.push('seller manquant')
    if (!sale.items || sale.items.length === 0) issues.push('items manquants')
    
    if (issues.length > 0) {
      console.log(`❌ Problèmes détectés: ${issues.join(', ')}`)
    } else {
      console.log('✅ Tous les champs requis sont présents')
    }

    // 5. Vérifier les articles
    console.log('\n5. Vérification des articles:')
    if (sale.items && sale.items.length > 0) {
      sale.items.forEach((item, index) => {
        console.log(`   Article ${index + 1}:`)
        console.log(`     - Nom: ${item.product?.name || 'N/A'}`)
        console.log(`     - SKU: ${item.product?.sku || 'N/A'}`)
        console.log(`     - Quantité: ${item.quantity}`)
        console.log(`     - Description: ${item.product?.description || 'N/A'}`)
      })
    }

    // 6. Vérifier les paramètres de l'entreprise
    console.log('\n6. Vérification des paramètres de l\'entreprise:')
    const companySettings = await prisma.companySettings.findFirst()
    
    if (companySettings) {
      console.log('✅ Paramètres de l\'entreprise trouvés:')
      console.log(`   - Nom: ${companySettings.name}`)
      console.log(`   - Adresse: ${companySettings.address || 'N/A'}`)
      console.log(`   - Téléphone: ${companySettings.phone || 'N/A'}`)
      console.log(`   - Email: ${companySettings.email || 'N/A'}`)
    } else {
      console.log('❌ Aucun paramètre d\'entreprise trouvé')
    }

    // 7. Test de génération des données
    console.log('\n7. Test de préparation des données:')
    try {
      const deliveryNoteData = {
        saleNumber: sale.saleNumber,
        customerName: sale.customer?.name || 'Client de passage',
        customerAddress: sale.customer?.address,
        customerPhone: sale.customer?.phone,
        sellerName: sale.seller?.name || 'Vendeur inconnu',
        items: sale.items?.map(item => ({
          productName: item.product?.name || 'Produit inconnu',
          productSku: item.product?.sku,
          quantity: item.quantity,
          description: item.product?.description
        })) || [],
        notes: sale.notes,
        createdAt: sale.createdAt,
        companySettings: companySettings ? {
          name: companySettings.name,
          address: companySettings.address,
          phone: companySettings.phone,
          email: companySettings.email,
          logo: companySettings.logo,
          primaryColor: companySettings.primaryColor
        } : undefined
      }
      
      console.log('✅ Données préparées avec succès')
      console.log(`   - Articles: ${deliveryNoteData.items.length}`)
      console.log(`   - Client: ${deliveryNoteData.customerName}`)
      console.log(`   - Vendeur: ${deliveryNoteData.sellerName}`)
      
    } catch (error) {
      console.log('❌ Erreur lors de la préparation des données:', error.message)
    }

    // 8. Recommandations
    console.log('\n8. Recommandations:')
    if (sale.status !== 'COMPLETED') {
      console.log('⚠️  La vente doit avoir le statut COMPLETED')
    }
    if (!sale.items || sale.items.length === 0) {
      console.log('⚠️  La vente doit contenir au moins un article')
    }
    if (!companySettings) {
      console.log('⚠️  Configurez les paramètres de l\'entreprise')
    }

    console.log('\n✅ Diagnostic terminé!')

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le diagnostic
debugDeliveryNote().catch(console.error)
