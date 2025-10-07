/**
 * Script pour déboguer l'erreur de génération PDF
 */

async function debugPDFError() {
  try {
    console.log('🔍 Débogage de l\'erreur PDF\n')

    // Test 1: Vérifier les imports
    console.log('📦 Test des imports...')
    try {
      const jsPDF = require('jspdf')
      console.log('✅ jsPDF importé avec succès')
      
      require('jspdf-autotable')
      console.log('✅ jspdf-autotable importé avec succès')
    } catch (error) {
      console.log('❌ Erreur d\'import:', error.message)
      return
    }

    // Test 2: Créer un PDF simple
    console.log('\n📄 Test de création PDF simple...')
    try {
      const { jsPDF } = require('jspdf')
      const doc = new jsPDF()
      doc.text('Test PDF', 10, 10)
      const pdfBuffer = doc.output('arraybuffer')
      console.log('✅ PDF simple créé, taille:', pdfBuffer.byteLength, 'bytes')
    } catch (error) {
      console.log('❌ Erreur création PDF simple:', error.message)
      return
    }

    // Test 3: Tester le générateur avec données minimales
    console.log('\n🧪 Test du générateur avec données minimales...')
    try {
      // Import dynamique pour éviter les erreurs de module
      const { generateDeliveryNotePDF } = await import('../lib/delivery-note-generator.ts')
      
      const testData = {
        saleNumber: 'TEST-001',
        customerName: 'Client Test',
        sellerName: 'Vendeur Test',
        items: [
          {
            productName: 'Produit Test',
            quantity: 1
          }
        ],
        createdAt: new Date(),
        companySettings: {
          name: 'Test Company',
          primaryColor: '#10B981'
        }
      }

      console.log('📊 Données de test préparées')
      const pdfBuffer = await generateDeliveryNotePDF(testData)
      console.log('✅ PDF généré avec succès, taille:', pdfBuffer.length, 'bytes')

      // Sauvegarder pour vérification
      const fs = require('fs')
      const path = require('path')
      const outputPath = path.join(__dirname, '..', 'debug-delivery-note.pdf')
      fs.writeFileSync(outputPath, pdfBuffer)
      console.log('💾 PDF sauvegardé:', outputPath)

    } catch (error) {
      console.log('❌ Erreur générateur PDF:', error.message)
      console.log('❌ Stack:', error.stack)
    }

    // Test 4: Vérifier la vente spécifique
    console.log('\n🔍 Test de la vente spécifique...')
    try {
      const { PrismaClient } = require('@prisma/client')
      const prisma = new PrismaClient()

      const saleId = 'cmgghk6uj0001ts4wp20yskt8'
      const sale = await prisma.sale.findUnique({
        where: { id: saleId },
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

      if (sale) {
        console.log('✅ Vente trouvée:', {
          id: sale.id,
          saleNumber: sale.saleNumber,
          status: sale.status,
          itemsCount: sale.items.length,
          hasCustomer: !!sale.customer,
          hasSeller: !!sale.seller
        })

        // Vérifier les paramètres de l'entreprise
        const companySettings = await prisma.companySettings.findFirst()
        console.log('🏢 Paramètres entreprise:', !!companySettings)

        if (companySettings) {
          console.log('📋 Détails entreprise:', {
            name: companySettings.companyName,
            hasAddress: !!companySettings.companyAddress,
            hasPhone: !!companySettings.companyPhone,
            primaryColor: companySettings.primaryColor
          })
        }

      } else {
        console.log('❌ Vente non trouvée avec ID:', saleId)
      }

      await prisma.$disconnect()

    } catch (error) {
      console.log('❌ Erreur base de données:', error.message)
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

debugPDFError().catch(console.error)
