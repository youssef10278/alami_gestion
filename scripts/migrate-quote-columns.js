#!/usr/bin/env node

/**
 * Script pour ajouter les colonnes manquantes pour les devis
 * Exécute le SQL directement via Prisma
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function checkColumn(columnName) {
  try {
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'company_settings' 
          AND column_name = ${columnName}
      ) as exists
    `
    return result[0].exists
  } catch (error) {
    console.error(`Erreur lors de la vérification de ${columnName}:`, error.message)
    return false
  }
}

async function addQuoteColumns() {
  console.log('🔧 Migration des colonnes de devis')
  console.log('=' .repeat(60))

  try {
    // Vérifier les colonnes existantes
    console.log('\n1️⃣ Vérification des colonnes existantes...')
    
    const columns = [
      'quoteTheme',
      'showValidityPeriod',
      'validityPeriodText',
      'showTermsAndConditions',
      'termsAndConditionsText'
    ]

    const existingColumns = {}
    for (const col of columns) {
      const exists = await checkColumn(col)
      existingColumns[col] = exists
      console.log(`   ${exists ? '✅' : '❌'} ${col}`)
    }

    const missingColumns = columns.filter(col => !existingColumns[col])

    if (missingColumns.length === 0) {
      console.log('\n✅ Toutes les colonnes existent déjà!')
      return true
    }

    console.log(`\n⚠️  ${missingColumns.length} colonne(s) manquante(s):`, missingColumns.join(', '))

    // Ajouter les colonnes manquantes
    console.log('\n2️⃣ Ajout des colonnes manquantes...')

    if (!existingColumns.quoteTheme) {
      console.log('   Ajout de quoteTheme...')
      await prisma.$executeRaw`
        ALTER TABLE company_settings 
        ADD COLUMN IF NOT EXISTS "quoteTheme" TEXT NOT NULL DEFAULT 'modern'
      `
      console.log('   ✅ quoteTheme ajoutée')
    }

    if (!existingColumns.showValidityPeriod) {
      console.log('   Ajout de showValidityPeriod...')
      await prisma.$executeRaw`
        ALTER TABLE company_settings 
        ADD COLUMN IF NOT EXISTS "showValidityPeriod" BOOLEAN NOT NULL DEFAULT true
      `
      console.log('   ✅ showValidityPeriod ajoutée')
    }

    if (!existingColumns.validityPeriodText) {
      console.log('   Ajout de validityPeriodText...')
      await prisma.$executeRaw`
        ALTER TABLE company_settings 
        ADD COLUMN IF NOT EXISTS "validityPeriodText" TEXT NOT NULL DEFAULT 'Ce devis est valable 30 jours à compter de la date d''émission.'
      `
      console.log('   ✅ validityPeriodText ajoutée')
    }

    if (!existingColumns.showTermsAndConditions) {
      console.log('   Ajout de showTermsAndConditions...')
      await prisma.$executeRaw`
        ALTER TABLE company_settings 
        ADD COLUMN IF NOT EXISTS "showTermsAndConditions" BOOLEAN NOT NULL DEFAULT true
      `
      console.log('   ✅ showTermsAndConditions ajoutée')
    }

    if (!existingColumns.termsAndConditionsText) {
      console.log('   Ajout de termsAndConditionsText...')
      await prisma.$executeRaw`
        ALTER TABLE company_settings 
        ADD COLUMN IF NOT EXISTS "termsAndConditionsText" TEXT NOT NULL DEFAULT 'Conditions générales de vente disponibles sur demande.'
      `
      console.log('   ✅ termsAndConditionsText ajoutée')
    }

    // Vérification finale
    console.log('\n3️⃣ Vérification finale...')
    
    for (const col of columns) {
      const exists = await checkColumn(col)
      console.log(`   ${exists ? '✅' : '❌'} ${col}`)
      if (!exists) {
        throw new Error(`La colonne ${col} n'a pas été créée correctement`)
      }
    }

    console.log('\n✅ Toutes les colonnes ont été ajoutées avec succès!')
    return true

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error.message)
    console.error('Stack:', error.stack)
    throw error
  }
}

async function verifySchema() {
  console.log('\n4️⃣ Vérification du schéma complet...')
  
  try {
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'company_settings'
      ORDER BY ordinal_position
    `
    
    console.log('\n📋 Colonnes de company_settings:')
    console.log('   Total:', result.length, 'colonnes')
    
    const quoteColumns = result.filter(col => 
      ['quoteTheme', 'showValidityPeriod', 'validityPeriodText', 'showTermsAndConditions', 'termsAndConditionsText']
        .includes(col.column_name)
    )
    
    console.log('\n📋 Colonnes de devis:')
    quoteColumns.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`)
    })
    
    return true
  } catch (error) {
    console.error('Erreur lors de la vérification:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Migration des Colonnes de Devis - Alami Gestion')
  console.log('=' .repeat(60))
  
  try {
    // Tester la connexion
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Connexion à la base de données OK\n')
    
    // Ajouter les colonnes
    await addQuoteColumns()
    
    // Vérifier le schéma
    await verifySchema()
    
    console.log('\n' + '=' .repeat(60))
    console.log('✅ MIGRATION RÉUSSIE')
    console.log('=' .repeat(60))
    console.log('\nVous pouvez maintenant:')
    console.log('1. Tester l\'API: POST /api/settings/quote-design')
    console.log('2. Utiliser le Designer de Devis')
    console.log('3. Redémarrer l\'application si nécessaire')
    console.log('=' .repeat(60))
    
  } catch (error) {
    console.log('\n' + '=' .repeat(60))
    console.error('❌ MIGRATION ÉCHOUÉE')
    console.error('Erreur:', error.message)
    console.log('=' .repeat(60))
    console.log('\nActions recommandées:')
    console.log('1. Vérifier la connexion à la base de données')
    console.log('2. Vérifier les permissions PostgreSQL')
    console.log('3. Exécuter manuellement le SQL: scripts/add-quote-columns.sql')
    console.log('=' .repeat(60))
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Script terminé')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Script terminé avec erreur:', error.message)
      process.exit(1)
    })
}

module.exports = { addQuoteColumns, verifySchema }

