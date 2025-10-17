const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugSales16Oct() {
  console.log('🔍 DÉBOGAGE DES VENTES DU 16 OCTOBRE 2025\n');

  try {
    // 1. Toutes les ventes du 16 octobre
    console.log('1️⃣ TOUTES LES VENTES DU 16 OCTOBRE 2025');
    
    const startDate = new Date('2025-10-16T00:00:00.000Z');
    const endDate = new Date('2025-10-16T23:59:59.999Z');
    
    const sales16Oct = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Nombre total de ventes: ${sales16Oct.length}\n`);

    sales16Oct.forEach((sale, index) => {
      console.log(`🛒 VENTE ${index + 1}:`);
      console.log(`   ID: ${sale.id}`);
      console.log(`   Date: ${sale.createdAt.toLocaleString()}`);
      console.log(`   Total: ${sale.totalAmount} DH`);
      console.log(`   Articles (${sale.items.length}):`);
      
      sale.items.forEach((item, itemIndex) => {
        console.log(`      ${itemIndex + 1}. ${item.product?.name || '❌ PRODUIT SUPPRIMÉ'}`);
        console.log(`         SKU: ${item.product?.sku || 'N/A'}`);
        console.log(`         Product ID: ${item.productId}`);
        console.log(`         Quantité: ${item.quantity}`);
        console.log(`         Prix unitaire: ${item.unitPrice} DH`);
        console.log(`         Total: ${item.total} DH`);
      });
      console.log('');
    });

    // 2. Recherche spécifique des ventes de 5 DH
    console.log('2️⃣ VENTES DE 5 DH EXACTEMENT');
    
    const sales5DH = sales16Oct.filter(sale => parseFloat(sale.totalAmount) === 5.00);
    console.log(`📊 Ventes de 5 DH: ${sales5DH.length}\n`);

    sales5DH.forEach((sale, index) => {
      console.log(`💰 VENTE DE 5 DH ${index + 1}:`);
      console.log(`   Date: ${sale.createdAt.toLocaleString()}`);
      console.log(`   Articles:`);
      
      sale.items.forEach((item, itemIndex) => {
        console.log(`      ${itemIndex + 1}. ${item.product?.name || '❌ PRODUIT SUPPRIMÉ'}`);
        console.log(`         SKU: ${item.product?.sku || 'N/A'}`);
        console.log(`         Product ID: ${item.productId}`);
        console.log(`         Quantité: ${item.quantity}`);
        console.log(`         Prix unitaire: ${item.unitPrice} DH`);
      });
      console.log('');
    });

    // 3. Vérifier les produits supprimés
    console.log('3️⃣ VÉRIFICATION DES PRODUITS SUPPRIMÉS');
    
    const allItems16Oct = sales16Oct.flatMap(sale => sale.items);
    const deletedProductItems = allItems16Oct.filter(item => !item.product);
    
    console.log(`📊 Articles avec produits supprimés: ${deletedProductItems.length}\n`);
    
    if (deletedProductItems.length > 0) {
      console.log('❌ PRODUITS SUPPRIMÉS TROUVÉS:');
      deletedProductItems.forEach((item, index) => {
        console.log(`   ${index + 1}. Product ID: ${item.productId}`);
        console.log(`      Quantité: ${item.quantity}`);
        console.log(`      Prix: ${item.unitPrice} DH`);
        console.log(`      Total: ${item.total} DH`);
      });
    }

    // 4. Recherche par Product ID des ventes de 5 DH
    if (sales5DH.length > 0) {
      console.log('\n4️⃣ ANALYSE DES PRODUCT IDs DES VENTES DE 5 DH');
      
      const productIds5DH = sales5DH.flatMap(sale => 
        sale.items.map(item => item.productId)
      );
      
      const uniqueProductIds = [...new Set(productIds5DH)];
      console.log(`Product IDs uniques: ${uniqueProductIds.join(', ')}\n`);
      
      for (const productId of uniqueProductIds) {
        console.log(`🔍 Recherche du produit ID: ${productId}`);
        
        const product = await prisma.product.findUnique({
          where: { id: productId }
        });
        
        if (product) {
          console.log(`✅ PRODUIT TROUVÉ:`);
          console.log(`   Nom: ${product.name}`);
          console.log(`   SKU: ${product.sku}`);
          console.log(`   Prix: ${product.price} DH`);
          console.log(`   Stock: ${product.stock}`);
          console.log(`   Actif: ${product.isActive}`);
        } else {
          console.log(`❌ PRODUIT SUPPRIMÉ`);
        }
        console.log('');
      }
    }

    // 5. Test de la requête API reports pour cette période
    console.log('5️⃣ TEST REQUÊTE API REPORTS POUR LE 16 OCTOBRE');
    
    const topProducts16Oct = await prisma.saleItem.groupBy({
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
    });

    console.log(`📊 Produits vendus le 16 octobre (groupBy): ${topProducts16Oct.length}\n`);
    
    for (const item of topProducts16Oct) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });
      
      console.log(`📦 Product ID: ${item.productId}`);
      console.log(`   Nom: ${product?.name || '❌ PRODUIT SUPPRIMÉ'}`);
      console.log(`   SKU: ${product?.sku || 'N/A'}`);
      console.log(`   Quantité vendue: ${item._sum.quantity}`);
      console.log(`   Total: ${parseFloat(item._sum.total || 0).toFixed(2)} DH`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSales16Oct();
