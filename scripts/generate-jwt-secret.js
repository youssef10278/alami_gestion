#!/usr/bin/env node

const crypto = require('crypto')

console.log('🔐 GÉNÉRATEUR DE JWT SECRET')
console.log('')

// Générer un secret sécurisé
const jwtSecret = crypto.randomBytes(64).toString('hex')

console.log('✨ JWT SECRET GÉNÉRÉ :')
console.log('')
console.log('🔑 Votre JWT Secret sécurisé :')
console.log(`${jwtSecret}`)
console.log('')
console.log('📋 UTILISATION :')
console.log('')
console.log('1️⃣ Dans Railway Variables :')
console.log(`   JWT_SECRET=${jwtSecret}`)
console.log('')
console.log('2️⃣ Dans votre .env local :')
console.log(`   JWT_SECRET="${jwtSecret}"`)
console.log('')
console.log('🔒 SÉCURITÉ :')
console.log('   ✅ 128 caractères hexadécimaux')
console.log('   ✅ Généré cryptographiquement')
console.log('   ✅ Unique et imprévisible')
console.log('   ✅ Conforme aux standards JWT')
console.log('')
console.log('⚠️  IMPORTANT :')
console.log('   • Ne partagez JAMAIS ce secret')
console.log('   • Utilisez un secret différent pour chaque environnement')
console.log('   • Changez-le régulièrement en production')
console.log('   • Ne le commitez jamais dans Git')
console.log('')
console.log('💡 CONSEIL :')
console.log('   Copiez ce secret et collez-le directement dans Railway !')
console.log('')

// Générer aussi quelques alternatives
console.log('🎲 ALTERNATIVES (choisissez-en une) :')
for (let i = 1; i <= 3; i++) {
  const altSecret = crypto.randomBytes(64).toString('hex')
  console.log(`   ${i}. ${altSecret}`)
}

console.log('')
console.log('🚀 Prêt pour Railway !')
