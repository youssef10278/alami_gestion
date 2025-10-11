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

function generateRandomProduct(index: number, batchIndex: number) {
  const name = productNames[Math.floor(Math.random() * productNames.length)]
  const brand = brands[Math.floor(Math.random() * brands.length)]
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const category = categories[Math.floor(Math.random() * categories.length)]
  
  const purchasePrice = Math.floor(Math.random() * 2000) + 10 // 10-2010 DH
  const margin = 1.2 + Math.random() * 0.8 // Marge entre 20% et 100%
  const price = Math.floor(purchasePrice * margin)
  
  const stock = Math.floor(Math.random() * 200) + 1 // 1-200 unités
  const minStock = Math.floor(stock * 0.1) + 1 // 10% du stock comme minimum
  
  // Générer un SKU vraiment unique avec timestamp et index
  const timestamp = Date.now()
  const uniqueId = `${timestamp}-${batchIndex}-${index}`
  
  return {
    sku: `TEST-${uniqueId}`,
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
    console.log('🔍 Début de la requête de génération de produits')

    // Vérifier l'authentification
    const session = await getSession()
    console.log('👤 Session:', session ? `${session.userId} (${session.role})` : 'null')

    if (!session) {
      console.log('❌ Pas de session')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Seul le propriétaire peut générer des produits de test
    if (session.role !== 'OWNER') {
      console.log(`❌ Rôle insuffisant: ${session.role}`)
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await request.json()
    const { count = 5000 } = body
    console.log('📊 Paramètres reçus:', { count })

    console.log(`🧪 Génération de ${count} produits de test...`)
    const startTime = Date.now()

    // 1. Créer les catégories de test si elles n'existent pas
    console.log('📁 Création des catégories...')
    const createdCategories = []

    for (const categoryName of categories) {
      // Vérifier si la catégorie existe déjà
      let category = await prisma.category.findFirst({
        where: { name: categoryName }
      })

      // Si elle n'existe pas, la créer
      if (!category) {
        category = await prisma.category.create({
          data: {
            name: categoryName,
            description: `Catégorie ${categoryName} - Générée pour les tests`
          }
        })
      }

      createdCategories.push(category)
    }

    console.log(`✅ ${createdCategories.length} catégories créées/mises à jour`)

    // 2. Supprimer les anciens produits de test s'ils existent
    console.log('🗑️ Suppression des anciens produits de test...')
    const deletedCount = await prisma.product.deleteMany({
      where: {
        sku: {
          startsWith: 'TEST-'
        }
      }
    })
    console.log(`✅ ${deletedCount.count} anciens produits de test supprimés`)

    // 3. Générer les produits par batch pour éviter les timeouts
    const batchSize = 100
    const batches = Math.ceil(count / batchSize)
    let totalCreated = 0

    console.log(`📊 Configuration: ${count} produits, ${batches} batches de ${batchSize}`)

    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const batchStart = batchIndex * batchSize
      const batchEnd = Math.min(batchStart + batchSize, count)
      const batchProducts = []

      console.log(`🔄 Génération batch ${batchIndex + 1}/${batches} (${batchStart} à ${batchEnd - 1})`)

      for (let i = batchStart; i < batchEnd; i++) {
        const product = generateRandomProduct(i + 1, batchIndex)
        // Assigner une catégorie aléatoire
        product.categoryId = createdCategories[Math.floor(Math.random() * createdCategories.length)].id
        batchProducts.push(product)
      }

      console.log(`💾 Insertion de ${batchProducts.length} produits...`)

      // Insérer le batch
      const result = await prisma.product.createMany({
        data: batchProducts,
        skipDuplicates: true
      })

      totalCreated += result.count
      console.log(`📦 Batch ${batchIndex + 1}/${batches} - ${result.count} produits créés (Total: ${totalCreated})`)

      // Petit délai pour éviter la surcharge
      if (batchIndex < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 10))
      }
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
    console.error('❌ Stack trace:', error.stack)
    return NextResponse.json(
      {
        error: 'Erreur lors de la génération des produits de test',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
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
