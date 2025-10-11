// Script de génération de 5000 produits de test
// À exécuter avec Node.js : node scripts/generate-test-products.js

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Données de base pour générer des produits réalistes
const categories = [
  'Électronique', 'Vêtements', 'Maison & Jardin', 'Sports & Loisirs', 
  'Beauté & Santé', 'Automobile', 'Livres', 'Jouets', 'Alimentation',
  'Informatique', 'Téléphonie', 'Mobilier', 'Décoration', 'Outils',
  'Bijoux', 'Chaussures', 'Bagagerie', 'Papeterie', 'Musique', 'Jeux'
]

const brands = [
  'Samsung', 'Apple', 'Sony', 'LG', 'Nike', 'Adidas', 'Zara', 'H&M',
  'IKEA', 'Philips', 'Bosch', 'Canon', 'HP', 'Dell', 'Lenovo',
  'Puma', 'Reebok', 'Casio', 'Seiko', 'Rolex', 'Gucci', 'Prada'
]

const adjectives = [
  'Premium', 'Deluxe', 'Pro', 'Ultra', 'Max', 'Plus', 'Elite', 'Advanced',
  'Smart', 'Digital', 'Wireless', 'Portable', 'Compact', 'Professional',
  'Standard', 'Basic', 'Essential', 'Classic', 'Modern', 'Vintage'
]

const productTypes = [
  'Smartphone', 'Laptop', 'Tablet', 'Montre', 'Casque', 'Écouteurs',
  'T-shirt', 'Pantalon', 'Chaussures', 'Sac', 'Parfum', 'Crème',
  'Livre', 'Jouet', 'Outil', 'Meuble', 'Lampe', 'Tapis', 'Coussin',
  'Clavier', 'Souris', 'Écran', 'Imprimante', 'Caméra', 'Objectif'
]

// Fonction pour générer un nom de produit réaliste
function generateProductName() {
  const brand = brands[Math.floor(Math.random() * brands.length)]
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const type = productTypes[Math.floor(Math.random() * productTypes.length)]
  const model = Math.floor(Math.random() * 9000) + 1000
  
  return `${brand} ${type} ${adjective} ${model}`
}

// Fonction pour générer un SKU unique
function generateSKU(index) {
  const prefix = ['PRD', 'ITM', 'ART', 'REF'][Math.floor(Math.random() * 4)]
  const year = new Date().getFullYear()
  const number = String(index).padStart(6, '0')
  return `${prefix}-${year}-${number}`
}

// Fonction pour générer une description
function generateDescription(name) {
  const features = [
    'Haute qualité', 'Design moderne', 'Technologie avancée', 'Facile à utiliser',
    'Durable', 'Écologique', 'Économique', 'Performant', 'Élégant', 'Pratique'
  ]
  
  const feature1 = features[Math.floor(Math.random() * features.length)]
  const feature2 = features[Math.floor(Math.random() * features.length)]
  
  return `${name} - ${feature1} et ${feature2}. Produit de qualité supérieure avec garantie constructeur.`
}

// Fonction pour générer un prix réaliste
function generatePrice() {
  const basePrice = Math.random() * 2000 + 10 // Entre 10 et 2010
  return Math.round(basePrice * 100) / 100 // Arrondir à 2 décimales
}

