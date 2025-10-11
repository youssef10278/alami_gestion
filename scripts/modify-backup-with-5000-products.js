// Script pour modifier le fichier de sauvegarde et y ajouter 5000 produits
// À exécuter avec Node.js : node scripts/modify-backup-with-5000-products.js

const fs = require('fs')
const path = require('path')

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
  'Puma', 'Reebok', 'Casio', 'Seiko', 'Rolex', 'Gucci', 'Prada',
  'Microsoft', 'Google', 'Amazon', 'Tesla', 'BMW', 'Mercedes', 'Audi'
]

const adjectives = [
  'Premium', 'Deluxe', 'Pro', 'Ultra', 'Max', 'Plus', 'Elite', 'Advanced',
  'Smart', 'Digital', 'Wireless', 'Portable', 'Compact', 'Professional',
  'Standard', 'Basic', 'Essential', 'Classic', 'Modern', 'Vintage',
  'Eco', 'Bio', 'Organic', 'Natural', 'Luxury', 'Sport', 'Gaming'
]

const productTypes = [
  'Smartphone', 'Laptop', 'Tablet', 'Montre', 'Casque', 'Écouteurs',
  'T-shirt', 'Pantalon', 'Chaussures', 'Sac', 'Parfum', 'Crème',
  'Livre', 'Jouet', 'Outil', 'Meuble', 'Lampe', 'Tapis', 'Coussin',
  'Clavier', 'Souris', 'Écran', 'Imprimante', 'Caméra', 'Objectif',
  'Voiture', 'Vélo', 'Scooter', 'Drone', 'Robot', 'Console', 'Jeu'
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
  const prefix = ['PRD', 'ITM', 'ART', 'REF', 'SKU'][Math.floor(Math.random() * 5)]
  const year = new Date().getFullYear()
  const number = String(index).padStart(6, '0')
  return `${prefix}-${year}-${number}`
}

// Fonction pour générer une description
function generateDescription(name) {
  const features = [
    'Haute qualité', 'Design moderne', 'Technologie avancée', 'Facile à utiliser',
    'Durable', 'Écologique', 'Économique', 'Performant', 'Élégant', 'Pratique',
    'Innovant', 'Résistant', 'Léger', 'Puissant', 'Silencieux', 'Rapide'
  ]
  
  const feature1 = features[Math.floor(Math.random() * features.length)]
  const feature2 = features[Math.floor(Math.random() * features.length)]
  
  return `${name} - ${feature1} et ${feature2}. Produit de qualité supérieure avec garantie constructeur. Livraison rapide disponible.`
}

// Fonction pour générer un prix réaliste
function generatePrice() {
  const basePrice = Math.random() * 5000 + 10 // Entre 10 et 5010
  return Math.round(basePrice * 100) / 100 // Arrondir à 2 décimales
}

// Fonction pour générer un ID unique
function generateId() {
  return 'cm' + Math.random().toString(36).substr(2, 15)
}

// Fonction pour générer 5000 produits
function generate5000Products() {
  console.log('🚀 Génération de 5000 produits pour le fichier de sauvegarde...')
  
  const products = []
  const now = new Date().toISOString()
  
  for (let i = 1; i <= 5000; i++) {
    const name = generateProductName()
    const sku = generateSKU(i)
    const category = categories[Math.floor(Math.random() * categories.length)]
    const price = generatePrice()
    const stock = Math.floor(Math.random() * 1000) + 1 // Stock entre 1 et 1000
    const description = generateDescription(name)
    
    const product = {
      id: generateId(),
      name: name,
      sku: sku,
      description: description,
      price: price,
      stock: stock,
      category: category,
      isActive: Math.random() > 0.05, // 95% des produits actifs
      createdAt: now,
      updatedAt: now
    }
    
    products.push(product)
    
    if (i % 500 === 0) {
      console.log(`✅ ${i} produits générés...`)
    }
  }
  
  console.log('🎉 5000 produits générés avec succès!')
  return products
}

