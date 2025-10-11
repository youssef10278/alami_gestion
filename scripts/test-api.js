const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAPI() {
  try {
    console.log('🧪 Test de l\'API avec le nouveau schéma...')
    
    // Test 1: Récupérer les produits (comme l'API GET /api/products)
    console.log('\n1️⃣ Test GET products...')
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    
    console.log(`✅ Récupération réussie: ${products.length} produits trouvés`)
    
    // Test 2: Créer un produit (comme l'API POST /api/products)
    console.log('\n2️⃣ Test CREATE product...')
    const newProduct = await prisma.product.create({
      data: {
        sku: 'TEST-API-' + Date.now(),
        name: 'Produit Test API',
        description: 'Test avec imagePublicId',
        price: 25.99,
        stock: 10,
        minStock: 5,
        image: 'https://example.com/test-image.jpg',
        imagePublicId: 'test-public-id-' + Date.now()
      },
      include: { category: true }
    })
    
    console.log('✅ Création réussie:', {
      id: newProduct.id,
      sku: newProduct.sku,
      name: newProduct.name,
      image: newProduct.image,
      imagePublicId: newProduct.imagePublicId
    })
    
    // Test 3: Mettre à jour le produit (comme l'API PUT /api/products/[id])
    console.log('\n3️⃣ Test UPDATE product...')
    const updatedProduct = await prisma.product.update({
      where: { id: newProduct.id },
      data: {
        name: 'Produit Test API Modifié',
        image: 'https://example.com/updated-image.jpg',
        imagePublicId: 'updated-public-id-' + Date.now()
      },
      include: { category: true }
    })
    
    console.log('✅ Mise à jour réussie:', {
      id: updatedProduct.id,
      name: updatedProduct.name,
      image: updatedProduct.image,
      imagePublicId: updatedProduct.imagePublicId
    })
    
    // Test 4: Supprimer le produit de test
    console.log('\n4️⃣ Test DELETE product...')
    await prisma.product.delete({
      where: { id: newProduct.id }
    })
    
    console.log('✅ Suppression réussie')
    
    console.log('\n🎉 Tous les tests API ont réussi !')
    console.log('✅ Le champ imagePublicId fonctionne correctement')
    console.log('✅ L\'API est prête pour Cloudinary')
    
  } catch (error) {
    console.error('❌ Erreur lors du test API:', error)
    console.error('📋 Détails:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testAPI()