// Fonction principale de génération
async function generateTestProducts(count = 5000) {
  console.log(`🚀 Génération de ${count} produits de test...`)
  
  const batchSize = 100 // Traiter par lots pour éviter les timeouts
  const batches = Math.ceil(count / batchSize)
  
  let totalCreated = 0
  
  for (let batch = 0; batch < batches; batch++) {
    const startIndex = batch * batchSize
    const endIndex = Math.min(startIndex + batchSize, count)
    const currentBatchSize = endIndex - startIndex
    
    console.log(`📦 Lot ${batch + 1}/${batches} - Création de ${currentBatchSize} produits...`)
    
    const products = []
    
    for (let i = startIndex; i < endIndex; i++) {
      const name = generateProductName()
      const sku = generateSKU(i + 1)
      const category = categories[Math.floor(Math.random() * categories.length)]
      const price = generatePrice()
      const stock = Math.floor(Math.random() * 1000) + 1 // Stock entre 1 et 1000
      const description = generateDescription(name)
      
      products.push({
        name,
        sku,
        description,
        price,
        stock,
        category,
        isActive: Math.random() > 0.1, // 90% des produits actifs
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
    
    try {
      await prisma.product.createMany({
        data: products,
        skipDuplicates: true
      })
      
      totalCreated += currentBatchSize
      console.log(`✅ Lot ${batch + 1} créé avec succès (${totalCreated}/${count})`)
      
      // Pause entre les lots pour éviter la surcharge
      if (batch < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
    } catch (error) {
      console.error(`❌ Erreur lors de la création du lot ${batch + 1}:`, error)
    }
  }
  
  console.log(`🎉 Génération terminée ! ${totalCreated} produits créés.`)
  
  // Statistiques finales
  const stats = await getProductStats()
  console.log('\n📊 Statistiques des produits:')
  console.log(`  Total: ${stats.total}`)
  console.log(`  Actifs: ${stats.active}`)
  console.log(`  Inactifs: ${stats.inactive}`)
  console.log(`  Catégories: ${stats.categories}`)
  console.log(`  Prix moyen: ${stats.averagePrice.toFixed(2)} MAD`)
  console.log(`  Stock total: ${stats.totalStock}`)
}

// Fonction pour obtenir des statistiques
async function getProductStats() {
  const total = await prisma.product.count()
  const active = await prisma.product.count({ where: { isActive: true } })
  const inactive = total - active
  
  const categories = await prisma.product.groupBy({
    by: ['category'],
    _count: { category: true }
  })
  
  const priceStats = await prisma.product.aggregate({
    _avg: { price: true },
    _sum: { stock: true }
  })
  
  return {
    total,
    active,
    inactive,
    categories: categories.length,
    averagePrice: priceStats._avg.price || 0,
    totalStock: priceStats._sum.stock || 0
  }
}

// Fonction pour nettoyer les données de test
async function cleanTestProducts() {
  console.log('🧹 Nettoyage des produits de test...')
  
  const result = await prisma.product.deleteMany({
    where: {
      sku: {
        startsWith: 'PRD-2025-'
      }
    }
  })
  
  console.log(`✅ ${result.count} produits de test supprimés.`)
}

// Fonction pour générer des données de test complètes (produits + ventes)
async function generateCompleteTestData() {
  console.log('🎯 Génération de données de test complètes...')
  
  // 1. Générer les produits
  await generateTestProducts(5000)
  
  // 2. Créer quelques clients de test
  console.log('👥 Création de clients de test...')
  const customers = []
  for (let i = 1; i <= 50; i++) {
    customers.push({
      name: `Client Test ${i}`,
      email: `client${i}@test.com`,
      phone: `06${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
      address: `${i} Rue de Test, Casablanca`,
      isActive: true
    })
  }
  
  await prisma.customer.createMany({
    data: customers,
    skipDuplicates: true
  })
  
  console.log('✅ Données de test complètes générées!')
}

// Interface en ligne de commande
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  try {
    switch (command) {
      case 'generate':
        const count = parseInt(args[1]) || 5000
        await generateTestProducts(count)
        break
        
      case 'clean':
        await cleanTestProducts()
        break
        
      case 'complete':
        await generateCompleteTestData()
        break
        
      case 'stats':
        const stats = await getProductStats()
        console.log('📊 Statistiques actuelles:', stats)
        break
        
      default:
        console.log('🔧 Utilisation:')
        console.log('  node scripts/generate-test-products.js generate [nombre]')
        console.log('  node scripts/generate-test-products.js clean')
        console.log('  node scripts/generate-test-products.js complete')
        console.log('  node scripts/generate-test-products.js stats')
        console.log('')
        console.log('Exemples:')
        console.log('  node scripts/generate-test-products.js generate 5000')
        console.log('  node scripts/generate-test-products.js generate 1000')
        console.log('  node scripts/generate-test-products.js clean')
    }
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exporter les fonctions pour utilisation dans d'autres scripts
module.exports = {
  generateTestProducts,
  cleanTestProducts,
  generateCompleteTestData,
  getProductStats
}

// Exécuter si appelé directement
if (require.main === module) {
  main()
}
