#!/usr/bin/env node

/**
 * Script de vérification avant déploiement
 * Vérifie que tout est en ordre avant de déployer sur Railway
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  console.log('\n📊 Vérification de la base de données...')
  
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Connexion à la base de données OK')
    return true
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message)
    return false
  }
}

async function checkTables() {
  console.log('\n📋 Vérification des tables...')
  
  const tables = [
    { name: 'User', model: prisma.user },
    { name: 'Product', model: prisma.product },
    { name: 'Customer', model: prisma.customer },
    { name: 'Sale', model: prisma.sale },
    { name: 'CompanySettings', model: prisma.companySettings },
  ]
  
  let allOk = true
  
  for (const table of tables) {
    try {
      await table.model.count()
      console.log(`✅ Table ${table.name} existe`)
    } catch (error) {
      console.error(`❌ Table ${table.name} manquante ou erreur:`, error.message)
      allOk = false
    }
  }
  
  return allOk
}

async function checkUsers() {
  console.log('\n👥 Vérification des utilisateurs...')
  
  try {
    const userCount = await prisma.user.count()
    const ownerCount = await prisma.user.count({ where: { role: 'OWNER' } })
    
    console.log(`   Total utilisateurs: ${userCount}`)
    console.log(`   Propriétaires: ${ownerCount}`)
    
    if (ownerCount === 0) {
      console.warn('⚠️  Aucun propriétaire trouvé - Créez un compte OWNER')
      return false
    }
    
    console.log('✅ Au moins un propriétaire existe')
    return true
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des utilisateurs:', error.message)
    return false
  }
}

async function checkCompanySettings() {
  console.log('\n🏢 Vérification des paramètres de l\'entreprise...')
  
  try {
    const settings = await prisma.companySettings.findFirst()
    
    if (!settings) {
      console.warn('⚠️  Aucun paramètre d\'entreprise trouvé')
      console.log('   Création des paramètres par défaut...')
      
      const newSettings = await prisma.companySettings.create({
        data: {
          companyName: 'Mon Entreprise',
          invoicePrefix: 'FAC',
          creditNotePrefix: 'FAV',
          defaultTaxRate: 20,
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
          quoteTheme: 'modern',
          showValidityPeriod: true,
          validityPeriodText: 'Ce devis est valable 30 jours à compter de la date d\'émission.',
          showTermsAndConditions: true,
          termsAndConditionsText: 'Conditions générales de vente disponibles sur demande.'
        }
      })
      
      console.log('✅ Paramètres créés:', newSettings.id)
      return true
    }
    
    console.log('✅ Paramètres trouvés:', settings.companyName)
    return true
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des paramètres:', error.message)
    return false
  }
}

async function checkEnvironment() {
  console.log('\n🔐 Vérification des variables d\'environnement...')
  
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
  ]
  
  const optional = [
    'NEXT_PUBLIC_APP_URL',
    'NODE_ENV',
  ]
  
  let allOk = true
  
  for (const varName of required) {
    if (process.env[varName]) {
      console.log(`✅ ${varName} défini`)
    } else {
      console.error(`❌ ${varName} manquant (REQUIS)`)
      allOk = false
    }
  }
  
  for (const varName of optional) {
    if (process.env[varName]) {
      console.log(`✅ ${varName} défini`)
    } else {
      console.warn(`⚠️  ${varName} non défini (optionnel)`)
    }
  }
  
  return allOk
}

async function getStats() {
  console.log('\n📈 Statistiques...')
  
  try {
    const stats = {
      users: await prisma.user.count(),
      products: await prisma.product.count(),
      customers: await prisma.customer.count(),
      sales: await prisma.sale.count(),
      categories: await prisma.category.count(),
    }
    
    console.log(`   Utilisateurs: ${stats.users}`)
    console.log(`   Produits: ${stats.products}`)
    console.log(`   Clients: ${stats.customers}`)
    console.log(`   Ventes: ${stats.sales}`)
    console.log(`   Catégories: ${stats.categories}`)
    
    return stats
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des stats:', error.message)
    return null
  }
}

async function main() {
  console.log('🚀 Vérification avant déploiement - Alami Gestion')
  console.log('=' .repeat(60))
  
  const checks = {
    environment: await checkEnvironment(),
    database: await checkDatabase(),
    tables: await checkTables(),
    users: await checkUsers(),
    companySettings: await checkCompanySettings(),
  }
  
  await getStats()
  
  console.log('\n' + '=' .repeat(60))
  console.log('📋 Résumé des vérifications:')
  console.log('=' .repeat(60))
  
  for (const [check, result] of Object.entries(checks)) {
    const icon = result ? '✅' : '❌'
    console.log(`${icon} ${check}: ${result ? 'OK' : 'ÉCHEC'}`)
  }
  
  const allPassed = Object.values(checks).every(v => v === true)
  
  console.log('\n' + '=' .repeat(60))
  if (allPassed) {
    console.log('✅ Toutes les vérifications sont passées!')
    console.log('🚀 Prêt pour le déploiement!')
    console.log('\nCommandes de déploiement:')
    console.log('  git add .')
    console.log('  git commit -m "Fix: API settings robustness"')
    console.log('  git push')
  } else {
    console.log('❌ Certaines vérifications ont échoué')
    console.log('⚠️  Corrigez les erreurs avant de déployer')
    process.exit(1)
  }
  console.log('=' .repeat(60))
}

main()
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

