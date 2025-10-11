const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAndFixDatabase() {
  try {
    console.log('🔍 Vérification de la structure de la base de données...')
    
    // Vérifier si la colonne imagePublicId existe
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Product' AND column_name = 'imagePublicId'
    `
    
    console.log('📊 Résultat de la vérification:', result)
    
    if (result.length === 0) {
      console.log('❌ La colonne imagePublicId n\'existe pas')
      console.log('🔧 Ajout de la colonne...')
      
      await prisma.$executeRaw`
        ALTER TABLE "Product" ADD COLUMN "imagePublicId" TEXT
      `
      
      console.log('✅ Colonne imagePublicId ajoutée avec succès')
    } else {
      console.log('✅ La colonne imagePublicId existe déjà')
    }
    
    // Vérifier la structure complète de la table Product
    console.log('\n📋 Structure actuelle de la table Product:')
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Product'
      ORDER BY ordinal_position
    `
    
    console.table(columns)
    
    // Test de création d'un produit simple
    console.log('\n🧪 Test de création d\'un produit...')
    
    try {
      const testProduct = await prisma.product.create({
        data: {
          sku: 'TEST-' + Date.now(),
          name: 'Produit Test',
          price: 10.00,
          stock: 5,
          minStock: 2
        }
      })
      
      console.log('✅ Produit de test créé avec succès:', testProduct.id)
      
      // Supprimer le produit de test
      await prisma.product.delete({
        where: { id: testProduct.id }
      })
      
      console.log('🗑️ Produit de test supprimé')
      
    } catch (error) {
      console.error('❌ Erreur lors du test de création:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndFixDatabase()
