/**
 * Script pour créer un compte de test complet
 * Inclut : utilisateur, client, produits, paramètres entreprise, et vente de test
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function createTestAccount() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🚀 Création d\'un compte de test complet\n')

    // 1. Créer un utilisateur de test
    console.log('👤 Création de l\'utilisateur de test...')
    const hashedPassword = await bcrypt.hash('test123', 10)
    
    const user = await prisma.user.create({
      data: {
        name: 'Utilisateur Test',
        email: 'test@alamigestion.ma',
        password: hashedPassword,
        role: 'OWNER'
      }
    })
    console.log('✅ Utilisateur créé:', user.email)

    // 2. Créer les paramètres de l'entreprise
    console.log('🏢 Création des paramètres de l\'entreprise...')
    const companySettings = await prisma.companySettings.create({
      data: {
        companyName: 'ALAMI GESTION - TEST',
        companyAddress: '123 Avenue Hassan II, Casablanca',
        companyPhone: '+212 522 123 456',
        companyEmail: 'contact@alamigestion-test.ma',
        companyICE: 'ICE123456789',
        primaryColor: '#10B981',
        secondaryColor: '#3B82F6',
        invoicePrefix: 'FAC',
        creditNotePrefix: 'FAV',
        defaultTaxRate: 20.00,
        bankName: 'Banque Populaire',
        bankAccount: 'BP-123456789',
        bankRIB: '011780001234567890123456',
        legalMentions: 'Société à responsabilité limitée au capital de 100 000 DH'
      }
    })
    console.log('✅ Paramètres entreprise créés')

    // 3. Créer des catégories
    console.log('📂 Création des catégories...')
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Informatique',
          description: 'Matériel informatique et accessoires'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Bureautique',
          description: 'Fournitures de bureau et papeterie'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Mobilier',
          description: 'Mobilier de bureau et équipements'
        }
      })
    ])
    console.log('✅ Catégories créées:', categories.length)

    // 4. Créer des produits
    console.log('📦 Création des produits...')
    const products = await Promise.all([
      // Informatique
      prisma.product.create({
        data: {
          name: 'MacBook Pro 14"',
          sku: 'MBP-14-001',
          description: 'MacBook Pro 14" M3 Pro, 18GB RAM, 512GB SSD',
          price: 25000.00,
          purchasePrice: 20000.00,
          stock: 5,
          categoryId: categories[0].id
        }
      }),
      prisma.product.create({
        data: {
          name: 'iPhone 15 Pro',
          sku: 'IPH-15P-001',
          description: 'iPhone 15 Pro 128GB Titane Naturel',
          price: 12000.00,
          purchasePrice: 9500.00,
          stock: 10,
          categoryId: categories[0].id
        }
      }),
      prisma.product.create({
        data: {
          name: 'iPad Air',
          sku: 'IPAD-AIR-001',
          description: 'iPad Air 11" M2, 128GB, Wi-Fi',
          price: 6500.00,
          purchasePrice: 5200.00,
          stock: 8,
          categoryId: categories[0].id
        }
      }),
      // Bureautique
      prisma.product.create({
        data: {
          name: 'Imprimante HP LaserJet',
          sku: 'HP-LJ-001',
          description: 'Imprimante laser HP LaserJet Pro M404dn',
          price: 2800.00,
          purchasePrice: 2200.00,
          stock: 12,
          categoryId: categories[1].id
        }
      }),
      prisma.product.create({
        data: {
          name: 'Ramette Papier A4',
          sku: 'PAP-A4-001',
          description: 'Ramette papier A4 80g/m² - 500 feuilles',
          price: 45.00,
          purchasePrice: 35.00,
          stock: 100,
          categoryId: categories[1].id
        }
      }),
      // Mobilier
      prisma.product.create({
        data: {
          name: 'Bureau Ergonomique',
          sku: 'BUR-ERG-001',
          description: 'Bureau ergonomique réglable en hauteur 160x80cm',
          price: 3500.00,
          purchasePrice: 2800.00,
          stock: 6,
          categoryId: categories[2].id
        }
      })
    ])
    console.log('✅ Produits créés:', products.length)

    // 5. Créer des clients
    console.log('👥 Création des clients...')
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          name: 'SARL TECH INNOVATIONS',
          email: 'contact@techinnovations.ma',
          phone: '+212 522 987 654',
          address: '456 Boulevard Zerktouni, Casablanca',
          company: 'SARL TECH INNOVATIONS',
          creditLimit: 50000.00
        }
      }),
      prisma.customer.create({
        data: {
          name: 'Entreprise DIGITAL SOLUTIONS',
          email: 'info@digitalsolutions.ma',
          phone: '+212 537 123 789',
          address: '789 Avenue Mohammed V, Rabat',
          company: 'DIGITAL SOLUTIONS SARL',
          creditLimit: 75000.00
        }
      }),
      prisma.customer.create({
        data: {
          name: 'Mohamed Alami',
          email: 'mohamed.alami@gmail.com',
          phone: '+212 661 234 567',
          address: '321 Rue des Orangers, Marrakech',
          company: null,
          creditLimit: 10000.00
        }
      })
    ])
    console.log('✅ Clients créés:', customers.length)

    // 6. Créer une vente de test finalisée
    console.log('🛒 Création d\'une vente de test...')
    const sale = await prisma.sale.create({
      data: {
        saleNumber: 'VTE-TEST-001',
        customerId: customers[0].id,
        sellerId: user.id,
        totalAmount: 31500.00, // MacBook + iPhone + Ramette
        paidAmount: 31500.00,
        creditAmount: 0,
        paymentMethod: 'CASH',
        status: 'COMPLETED',
        notes: 'Vente de test - Livraison urgente demandée',
        items: {
          create: [
            {
              productId: products[0].id, // MacBook Pro
              quantity: 1,
              unitPrice: 25000.00,
              total: 25000.00
            },
            {
              productId: products[1].id, // iPhone 15 Pro
              quantity: 1,
              unitPrice: 12000.00,
              total: 12000.00
            },
            {
              productId: products[4].id, // Ramette papier
              quantity: 10,
              unitPrice: 45.00,
              total: 450.00
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

    // 7. Créer un devis de test
    console.log('📋 Création d\'un devis de test...')
    const quote = await prisma.quote.create({
      data: {
        quoteNumber: 'DEV-TEST-001',
        customerId: customers[1].id,
        customerName: customers[1].name,
        totalAmount: 9300.00,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        status: 'PENDING',
        notes: 'Devis pour équipement bureau complet',
        items: {
          create: [
            {
              productId: products[3].id, // Imprimante HP
              productName: products[3].name,
              quantity: 1,
              unitPrice: 2800.00,
              total: 2800.00
            },
            {
              productId: products[5].id, // Bureau ergonomique
              productName: products[5].name,
              quantity: 2,
              unitPrice: 3500.00,
              total: 7000.00
            }
          ]
        }
      }
    })
    console.log('✅ Devis de test créé:', quote.quoteNumber)

    // 8. Résumé final
    console.log('\n🎉 Compte de test créé avec succès!')
    console.log('=' .repeat(50))
    console.log('📊 RÉSUMÉ DU COMPTE DE TEST:')
    console.log('=' .repeat(50))
    console.log(`👤 Utilisateur: ${user.email} (mot de passe: test123)`)
    console.log(`🏢 Entreprise: ${companySettings.companyName}`)
    console.log(`📂 Catégories: ${categories.length}`)
    console.log(`📦 Produits: ${products.length}`)
    console.log(`👥 Clients: ${customers.length}`)
    console.log(`🛒 Vente test: ${sale.saleNumber} (${sale.totalAmount} DH)`)
    console.log(`📋 Devis test: ${quote.quoteNumber} (${quote.totalAmount} DH)`)

    console.log('\n🧪 POUR TESTER LE BON DE LIVRAISON:')
    console.log('=' .repeat(50))
    console.log(`1. Connectez-vous avec: ${user.email} / test123`)
    console.log(`2. Allez dans Historique des ventes`)
    console.log(`3. Trouvez la vente: ${sale.saleNumber}`)
    console.log(`4. Cliquez sur "Générer Bon de Livraison"`)
    console.log(`5. URL directe: http://localhost:3000/api/sales/${sale.id}/delivery-note`)

    console.log('\n📱 DONNÉES DISPONIBLES:')
    console.log('=' .repeat(50))
    console.log('• MacBook Pro 14" - 25 000 DH')
    console.log('• iPhone 15 Pro - 12 000 DH') 
    console.log('• iPad Air - 6 500 DH')
    console.log('• Imprimante HP - 2 800 DH')
    console.log('• Bureau Ergonomique - 3 500 DH')
    console.log('• Ramette Papier A4 - 45 DH')

    return {
      user,
      companySettings,
      categories,
      products,
      customers,
      sale,
      quote
    }

  } catch (error) {
    console.error('❌ Erreur lors de la création du compte de test:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
if (require.main === module) {
  createTestAccount()
    .then(() => {
      console.log('\n✅ Script terminé avec succès!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Erreur fatale:', error)
      process.exit(1)
    })
}

module.exports = { createTestAccount }
