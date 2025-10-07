#!/usr/bin/env node

console.log('🧪 TEST BUILD LOCAL')
console.log('')

const { spawn } = require('child_process')

console.log('📋 Simulation du build Railway...')
console.log('')

// Simuler les variables d'environnement de production
process.env.NODE_ENV = 'production'
process.env.SKIP_ENV_VALIDATION = 'true'

console.log('🔧 Variables d\'environnement:')
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`)
console.log(`   SKIP_ENV_VALIDATION: ${process.env.SKIP_ENV_VALIDATION}`)
console.log('')

console.log('🏗️ Lancement du build...')
console.log('   Commande: npm run build')
console.log('')

const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    SKIP_ENV_VALIDATION: 'true'
  }
})

buildProcess.on('close', (code) => {
  console.log('')
  if (code === 0) {
    console.log('✅ BUILD RÉUSSI !')
    console.log('')
    console.log('🎉 Le build fonctionne localement')
    console.log('🚀 Railway devrait maintenant réussir le déploiement')
    console.log('')
    console.log('📊 Prochaines étapes:')
    console.log('   1. Commitez et poussez les corrections')
    console.log('   2. Railway redéploiera automatiquement')
    console.log('   3. Surveillez les logs Railway')
  } else {
    console.log('❌ BUILD ÉCHOUÉ !')
    console.log('')
    console.log(`💥 Code de sortie: ${code}`)
    console.log('')
    console.log('🔧 Actions à prendre:')
    console.log('   1. Vérifiez les erreurs ci-dessus')
    console.log('   2. Corrigez les problèmes identifiés')
    console.log('   3. Relancez le test: node scripts/test-build.js')
  }
})

buildProcess.on('error', (error) => {
  console.log('')
  console.log('❌ ERREUR DE PROCESSUS !')
  console.log(`💥 ${error.message}`)
})
