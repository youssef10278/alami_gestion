/**
 * Script pour vérifier les produits dans la base de données
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkProducts() {
  try {
    console.log('🔍 Vérification des produits dans la base de données...\n')
    
    // Compter le nombre total de produits
    const totalProducts = await prisma.product.count()
    console.log(`📊 Nombre total de produits: ${totalProducts}`)
    
    // Compter les produits actifs
    const activeProducts = await prisma.product.count({
      where: { isActive: true }
    })
    console.log(`✅ Produits actifs: ${activeProducts}`)
    
    // Récupérer quelques produits pour exemple
    const sampleProducts = await prisma.product.findMany({
      take: 5,
      include: {
        category: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    if (sampleProducts.length > 0) {
      console.log('\n📦 Exemples de produits:')
      console.log('========================')
      
      sampleProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`)
        console.log(`   SKU: ${product.sku || 'N/A'}`)
        console.log(`   Prix: ${product.price} DH`)
        console.log(`   Catégorie: ${product.category?.name || 'Aucune'}`)
        console.log(`   Actif: ${product.isActive ? 'Oui' : 'Non'}`)
        console.log(`   Description: ${product.description || 'N/A'}`)
        console.log('')
      })
    } else {
      console.log('\n❌ Aucun produit trouvé dans la base de données')
      console.log('\n💡 Suggestions:')
      console.log('1. Allez dans la section "Produits" de l\'application')
      console.log('2. Créez quelques produits de test')
      console.log('3. Ou exécutez le script de seed: npm run seed')
    }
    
    // Vérifier les catégories
    const categories = await prisma.category.count()
    console.log(`\n📂 Nombre de catégories: ${categories}`)
    
    if (categories === 0) {
      console.log('\n⚠️  Aucune catégorie trouvée')
      console.log('💡 Créez des catégories pour mieux organiser vos produits')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter la vérification
checkProducts()
