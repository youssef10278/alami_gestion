/**
 * Script de migration des images base64 vers Cloudinary
 * 
 * Ce script :
 * 1. Récupère tous les produits avec des images en base64
 * 2. Upload chaque image vers Cloudinary
 * 3. Met à jour la BDD avec les nouvelles URLs
 * 4. Garde une sauvegarde des anciennes images
 */

const { PrismaClient } = require('@prisma/client')
const { v2: cloudinary } = require('cloudinary')
const fs = require('fs')
const path = require('path')

// Configuration
require('dotenv').config()

const prisma = new PrismaClient()

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

// Fonction pour convertir base64 en buffer
function base64ToBuffer(base64String) {
  // Retirer le préfixe data:image/...;base64,
  const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '')
  return Buffer.from(base64Data, 'base64')
}

// Fonction pour uploader vers Cloudinary
async function uploadToCloudinary(base64Image, productSku) {
  return new Promise((resolve, reject) => {
    const buffer = base64ToBuffer(base64Image)
    
    cloudinary.uploader.upload_stream(
      {
        folder: 'alami-gestion/products',
        public_id: `product_${productSku}_${Date.now()}`,
        resource_type: 'image',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          console.error('❌ Erreur upload Cloudinary:', error)
          reject(error)
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height
          })
        } else {
          reject(new Error('Upload failed: no result'))
        }
      }
    ).end(buffer)
  })
}

// Fonction principale de migration
async function migrateImages() {
  console.log('🚀 Début de la migration des images vers Cloudinary...')
  
  try {
    // Récupérer tous les produits avec des images base64
    const products = await prisma.product.findMany({
      where: {
        image: {
          not: null,
          startsWith: 'data:image'
        }
      },
      select: {
        id: true,
        sku: true,
        name: true,
        image: true
      }
    })

    console.log(`📊 ${products.length} produits avec images base64 trouvés`)

    if (products.length === 0) {
      console.log('✅ Aucune migration nécessaire')
      return
    }

    // Créer un dossier de sauvegarde
    const backupDir = path.join(__dirname, '../backups/images')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const migrationResults = []
    let successCount = 0
    let errorCount = 0

    // Migrer chaque produit
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      console.log(`\n📤 [${i + 1}/${products.length}] Migration: ${product.name} (${product.sku})`)

      try {
        // Sauvegarder l'image originale
        const backupPath = path.join(backupDir, `${product.sku}_original.txt`)
        fs.writeFileSync(backupPath, product.image)

        // Upload vers Cloudinary
        console.log('   🔄 Upload vers Cloudinary...')
        const cloudinaryResult = await uploadToCloudinary(product.image, product.sku)
        
        console.log(`   ✅ Upload réussi: ${cloudinaryResult.url}`)

        // Mettre à jour la BDD
        await prisma.product.update({
          where: { id: product.id },
          data: {
            image: cloudinaryResult.url,
            imagePublicId: cloudinaryResult.publicId
          }
        })

        console.log('   💾 BDD mise à jour')

        migrationResults.push({
          productId: product.id,
          sku: product.sku,
          name: product.name,
          status: 'success',
          oldImageSize: product.image.length,
          newUrl: cloudinaryResult.url,
          publicId: cloudinaryResult.publicId
        })

        successCount++

      } catch (error) {
        console.error(`   ❌ Erreur pour ${product.sku}:`, error.message)
        
        migrationResults.push({
          productId: product.id,
          sku: product.sku,
          name: product.name,
          status: 'error',
          error: error.message
        })

        errorCount++
      }

      // Pause pour éviter de surcharger Cloudinary
      if (i < products.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Sauvegarder le rapport de migration
    const reportPath = path.join(__dirname, '../backups/migration-report.json')
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalProducts: products.length,
      successCount,
      errorCount,
      results: migrationResults
    }, null, 2))

    console.log('\n📊 Résumé de la migration:')
    console.log(`   ✅ Succès: ${successCount}`)
    console.log(`   ❌ Erreurs: ${errorCount}`)
    console.log(`   📄 Rapport sauvegardé: ${reportPath}`)

    if (successCount > 0) {
      console.log('\n🎉 Migration terminée avec succès !')
      console.log('💡 Les images sont maintenant stockées sur Cloudinary')
      console.log('💾 Les images originales sont sauvegardées dans /backups/images')
    }

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Fonction pour vérifier la configuration
async function checkConfiguration() {
  console.log('🔍 Vérification de la configuration...')
  
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Configuration Cloudinary manquante')
    console.log('Assurez-vous que ces variables d\'environnement sont définies :')
    console.log('- CLOUDINARY_CLOUD_NAME')
    console.log('- CLOUDINARY_API_KEY')
    console.log('- CLOUDINARY_API_SECRET')
    process.exit(1)
  }

  try {
    // Test de connexion Cloudinary
    const result = await cloudinary.api.ping()
    console.log('✅ Connexion Cloudinary OK')
  } catch (error) {
    console.error('❌ Erreur de connexion Cloudinary:', error.message)
    process.exit(1)
  }

  try {
    // Test de connexion BDD
    await prisma.$connect()
    console.log('✅ Connexion base de données OK')
  } catch (error) {
    console.error('❌ Erreur de connexion BDD:', error.message)
    process.exit(1)
  }
}

// Fonction pour afficher l'aide
function showHelp() {
  console.log(`
🔄 Script de Migration des Images vers Cloudinary

Usage:
  node scripts/migrate-images-to-cloudinary.js [options]

Options:
  --help, -h     Afficher cette aide
  --check, -c    Vérifier la configuration seulement
  --migrate, -m  Lancer la migration

Exemples:
  node scripts/migrate-images-to-cloudinary.js --check
  node scripts/migrate-images-to-cloudinary.js --migrate

⚠️  Important:
- Assurez-vous d'avoir configuré les variables Cloudinary
- Une sauvegarde des images originales sera créée
- La migration peut prendre du temps selon le nombre d'images
`)
}

// Point d'entrée principal
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp()
    return
  }

  if (args.includes('--check') || args.includes('-c')) {
    await checkConfiguration()
    console.log('✅ Configuration valide')
    return
  }

  if (args.includes('--migrate') || args.includes('-m')) {
    await checkConfiguration()
    await migrateImages()
    return
  }

  // Par défaut, afficher l'aide
  showHelp()
}

// Lancer le script
main().catch(console.error)
