import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

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

function generateRandomProduct(index: number) {
  const name = productNames[Math.floor(Math.random() * productNames.length)]
  const brand = brands[Math.floor(Math.random() * brands.length)]
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const category = categories[Math.floor(Math.random() * categories.length)]
  
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
    categoryId: null, // On va créer les catégories après
    isActive: true
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Seul le propriétaire peut générer des produits de test
    if (session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { count = 5000 } = await request.json()

    console.log(`🧪 Génération de ${count} produits de test...`)
    const startTime = Date.now()

    // 1. Créer les catégories de test si elles n'existent pas
    console.log('📁 Création des catégories...')
    const categoryPromises = categories.map(async (categoryName) => {
      return prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: {
          name: categoryName,
          description: `Catégorie ${categoryName} - Générée pour les tests`
        }
      })
    })
    
    const createdCategories = await Promise.all(categoryPromises)
    console.log(`✅ ${createdCategories.length} catégories créées/mises à jour`)

    // 2. Générer les produits par batch pour éviter les timeouts
    const batchSize = 100
    const batches = Math.ceil(count / batchSize)
    let totalCreated = 0

    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const batchStart = batchIndex * batchSize
      const batchEnd = Math.min(batchStart + batchSize, count)
      const batchProducts = []

      for (let i = batchStart; i < batchEnd; i++) {
        const product = generateRandomProduct(i + 1)
        // Assigner une catégorie aléatoire
        product.categoryId = createdCategories[Math.floor(Math.random() * createdCategories.length)].id
        batchProducts.push(product)
      }

      // Insérer le batch
      await prisma.product.createMany({
        data: batchProducts,
        skipDuplicates: true
      })

      totalCreated += batchProducts.length
      console.log(`📦 Batch ${batchIndex + 1}/${batches} - ${batchProducts.length} produits créés (Total: ${totalCreated})`)
    }

    const endTime = Date.now()
    const duration = endTime - startTime

    console.log(`✅ Génération terminée: ${totalCreated} produits en ${duration}ms`)

    // Statistiques finales
    const stats = {
      totalProducts: await prisma.product.count(),
      testProducts: totalCreated,
      categories: createdCategories.length,
      duration: `${duration}ms`,
      averagePerProduct: `${(duration / totalCreated).toFixed(2)}ms`
    }

    return NextResponse.json({
      success: true,
      message: `${totalCreated} produits de test générés avec succès`,
      stats
    })

  } catch (error) {
    console.error('❌ Erreur lors de la génération des produits:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération des produits de test' },
      { status: 500 }
    )
  }
}

// API pour supprimer tous les produits de test
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    console.log('🗑️ Suppression des produits de test...')
    const startTime = Date.now()

    // Supprimer tous les produits avec SKU commençant par "TEST-"
    const result = await prisma.product.deleteMany({
      where: {
        sku: {
          startsWith: 'TEST-'
        }
      }
    })

    const endTime = Date.now()
    const duration = endTime - startTime

    console.log(`✅ ${result.count} produits de test supprimés en ${duration}ms`)

    return NextResponse.json({
      success: true,
      message: `${result.count} produits de test supprimés`,
      duration: `${duration}ms`
    })

  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression des produits de test' },
      { status: 500 }
    )
  }
}
