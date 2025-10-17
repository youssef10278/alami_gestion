const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findCharniRProduct() {
  console.log('🔍 RECHERCHE EXHAUSTIVE DU PRODUIT "Charnir 3D"\n');

  try {
    // 1. Recherche par nom contenant "charnir"
    console.log('1️⃣ Recherche par nom contenant "charnir"');
    const productsByName = await prisma.product.findMany({
      where: {
        name: {
          contains: 'charnir',
          mode: 'insensitive'
        }
      }
    });
    console.log(`Résultats: ${productsByName.length} produits`);
    productsByName.forEach(p => {
      console.log(`   - ${p.name} (SKU: ${p.sku}, ID: ${p.id})`);
    });

    // 2. Recherche par nom contenant "3D"
    console.log('\n2️⃣ Recherche par nom contenant "3D"');
    const productsBy3D = await prisma.product.findMany({
      where: {
        name: {
          contains: '3D',
          mode: 'insensitive'
        }
      }
    });
    console.log(`Résultats: ${productsBy3D.length} produits`);
    productsBy3D.forEach(p => {
      console.log(`   - ${p.name} (SKU: ${p.sku}, ID: ${p.id})`);
    });

    // 3. Recherche par SKU "000"
    console.log('\n3️⃣ Recherche par SKU "000"');
    const productsBySKU = await prisma.product.findMany({
      where: {
        sku: '000'
      }
    });
    console.log(`Résultats: ${productsBySKU.length} produits`);
    productsBySKU.forEach(p => {
      console.log(`   - ${p.name} (SKU: ${p.sku}, ID: ${p.id})`);
    });

    // 4. Recherche dans les ventes de 5 DH du 16 octobre
    console.log('\n4️⃣ Recherche dans les ventes de 5 DH du 16 octobre');
    
    const startDate = new Date('2025-10-16T00:00:00.000Z');
    const endDate = new Date('2025-10-16T23:59:59.999Z');
    
    const salesOf5DH = await prisma.saleItem.findMany({
      where: {
        total: 5.00,
        sale: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      include: {
        product: true,
        sale: true
      }
    });

    console.log(`Ventes de 5 DH le 16 octobre: ${salesOf5DH.length}`);
    salesOf5DH.forEach((item, index) => {
      console.log(`   ${index + 1}. Produit: ${item.product?.name || 'PRODUIT SUPPRIMÉ'}`);
      console.log(`      SKU: ${item.product?.sku || 'N/A'}`);
      console.log(`      Product ID: ${item.productId}`);
      console.log(`      Quantité: ${item.quantity}`);
      console.log(`      Prix unitaire: ${item.unitPrice} DH`);
      console.log(`      Total: ${item.total} DH`);
      console.log(`      Date: ${item.sale.createdAt.toLocaleString()}\n`);
    });

    // 5. Recherche par prix de 5 DH
    console.log('5️⃣ Recherche par prix de 5 DH');
    const productsBy5DH = await prisma.product.findMany({
      where: {
        price: 5.00
      }
    });
    console.log(`Produits à 5 DH: ${productsBy5DH.length}`);
    productsBy5DH.forEach(p => {
      console.log(`   - ${p.name} (SKU: ${p.sku}, ID: ${p.id})`);
    });

    // 6. Vérifier les produits supprimés/orphelins
    console.log('\n6️⃣ Vérification des produits orphelins dans les ventes');
    
    const orphanSales = await prisma.saleItem.findMany({
      where: {
        product: null
      },
      include: {
        sale: true
      }
    });

    console.log(`Ventes avec produits orphelins: ${orphanSales.length}`);
    if (orphanSales.length > 0) {
      console.log('Détails des ventes orphelines:');
      orphanSales.forEach((item, index) => {
        console.log(`   ${index + 1}. Product ID: ${item.productId}`);
        console.log(`      Quantité: ${item.quantity}`);
        console.log(`      Prix: ${item.unitPrice} DH`);
        console.log(`      Total: ${item.total} DH`);
        console.log(`      Date: ${item.sale.createdAt.toLocaleString()}\n`);
      });
    }

    // 7. Recherche directe par ID des ventes de 5 DH
    if (salesOf5DH.length > 0) {
      console.log('7️⃣ Vérification des Product IDs des ventes de 5 DH');
      
      const productIds = [...new Set(salesOf5DH.map(s => s.productId))];
      console.log(`Product IDs uniques: ${productIds.join(', ')}`);
      
      for (const productId of productIds) {
        const product = await prisma.product.findUnique({
          where: { id: productId }
        });
        
        if (product) {
          console.log(`✅ Produit trouvé pour ID ${productId}:`);
          console.log(`   Nom: ${product.name}`);
          console.log(`   SKU: ${product.sku}`);
          console.log(`   Prix: ${product.price} DH`);
        } else {
          console.log(`❌ Produit SUPPRIMÉ pour ID ${productId}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findCharniRProduct();
