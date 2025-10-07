/**
 * Script pour créer une vente de test pour le bon de livraison
 */

const { PrismaClient } = require('@prisma/client')

async function createTestSale() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🛒 Création d\'une vente de test pour le bon de livraison\n')

    // 1. Créer un utilisateur vendeur
    console.log('👤 Création du vendeur...')
    const seller = await prisma.user.upsert({
      where: { email: 'vendeur@alamigestion.ma' },
      update: {},
      create: {
        name: 'Ahmed Alami',
        email: 'vendeur@alamigestion.ma',
        password: 'password123', // En production, utilisez un hash
        role: 'OWNER'
      }
    })
    console.log('✅ Vendeur créé:', seller.name)

    // 2. Créer un client
    console.log('👥 Création du client...')
    const customer = await prisma.customer.create({
      data: {
        name: 'SARL TECH SOLUTIONS',
        email: 'client@techsolutions.ma',
        phone: '+212 522 123 456',
        address: '123 Avenue Mohammed V, Casablanca',
        company: 'SARL TECH SOLUTIONS'
      }
    })
    console.log('✅ Client créé:', customer.name)

    // 3. Créer une catégorie
    console.log('📂 Création de la catégorie...')
    const category = await prisma.category.create({
      data: {
        name: 'Électronique',
        description: 'Produits électroniques et informatiques'
      }
    })
    console.log('✅ Catégorie créée:', category.name)

    // 4. Créer des produits
    console.log('📦 Création des produits...')
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: 'Ordinateur portable HP',
          sku: 'HP-LAPTOP-001',
          description: 'Ordinateur portable HP 15.6" Intel Core i5, 8GB RAM, 256GB SSD',
          price: 6500.00,
          purchasePrice: 5200.00,
          stock: 10,
          categoryId: category.id
        }
      }),
      prisma.product.create({
        data: {
          name: 'Souris sans fil Logitech',
          sku: 'LOG-MOUSE-001',
          description: 'Souris optique sans fil avec récepteur USB',
          price: 150.00,
          purchasePrice: 100.00,
          stock: 25,
          categoryId: category.id
        }
      }),
      prisma.product.create({
        data: {
          name: 'Clavier mécanique RGB',
          sku: 'KEYBOARD-RGB-001',
          description: 'Clavier mécanique avec rétroéclairage RGB et switches bleus',
          price: 800.00,
          purchasePrice: 600.00,
          stock: 15,
          categoryId: category.id
        }
      })
    ])
    console.log('✅ Produits créés:', products.length)

    // 5. Créer les paramètres de l'entreprise
    console.log('🏢 Création des paramètres de l\'entreprise...')
    const companySettings = await prisma.companySettings.create({
      data: {
        companyName: 'ALAMI GESTION',
        companyAddress: '456 Boulevard Zerktouni, Casablanca',
        companyPhone: '+212 522 987 654',
        companyEmail: 'contact@alamigestion.ma',
        primaryColor: '#10B981'
      }
    })
    console.log('✅ Paramètres de l\'entreprise créés')

    // 6. Créer une vente
    console.log('🛒 Création de la vente...')
    const sale = await prisma.sale.create({
      data: {
        saleNumber: 'VTE-00000001',
        customerId: customer.id,
        sellerId: seller.id,
        totalAmount: 7450.00, // 6500 + 150 + 800
        paidAmount: 7450.00,
        creditAmount: 0,
        paymentMethod: 'CASH',
        status: 'COMPLETED',
        notes: 'Livraison urgente - Contacter le client avant livraison',
        items: {
          create: [
            {
              productId: products[0].id, // HP Laptop
              quantity: 1,
              unitPrice: 6500.00,
              total: 6500.00
            },
            {
              productId: products[1].id, // Logitech Mouse
              quantity: 1,
              unitPrice: 150.00,
              total: 150.00
            },
            {
              productId: products[2].id, // RGB Keyboard
              quantity: 1,
              unitPrice: 800.00,
              total: 800.00
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

    console.log('✅ Vente créée avec succès!')
    console.log('📊 Détails de la vente:')
    console.log(`   ID: ${sale.id}`)
    console.log(`   Numéro: ${sale.saleNumber}`)
    console.log(`   Statut: ${sale.status}`)
    console.log(`   Client: ${sale.customer.name}`)
    console.log(`   Vendeur: ${sale.seller.name}`)
    console.log(`   Total: ${sale.totalAmount} DH`)
    console.log(`   Articles: ${sale.items.length}`)

    console.log('\n🧪 Pour tester le bon de livraison:')
    console.log(`   URL: http://localhost:3000/api/sales/${sale.id}/delivery-note`)
    console.log(`   ID de vente: ${sale.id}`)

    return sale

  } catch (error) {
    console.error('❌ Erreur lors de la création de la vente de test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestSale().catch(console.error)
