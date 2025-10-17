const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugTimezone() {
  console.log('🕐 DÉBOGAGE DES FUSEAUX HORAIRES\n');

  try {
    // 1. Vérifier les dernières ventes
    console.log('1️⃣ LES 10 DERNIÈRES VENTES (toutes dates)');
    
    const recentSales = await prisma.sale.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log(`📊 Dernières ventes trouvées: ${recentSales.length}\n`);

    recentSales.forEach((sale, index) => {
      console.log(`🛒 VENTE ${index + 1}:`);
      console.log(`   ID: ${sale.id}`);
      console.log(`   Date UTC: ${sale.createdAt.toISOString()}`);
      console.log(`   Date locale: ${sale.createdAt.toLocaleString()}`);
      console.log(`   Total: ${sale.totalAmount} DH`);
      console.log(`   Articles (${sale.items.length}):`);
      
      sale.items.forEach((item, itemIndex) => {
        console.log(`      ${itemIndex + 1}. ${item.product?.name || '❌ PRODUIT SUPPRIMÉ'}`);
        console.log(`         SKU: ${item.product?.sku || 'N/A'}`);
        console.log(`         Quantité: ${item.quantity}`);
        console.log(`         Prix: ${item.unitPrice} DH`);
        console.log(`         Total: ${item.total} DH`);
      });
      console.log('');
    });

    // 2. Recherche des ventes de 5 DH dans les dernières ventes
    console.log('2️⃣ VENTES DE 5 DH DANS LES DERNIÈRES VENTES');
    
    const sales5DH = recentSales.filter(sale => parseFloat(sale.totalAmount) === 5.00);
    console.log(`📊 Ventes de 5 DH trouvées: ${sales5DH.length}\n`);

    if (sales5DH.length > 0) {
      sales5DH.forEach((sale, index) => {
        console.log(`💰 VENTE DE 5 DH ${index + 1}:`);
        console.log(`   Date UTC: ${sale.createdAt.toISOString()}`);
        console.log(`   Date locale: ${sale.createdAt.toLocaleString()}`);
        console.log(`   Articles:`);
        
        sale.items.forEach((item, itemIndex) => {
          console.log(`      ${itemIndex + 1}. ${item.product?.name || '❌ PRODUIT SUPPRIMÉ'}`);
          console.log(`         SKU: ${item.product?.sku || 'N/A'}`);
          console.log(`         Product ID: ${item.productId}`);
          console.log(`         Quantité: ${item.quantity}`);
        });
        console.log('');
      });

      // 3. Vérifier les produits des ventes de 5 DH
      console.log('3️⃣ ANALYSE DES PRODUITS DES VENTES DE 5 DH');
      
      const productIds5DH = sales5DH.flatMap(sale => 
        sale.items.map(item => item.productId)
      );
      
      const uniqueProductIds = [...new Set(productIds5DH)];
      console.log(`Product IDs uniques: ${uniqueProductIds.join(', ')}\n`);
      
      for (const productId of uniqueProductIds) {
        console.log(`🔍 Produit ID: ${productId}`);
        
        const product = await prisma.product.findUnique({
          where: { id: productId }
        });
        
        if (product) {
          console.log(`✅ PRODUIT TROUVÉ:`);
          console.log(`   Nom: ${product.name}`);
          console.log(`   SKU: ${product.sku}`);
          console.log(`   Prix: ${product.price} DH`);
          
          // Vérifier si c'est "Charnir 3D"
          if (product.name.toLowerCase().includes('charnir') || 
              product.sku === '000' || 
              product.name.toLowerCase().includes('3d')) {
            console.log(`   🎯 BINGO! C'est probablement "Charnir 3D"!`);
          }
        } else {
          console.log(`❌ PRODUIT SUPPRIMÉ`);
        }
        console.log('');
      }
    }

    // 4. Test de la requête API reports avec les vraies dates
    if (recentSales.length > 0) {
      console.log('4️⃣ TEST REQUÊTE API REPORTS AVEC VRAIES DATES');
      
      // Prendre une plage large autour des dernières ventes
      const oldestSale = recentSales[recentSales.length - 1];
      const newestSale = recentSales[0];
      
      const startDate = new Date(oldestSale.createdAt);
      startDate.setDate(startDate.getDate() - 1); // 1 jour avant
      
      const endDate = new Date(newestSale.createdAt);
      endDate.setDate(endDate.getDate() + 1); // 1 jour après
      
      console.log(`📅 Période: ${startDate.toISOString()} - ${endDate.toISOString()}`);
      
      const topProducts = await prisma.saleItem.groupBy({
        by: ['productId'],
        where: {
          sale: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        _sum: {
          quantity: true,
          total: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 10,
      });

      console.log(`📊 Top produits trouvés: ${topProducts.length}\n`);
      
      for (const item of topProducts) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        
        const isCharnir = product?.name.toLowerCase().includes('charnir') || 
                         product?.sku === '000' || 
                         product?.name.toLowerCase().includes('3d');
        
        const marker = isCharnir ? '🎯' : '  ';
        
        console.log(`${marker} Product ID: ${item.productId}`);
        console.log(`   Nom: ${product?.name || '❌ PRODUIT SUPPRIMÉ'}`);
        console.log(`   SKU: ${product?.sku || 'N/A'}`);
        console.log(`   Quantité: ${item._sum.quantity}`);
        console.log(`   Total: ${parseFloat(item._sum.total || 0).toFixed(2)} DH`);
        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTimezone();
