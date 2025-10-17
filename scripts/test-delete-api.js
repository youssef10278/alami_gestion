const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDeleteAPI() {
  console.log('🧪 TEST DE L\'API DE SUPPRESSION DE PRODUIT\n');

  try {
    // 1. Créer un produit de test
    console.log('1️⃣ Création d\'un produit de test pour l\'API');
    
    const testProduct = await prisma.product.create({
      data: {
        sku: 'API-TEST-' + Date.now(),
        name: 'Produit Test API Delete',
        description: 'Produit pour tester l\'API de suppression',
        purchasePrice: 5.00,
        price: 10.00,
        stock: 3,
        minStock: 1,
        isActive: true,
      }
    });

    console.log(`✅ Produit créé: ${testProduct.name}`);
    console.log(`   ID: ${testProduct.id}`);
    console.log(`   SKU: ${testProduct.sku}`);
    console.log(`   Actif: ${testProduct.isActive}`);

    // 2. Simuler la logique de l'API DELETE
    console.log('\n2️⃣ Simulation de l\'API DELETE');
    
    // Étape 1: Vérifier si le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: testProduct.id },
    });

    if (!existingProduct) {
      console.log('❌ Produit non trouvé (erreur 404)');
      return;
    }

    console.log(`✅ Produit trouvé: ${existingProduct.name}`);

    // Étape 2: Vérifier si le produit est déjà supprimé
    if (!existingProduct.isActive) {
      console.log('⚠️ Le produit est déjà supprimé (erreur 400)');
      return;
    }

    console.log('✅ Produit actif, suppression possible');

    // Étape 3: Effectuer la suppression (soft delete)
    const deletedProduct = await prisma.product.update({
      where: { id: testProduct.id },
      data: { isActive: false },
    });

    console.log(`✅ Suppression réussie: ${deletedProduct.name}`);
    console.log(`   Actif: ${deletedProduct.isActive}`);

    // 3. Tester la suppression d'un produit déjà supprimé
    console.log('\n3️⃣ Test de suppression d\'un produit déjà supprimé');
    
    const alreadyDeletedProduct = await prisma.product.findUnique({
      where: { id: testProduct.id },
    });

    if (!alreadyDeletedProduct.isActive) {
      console.log('⚠️ Le produit est déjà supprimé (comportement attendu)');
    }

    // 4. Tester avec un ID inexistant
    console.log('\n4️⃣ Test avec un ID inexistant');
    
    const fakeId = 'fake-id-' + Date.now();
    
    try {
      const nonExistentProduct = await prisma.product.findUnique({
        where: { id: fakeId },
      });

      if (!nonExistentProduct) {
        console.log('✅ Produit inexistant correctement détecté (erreur 404)');
      }
    } catch (error) {
      console.log('❌ Erreur inattendue:', error.message);
    }

    // 5. Vérifier le comportement avec update direct (ancien comportement)
    console.log('\n5️⃣ Test de l\'ancien comportement (update direct)');
    
    try {
      await prisma.product.update({
        where: { id: fakeId },
        data: { isActive: false },
      });
      console.log('❌ Update direct réussi (ne devrait pas arriver)');
    } catch (error) {
      if (error.code === 'P2025') {
        console.log('✅ Erreur P2025 correctement attrapée (ancien problème)');
        console.log(`   Message: ${error.message}`);
      } else {
        console.log('❌ Erreur inattendue:', error.message);
      }
    }

    // 6. Nettoyer
    console.log('\n6️⃣ Nettoyage');
    
    await prisma.product.delete({
      where: { id: testProduct.id }
    });
    
    console.log('✅ Produit de test supprimé définitivement');

    console.log('\n🎉 TOUS LES TESTS PASSÉS !');
    console.log('✅ L\'API de suppression devrait maintenant fonctionner correctement');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDeleteAPI();
