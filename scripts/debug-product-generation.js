/**
 * Script de debug pour tester la génération de produits
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Données pour générer des produits réalistes
const productNames = [
  'Smartphone', 'Ordinateur portable', 'Tablette', 'Écouteurs', 'Montre connectée',
  'Télévision', 'Réfrigérateur', 'Lave-linge', 'Micro-ondes', 'Aspirateur',
  'T-shirt', 'Jean', 'Robe', 'Chaussures', 'Veste',
  'Livre', 'Stylo', 'Cahier', 'Calculatrice', 'Sac à dos',
  'Pain', 'Lait', 'Fromage', 'Yaourt', 'Céréales',
  'Shampoing', 'Dentifrice', 'Savon', 'Crème', 'Parfum',
  'Marteau', 'Tournevis', 'Perceuse', 'Scie', 'Clé',
  'Ballon', 'Raquette', 'Vélo', 'Tapis de yoga', 'Haltères'
]

const brands = [
  'Samsung', 'Apple', 'Sony', 'LG', 'Philips',
  'Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo',
  'Nestlé', 'Danone', 'Coca-Cola', 'Pepsi', 'Kraft',
  'L\'Oréal', 'Nivea', 'Garnier', 'Maybelline', 'Dove',
  'Bosch', 'Black & Decker', 'Makita', 'DeWalt', 'Stanley'
]

const adjectives = [
  'Premium', 'Pro', 'Ultra', 'Max', 'Plus',
  'Deluxe', 'Elite', 'Advanced', 'Smart', 'Digital',
  'Eco', 'Bio', 'Natural', 'Fresh', 'Pure',
  'Sport', 'Fitness', 'Active', 'Power', 'Turbo'
]

const categories = [
  'Électronique', 'Électroménager', 'Vêtements', 'Accessoires',
  'Bureautique', 'Alimentation', 'Beauté & Santé', 'Outils',
  'Sport & Loisirs', 'Maison & Jardin'
]

function generateRandomProduct(index) {
  const name = productNames[Math.floor(Math.random() * productNames.length)]
  const brand = brands[Math.floor(Math.random() * brands.length)]
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  
  const purchasePrice = Math.floor(Math.random() * 2000) + 10 // 10-2010 DH
  const margin = 1.2 + Math.random() * 0.8 // Marge entre 20% et 100%
  const price = Math.floor(purchasePrice * margin)
  
  const stock = Math.floor(Math.random() * 200) + 1 // 1-200 unités
  const minStock = Math.floor(stock * 0.1) + 1 // 10% du stock comme minimum
  
  return {
    sku: `TEST-${String(index).padStart(5, '0')}`,
    name: `${brand} ${name} ${adjective}`,
    description: `${adjective} ${name} de la marque ${brand} - Produit de test généré automatiquement`,
    purchasePrice,
    price,
    stock,
    minStock,
    isActive: true
  }
}

async function debugGeneration() {
  console.log('🔍 Debug de la génération de produits')
  console.log('=' .repeat(50))

  try {
    // 1. Vérifier les produits de test existants
    const existingTestProducts = await prisma.product.count({
      where: {
        sku: {
          startsWith: 'TEST-'
        }
      }
    })
    console.log(`📊 Produits de test existants: ${existingTestProducts}`)

    // 2. Vérifier les catégories
    const existingCategories = await prisma.category.findMany()
    console.log(`📁 Catégories existantes: ${existingCategories.length}`)
    existingCategories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.id})`)
    })

    // 3. Créer les catégories manquantes
    console.log('\n📁 Création des catégories manquantes...')
    const createdCategories = []
    
    for (const categoryName of categories) {
      let category = await prisma.category.findFirst({
        where: { name: categoryName }
      })
      
      if (!category) {
        category = await prisma.category.create({
          data: {
            name: categoryName,
            description: `Catégorie ${categoryName} - Générée pour les tests`
          }
        })
        console.log(`  ✅ Créée: ${category.name}`)
      } else {
        console.log(`  ⏭️  Existe: ${category.name}`)
      }
      
      createdCategories.push(category)
    }

    // 4. Test de génération d'un petit batch
    console.log('\n🧪 Test de génération de 10 produits...')
    const testProducts = []
    
    for (let i = 1; i <= 10; i++) {
      const product = generateRandomProduct(existingTestProducts + i)
      product.categoryId = createdCategories[Math.floor(Math.random() * createdCategories.length)].id
      testProducts.push(product)
    }

    console.log('📦 Produits à créer:')
    testProducts.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.sku} - ${p.name}`)
    })

    // 5. Insérer les produits
    console.log('\n💾 Insertion des produits...')
    const result = await prisma.product.createMany({
      data: testProducts,
      skipDuplicates: true
    })

    console.log(`✅ ${result.count} produits créés`)

    // 6. Vérifier le résultat
    const newTestProductsCount = await prisma.product.count({
      where: {
        sku: {
          startsWith: 'TEST-'
        }
      }
    })
    console.log(`📊 Total produits de test après création: ${newTestProductsCount}`)

    // 7. Test de génération d'un gros batch
    console.log('\n🚀 Test de génération de 1000 produits...')
    const startTime = Date.now()
    
    const batchSize = 100
    const count = 1000
    const batches = Math.ceil(count / batchSize)
    let totalCreated = 0

    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const batchStart = batchIndex * batchSize
      const batchEnd = Math.min(batchStart + batchSize, count)
      const batchProducts = []

      for (let i = batchStart; i < batchEnd; i++) {
        const product = generateRandomProduct(newTestProductsCount + i + 1)
        product.categoryId = createdCategories[Math.floor(Math.random() * createdCategories.length)].id
        batchProducts.push(product)
      }

      const batchResult = await prisma.product.createMany({
        data: batchProducts,
        skipDuplicates: true
      })

      totalCreated += batchResult.count
      console.log(`📦 Batch ${batchIndex + 1}/${batches} - ${batchResult.count} produits créés (Total: ${totalCreated})`)
    }

    const endTime = Date.now()
    const duration = endTime - startTime

    console.log(`\n✅ Test terminé: ${totalCreated} produits en ${duration}ms`)
    console.log(`⚡ Moyenne: ${(duration / totalCreated).toFixed(2)}ms par produit`)

    // 8. Statistiques finales
    const finalCount = await prisma.product.count({
      where: {
        sku: {
          startsWith: 'TEST-'
        }
      }
    })
    console.log(`📊 Total final de produits de test: ${finalCount}`)

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugGeneration().catch(console.error)
