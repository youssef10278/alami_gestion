/**
 * Script pour vérifier les ventes dans la base de données
 */

const { PrismaClient } = require('@prisma/client')

async function checkSales() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Vérification des ventes dans la base de données\n')

    // Récupérer toutes les ventes
    const sales = await prisma.sale.findMany({
      take: 10,
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

    console.log(`📊 Nombre total de ventes: ${sales.length}\n`)

    if (sales.length === 0) {
      console.log('❌ Aucune vente trouvée dans la base de données')
      console.log('💡 Créez d\'abord une vente pour tester le bon de livraison')
      return
    }

    // Afficher les détails de chaque vente
    sales.forEach((sale, index) => {
      console.log(`📋 Vente ${index + 1}:`)
      console.log(`   ID: ${sale.id}`)
      console.log(`   Numéro: ${sale.saleNumber}`)
      console.log(`   Statut: ${sale.status}`)
      console.log(`   Date: ${sale.createdAt.toLocaleDateString('fr-FR')}`)
      console.log(`   Client: ${sale.customer?.name || 'Client de passage'}`)
      console.log(`   Vendeur: ${sale.seller?.name || 'N/A'}`)
      console.log(`   Articles: ${sale.items?.length || 0}`)
      console.log(`   Total: ${sale.totalAmount} DH`)
      console.log(`   Bon de livraison généré: ${sale.deliveryNoteGenerated || false}`)
      
      if (sale.items && sale.items.length > 0) {
        console.log('   📦 Articles:')
        sale.items.forEach((item, itemIndex) => {
          console.log(`      ${itemIndex + 1}. ${item.product?.name || 'Produit inconnu'} (Qté: ${item.quantity})`)
        })
      }
      
      console.log('')
    })

    // Statistiques
    const completedSales = sales.filter(s => s.status === 'COMPLETED')
    const salesWithDeliveryNote = sales.filter(s => s.deliveryNoteGenerated)

    console.log('📊 Statistiques:')
    console.log(`   ✅ Ventes finalisées: ${completedSales.length}/${sales.length}`)
    console.log(`   📦 Bons de livraison générés: ${salesWithDeliveryNote.length}/${sales.length}`)

    // Recommandations
    console.log('\n💡 Recommandations:')
    if (completedSales.length === 0) {
      console.log('   ⚠️  Aucune vente finalisée - les bons de livraison nécessitent le statut COMPLETED')
    } else {
      console.log(`   ✅ ${completedSales.length} vente(s) éligible(s) pour bon de livraison`)
      console.log(`   🧪 Testez avec l'ID: ${completedSales[0].id}`)
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSales().catch(console.error)
