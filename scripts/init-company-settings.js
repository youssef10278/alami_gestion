const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function initCompanySettings() {
  try {
    console.log('🏢 Initialisation des paramètres de l\'entreprise...')

    // Vérifier si des paramètres existent déjà
    const existing = await prisma.companySettings.findFirst()

    if (existing) {
      console.log('✅ Paramètres existants trouvés:', existing.id)
      console.log('   Nom:', existing.companyName)
      return existing
    }

    console.log('⚠️ Aucun paramètre trouvé - Création...')

    // Créer les paramètres par défaut
    const settings = await prisma.companySettings.create({
      data: {
        companyName: 'Mon Entreprise',
        invoicePrefix: 'FAC',
        creditNotePrefix: 'FAV',
        defaultTaxRate: 20,
        // Paramètres de design par défaut
        invoiceTheme: 'modern',
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
        // Paramètres spécifiques aux devis
        quoteTheme: 'modern',
        showValidityPeriod: true,
        validityPeriodText: 'Ce devis est valable 30 jours à compter de la date d\'émission.',
        showTermsAndConditions: true,
        termsAndConditionsText: 'Conditions générales de vente disponibles sur demande.'
      }
    })

    console.log('✅ Paramètres créés avec succès!')
    console.log('   ID:', settings.id)
    console.log('   Nom:', settings.companyName)

    return settings
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  initCompanySettings()
    .then(() => {
      console.log('✅ Initialisation terminée')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erreur:', error)
      process.exit(1)
    })
}

module.exports = { initCompanySettings }

