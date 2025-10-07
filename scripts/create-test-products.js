/**
 * Script pour créer des produits de test
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestProducts() {
  try {
    console.log('🏗️  Création de produits de test...\n')
    
    // Créer une catégorie de test si elle n'existe pas
    let category = await prisma.category.findFirst({
      where: { name: 'Électronique' }
    })
    
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: 'Électronique',
          description: 'Produits électroniques et informatiques'
        }
      })
      console.log('✅ Catégorie "Électronique" créée')
    }
    
    // Produits de test à créer
    const testProducts = [
      {
        name: 'Ordinateur portable HP',
        sku: 'HP-LAPTOP-001',
        description: 'Ordinateur portable HP 15.6" Intel Core i5, 8GB RAM, 256GB SSD',
        price: 6500.00,
        purchasePrice: 5200.00,
        stock: 10,
        minStock: 2,
        categoryId: category.id,
        isActive: true
      },
      {
        name: 'Souris sans fil Logitech',
        sku: 'LOG-MOUSE-001',
        description: 'Souris optique sans fil 2.4GHz avec récepteur USB',
        price: 150.00,
        purchasePrice: 90.00,
        stock: 25,
        minStock: 5,
        categoryId: category.id,
        isActive: true
      },
      {
        name: 'Clavier mécanique RGB',
        sku: 'KEYBOARD-RGB-001',
        description: 'Clavier mécanique rétroéclairé RGB avec switches bleus',
        price: 800.00,
        purchasePrice: 600.00,
        stock: 8,
        minStock: 2,
        categoryId: category.id,
        isActive: true
      },
      {
        name: 'Écran 24" Full HD',
        sku: 'MONITOR-24-001',
        description: 'Écran LED 24 pouces Full HD 1920x1080, HDMI/VGA',
        price: 1200.00,
        purchasePrice: 900.00,
        stock: 5,
        minStock: 1,
        categoryId: category.id,
        isActive: true
      },
      {
        name: 'Casque audio Bluetooth',
        sku: 'HEADSET-BT-001',
        description: 'Casque audio sans fil Bluetooth avec réduction de bruit',
        price: 450.00,
        purchasePrice: 300.00,
        stock: 15,
        minStock: 3,
        categoryId: category.id,
        isActive: true
      }
    ]
    
    // Créer les produits
    for (const productData of testProducts) {
      // Vérifier si le produit existe déjà
      const existingProduct = await prisma.product.findFirst({
        where: { sku: productData.sku }
      })
      
      if (!existingProduct) {
        const product = await prisma.product.create({
          data: productData
        })
        console.log(`✅ Produit créé: ${product.name} (${product.sku})`)
      } else {
        console.log(`ℹ️  Produit existe déjà: ${productData.name} (${productData.sku})`)
      }
    }
    
    // Vérifier le résultat
    const totalProducts = await prisma.product.count()
    console.log(`\n📊 Nombre total de produits: ${totalProducts}`)
    
    console.log('\n🎉 Création de produits de test terminée!')
    console.log('💡 Vous pouvez maintenant tester la sélection de produits dans les factures')
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des produits:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter la création
createTestProducts()
