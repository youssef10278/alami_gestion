#!/usr/bin/env node

/**
 * Script de test pour vérifier que le logo d'entreprise s'affiche correctement
 * dans les bons de livraison générés
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function testDeliveryNoteLogo() {
  console.log('🧪 Test du logo dans le bon de livraison')
  console.log('=' .repeat(50))

  try {
    // 1. Vérifier les paramètres de l'entreprise
    console.log('📋 1. Vérification des paramètres de l\'entreprise...')
    const companySettings = await prisma.companySettings.findFirst()
    
    if (!companySettings) {
      console.log('❌ Aucun paramètre d\'entreprise trouvé')
      return
    }

    console.log('✅ Paramètres trouvés:', {
      name: companySettings.companyName,
      hasLogo: !!companySettings.companyLogo,
      logoUrl: companySettings.companyLogo,
      address: companySettings.companyAddress,
      phone: companySettings.companyPhone,
      email: companySettings.companyEmail
    })

    // 2. Créer une vente de test si nécessaire
    console.log('\n📦 2. Vérification des ventes...')
    let testSale = await prisma.sale.findFirst({
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

    if (!testSale) {
      console.log('⚠️ Aucune vente trouvée, création d\'une vente de test...')
      
      // Créer un produit de test
      const testProduct = await prisma.product.create({
        data: {
          sku: 'TEST-001',
          name: 'Produit de Test',
          price: 100.00,
          purchasePrice: 50.00,
          stock: 10,
          minStock: 5
        }
      })

      // Créer un utilisateur de test
      const testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: 'hashedpassword',
          name: 'Test User',
          role: 'SELLER'
        }
      })

      // Créer une vente de test
      testSale = await prisma.sale.create({
        data: {
          saleNumber: 'VNT-TEST-001',
          sellerId: testUser.id,
          totalAmount: 100.00,
          paidAmount: 100.00,
          creditAmount: 0.00,
          paymentMethod: 'CASH',
          status: 'COMPLETED',
          items: {
            create: {
              productId: testProduct.id,
              quantity: 1,
              unitPrice: 100.00,
              total: 100.00
            }
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

      console.log('✅ Vente de test créée:', testSale.saleNumber)
    } else {
      console.log('✅ Vente trouvée:', testSale.saleNumber)
    }

    // 3. Tester la génération du bon de livraison
    console.log('\n📄 3. Test de génération du bon de livraison...')
    
    const { generateDeliveryNotePDF } = require('../lib/delivery-note-generator')
    
    const deliveryNoteData = {
      saleNumber: testSale.saleNumber,
      customerName: testSale.customer?.name || 'Client de passage',
      customerAddress: testSale.customer?.address,
      customerPhone: testSale.customer?.phone,
      sellerName: testSale.seller.name,
      items: testSale.items.map(item => ({
        productName: item.product?.name || 'Produit inconnu',
        productSku: item.product?.sku,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice) || 0,
        total: Number(item.total) || 0,
        description: item.product?.description
      })),
      notes: testSale.notes,
      createdAt: testSale.createdAt,
      companySettings: {
        name: companySettings.companyName,
        address: companySettings.companyAddress,
        phone: companySettings.companyPhone,
        email: companySettings.companyEmail,
        logo: companySettings.companyLogo,
        primaryColor: companySettings.primaryColor
      }
    }

    console.log('📋 Données préparées:', {
      saleNumber: deliveryNoteData.saleNumber,
      customerName: deliveryNoteData.customerName,
      sellerName: deliveryNoteData.sellerName,
      itemsCount: deliveryNoteData.items.length,
      hasCompanySettings: !!deliveryNoteData.companySettings,
      companyLogo: deliveryNoteData.companySettings?.logo
    })

    // Générer le PDF
    const pdfBuffer = await generateDeliveryNotePDF(deliveryNoteData)
    console.log('✅ PDF généré avec succès, taille:', pdfBuffer.length, 'bytes')

    // Sauvegarder le PDF pour inspection
    const outputDir = path.join(__dirname, '..', 'test-outputs')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const outputPath = path.join(outputDir, `delivery-note-test-${Date.now()}.pdf`)
    fs.writeFileSync(outputPath, pdfBuffer)
    console.log('💾 PDF sauvegardé:', outputPath)

    // 4. Résumé du test
    console.log('\n📊 4. Résumé du test:')
    console.log('=' .repeat(30))
    console.log(`✅ Paramètres entreprise: ${companySettings.companyName}`)
    console.log(`✅ Logo configuré: ${companySettings.companyLogo ? 'OUI' : 'NON'}`)
    console.log(`✅ Vente de test: ${testSale.saleNumber}`)
    console.log(`✅ PDF généré: ${pdfBuffer.length} bytes`)
    console.log(`✅ Fichier sauvegardé: ${outputPath}`)
    
    if (companySettings.companyLogo) {
      console.log('\n🎯 Vérifiez le fichier PDF pour confirmer que le logo s\'affiche correctement!')
    } else {
      console.log('\n⚠️ Aucun logo configuré - le PDF devrait afficher un cercle avec initiale')
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
    console.error('Stack trace:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le test
testDeliveryNoteLogo()
  .then(() => {
    console.log('\n✅ Test terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test échoué:', error)
    process.exit(1)
  })
