const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugCharniRReports() {
  console.log('🔍 DÉBOGAGE COMPLET - Charnir 3D dans les rapports\n');

  try {
    // 1. Vérifier le produit Charnir 3D
    console.log('1️⃣ RECHERCHE DU PRODUIT "Charnir 3D"');
    const charniRProduct = await prisma.product.findFirst({
      where: {
        OR: [
          { name: { contains: 'Charnir', mode: 'insensitive' } },
          { sku: '000' }
        ]
      }
    });

    if (!charniRProduct) {
      console.log('❌ Produit "Charnir 3D" non trouvé !');
      return;
    }

    console.log('✅ Produit trouvé :');
    console.log(`   - ID: ${charniRProduct.id}`);
    console.log(`   - Nom: ${charniRProduct.name}`);
    console.log(`   - SKU: ${charniRProduct.sku}`);
    console.log(`   - Prix: ${charniRProduct.price} DH\n`);

    // 2. Vérifier les ventes de ce produit
    console.log('2️⃣ VENTES DU PRODUIT "Charnir 3D"');
    const charniRSales = await prisma.saleItem.findMany({
      where: {
        productId: charniRProduct.id
      },
      include: {
        sale: true,
        product: true
      },
      orderBy: {
        sale: {
          createdAt: 'desc'
        }
      }
    });

    console.log(`📊 Nombre total de ventes: ${charniRSales.length}`);
    
    if (charniRSales.length > 0) {
      console.log('\n📋 Détail des ventes:');
      charniRSales.forEach((item, index) => {
        console.log(`   ${index + 1}. Date: ${item.sale.createdAt.toLocaleString()}`);
        console.log(`      Quantité: ${item.quantity}`);
        console.log(`      Prix unitaire: ${item.unitPrice} DH`);
        console.log(`      Total: ${item.total} DH`);
        console.log(`      Sale ID: ${item.saleId}\n`);
      });

      // Calculer les totaux
      const totalQuantity = charniRSales.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = charniRSales.reduce((sum, item) => sum + parseFloat(item.total), 0);
      
      console.log(`📈 TOTAUX:`);
      console.log(`   - Quantité totale: ${totalQuantity} unités`);
      console.log(`   - Montant total: ${totalAmount.toFixed(2)} DH\n`);
    }

    // 3. Reproduire la requête exacte de l'API reports
    console.log('3️⃣ REPRODUCTION DE LA REQUÊTE API REPORTS');
    
    // Calculer la date de début (7 derniers jours)
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    console.log(`📅 Période analysée: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);

    // Requête exacte comme dans l'API
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
      take: 10, // Prendre top 10 pour voir où est Charnir 3D
    });

    console.log(`\n📊 TOP 10 PRODUITS (par quantité):`);
    
    // Récupérer les détails des produits
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        
        return {
          productId: item.productId,
          name: product?.name || 'Produit supprimé',
          sku: product?.sku || 'N/A',
          quantity: item._sum.quantity || 0,
          total: parseFloat(item._sum.total || 0),
        };
      })
    );

    topProductsWithDetails.forEach((product, index) => {
      const isCharnir = product.name.toLowerCase().includes('charnir');
      const marker = isCharnir ? '🎯' : '  ';
      console.log(`${marker} ${index + 1}. ${product.name} (${product.sku})`);
      console.log(`      Quantité: ${product.quantity} unités`);
      console.log(`      Total: ${product.total.toFixed(2)} DH`);
      console.log(`      Product ID: ${product.productId}\n`);
    });

    // 4. Vérifier si Charnir 3D est dans les résultats
    const charniRInResults = topProductsWithDetails.find(p => 
      p.productId === charniRProduct.id || 
      p.name.toLowerCase().includes('charnir')
    );

    if (charniRInResults) {
      console.log(`✅ "Charnir 3D" trouvé dans les résultats à la position ${topProductsWithDetails.indexOf(charniRInResults) + 1}`);
    } else {
      console.log(`❌ "Charnir 3D" NON TROUVÉ dans le top 10 !`);
      
      // Vérifier pourquoi
      console.log('\n🔍 ANALYSE DU PROBLÈME:');
      
      // Vérifier les ventes dans la période
      const charniRSalesInPeriod = await prisma.saleItem.findMany({
        where: {
          productId: charniRProduct.id,
          sale: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        include: {
          sale: true
        }
      });

      console.log(`📊 Ventes de "Charnir 3D" dans la période (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}):`);
      console.log(`   Nombre: ${charniRSalesInPeriod.length}`);
      
      if (charniRSalesInPeriod.length > 0) {
        const periodQuantity = charniRSalesInPeriod.reduce((sum, item) => sum + item.quantity, 0);
        const periodTotal = charniRSalesInPeriod.reduce((sum, item) => sum + parseFloat(item.total), 0);
        
        console.log(`   Quantité totale: ${periodQuantity} unités`);
        console.log(`   Montant total: ${periodTotal.toFixed(2)} DH`);
        
        console.log('\n   Détail:');
        charniRSalesInPeriod.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.sale.createdAt.toLocaleString()} - ${item.quantity} unités`);
        });
      } else {
        console.log('   ❌ Aucune vente dans cette période !');
      }
    }

    // 5. Test de la requête groupBy spécifique pour Charnir 3D
    console.log('\n4️⃣ TEST REQUÊTE GROUPBY POUR CHARNIR 3D');
    
    const charniRGroupBy = await prisma.saleItem.groupBy({
      by: ['productId'],
      where: {
        productId: charniRProduct.id,
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
    });

    console.log('Résultat groupBy pour Charnir 3D:');
    console.log(JSON.stringify(charniRGroupBy, null, 2));

  } catch (error) {
    console.error('❌ Erreur lors du débogage:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le débogage
debugCharniRReports();
