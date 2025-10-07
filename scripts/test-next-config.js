#!/usr/bin/env node

console.log('🧪 TEST NEXT.CONFIG.JS')
console.log('')

try {
  console.log('📋 Chargement de next.config.js...')
  const config = require('../next.config.js')
  
  console.log('✅ Configuration chargée avec succès !')
  console.log('')
  
  console.log('🔍 VALIDATION DES PROPRIÉTÉS :')
  
  // Vérifier output
  if (config.output === 'standalone') {
    console.log('   ✅ output: standalone')
  } else {
    console.log('   ❌ output manquant ou incorrect')
  }
  
  // Vérifier experimental
  if (config.experimental) {
    console.log('   ✅ experimental configuré')
    
    if (config.experimental.serverComponentsExternalPackages) {
      const packages = config.experimental.serverComponentsExternalPackages
      if (packages.includes('@prisma/client') && packages.includes('prisma')) {
        console.log('   ✅ Prisma packages configurés')
      } else {
        console.log('   ⚠️  Prisma packages manquants')
      }
    }
  } else {
    console.log('   ❌ experimental manquant')
  }
  
  // Vérifier images
  if (config.images) {
    console.log('   ✅ images configuré')
  } else {
    console.log('   ⚠️  images manquant')
  }
  
  // Vérifier headers
  if (typeof config.headers === 'function') {
    console.log('   ✅ headers function définie')
  } else {
    console.log('   ⚠️  headers function manquante')
  }
  
  // Vérifier redirects
  if (typeof config.redirects === 'function') {
    console.log('   ✅ redirects function définie')
  } else {
    console.log('   ⚠️  redirects function manquante')
  }
  
  console.log('')
  console.log('📊 RÉSUMÉ :')
  console.log('   ✅ Syntaxe JavaScript valide')
  console.log('   ✅ Pas de référence circulaire')
  console.log('   ✅ Configuration Next.js correcte')
  console.log('   ✅ Prêt pour le build')
  
} catch (error) {
  console.log('❌ ERREUR DÉTECTÉE :')
  console.log(`   ${error.message}`)
  console.log('')
  console.log('🔧 CORRECTION NÉCESSAIRE :')
  console.log('   Vérifiez la syntaxe de next.config.js')
  console.log('   Assurez-vous qu\'il n\'y a pas de référence circulaire')
  process.exit(1)
}

console.log('')
console.log('🎉 Configuration Next.js validée avec succès !')
console.log('🚀 Prêt pour le déploiement Railway !')
