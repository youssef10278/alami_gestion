#!/usr/bin/env node

/**
 * Script de migration automatique des colonnes de devis
 * S'exécute au démarrage de l'application
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function autoMigrateQuoteColumns() {
  console.log('🔄 Vérification des colonnes de devis...')

  try {
    // Vérifier si les colonnes existent déjà
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'company_settings' 
      AND column_name IN ('quoteTheme', 'showValidityPeriod', 'validityPeriodText', 'showTermsAndConditions', 'termsAndConditionsText')
    `

    const existingColumns = result.map(row => row.column_name)
    const requiredColumns = ['quoteTheme', 'showValidityPeriod', 'validityPeriodText', 'showTermsAndConditions', 'termsAndConditionsText']
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col))

    if (missingColumns.length === 0) {
      console.log('✅ Toutes les colonnes de devis existent déjà')
      return true
    }

    console.log(`⚠️  Colonnes manquantes: ${missingColumns.join(', ')}`)
    console.log('🔧 Ajout des colonnes manquantes...')

    // Ajouter les colonnes manquantes une par une
    const migrations = []

    if (missingColumns.includes('quoteTheme')) {
      migrations.push(
        prisma.$executeRaw`ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS "quoteTheme" TEXT NOT NULL DEFAULT 'modern'`
      )
    }

    if (missingColumns.includes('showValidityPeriod')) {
      migrations.push(
        prisma.$executeRaw`ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS "showValidityPeriod" BOOLEAN NOT NULL DEFAULT true`
      )
    }

    if (missingColumns.includes('validityPeriodText')) {
      migrations.push(
        prisma.$executeRaw`ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS "validityPeriodText" TEXT NOT NULL DEFAULT 'Ce devis est valable 30 jours à compter de la date d''émission.'`
      )
    }

    if (missingColumns.includes('showTermsAndConditions')) {
      migrations.push(
        prisma.$executeRaw`ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS "showTermsAndConditions" BOOLEAN NOT NULL DEFAULT true`
      )
    }

    if (missingColumns.includes('termsAndConditionsText')) {
      migrations.push(
        prisma.$executeRaw`ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS "termsAndConditionsText" TEXT NOT NULL DEFAULT 'Conditions générales de vente disponibles sur demande.'`
      )
    }

    // Exécuter toutes les migrations
    await Promise.all(migrations)

    console.log('✅ Colonnes de devis ajoutées avec succès !')
    return true

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    
    // Si l'erreur est due à des colonnes déjà existantes, c'est OK
    if (error.message && error.message.includes('already exists')) {
      console.log('✅ Les colonnes existent déjà (erreur ignorée)')
      return true
    }

    // Sinon, on continue quand même (l'app peut fonctionner sans ces colonnes)
    console.log('⚠️  Migration échouée, mais l\'application va continuer')
    return false

  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter la migration
autoMigrateQuoteColumns()
  .then((success) => {
    if (success) {
      console.log('🎉 Migration terminée avec succès')
      process.exit(0)
    } else {
      console.log('⚠️  Migration terminée avec des avertissements')
      process.exit(0) // Exit 0 quand même pour ne pas bloquer le démarrage
    }
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error)
    process.exit(0) // Exit 0 pour ne pas bloquer le démarrage
  })

