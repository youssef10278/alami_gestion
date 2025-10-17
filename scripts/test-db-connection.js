const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔌 Test de connexion à la base de données...');

  try {
    // Test simple de connexion
    const productCount = await prisma.product.count();
    console.log(`✅ Connexion réussie! Nombre de produits: ${productCount}`);
    
    // Test de création d'un produit simple
    console.log('\n🧪 Test de création d\'un produit...');
    
    const testProduct = await prisma.product.create({
      data: {
        sku: 'TEST-' + Date.now(),
        name: 'Test Product',
        purchasePrice: 10.00,
        price: 15.00,
        stock: 1,
        minStock: 0,
        isActive: true,
      }
    });
    
    console.log(`✅ Produit créé: ${testProduct.name} (ID: ${testProduct.id})`);
    
    // Test de suppression
    console.log('\n🗑️ Test de suppression...');
    
    await prisma.product.delete({
      where: { id: testProduct.id }
    });
    
    console.log('✅ Produit supprimé avec succès');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Connexion fermée');
  }
}

testConnection();
