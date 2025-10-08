#!/usr/bin/env node

/**
 * Script d'urgence pour créer/réparer les paramètres de l'entreprise
 * À exécuter sur Railway si l'API ne fonctionne pas
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function emergencyFix() {
  console.log('🚨 SCRIPT D\'URGENCE - Réparation des paramètres')
  console.log('=' .repeat(60))

  try {
    // 1. Vérifier l'état actuel
    console.log('\n1️⃣ Vérification de l\'état actuel...')
    const existing = await prisma.companySettings.findFirst()
    
    if (existing) {
      console.log('✅ Paramètres existants trouvés:')
      console.log('   ID:', existing.id)
      console.log('   Nom:', existing.companyName)
      console.log('   Created:', existing.createdAt)
      console.log('   Updated:', existing.updatedAt)
      
      // Vérifier si tous les champs sont présents
      const missingFields = []
      
      if (!existing.quoteTheme) missingFields.push('quoteTheme')
      if (existing.showValidityPeriod === null || existing.showValidityPeriod === undefined) {
        missingFields.push('showValidityPeriod')
      }
      if (!existing.validityPeriodText) missingFields.push('validityPeriodText')
      if (existing.showTermsAndConditions === null || existing.showTermsAndConditions === undefined) {
        missingFields.push('showTermsAndConditions')
      }
      if (!existing.termsAndConditionsText) missingFields.push('termsAndConditionsText')
      
      if (missingFields.length > 0) {
        console.log('\n⚠️  Champs manquants détectés:', missingFields.join(', '))
        console.log('   Mise à jour des champs manquants...')
        
        await prisma.companySettings.update({
          where: { id: existing.id },
          data: {
            quoteTheme: existing.quoteTheme || 'modern',
            showValidityPeriod: existing.showValidityPeriod ?? true,
            validityPeriodText: existing.validityPeriodText || 'Ce devis est valable 30 jours à compter de la date d\'émission.',
            showTermsAndConditions: existing.showTermsAndConditions ?? true,
            termsAndConditionsText: existing.termsAndConditionsText || 'Conditions générales de vente disponibles sur demande.',
            updatedAt: new Date()
          }
        })
        
        console.log('✅ Champs manquants ajoutés')
      } else {
        console.log('✅ Tous les champs sont présents')
      }
      
      console.log('\n✅ Paramètres OK - Aucune action nécessaire')
      return existing
    }

    // 2. Créer les paramètres s'ils n'existent pas
    console.log('⚠️  Aucun paramètre trouvé')
    console.log('\n2️⃣ Création des paramètres complets...')
    
    const settings = await prisma.companySettings.create({
      data: {
        // Informations de base
        companyName: 'Mon Entreprise',
        companyLogo: null,
        companyICE: null,
        companyEmail: null,
        companyPhone: null,
        companyAddress: null,
        companyWebsite: null,
        companyTaxId: null,
        
        // Préfixes et taxes
        invoicePrefix: 'FAC',
        creditNotePrefix: 'FAV',
        defaultTaxRate: 20,
        
        // Informations bancaires
        bankName: null,
        bankAccount: null,
        bankRIB: null,
        legalMentions: null,
        
        // Design de facture
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
        watermarkText: null,
        customCSS: null,
        
        // Design de devis
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
    console.log('   Created:', settings.createdAt)
    
    return settings

  } catch (error) {
    console.error('\n❌ ERREUR CRITIQUE:', error.message)
    console.error('\nCode:', error.code)
    
    if (error.meta) {
      console.error('\nMeta:', JSON.stringify(error.meta, null, 2))
    }
    
    if (error.stack) {
      console.error('\nStack trace:')
      console.error(error.stack)
    }
    
    throw error
  }
}

async function verifySettings() {
  console.log('\n3️⃣ Vérification finale...')
  
  const settings = await prisma.companySettings.findFirst()
  
  if (!settings) {
    console.error('❌ Aucun paramètre trouvé après création!')
    return false
  }
  
  console.log('✅ Paramètres vérifiés:')
  console.log('   ID:', settings.id)
  console.log('   Company Name:', settings.companyName)
  console.log('   Invoice Prefix:', settings.invoicePrefix)
  console.log('   Credit Note Prefix:', settings.creditNotePrefix)
  console.log('   Default Tax Rate:', settings.defaultTaxRate.toString())
  console.log('   Invoice Theme:', settings.invoiceTheme)
  console.log('   Quote Theme:', settings.quoteTheme)
  console.log('   Primary Color:', settings.primaryColor)
  console.log('   Show Validity Period:', settings.showValidityPeriod)
  console.log('   Show Terms:', settings.showTermsAndConditions)
  
  // Vérifier tous les champs critiques
  const checks = {
    companyName: !!settings.companyName,
    invoicePrefix: !!settings.invoicePrefix,
    creditNotePrefix: !!settings.creditNotePrefix,
    defaultTaxRate: settings.defaultTaxRate !== null,
    invoiceTheme: !!settings.invoiceTheme,
    quoteTheme: !!settings.quoteTheme,
    primaryColor: !!settings.primaryColor,
    showValidityPeriod: settings.showValidityPeriod !== null,
    validityPeriodText: !!settings.validityPeriodText,
    showTermsAndConditions: settings.showTermsAndConditions !== null,
    termsAndConditionsText: !!settings.termsAndConditionsText
  }
  
  const allOk = Object.values(checks).every(v => v === true)
  
  if (!allOk) {
    console.error('\n⚠️  Certains champs sont manquants:')
    for (const [field, ok] of Object.entries(checks)) {
      if (!ok) {
        console.error(`   ❌ ${field}`)
      }
    }
    return false
  }
  
  console.log('\n✅ Tous les champs critiques sont présents')
  return true
}

async function main() {
  console.log('🚨 SCRIPT D\'URGENCE - Alami Gestion')
  console.log('=' .repeat(60))
  console.log('Ce script va créer ou réparer les paramètres de l\'entreprise')
  console.log('=' .repeat(60))
  
  try {
    await emergencyFix()
    const ok = await verifySettings()
    
    console.log('\n' + '=' .repeat(60))
    if (ok) {
      console.log('✅ SUCCÈS - Paramètres OK')
      console.log('\nVous pouvez maintenant:')
      console.log('1. Tester l\'API: GET /api/settings/company')
      console.log('2. Tester le designer: POST /api/settings/quote-design')
      console.log('3. Utiliser l\'application normalement')
    } else {
      console.log('⚠️  ATTENTION - Certains champs manquent')
      console.log('\nActions recommandées:')
      console.log('1. Vérifier les logs ci-dessus')
      console.log('2. Exécuter à nouveau ce script')
      console.log('3. Contacter le support si le problème persiste')
    }
    console.log('=' .repeat(60))
    
  } catch (error) {
    console.log('\n' + '=' .repeat(60))
    console.error('❌ ÉCHEC - Impossible de réparer les paramètres')
    console.error('\nErreur:', error.message)
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

module.exports = { emergencyFix, verifySettings }

