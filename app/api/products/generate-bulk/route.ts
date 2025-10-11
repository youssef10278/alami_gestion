import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// Interface pour le suivi de progression
interface GenerationProgress {
  id: string
  total: number
  completed: number
  currentBatch: number
  totalBatches: number
  status: 'pending' | 'running' | 'completed' | 'error'
  startTime: number
  endTime?: number
  error?: string
}

// Stockage en mémoire pour le suivi (en production, utiliser Redis)
const generationProgress = new Map<string, GenerationProgress>()

// Données pour générer des produits réalistes
const productNames = [
  'Smartphone', 'Ordinateur portable', 'Tablette', 'Écouteurs', 'Montre connectée',
  'Télévision', 'Réfrigérateur', 'Lave-linge', 'Micro-ondes', 'Aspirateur',
  'T-shirt', 'Jean', 'Robe', 'Chaussures', 'Veste',
  'Livre', 'Stylo', 'Cahier', 'Calculatrice', 'Sac à dos',
  'Pain', 'Lait', 'Fromage', 'Yaourt', 'Céréales',
  'Shampoing', 'Dentifrice', 'Savon', 'Crème', 'Parfum',
  'Marteau', 'Tournevis', 'Perceuse', 'Scie', 'Clé',
  'Ballon', 'Raquette', 'Vélo', 'Tapis de yoga', 'Haltères',
  'Cafetière', 'Grille-pain', 'Mixeur', 'Robot culinaire', 'Bouilloire',
  'Lampadaire', 'Table', 'Chaise', 'Canapé', 'Armoire',
  'Tapis', 'Rideaux', 'Coussin', 'Couverture', 'Oreiller'
]

const brands = [
  'Samsung', 'Apple', 'Sony', 'LG', 'Philips', 'Panasonic',
  'Nike', 'Adidas', 'Puma', 'Reebok', 'Under Armour',
  'Zara', 'H&M', 'Uniqlo', 'Gap', 'Levi\'s',
  'Nestlé', 'Danone', 'Coca-Cola', 'Pepsi', 'Kraft', 'Heinz',
  'L\'Oréal', 'Nivea', 'Garnier', 'Maybelline', 'Dove', 'Pantene',
  'Bosch', 'Black & Decker', 'Makita', 'DeWalt', 'Stanley', 'Ryobi',
  'IKEA', 'Wayfair', 'West Elm', 'Pottery Barn', 'Crate & Barrel'
]

const adjectives = [
  'Premium', 'Pro', 'Ultra', 'Max', 'Plus', 'Elite',
  'Deluxe', 'Advanced', 'Smart', 'Digital', 'Wireless',
  'Eco', 'Bio', 'Natural', 'Fresh', 'Pure', 'Organic',
  'Sport', 'Fitness', 'Active', 'Power', 'Turbo', 'Speed',
  'Luxury', 'Designer', 'Professional', 'Commercial', 'Industrial'
]

const categories = [
  'Électronique', 'Électroménager', 'Vêtements', 'Accessoires',
  'Bureautique', 'Alimentation', 'Beauté & Santé', 'Outils',
  'Sport & Loisirs', 'Maison & Jardin', 'Informatique', 'Mobilier',
  'Jouets & Jeux', 'Livre & Média', 'Automobile', 'Jardinage'
]

function generateRandomProduct(index: number, batchId: string): any {
  const name = productNames[Math.floor(Math.random() * productNames.length)]
  const brand = brands[Math.floor(Math.random() * brands.length)]
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  
  const purchasePrice = Math.floor(Math.random() * 2000) + 10 // 10-2010 DH
  const margin = 1.2 + Math.random() * 0.8 // Marge entre 20% et 100%
  const price = Math.floor(purchasePrice * margin)
  
  const stock = Math.floor(Math.random() * 200) + 1 // 1-200 unités
  const minStock = Math.floor(stock * 0.1) + 1 // 10% du stock comme minimum
  
  // SKU vraiment unique avec timestamp, batchId et index
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const uniqueId = `${timestamp}-${batchId}-${index}-${randomSuffix}`
  
  return {
    sku: `BULK-${uniqueId}`,
    name: `${brand} ${name} ${adjective}`,
    description: `${adjective} ${name} de la marque ${brand} - Produit généré en masse`,
    purchasePrice,
    price,
    stock,
    minStock,
    categoryId: null, // Sera assigné plus tard
    isActive: Math.random() > 0.05 // 95% des produits actifs
  }
}

// Fonction pour créer une session de génération
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Début de la requête de génération en masse')

    // Vérifier l'authentification
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { count = 5000 } = body
    console.log('📊 Paramètres reçus:', { count })

    // Créer un ID unique pour cette session de génération
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    
    // Configuration des lots
    const batchSize = 50 // Lots plus petits pour éviter les timeouts
    const totalBatches = Math.ceil(count / batchSize)

    // Initialiser le suivi de progression
    const progress: GenerationProgress = {
      id: generationId,
      total: count,
      completed: 0,
      currentBatch: 0,
      totalBatches,
      status: 'pending',
      startTime: Date.now()
    }
    
    generationProgress.set(generationId, progress)

    // Démarrer la génération en arrière-plan
    generateProductsInBackground(generationId, count, batchSize)

    return NextResponse.json({
      success: true,
      generationId,
      message: `Génération de ${count} produits démarrée`,
      progress: {
        total: count,
        batches: totalBatches,
        batchSize
      }
    })

  } catch (error) {
    console.error('❌ Erreur lors du démarrage de la génération:', error)
    return NextResponse.json(
      { error: 'Erreur lors du démarrage de la génération' },
      { status: 500 }
    )
  }
}

