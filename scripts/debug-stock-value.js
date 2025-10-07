#!/usr/bin/env node

console.log('🔍 Diagnostic - Valeur du Stock affiche 0')
console.log('')

async function debugStockValue() {
  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    console.log('📊 VÉRIFICATION DES DONNÉES PRODUITS')
    console.log('')
    
    // Récupérer tous les produits actifs
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        price: true,
        purchasePrice: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })
    
    console.log(`📦 Nombre de produits actifs: ${products.length}`)
    console.log('')
    
    if (products.length === 0) {
      console.log('❌ PROBLÈME IDENTIFIÉ: Aucun produit actif trouvé')
      console.log('')
      console.log('🔧 SOLUTIONS:')
      console.log('   1. Vérifiez que vous avez des produits dans la base')
      console.log('   2. Vérifiez que les produits ont isActive = true')
      console.log('   3. Créez des produits via la page "Produits"')
      return
    }
    
    console.log('📋 DÉTAIL DES PRODUITS:')
    console.log('')
    
    let totalSaleValue = 0
    let totalCostValue = 0
    let totalQuantity = 0
    let productsWithStock = 0
    let productsWithPrice = 0
    let productsWithCostPrice = 0
    
    products.forEach((product, index) => {
      const stock = Number(product.stock || 0)
      const price = Number(product.price || 0)
      const purchasePrice = Number(product.purchasePrice || 0)
      const saleValue = price * stock
      const costValue = purchasePrice * stock
      
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   SKU: ${product.sku || 'N/A'}`)
      console.log(`   Stock: ${stock}`)
      console.log(`   Prix vente: ${price} DH`)
      console.log(`   Prix achat: ${purchasePrice} DH`)
      console.log(`   Valeur stock (vente): ${saleValue.toFixed(2)} DH`)
      console.log(`   Valeur stock (coût): ${costValue.toFixed(2)} DH`)
      console.log(`   Catégorie: ${product.category?.name || 'Sans catégorie'}`)
      console.log('')
      
      totalSaleValue += saleValue
      totalCostValue += costValue
      totalQuantity += stock
      
      if (stock > 0) productsWithStock++
      if (price > 0) productsWithPrice++
      if (purchasePrice > 0) productsWithCostPrice++
    })
    
    console.log('📊 RÉSUMÉ DES CALCULS:')
    console.log('')
    console.log(`💰 Valeur totale (vente): ${totalSaleValue.toFixed(2)} DH`)
    console.log(`💰 Valeur totale (coût): ${totalCostValue.toFixed(2)} DH`)
    console.log(`📦 Quantité totale: ${totalQuantity}`)
    console.log(`📈 Marge potentielle: ${(totalSaleValue - totalCostValue).toFixed(2)} DH`)
    console.log('')
    console.log('📋 STATISTIQUES:')
    console.log(`   • Produits avec stock > 0: ${productsWithStock}/${products.length}`)
    console.log(`   • Produits avec prix vente > 0: ${productsWithPrice}/${products.length}`)
    console.log(`   • Produits avec prix achat > 0: ${productsWithCostPrice}/${products.length}`)
    console.log('')
    
    // Diagnostic des problèmes
    if (totalSaleValue === 0 && totalCostValue === 0) {
      console.log('❌ PROBLÈME IDENTIFIÉ: Toutes les valeurs sont à 0')
      console.log('')
      console.log('🔍 CAUSES POSSIBLES:')
      
      if (totalQuantity === 0) {
        console.log('   ❌ Aucun produit n\'a de stock')
        console.log('   🔧 Solution: Ajoutez du stock aux produits')
      }
      
      if (productsWithPrice === 0) {
        console.log('   ❌ Aucun produit n\'a de prix de vente')
        console.log('   🔧 Solution: Définissez les prix de vente')
      }
      
      if (productsWithCostPrice === 0) {
        console.log('   ❌ Aucun produit n\'a de prix d\'achat')
        console.log('   🔧 Solution: Définissez les prix d\'achat')
      }
      
      console.log('')
      console.log('🛠️ ACTIONS RECOMMANDÉES:')
      console.log('   1. Allez sur la page "Produits"')
      console.log('   2. Modifiez vos produits pour ajouter:')
      console.log('      • Stock (quantité disponible)')
      console.log('      • Prix de vente')
      console.log('      • Prix d\'achat (coût)')
      console.log('   3. Rechargez la page "Gestion du Stock"')
      
    } else {
      console.log('✅ Les calculs semblent corrects')
      console.log('💡 Si l\'interface affiche encore 0, vérifiez:')
      console.log('   • La console du navigateur pour les erreurs')
      console.log('   • Que l\'API /api/stock/value fonctionne')
      console.log('   • Que la page se recharge correctement')
    }
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.log('❌ Erreur lors du diagnostic:', error.message)
    console.log('')
    console.log('🔧 Vérifiez:')
    console.log('   • Que la base de données est accessible')
    console.log('   • Que Prisma est correctement configuré')
    console.log('   • Que le serveur de développement fonctionne')
  }
}

debugStockValue()
