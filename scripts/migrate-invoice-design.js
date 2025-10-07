/**
 * Script de migration pour ajouter les paramètres de design des factures
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateInvoiceDesign() {
  console.log('🔄 Migration des paramètres de design des factures...')

  try {
    // Vérifier si les paramètres existent déjà
    const existingSettings = await prisma.companySettings.findFirst()

    if (existingSettings) {
      console.log('📋 Paramètres d\'entreprise existants trouvés')
      
      // Vérifier si les nouveaux champs existent déjà
      if (existingSettings.invoiceTheme !== undefined) {
        console.log('✅ Les paramètres de design existent déjà')
        return
      }

      console.log('🔧 Mise à jour avec les paramètres de design par défaut...')
      
      // Mettre à jour avec les valeurs par défaut
      await prisma.companySettings.update({
        where: { id: existingSettings.id },
        data: {
          invoiceTheme: 'modern',
          primaryColor: '#2563EB',
          secondaryColor: '#10B981',
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
          watermarkText: null,
          customCSS: null
        }
      })

      console.log('✅ Paramètres de design ajoutés avec succès')
    } else {
      console.log('🆕 Création de nouveaux paramètres avec design par défaut...')
      
      // Créer de nouveaux paramètres avec design
      await prisma.companySettings.create({
        data: {
          companyName: 'Mon Entreprise',
          invoicePrefix: 'FAC',
          creditNotePrefix: 'FAV',
          defaultTaxRate: 20,
          invoiceTheme: 'modern',
          primaryColor: '#2563EB',
          secondaryColor: '#10B981',
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
          watermarkText: null,
          customCSS: null
        }
      })

      console.log('✅ Nouveaux paramètres créés avec succès')
    }

    // Vérifier la migration
    const updatedSettings = await prisma.companySettings.findFirst()
    console.log('')
    console.log('📊 Paramètres de design configurés :')
    console.log(`- Thème: ${updatedSettings?.invoiceTheme}`)
    console.log(`- Couleur principale: ${updatedSettings?.primaryColor}`)
    console.log(`- Couleur secondaire: ${updatedSettings?.secondaryColor}`)
    console.log(`- Style d'en-tête: ${updatedSettings?.headerStyle}`)
    console.log(`- Position du logo: ${updatedSettings?.logoPosition}`)
    console.log(`- Famille de police: ${updatedSettings?.fontFamily}`)
    console.log(`- Filigrane: ${updatedSettings?.showWatermark ? 'Activé' : 'Désactivé'}`)

  } catch (error) {
    console.error('❌ Erreur lors de la migration :', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function testDesignSettings() {
  console.log('')
  console.log('🧪 Test des paramètres de design...')

  try {
    // Test de lecture
    const settings = await prisma.companySettings.findFirst()
    if (!settings) {
      throw new Error('Aucun paramètre trouvé')
    }

    console.log('✅ Lecture des paramètres réussie')

    // Test de mise à jour
    await prisma.companySettings.update({
      where: { id: settings.id },
      data: {
        primaryColor: '#3B82F6', // Bleu test
        secondaryColor: '#059669', // Vert test
        showWatermark: true,
        watermarkText: 'TEST'
      }
    })

    console.log('✅ Mise à jour des paramètres réussie')

    // Restaurer les valeurs par défaut
    await prisma.companySettings.update({
      where: { id: settings.id },
      data: {
        primaryColor: '#2563EB',
        secondaryColor: '#10B981',
        showWatermark: false,
        watermarkText: null
      }
    })

    console.log('✅ Restauration des valeurs par défaut réussie')

  } catch (error) {
    console.error('❌ Erreur lors du test :', error)
    throw error
  }
}

async function showAvailableThemes() {
  console.log('')
  console.log('🎨 Thèmes disponibles :')
  console.log('')
  
  const themes = [
    {
      name: 'Moderne',
      value: 'modern',
      description: 'Design épuré et contemporain',
      colors: {
        primary: '#2563EB',
        secondary: '#10B981',
        accent: '#F59E0B'
      }
    },
    {
      name: 'Classique',
      value: 'classic',
      description: 'Style traditionnel et professionnel',
      colors: {
        primary: '#1F2937',
        secondary: '#374151',
        accent: '#DC2626'
      }
    },
    {
      name: 'Minimal',
      value: 'minimal',
      description: 'Design simple et élégant',
      colors: {
        primary: '#6B7280',
        secondary: '#9CA3AF',
        accent: '#F59E0B'
      }
    },
    {
      name: 'Coloré',
      value: 'colorful',
      description: 'Design vibrant et dynamique',
      colors: {
        primary: '#7C3AED',
        secondary: '#EC4899',
        accent: '#F59E0B'
      }
    }
  ]

  themes.forEach(theme => {
    console.log(`📋 ${theme.name} (${theme.value})`)
    console.log(`   ${theme.description}`)
    console.log(`   Couleurs: ${theme.colors.primary} | ${theme.colors.secondary} | ${theme.colors.accent}`)
    console.log('')
  })
}

// Exécuter la migration
if (require.main === module) {
  migrateInvoiceDesign()
    .then(() => testDesignSettings())
    .then(() => showAvailableThemes())
    .then(() => {
      console.log('🎉 Migration terminée avec succès !')
      console.log('')
      console.log('📋 Prochaines étapes :')
      console.log('1. Redémarrer l\'application')
      console.log('2. Aller dans Paramètres > Designer de Facture')
      console.log('3. Personnaliser les couleurs et le style')
      console.log('4. Tester avec l\'aperçu')
      console.log('')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Échec de la migration :', error)
      process.exit(1)
    })
}

module.exports = { migrateInvoiceDesign, testDesignSettings }
