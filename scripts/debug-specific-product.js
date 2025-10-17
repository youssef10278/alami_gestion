const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugSpecificProduct() {
  console.log('🔍 DÉBOGAGE DU PRODUIT SPÉCIFIQUE\n');

  const productId = 'cmgnkrsmv0001mo014p5zsd6m';
  
  try {
    console.log(`🎯 Recherche du produit ID: ${productId}`);

    // 1. Recherche directe par ID
    console.log('\n1️⃣ Recherche directe par ID');
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        saleItems: {
          include: {
            sale: true
          }
        }
      }
    });

    if (product) {
      console.log('✅ PRODUIT TROUVÉ:');
      console.log(`   Nom: ${product.name}`);
      console.log(`   SKU: ${product.sku}`);
      console.log(`   Prix: ${product.price} DH`);
      console.log(`   Stock: ${product.stock}`);
      console.log(`   Actif: ${product.isActive}`);
      console.log(`   Créé le: ${product.createdAt}`);
      console.log(`   Catégorie: ${product.category?.name || 'Aucune'}`);
      console.log(`   Ventes associées: ${product.saleItems?.length || 0}`);
      
      if (product.saleItems && product.saleItems.length > 0) {
        console.log('\n📊 VENTES ASSOCIÉES:');
        product.saleItems.forEach((item, index) => {
          console.log(`   ${index + 1}. Vente du ${item.sale.createdAt.toLocaleDateString()}`);
          console.log(`      Quantité: ${item.quantity}`);
          console.log(`      Total: ${item.total} DH`);
        });
      }
    } else {
      console.log('❌ PRODUIT NON TROUVÉ');
      
      // 2. Recherche dans les produits supprimés récemment
      console.log('\n2️⃣ Recherche dans les produits inactifs récents');
      
      const recentInactiveProducts = await prisma.product.findMany({
        where: {
          isActive: false,
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 derniers jours
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: 10
      });

      console.log(`📊 Produits inactifs récents: ${recentInactiveProducts.length}`);
      
      recentInactiveProducts.forEach((p, index) => {
        console.log(`   ${index + 1}. ${p.name} (${p.sku})`);
        console.log(`      ID: ${p.id}`);
        console.log(`      Supprimé le: ${p.updatedAt.toLocaleString()}`);
      });

      // 3. Recherche par pattern d'ID similaire
      console.log('\n3️⃣ Recherche par pattern d\'ID similaire');
      
      const idPrefix = productId.substring(0, 10); // Prendre les 10 premiers caractères
      
      const similarProducts = await prisma.product.findMany({
        where: {
          id: {
            startsWith: idPrefix
          }
        },
        take: 5
      });

      console.log(`📊 Produits avec ID similaire (${idPrefix}*): ${similarProducts.length}`);
      
      similarProducts.forEach((p, index) => {
        console.log(`   ${index + 1}. ${p.name} (${p.sku})`);
        console.log(`      ID: ${p.id}`);
        console.log(`      Actif: ${p.isActive}`);
      });
    }

    // 4. Vérifier s'il y a des références orphelines dans les ventes
    console.log('\n4️⃣ Vérification des références orphelines');
    
    const orphanSaleItems = await prisma.saleItem.findMany({
      where: {
        productId: productId
      },
      include: {
        sale: true
      }
    });

    if (orphanSaleItems.length > 0) {
      console.log(`⚠️ RÉFÉRENCES ORPHELINES TROUVÉES: ${orphanSaleItems.length}`);
      console.log('   Le produit a été supprimé mais des ventes y font encore référence');
      
      orphanSaleItems.forEach((item, index) => {
        console.log(`   ${index + 1}. Vente du ${item.sale.createdAt.toLocaleDateString()}`);
        console.log(`      Quantité: ${item.quantity}`);
        console.log(`      Total: ${item.total} DH`);
      });
    } else {
      console.log('✅ Aucune référence orpheline trouvée');
    }

    // 5. Statistiques générales
    console.log('\n5️⃣ Statistiques générales');
    
    const totalProducts = await prisma.product.count();
    const activeProducts = await prisma.product.count({
      where: { isActive: true }
    });
    const inactiveProducts = await prisma.product.count({
      where: { isActive: false }
    });

    console.log(`📊 Total produits: ${totalProducts}`);
    console.log(`📊 Produits actifs: ${activeProducts}`);
    console.log(`📊 Produits inactifs: ${inactiveProducts}`);

    // 6. Recommandations
    console.log('\n6️⃣ RECOMMANDATIONS');
    
    if (!product && orphanSaleItems.length === 0) {
      console.log('🔧 SOLUTION RECOMMANDÉE:');
      console.log('   1. Le produit n\'existe plus dans la base de données');
      console.log('   2. Rafraîchir la page des produits pour mettre à jour la liste');
      console.log('   3. Vérifier que l\'ID affiché dans l\'interface est correct');
    } else if (!product && orphanSaleItems.length > 0) {
      console.log('🔧 SOLUTION RECOMMANDÉE:');
      console.log('   1. Le produit a été supprimé mais des ventes y font référence');
      console.log('   2. Nettoyer les références orphelines ou restaurer le produit');
    } else if (product && !product.isActive) {
      console.log('🔧 SOLUTION RECOMMANDÉE:');
      console.log('   1. Le produit existe mais est déjà inactif');
      console.log('   2. Rafraîchir la page pour mettre à jour l\'état');
    }

  } catch (error) {
    console.error('❌ Erreur lors du débogage:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSpecificProduct();
