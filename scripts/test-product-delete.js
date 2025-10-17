const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testProductDelete() {
  console.log('🧪 TEST DE LA SUPPRESSION DE PRODUIT\n');

  try {
    // 1. Créer un produit de test
    console.log('1️⃣ Création d\'un produit de test');
    
    const testProduct = await prisma.product.create({
      data: {
        sku: 'TEST-DELETE-' + Date.now(),
        name: 'Produit Test Suppression',
        description: 'Produit créé pour tester la suppression',
        purchasePrice: 10.00,
        price: 15.00,
        stock: 5,
        minStock: 1,
        isActive: true,
      }
    });

    console.log(`✅ Produit créé: ${testProduct.name} (ID: ${testProduct.id})`);

    // 2. Vérifier que le produit existe et est actif
    console.log('\n2️⃣ Vérification du produit créé');
    
    const foundProduct = await prisma.product.findUnique({
      where: { id: testProduct.id }
    });

    if (foundProduct && foundProduct.isActive) {
      console.log(`✅ Produit trouvé et actif: ${foundProduct.name}`);
    } else {
      console.log('❌ Problème avec le produit créé');
      return;
    }

    // 3. Tester la suppression (soft delete)
    console.log('\n3️⃣ Test de suppression (soft delete)');
    
    const deletedProduct = await prisma.product.update({
      where: { id: testProduct.id },
      data: { isActive: false }
    });

    if (!deletedProduct.isActive) {
      console.log(`✅ Produit supprimé avec succès: ${deletedProduct.name}`);
    } else {
      console.log('❌ Échec de la suppression');
    }

    // 4. Tester la suppression d'un produit déjà supprimé
    console.log('\n4️⃣ Test de suppression d\'un produit déjà supprimé');
    
    try {
      await prisma.product.update({
        where: { id: testProduct.id },
        data: { isActive: false }
      });
      console.log('✅ Suppression d\'un produit déjà supprimé réussie (pas d\'erreur)');
    } catch (error) {
      console.log('❌ Erreur lors de la suppression d\'un produit déjà supprimé:', error.message);
    }

    // 5. Tester la suppression d'un produit inexistant
    console.log('\n5️⃣ Test de suppression d\'un produit inexistant');
    
    const fakeId = 'fake-id-' + Date.now();
    
    try {
      await prisma.product.update({
        where: { id: fakeId },
        data: { isActive: false }
      });
      console.log('❌ Suppression d\'un produit inexistant réussie (ne devrait pas arriver)');
    } catch (error) {
      if (error.code === 'P2025') {
        console.log('✅ Erreur P2025 correctement attrapée pour produit inexistant');
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    // 6. Vérifier les produits actifs vs inactifs
    console.log('\n6️⃣ Vérification des produits actifs vs inactifs');
    
    const activeProducts = await prisma.product.count({
      where: { isActive: true }
    });
    
    const inactiveProducts = await prisma.product.count({
      where: { isActive: false }
    });

    console.log(`📊 Produits actifs: ${activeProducts}`);
    console.log(`📊 Produits inactifs: ${inactiveProducts}`);

    // 7. Nettoyer - supprimer définitivement le produit de test
    console.log('\n7️⃣ Nettoyage - suppression définitive du produit de test');
    
    await prisma.product.delete({
      where: { id: testProduct.id }
    });
    
    console.log('✅ Produit de test supprimé définitivement');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProductDelete();
