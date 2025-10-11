/**
 * Script pour vérifier le nombre de produits dans la base de données
 */

const { PrismaClient } = require('@prisma/client')

async function checkProductsCount() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Vérification du nombre de produits...')
    console.log('=' .repeat(50))

    // Compter tous les produits
    const totalProducts = await prisma.product.count()
    console.log(`📊 Total des produits: ${totalProducts}`)

    // Compter les produits de test
    const testProducts = await prisma.product.count({
      where: {
        sku: {
          startsWith: 'TEST-'
        }
      }
    })
    console.log(`🧪 Produits de test: ${testProducts}`)

    // Compter les produits actifs
    const activeProducts = await prisma.product.count({
      where: {
        isActive: true
      }
    })
    console.log(`✅ Produits actifs: ${activeProducts}`)

    // Compter les produits inactifs
    const inactiveProducts = await prisma.product.count({
      where: {
        isActive: false
      }
    })
    console.log(`❌ Produits inactifs: ${inactiveProducts}`)

    // Compter par catégorie
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    console.log('\n📁 Produits par catégorie:')
    categories.forEach(category => {
      console.log(`  ${category.name}: ${category._count.products} produits`)
    })

    // Afficher quelques exemples de produits de test
    const sampleTestProducts = await prisma.product.findMany({
      where: {
        sku: {
          startsWith: 'TEST-'
        }
      },
      take: 5,
      select: {
        sku: true,
        name: true,
        price: true,
        stock: true
      }
    })

    console.log('\n📦 Exemples de produits de test:')
    sampleTestProducts.forEach(product => {
      console.log(`  ${product.sku}: ${product.name} - ${product.price} DH (Stock: ${product.stock})`)
    })

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductsCount().catch(console.error)
