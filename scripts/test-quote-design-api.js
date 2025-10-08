const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testQuoteDesignAPI() {
  console.log('🧪 Test de l\'API Quote Design')
  console.log('=' .repeat(60))

  try {
    // 1. Vérifier si des paramètres existent
    console.log('\n1️⃣ Vérification des paramètres existants...')
    const existing = await prisma.companySettings.findFirst()
    
    if (existing) {
      console.log('✅ Paramètres trouvés:')
      console.log('   ID:', existing.id)
      console.log('   Nom:', existing.companyName)
      console.log('   Quote Theme:', existing.quoteTheme)
      console.log('   Primary Color:', existing.primaryColor)
    } else {
      console.log('⚠️  Aucun paramètre trouvé')
    }

    // 2. Simuler une mise à jour (comme l'API le ferait)
    console.log('\n2️⃣ Simulation de mise à jour...')
    
    const testSettings = {
      quoteTheme: 'modern',
      primaryColor: '#2563EB',
      secondaryColor: '#10B981',
      tableHeaderColor: '#10B981',
      sectionColor: '#10B981',
      accentColor: '#F59E0B',
      textColor: '#1F2937',
      headerTextColor: '#FFFFFF',
      sectionTextColor: '#FFFFFF',
      backgroundColor: '#FFFFFF',
      headerStyle: 'gradient',
      logoPosition: 'left',
      logoSize: 'medium',
      fontFamily: 'helvetica',
      fontSize: 'normal',
      borderRadius: 'rounded',
      showWatermark: false,
      watermarkText: 'DEVIS',
      customCSS: '',
      showValidityPeriod: true,
      validityPeriodText: 'Ce devis est valable 30 jours à compter de la date d\'émission.',
      showTermsAndConditions: true,
      termsAndConditionsText: 'Conditions générales de vente disponibles sur demande.'
    }

    if (existing) {
      console.log('   Mode: UPDATE')
      
      try {
        const updated = await prisma.companySettings.update({
          where: { id: existing.id },
          data: {
            quoteTheme: testSettings.quoteTheme,
            primaryColor: testSettings.primaryColor,
            secondaryColor: testSettings.secondaryColor,
            tableHeaderColor: testSettings.tableHeaderColor,
            sectionColor: testSettings.sectionColor,
            accentColor: testSettings.accentColor,
            textColor: testSettings.textColor,
            headerTextColor: testSettings.headerTextColor,
            sectionTextColor: testSettings.sectionTextColor,
            backgroundColor: testSettings.backgroundColor,
            headerStyle: testSettings.headerStyle,
            logoPosition: testSettings.logoPosition,
            logoSize: testSettings.logoSize,
            fontFamily: testSettings.fontFamily,
            fontSize: testSettings.fontSize,
            borderRadius: testSettings.borderRadius,
            showWatermark: testSettings.showWatermark,
            watermarkText: testSettings.watermarkText,
            customCSS: testSettings.customCSS,
            showValidityPeriod: testSettings.showValidityPeriod,
            validityPeriodText: testSettings.validityPeriodText,
            showTermsAndConditions: testSettings.showTermsAndConditions,
            termsAndConditionsText: testSettings.termsAndConditionsText,
            updatedAt: new Date()
          }
        })
        
        console.log('✅ Mise à jour réussie!')
        console.log('   Updated At:', updated.updatedAt)
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour:', error.message)
        console.error('   Code:', error.code)
        throw error
      }
    } else {
      console.log('   Mode: CREATE')
      
      try {
        const created = await prisma.companySettings.create({
          data: {
            // Champs obligatoires
            companyName: 'Mon Entreprise',
            invoicePrefix: 'FAC',
            creditNotePrefix: 'FAV',
            defaultTaxRate: 20,
            // Paramètres de design de facture par défaut
            invoiceTheme: 'modern',
            // Paramètres de design du devis
            quoteTheme: testSettings.quoteTheme,
            primaryColor: testSettings.primaryColor,
            secondaryColor: testSettings.secondaryColor,
            tableHeaderColor: testSettings.tableHeaderColor,
            sectionColor: testSettings.sectionColor,
            accentColor: testSettings.accentColor,
            textColor: testSettings.textColor,
            headerTextColor: testSettings.headerTextColor,
            sectionTextColor: testSettings.sectionTextColor,
            backgroundColor: testSettings.backgroundColor,
            headerStyle: testSettings.headerStyle,
            logoPosition: testSettings.logoPosition,
            logoSize: testSettings.logoSize,
            fontFamily: testSettings.fontFamily,
            fontSize: testSettings.fontSize,
            borderRadius: testSettings.borderRadius,
            showWatermark: testSettings.showWatermark,
            watermarkText: testSettings.watermarkText,
            customCSS: testSettings.customCSS,
            showValidityPeriod: testSettings.showValidityPeriod,
            validityPeriodText: testSettings.validityPeriodText,
            showTermsAndConditions: testSettings.showTermsAndConditions,
            termsAndConditionsText: testSettings.termsAndConditionsText
          }
        })
        
        console.log('✅ Création réussie!')
        console.log('   ID:', created.id)
        console.log('   Created At:', created.createdAt)
      } catch (error) {
        console.error('❌ Erreur lors de la création:', error.message)
        console.error('   Code:', error.code)
        if (error.meta) {
          console.error('   Meta:', JSON.stringify(error.meta, null, 2))
        }
        throw error
      }
    }

    // 3. Vérifier le résultat final
    console.log('\n3️⃣ Vérification finale...')
    const final = await prisma.companySettings.findFirst()
    
    if (final) {
      console.log('✅ Paramètres finaux:')
      console.log('   ID:', final.id)
      console.log('   Company Name:', final.companyName)
      console.log('   Invoice Prefix:', final.invoicePrefix)
      console.log('   Quote Theme:', final.quoteTheme)
      console.log('   Primary Color:', final.primaryColor)
      console.log('   Show Validity Period:', final.showValidityPeriod)
      console.log('   Updated At:', final.updatedAt)
    }

    console.log('\n' + '=' .repeat(60))
    console.log('✅ Test réussi!')
    console.log('=' .repeat(60))

  } catch (error) {
    console.log('\n' + '=' .repeat(60))
    console.error('❌ Test échoué!')
    console.error('Erreur:', error.message)
    if (error.stack) {
      console.error('\nStack trace:')
      console.error(error.stack)
    }
    console.log('=' .repeat(60))
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le test
if (require.main === module) {
  testQuoteDesignAPI()
    .then(() => {
      console.log('\n✅ Script terminé avec succès')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Script terminé avec erreur:', error.message)
      process.exit(1)
    })
}

module.exports = { testQuoteDesignAPI }

