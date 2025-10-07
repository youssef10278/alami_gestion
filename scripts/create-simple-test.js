/**
 * Script simple pour créer les données essentielles de test
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function createSimpleTest() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🧪 Création des données de test essentielles\n')

    // Vérifier si l'utilisateur existe déjà
    let user = await prisma.user.findUnique({
      where: { email: 'test@alamigestion.ma' }
    })

    if (!user) {
      console.log('👤 Création de l\'utilisateur de test...')
      const hashedPassword = await bcrypt.hash('test123', 10)
      user = await prisma.user.create({
        data: {
          name: 'Utilisateur Test',
          email: 'test@alamigestion.ma',
          password: hashedPassword,
          role: 'OWNER'
        }
      })
      console.log('✅ Utilisateur créé:', user.email)
    } else {
      console.log('✅ Utilisateur existant trouvé:', user.email)
    }

    // Vérifier les paramètres de l'entreprise
    let companySettings = await prisma.companySettings.findFirst()
    
    if (!companySettings) {
      console.log('🏢 Création des paramètres de l\'entreprise...')
      companySettings = await prisma.companySettings.create({
        data: {
          companyName: 'ALAMI GESTION - TEST',
          companyAddress: '123 Avenue Hassan II, Casablanca',
          companyPhone: '+212 522 123 456',
          companyEmail: 'contact@alamigestion-test.ma',
          primaryColor: '#10B981'
        }
      })
      console.log('✅ Paramètres entreprise créés')
    } else {
      console.log('✅ Paramètres entreprise existants trouvés')
    }

    // Créer une catégorie simple
    let category = await prisma.category.findFirst({
      where: { name: 'Test' }
    })
    
    if (!category) {
      console.log('📂 Création de la catégorie de test...')
      category = await prisma.category.create({
        data: {
          name: 'Test',
          description: 'Catégorie pour les tests'
        }
      })
      console.log('✅ Catégorie créée')
    } else {
      console.log('✅ Catégorie existante trouvée')
    }

    // Créer des produits simples
    console.log('📦 Création des produits de test...')
    const productData = [
      {
        name: 'Produit Test A',
        sku: 'TEST-A-001',
        description: 'Premier produit de test',
        price: 1000.00,
        purchasePrice: 800.00,
        stock: 10
      },
      {
        name: 'Produit Test B',
        sku: 'TEST-B-001',
        description: 'Deuxième produit de test',
        price: 500.00,
        purchasePrice: 400.00,
        stock: 20
      },
      {
        name: 'Produit Test C',
        sku: 'TEST-C-001',
        description: 'Troisième produit de test',
        price: 250.00,
        purchasePrice: 200.00,
        stock: 30
      }
    ]

    const products = []
    for (const productInfo of productData) {
      let product = await prisma.product.findUnique({
        where: { sku: productInfo.sku }
      })
      
      if (!product) {
        product = await prisma.product.create({
          data: {
            ...productInfo,
            categoryId: category.id
          }
        })
      }
      products.push(product)
    }
    console.log('✅ Produits créés/trouvés:', products.length)

    // Créer un client simple
    let customer = await prisma.customer.findFirst({
      where: { email: 'client.test@example.com' }
    })
    
    if (!customer) {
      console.log('👥 Création du client de test...')
      customer = await prisma.customer.create({
        data: {
          name: 'Client Test SARL',
          email: 'client.test@example.com',
          phone: '+212 661 123 456',
          address: '456 Rue de Test, Casablanca',
          company: 'CLIENT TEST SARL'
        }
      })
      console.log('✅ Client créé')
    } else {
      console.log('✅ Client existant trouvé')
    }

    // Créer une vente de test
    console.log('🛒 Création d\'une vente de test...')
    const saleNumber = `VTE-TEST-${Date.now().toString().slice(-6)}`
    
    const sale = await prisma.sale.create({
      data: {
        saleNumber: saleNumber,
        customerId: customer.id,
        sellerId: user.id,
        totalAmount: 1750.00, // 1000 + 500 + 250
        paidAmount: 1750.00,
        creditAmount: 0,
        paymentMethod: 'CASH',
        status: 'COMPLETED',
        notes: 'Vente de test pour bon de livraison',
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 1,
              unitPrice: 1000.00,
              total: 1000.00
            },
            {
              productId: products[1].id,
              quantity: 1,
              unitPrice: 500.00,
              total: 500.00
            },
            {
              productId: products[2].id,
              quantity: 1,
              unitPrice: 250.00,
              total: 250.00
            }
          ]
        }
      },
      include: {
        customer: true,
        seller: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    console.log('✅ Vente de test créée:', sale.saleNumber)

    // Résumé
    console.log('\n🎉 Données de test créées avec succès!')
    console.log('=' .repeat(50))
    console.log('📊 INFORMATIONS DE CONNEXION:')
    console.log('=' .repeat(50))
    console.log(`📧 Email: ${user.email}`)
    console.log(`🔑 Mot de passe: test123`)
    console.log(`🏢 Entreprise: ${companySettings.companyName}`)

    console.log('\n🧪 DONNÉES CRÉÉES:')
    console.log('=' .repeat(50))
    console.log(`👤 Utilisateur: ${user.name}`)
    console.log(`👥 Client: ${customer.name}`)
    console.log(`📦 Produits: ${products.length}`)
    console.log(`🛒 Vente: ${sale.saleNumber} (${sale.totalAmount} DH)`)

    console.log('\n📦 TESTER LE BON DE LIVRAISON:')
    console.log('=' .repeat(50))
    console.log('1. Connectez-vous sur http://localhost:3000')
    console.log(`2. Email: ${user.email} | Mot de passe: test123`)
    console.log('3. Allez dans "Historique des ventes"')
    console.log(`4. Trouvez la vente: ${sale.saleNumber}`)
    console.log('5. Cliquez sur "Générer Bon de Livraison"')
    console.log(`6. URL directe: http://localhost:3000/api/sales/${sale.id}/delivery-note`)

    return { user, customer, products, sale, companySettings }

  } catch (error) {
    console.error('❌ Erreur:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
if (require.main === module) {
  createSimpleTest()
    .then(() => {
      console.log('\n✅ Script terminé avec succès!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Erreur fatale:', error)
      process.exit(1)
    })
}

module.exports = { createSimpleTest }
