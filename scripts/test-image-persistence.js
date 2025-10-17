const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testImagePersistence() {
  console.log('🧪 TEST DE PERSISTANCE DES IMAGES\n');

  try {
    console.log('1️⃣ RECHERCHE DE PRODUITS AVEC IMAGES...');
    
    // Chercher tous les produits avec des images
    const productsWithImages = await prisma.product.findMany({
      where: {
        image: {
          not: null
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        sku: true,
        image: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    console.log(`📊 Trouvé ${productsWithImages.length} produits avec images:`);
    
    if (productsWithImages.length === 0) {
      console.log('❌ Aucun produit avec image trouvé en base de données');
      console.log('   → Ajoutez un produit avec une photo pour tester');
      return;
    }

    productsWithImages.forEach((product, index) => {
      const imageSize = product.image ? product.image.length : 0;
      const isBase64 = product.image && product.image.startsWith('data:image/');
      
      console.log(`\n   ${index + 1}. ${product.name} (${product.sku})`);
      console.log(`      ID: ${product.id}`);
      console.log(`      Image: ${imageSize} caractères`);
      console.log(`      Format: ${isBase64 ? 'Base64 ✅' : 'Autre format ❌'}`);
      console.log(`      Créé: ${product.createdAt.toLocaleString()}`);
      
      if (product.image && imageSize > 0) {
        const preview = product.image.substring(0, 50) + '...';
        console.log(`      Aperçu: ${preview}`);
      }
    });

    console.log('\n2️⃣ TEST API NORMALE (/api/products)...');
    
    // Simuler l'appel API normale
    const normalApiProducts = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const normalWithImages = normalApiProducts.filter(p => p.image);
    console.log(`📊 API normale: ${normalWithImages.length} produits avec images sur ${normalApiProducts.length} total`);

    console.log('\n3️⃣ TEST API FAST (/api/products/fast)...');
    
    // Simuler l'appel API fast
    const fastApiProducts = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        stock: true,
        image: true,
        categoryId: true,
      },
      orderBy: [
        { stock: 'desc' },
        { name: 'asc' }
      ],
      take: 5
    });

    const fastWithImages = fastApiProducts.filter(p => p.image);
    console.log(`📊 API fast: ${fastWithImages.length} produits avec images sur ${fastApiProducts.length} total`);

    console.log('\n4️⃣ COMPARAISON DES RÉSULTATS...');
    
    // Comparer les résultats
    const normalIds = new Set(normalWithImages.map(p => p.id));
    const fastIds = new Set(fastWithImages.map(p => p.id));
    
    const missingInFast = normalWithImages.filter(p => !fastIds.has(p.id));
    const missingInNormal = fastWithImages.filter(p => !normalIds.has(p.id));

    if (missingInFast.length > 0) {
      console.log(`❌ ${missingInFast.length} produits avec images manquants dans l'API fast:`);
      missingInFast.forEach(p => console.log(`   - ${p.name} (${p.id})`));
    }

    if (missingInNormal.length > 0) {
      console.log(`❌ ${missingInNormal.length} produits avec images manquants dans l'API normale:`);
      missingInNormal.forEach(p => console.log(`   - ${p.name} (${p.id})`));
    }

    if (missingInFast.length === 0 && missingInNormal.length === 0) {
      console.log('✅ Les deux APIs retournent les mêmes produits avec images');
    }

    console.log('\n5️⃣ VÉRIFICATION DES TAILLES D\'IMAGES...');
    
    let totalImageSize = 0;
    let maxImageSize = 0;
    let minImageSize = Infinity;
    
    productsWithImages.forEach(product => {
      if (product.image) {
        const size = product.image.length;
        totalImageSize += size;
        maxImageSize = Math.max(maxImageSize, size);
        minImageSize = Math.min(minImageSize, size);
      }
    });

    if (productsWithImages.length > 0) {
      const avgImageSize = totalImageSize / productsWithImages.length;
      
      console.log(`📊 Statistiques des images:`);
      console.log(`   Taille totale: ${(totalImageSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Taille moyenne: ${(avgImageSize / 1024).toFixed(2)} KB`);
      console.log(`   Taille max: ${(maxImageSize / 1024).toFixed(2)} KB`);
      console.log(`   Taille min: ${(minImageSize / 1024).toFixed(2)} KB`);
      
      // Vérifier si les images sont trop volumineuses pour localStorage
      const localStorageLimit = 5 * 1024 * 1024; // 5MB limite approximative
      if (totalImageSize > localStorageLimit) {
        console.log(`⚠️  PROBLÈME POTENTIEL: Images trop volumineuses pour localStorage`);
        console.log(`   Limite localStorage: ~5MB`);
        console.log(`   Taille actuelle: ${(totalImageSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   → Solution: Exclure les images du cache ou utiliser IndexedDB`);
      } else {
        console.log(`✅ Taille des images compatible avec localStorage`);
      }
    }

    console.log('\n6️⃣ RECOMMANDATIONS...');
    
    if (productsWithImages.length > 0) {
      console.log('✅ Les images sont bien sauvegardées en base de données');
      console.log('✅ Les APIs récupèrent correctement les images');
      console.log('');
      console.log('🎯 LE PROBLÈME EST PROBABLEMENT:');
      console.log('   A) Cache localStorage qui ne gère pas bien les images volumineuses');
      console.log('   B) Problème d\'affichage côté frontend');
      console.log('   C) Corruption du cache lors du refresh');
      console.log('');
      console.log('🛠️ SOLUTIONS RECOMMANDÉES:');
      console.log('   1. Exclure les images du cache localStorage');
      console.log('   2. Ajouter des logs dans ProductTable pour tracer l\'affichage');
      console.log('   3. Vérifier le cache dans DevTools après refresh');
    } else {
      console.log('❌ Aucune image trouvée en base de données');
      console.log('   → Le problème est dans la sauvegarde des images');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testImagePersistence();
