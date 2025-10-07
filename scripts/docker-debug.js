#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🐳 DIAGNOSTIC DOCKER POUR RAILWAY')
console.log('')

// Vérifier les fichiers Docker
console.log('📁 FICHIERS DOCKER :')
const dockerFiles = ['Dockerfile', '.dockerignore']
dockerFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file} présent`)
  } else {
    console.log(`   ❌ ${file} manquant`)
  }
})

console.log('')

// Vérifier la structure Prisma
console.log('🗄️ STRUCTURE PRISMA :')
const prismaFiles = [
  'prisma/schema.prisma',
  'prisma/migrations'
]

prismaFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file} présent`)
    if (file === 'prisma/migrations') {
      const migrations = fs.readdirSync(file).filter(f => 
        fs.statSync(path.join(file, f)).isDirectory()
      )
      console.log(`      📄 ${migrations.length} migration(s)`)
    }
  } else {
    console.log(`   ❌ ${file} manquant`)
  }
})

console.log('')

// Vérifier package.json
console.log('📦 SCRIPTS PACKAGE.JSON :')
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  
  const importantScripts = ['build', 'start', 'postinstall']
  importantScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`   ✅ ${script}: ${packageJson.scripts[script]}`)
    } else {
      console.log(`   ❌ ${script} manquant`)
    }
  })
  
  // Vérifier les dépendances Prisma
  console.log('')
  console.log('🔧 DÉPENDANCES PRISMA :')
  const prismaDeps = ['@prisma/client', 'prisma']
  prismaDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`   ✅ ${dep} en dependencies`)
    } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`   ⚠️  ${dep} en devDependencies`)
    } else {
      console.log(`   ❌ ${dep} manquant`)
    }
  })
  
} catch (error) {
  console.log(`   ❌ Erreur lecture package.json: ${error.message}`)
}

console.log('')

// Vérifier next.config.js
console.log('⚙️ NEXT.CONFIG.JS :')
if (fs.existsSync('next.config.js')) {
  console.log('   ✅ next.config.js présent')
  try {
    const config = fs.readFileSync('next.config.js', 'utf8')
    if (config.includes('output: \'standalone\'')) {
      console.log('   ✅ Mode standalone activé')
    } else {
      console.log('   ⚠️  Mode standalone non configuré')
    }
    if (config.includes('@prisma/client')) {
      console.log('   ✅ Prisma dans serverComponentsExternalPackages')
    } else {
      console.log('   ⚠️  Prisma non configuré dans external packages')
    }
  } catch (error) {
    console.log(`   ❌ Erreur lecture next.config.js: ${error.message}`)
  }
} else {
  console.log('   ❌ next.config.js manquant')
}

console.log('')

// Vérifier .dockerignore
console.log('🚫 .DOCKERIGNORE :')
if (fs.existsSync('.dockerignore')) {
  console.log('   ✅ .dockerignore présent')
  const dockerignore = fs.readFileSync('.dockerignore', 'utf8')
  const importantIgnores = ['node_modules', '.next', '.git']
  importantIgnores.forEach(ignore => {
    if (dockerignore.includes(ignore)) {
      console.log(`   ✅ ${ignore} ignoré`)
    } else {
      console.log(`   ⚠️  ${ignore} non ignoré`)
    }
  })
} else {
  console.log('   ❌ .dockerignore manquant')
}

console.log('')

// Analyser le Dockerfile
console.log('🐳 ANALYSE DOCKERFILE :')
if (fs.existsSync('Dockerfile')) {
  const dockerfile = fs.readFileSync('Dockerfile', 'utf8')
  
  // Vérifier les étapes importantes
  const checks = [
    { pattern: /COPY.*prisma/, name: 'Copie du dossier prisma' },
    { pattern: /prisma generate/, name: 'Génération client Prisma' },
    { pattern: /npm ci/, name: 'Installation dépendances' },
    { pattern: /npm run build/, name: 'Build de l\'application' },
    { pattern: /EXPOSE 3000/, name: 'Exposition du port 3000' },
    { pattern: /NODE_ENV=production/, name: 'Variable NODE_ENV' }
  ]
  
  checks.forEach(check => {
    if (check.pattern.test(dockerfile)) {
      console.log(`   ✅ ${check.name}`)
    } else {
      console.log(`   ❌ ${check.name} manquant`)
    }
  })
  
  // Vérifier l'ordre des étapes
  const lines = dockerfile.split('\n')
  let prismaIndex = -1
  let generateIndex = -1
  let buildIndex = -1
  
  lines.forEach((line, index) => {
    if (line.includes('COPY') && line.includes('prisma')) prismaIndex = index
    if (line.includes('prisma generate')) generateIndex = index
    if (line.includes('npm run build')) buildIndex = index
  })
  
  console.log('')
  console.log('📋 ORDRE DES ÉTAPES :')
  if (prismaIndex < generateIndex && generateIndex < buildIndex) {
    console.log('   ✅ Ordre correct : prisma copy → generate → build')
  } else {
    console.log('   ❌ Ordre incorrect des étapes')
    console.log(`      Prisma copy: ligne ${prismaIndex + 1}`)
    console.log(`      Prisma generate: ligne ${generateIndex + 1}`)
    console.log(`      Build: ligne ${buildIndex + 1}`)
  }
  
} else {
  console.log('   ❌ Dockerfile manquant')
}

console.log('')

// Recommandations
console.log('💡 RECOMMANDATIONS :')
console.log('')
console.log('   🔧 Pour corriger l\'erreur Prisma :')
console.log('   1. Assurez-vous que prisma/ est copié AVANT npm ci')
console.log('   2. Exécutez prisma generate APRÈS npm ci')
console.log('   3. Vérifiez que @prisma/client est en dependencies')
console.log('')
console.log('   🚀 Pour optimiser le build :')
console.log('   1. Utilisez un Dockerfile multi-stage')
console.log('   2. Activez le mode standalone dans next.config.js')
console.log('   3. Configurez serverComponentsExternalPackages')
console.log('')
console.log('   🔒 Pour la sécurité :')
console.log('   1. Utilisez un utilisateur non-root')
console.log('   2. Minimisez la taille de l\'image finale')
console.log('   3. Excluez les fichiers sensibles avec .dockerignore')
console.log('')
console.log('🎯 PROCHAINES ÉTAPES :')
console.log('   1. Commitez les corrections du Dockerfile')
console.log('   2. Poussez vers GitHub')
console.log('   3. Railway redéploiera automatiquement')
console.log('   4. Surveillez les logs de build')
console.log('')
console.log('✨ Le Dockerfile a été corrigé pour résoudre l\'erreur Prisma !')