// Fonction pour obtenir le statut de progression
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const generationId = searchParams.get('id')

    if (!generationId) {
      return NextResponse.json({ error: 'ID de génération requis' }, { status: 400 })
    }

    const progress = generationProgress.get(generationId)
    if (!progress) {
      return NextResponse.json({ error: 'Session de génération introuvable' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      progress: {
        ...progress,
        percentage: Math.round((progress.completed / progress.total) * 100),
        estimatedTimeRemaining: calculateEstimatedTime(progress)
      }
    })

  } catch (error) {
    console.error('❌ Erreur lors de la récupération du statut:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du statut' },
      { status: 500 }
    )
  }
}

// Fonction de génération en arrière-plan
async function generateProductsInBackground(generationId: string, totalCount: number, batchSize: number) {
  const progress = generationProgress.get(generationId)
  if (!progress) return

  try {
    progress.status = 'running'
    generationProgress.set(generationId, progress)

    console.log(`🧪 Début de la génération de ${totalCount} produits (${Math.ceil(totalCount / batchSize)} lots)`)

    // 1. Créer les catégories si elles n'existent pas
    console.log('📁 Création des catégories...')
    const createdCategories = await createCategoriesIfNeeded()
    console.log(`✅ ${createdCategories.length} catégories prêtes`)

    // 2. Supprimer les anciens produits de test
    console.log('🗑️ Suppression des anciens produits de test...')
    const deletedCount = await prisma.product.deleteMany({
      where: {
        sku: {
          startsWith: 'BULK-'
        }
      }
    })
    console.log(`✅ ${deletedCount.count} anciens produits supprimés`)

    // 3. Générer les produits par lots
    const totalBatches = Math.ceil(totalCount / batchSize)
    let totalCreated = 0

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batchStart = batchIndex * batchSize
      const batchEnd = Math.min(batchStart + batchSize, totalCount)
      const currentBatchSize = batchEnd - batchStart

      console.log(`🔄 Lot ${batchIndex + 1}/${totalBatches} - ${currentBatchSize} produits`)

      // Générer les produits du lot
      const batchProducts = []
      for (let i = batchStart; i < batchEnd; i++) {
        const product = generateRandomProduct(i + 1, generationId)
        // Assigner une catégorie aléatoire
        product.categoryId = createdCategories[Math.floor(Math.random() * createdCategories.length)].id
        batchProducts.push(product)
      }

      // Insérer le lot
      try {
        const result = await prisma.product.createMany({
          data: batchProducts,
          skipDuplicates: true
        })

        totalCreated += result.count
        console.log(`✅ Lot ${batchIndex + 1} - ${result.count} produits créés (Total: ${totalCreated})`)

        // Mettre à jour la progression
        progress.completed = totalCreated
        progress.currentBatch = batchIndex + 1
        generationProgress.set(generationId, progress)

        // Pause entre les lots pour éviter la surcharge
        if (batchIndex < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }

      } catch (error) {
        console.error(`❌ Erreur lors de la création du lot ${batchIndex + 1}:`, error)
        // Continuer avec le lot suivant
      }
    }

    // Finaliser la progression
    progress.status = 'completed'
    progress.endTime = Date.now()
    progress.completed = totalCreated
    generationProgress.set(generationId, progress)

    console.log(`🎉 Génération terminée: ${totalCreated} produits créés`)

  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error)
    progress.status = 'error'
    progress.error = error.message
    progress.endTime = Date.now()
    generationProgress.set(generationId, progress)
  }
}

// Fonction pour créer les catégories si elles n'existent pas
async function createCategoriesIfNeeded() {
  const createdCategories = []

  for (const categoryName of categories) {
    let category = await prisma.category.findFirst({
      where: { name: categoryName }
    })

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryName,
          description: `Catégorie ${categoryName} - Générée automatiquement`
        }
      })
    }

    createdCategories.push(category)
  }

  return createdCategories
}

// Fonction pour calculer le temps estimé restant
function calculateEstimatedTime(progress: GenerationProgress): string {
  if (progress.completed === 0) return 'Calcul en cours...'
  
  const elapsed = Date.now() - progress.startTime
  const rate = progress.completed / elapsed // produits par milliseconde
  const remaining = progress.total - progress.completed
  const estimatedMs = remaining / rate
  
  const minutes = Math.floor(estimatedMs / 60000)
  const seconds = Math.floor((estimatedMs % 60000) / 1000)
  
  return `${minutes}m ${seconds}s`
}

// Fonction pour nettoyer les anciennes sessions (appelée périodiquement)
export function cleanupOldSessions() {
  const now = Date.now()
  const maxAge = 30 * 60 * 1000 // 30 minutes

  for (const [id, progress] of generationProgress.entries()) {
    if (now - progress.startTime > maxAge) {
      generationProgress.delete(id)
    }
  }
}

// Nettoyer les anciennes sessions (appelé manuellement)
// setInterval(cleanupOldSessions, 10 * 60 * 1000) // Désactivé pour éviter les problèmes

// API pour supprimer tous les produits de test BULK-
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    console.log('🗑️ Suppression des produits de test BULK-...')
    const startTime = Date.now()

    // Supprimer tous les produits avec SKU commençant par "BULK-"
    const result = await prisma.product.deleteMany({
      where: {
        sku: {
          startsWith: 'BULK-'
        }
      }
    })

    const endTime = Date.now()
    const duration = endTime - startTime

    console.log(`✅ ${result.count} produits BULK- supprimés en ${duration}ms`)

    return NextResponse.json({
      success: true,
      message: `${result.count} produits de test BULK- supprimés`,
      duration: `${duration}ms`
    })

  } catch (error) {
    console.error('❌ Erreur lors de la suppression BULK-:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression des produits de test BULK-' },
      { status: 500 }
    )
  }
}
