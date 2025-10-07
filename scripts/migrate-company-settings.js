/**
 * Script de migration pour ajouter les nouveaux champs de couleur
 * aux paramètres d'entreprise existants
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateCompanySettings() {
  try {
    console.log('🔄 Migration des paramètres d\'entreprise...')
    
    // Récupérer tous les paramètres existants
    const existingSettings = await prisma.companySettings.findMany()
    
    console.log(`📊 Trouvé ${existingSettings.length} paramètre(s) d'entreprise`)
    
    for (const settings of existingSettings) {
      console.log(`🔧 Mise à jour des paramètres ID: ${settings.id}`)
      
      // Mettre à jour avec les nouvelles couleurs si elles n'existent pas
      const updateData = {}
      
      // Ajouter tableHeaderColor si manquant
      if (!settings.tableHeaderColor) {
        updateData.tableHeaderColor = settings.secondaryColor || '#10B981'
      }
      
      // Ajouter sectionColor si manquant
      if (!settings.sectionColor) {
        updateData.sectionColor = settings.secondaryColor || '#10B981'
      }
      
      // Effectuer la mise à jour seulement si nécessaire
      if (Object.keys(updateData).length > 0) {
        await prisma.companySettings.update({
          where: { id: settings.id },
          data: updateData
        })
        
        console.log(`✅ Paramètres mis à jour:`, updateData)
      } else {
        console.log(`ℹ️  Aucune mise à jour nécessaire`)
      }
    }
    
    // Si aucun paramètre n'existe, créer les paramètres par défaut
    if (existingSettings.length === 0) {
      console.log('📝 Création des paramètres par défaut...')
      
      await prisma.companySettings.create({
        data: {
          companyName: 'Mon Entreprise',
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
          showWatermark: false
        }
      })
      
      console.log('✅ Paramètres par défaut créés')
    }
    
    console.log('🎉 Migration terminée avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter la migration
migrateCompanySettings()
