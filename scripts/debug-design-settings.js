/**
 * Script de debug pour les paramètres de design
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugDesignSettings() {
  console.log('🔍 Debug des paramètres de design...')

  try {
    // Récupérer les paramètres de l'entreprise
    const settings = await prisma.companySettings.findFirst()
    
    if (!settings) {
      console.log('❌ Aucun paramètre trouvé')
      return
    }

    console.log('✅ Paramètres trouvés :')
    console.log('')
    
    // Paramètres généraux
    console.log('📋 Paramètres généraux :')
    console.log(`- ID: ${settings.id}`)
    console.log(`- Nom entreprise: ${settings.companyName}`)
    console.log(`- Logo: ${settings.companyLogo || 'Non défini'}`)
    console.log('')
    
    // Paramètres de design
    console.log('🎨 Paramètres de design :')
    console.log(`- Thème: ${settings.invoiceTheme}`)
    console.log(`- Couleur principale: ${settings.primaryColor}`)
    console.log(`- Couleur secondaire: ${settings.secondaryColor}`)
    console.log(`- Couleur d'accent: ${settings.accentColor}`)
    console.log(`- Couleur du texte: ${settings.textColor}`)
    console.log(`- Couleur texte en-tête: ${settings.headerTextColor}`)
    console.log(`- Couleur texte sections: ${settings.sectionTextColor}`)
    console.log(`- Couleur de fond: ${settings.backgroundColor}`)
    console.log(`- Style d'en-tête: ${settings.headerStyle}`)
    console.log(`- Position du logo: ${settings.logoPosition}`)
    console.log(`- Taille du logo: ${settings.logoSize}`)
    console.log(`- Famille de police: ${settings.fontFamily}`)
    console.log(`- Taille de police: ${settings.fontSize}`)
    console.log(`- Bordures arrondies: ${settings.borderRadius}`)
    console.log(`- Filigrane: ${settings.showWatermark ? 'Activé' : 'Désactivé'}`)
    console.log(`- Texte filigrane: ${settings.watermarkText || 'Non défini'}`)
    console.log('')
    
    // Test de l'API
    console.log('🧪 Test de l\'API de design...')
    
    try {
      const fetch = (await import('node-fetch')).default
      const response = await fetch('http://localhost:3000/api/settings/invoice-design')
      
      if (response.ok) {
        const apiData = await response.json()
        console.log('✅ API répond correctement')
        console.log('📊 Données de l\'API :')
        console.log(JSON.stringify(apiData, null, 2))
      } else {
        console.log('❌ Erreur API:', response.status, response.statusText)
      }
    } catch (error) {
      console.log('❌ Erreur lors du test API:', error.message)
    }

  } catch (error) {
    console.error('❌ Erreur lors du debug :', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function testColorConversion() {
  console.log('')
  console.log('🎨 Test de conversion des couleurs...')
  
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [41, 128, 185]
  }
  
  const testColors = [
    '#2563EB', // Bleu
    '#10B981', // Vert
    '#F59E0B', // Orange
    '#FFFFFF', // Blanc
    '#000000', // Noir
    '#242424'  // Gris foncé
  ]
  
  testColors.forEach(color => {
    const rgb = hexToRgb(color)
    console.log(`${color} → RGB(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`)
  })
}

// Exécuter le debug
if (require.main === module) {
  debugDesignSettings()
    .then(() => testColorConversion())
    .then(() => {
      console.log('')
      console.log('🎉 Debug terminé !')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Erreur :', error)
      process.exit(1)
    })
}

module.exports = { debugDesignSettings }
