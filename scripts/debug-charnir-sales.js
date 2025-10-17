#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCharnirSales() {
  console.log('🔍 DIAGNOSTIC DES VENTES CHARNIR 3D');
  console.log('=====================================');
  
  try {
    // 1. Chercher le produit Charnir 3D
    console.log('\n1️⃣ Recherche du produit Charnir 3D...');
    const product = await prisma.product.findFirst({
      where: {
        name: {
          contains: 'Charnir',
          mode: 'insensitive'
        }
      }
    });
    
    if (product) {
      console.log('✅ Produit trouvé:');
      console.log('   ID:', product.id);
      console.log('   Nom:', product.name);
      console.log('   SKU:', product.sku);
      console.log('   Prix:', product.price, 'DH');
    } else {
      console.log('❌ Produit Charnir 3D non trouvé');
      
      // Chercher tous les produits pour voir
      console.log('\n🔍 Tous les produits disponibles:');
      const allProducts = await prisma.product.findMany({
        select: { id: true, name: true, sku: true },
        take: 10
      });
      
      allProducts.forEach(p => {
        console.log(`   - ${p.name} (${p.sku})`);
      });
      
      return;
    }
    
    // 2. Vérifier les ventes d'aujourd'hui
    console.log('\n2️⃣ Ventes d\'aujourd\'hui...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    console.log('📅 Période analysée:', today.toLocaleString('fr-FR'), 'à', tomorrow.toLocaleString('fr-FR'));
    
    const todaySales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    console.log('📊 Ventes d\'aujourd\'hui:', todaySales.length);
    
    // 3. Chercher les ventes du produit Charnir 3D
    console.log('\n3️⃣ Ventes de Charnir 3D aujourd\'hui...');
    const charnirSales = todaySales.filter(sale => 
      sale.items.some(item => item.product.name.toLowerCase().includes('charnir'))
    );
    
    console.log('🎯 Ventes avec Charnir 3D:', charnirSales.length);
    
    charnirSales.forEach((sale, index) => {
      console.log(`\n   Vente ${index + 1}:`);
      console.log('   - ID:', sale.id);
      console.log('   - Date:', sale.createdAt.toLocaleString('fr-FR'));
      console.log('   - Total:', sale.totalAmount, 'DH');
      
      const charnirItems = sale.items.filter(item => 
        item.product.name.toLowerCase().includes('charnir')
      );
      
      charnirItems.forEach(item => {
        console.log('   - Produit:', item.product.name);
        console.log('   - Quantité:', item.quantity);
        console.log('   - Prix unitaire:', item.unitPrice, 'DH');
        console.log('   - Total item:', item.total, 'DH');
      });
    });
    
    // 4. Vérifier spécifiquement Charnir 3D dans les SaleItems
    console.log('\n4️⃣ SaleItems pour Charnir 3D (toutes périodes)...');
    const charnirSaleItems = await prisma.saleItem.findMany({
      where: {
        productId: product.id
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
    
    console.log('📦 Total SaleItems pour Charnir 3D:', charnirSaleItems.length);
    
    charnirSaleItems.forEach((item, index) => {
      console.log(`\n   SaleItem ${index + 1}:`);
      console.log('   - Sale ID:', item.saleId);
      console.log('   - Date vente:', item.sale.createdAt.toLocaleString('fr-FR'));
      console.log('   - Quantité:', item.quantity);
      console.log('   - Prix unitaire:', item.unitPrice, 'DH');
      console.log('   - Total:', item.total, 'DH');
    });
    
    // 5. Test de la requête API exacte
    console.log('\n5️⃣ Test de la requête API exacte...');
    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId'],
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
    
    console.log('📈 Top produits (par quantité):');
    for (const item of topProducts) {
      const prod = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { name: true, sku: true },
      });
      
      console.log(`   - ${prod?.name || 'Produit supprimé'} (${prod?.sku || 'N/A'})`);
      console.log(`     Quantité: ${item._sum.quantity}`);
      console.log(`     Total: ${item._sum.total} DH`);
      
      if (prod?.name?.toLowerCase().includes('charnir')) {
        console.log('     ⭐ CHARNIR 3D TROUVÉ DANS LE TOP!');
      }
      console.log('');
    }
    
    // 6. Agrégation manuelle pour Charnir 3D
    console.log('\n6️⃣ Agrégation manuelle pour Charnir 3D...');
    const charnirAgg = await prisma.saleItem.aggregate({
      where: {
        productId: product.id
      },
      _sum: {
        quantity: true,
        total: true,
      },
      _count: true,
    });
    
    console.log('📊 Résultats agrégation:');
    console.log('   - Quantité totale:', charnirAgg._sum.quantity);
    console.log('   - Montant total:', charnirAgg._sum.total, 'DH');
    console.log('   - Nombre de lignes:', charnirAgg._count);
    
    // 7. Vérifier si le problème vient de la période
    console.log('\n7️⃣ Test avec différentes périodes...');
    
    // Derniers 7 jours
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 6);
    last7Days.setHours(0, 0, 0, 0);
    
    const charnirLast7Days = await prisma.saleItem.aggregate({
      where: {
        productId: product.id,
        sale: {
          createdAt: {
            gte: last7Days
          }
        }
      },
      _sum: {
        quantity: true,
        total: true,
      },
      _count: true,
    });
    
    console.log('📅 Derniers 7 jours:');
    console.log('   - Quantité:', charnirLast7Days._sum.quantity || 0);
    console.log('   - Total:', charnirLast7Days._sum.total || 0, 'DH');
    console.log('   - Lignes:', charnirLast7Days._count);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCharnirSales();