// Fonction principale pour modifier le fichier de sauvegarde
async function modifyBackupFile() {
  const backupFilePath = path.join(__dirname, '..', 'alami-backup-2025-10-11.json')
  
  try {
    console.log('📖 Lecture du fichier de sauvegarde existant...')
    
    // Lire le fichier existant
    const backupContent = fs.readFileSync(backupFilePath, 'utf8')
    const backupData = JSON.parse(backupContent)
    
    console.log('✅ Fichier de sauvegarde lu avec succès')
    console.log('📊 Contenu actuel:', {
      version: backupData.metadata?.version,
      totalRecords: backupData.metadata?.total_records,
      hasProducts: !!backupData.products,
      currentProductsCount: backupData.products?.length || 0
    })
    
    // Générer 5000 nouveaux produits
    const newProducts = generate5000Products()
    
    // Remplacer ou ajouter les produits
    backupData.products = newProducts
    
    // Mettre à jour les métadonnées
    backupData.metadata.total_records = (backupData.metadata.total_records || 0) + 5000
    backupData.metadata.exported_at = new Date().toISOString()
    backupData.metadata.modified_by = 'Test Data Generator'
    backupData.metadata.products_count = 5000
    
    // Calculer un nouveau checksum (simple)
    const dataString = JSON.stringify(backupData)
    const crypto = require('crypto')
    backupData.metadata.checksum = crypto.createHash('sha256').update(dataString).digest('hex')
    
    console.log('💾 Sauvegarde du fichier modifié...')
    
    // Créer une sauvegarde de l'original
    const originalBackupPath = backupFilePath.replace('.json', '-original.json')
    if (!fs.existsSync(originalBackupPath)) {
      fs.copyFileSync(backupFilePath, originalBackupPath)
      console.log('📋 Sauvegarde de l\'original créée:', originalBackupPath)
    }
    
    // Sauvegarder le fichier modifié
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2))
    
    console.log('🎉 Fichier de sauvegarde modifié avec succès!')
    console.log('📊 Nouvelles statistiques:', {
      totalRecords: backupData.metadata.total_records,
      productsCount: backupData.products.length,
      fileSize: Math.round(fs.statSync(backupFilePath).size / 1024 / 1024 * 100) / 100 + ' MB'
    })
    
    // Afficher quelques exemples de produits
    console.log('\n📦 Exemples de produits générés:')
    for (let i = 0; i < 5; i++) {
      const product = newProducts[i]
      console.log(`  ${i + 1}. ${product.name} (${product.sku}) - ${product.price} MAD - Stock: ${product.stock}`)
    }
    
    console.log('\n✅ Le fichier est prêt pour l\'importation!')
    console.log('📁 Fichier modifié:', backupFilePath)
    console.log('📁 Fichier original sauvegardé:', originalBackupPath)
    
  } catch (error) {
    console.error('❌ Erreur lors de la modification du fichier:', error.message)
    
    if (error.code === 'ENOENT') {
      console.log('💡 Le fichier de sauvegarde n\'existe pas.')
      console.log('📍 Chemin recherché:', backupFilePath)
      console.log('🔍 Vérifiez que le fichier existe à cet emplacement.')
    } else if (error instanceof SyntaxError) {
      console.log('💡 Le fichier JSON semble corrompu ou mal formaté.')
      console.log('🔧 Essayez de vérifier la syntaxe du fichier JSON.')
    }
  }
}

// Fonction pour créer un nouveau fichier de sauvegarde avec 5000 produits
function createNewBackupFile() {
  console.log('🆕 Création d\'un nouveau fichier de sauvegarde avec 5000 produits...')
  
  const products = generate5000Products()
  const now = new Date().toISOString()
  
  const backupData = {
    metadata: {
      version: "1.0",
      exported_at: now,
      app_version: "1.2.3",
      total_records: 5000,
      products_count: 5000,
      compressed: false,
      created_by: "Test Data Generator",
      checksum: "test_checksum_5000_products"
    },
    company: {
      settings: {
        id: "test_company_id",
        companyName: "Entreprise Test - 5000 Produits",
        companyAddress: "123 Rue Test, Casablanca",
        companyPhone: "+212600000000",
        companyEmail: "test@entreprise.com",
        companyLogo: null,
        invoicePrefix: "FAC",
        creditNotePrefix: "FAV",
        defaultTaxRate: 20,
        createdAt: now,
        updatedAt: now
      }
    },
    products: products,
    customers: [],
    sales: [],
    suppliers: [],
    transactions: []
  }
  
  const newBackupPath = path.join(__dirname, '..', 'alami-backup-5000-products.json')
  fs.writeFileSync(newBackupPath, JSON.stringify(backupData, null, 2))
  
  console.log('🎉 Nouveau fichier de sauvegarde créé!')
  console.log('📁 Fichier:', newBackupPath)
  console.log('📊 Contient 5000 produits prêts pour l\'importation')
}

// Interface en ligne de commande
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  try {
    switch (command) {
      case 'modify':
        await modifyBackupFile()
        break
        
      case 'create':
        createNewBackupFile()
        break
        
      default:
        console.log('🔧 Utilisation:')
        console.log('  node scripts/modify-backup-with-5000-products.js modify   # Modifier le fichier existant')
        console.log('  node scripts/modify-backup-with-5000-products.js create   # Créer un nouveau fichier')
        console.log('')
        console.log('💡 Recommandation: Utilisez "modify" pour modifier le fichier existant')
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main()
}
