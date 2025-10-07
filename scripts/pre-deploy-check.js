#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔍 VÉRIFICATION PRÉ-DÉPLOIEMENT')
console.log('')

let allChecksPass = true

// Vérifier les fichiers requis
const requiredFiles = [
  'package.json',
  'next.config.js',
  'railway.toml',
  'Dockerfile',
  '.dockerignore',
  'prisma/schema.prisma',
  'app/api/health/route.ts'
]

console.log('📁 FICHIERS REQUIS :')
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`)
  } else {
    console.log(`   ❌ ${file} - MANQUANT`)
    allChecksPass = false
  }
})

console.log('')

// Vérifier package.json
console.log('📦 PACKAGE.JSON :')
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  
  // Vérifier les scripts
  const requiredScripts = ['build', 'start', 'postinstall']
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`   ✅ Script "${script}" présent`)
    } else {
      console.log(`   ❌ Script "${script}" manquant`)
      allChecksPass = false
    }
  })
  
  // Vérifier les dépendances critiques
  const criticalDeps = ['@prisma/client', 'prisma', 'next']
  criticalDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`   ✅ Dépendance "${dep}" présente`)
    } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`   ⚠️  Dépendance "${dep}" en devDependencies (devrait être en dependencies)`)
    } else {
      console.log(`   ❌ Dépendance "${dep}" manquante`)
      allChecksPass = false
    }
  })
  
} catch (error) {
  console.log(`   ❌ Erreur lecture package.json: ${error.message}`)
  allChecksPass = false
}

console.log('')

// Vérifier Prisma
console.log('🗄️ PRISMA :')
try {
  const schemaPath = 'prisma/schema.prisma'
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    if (schema.includes('generator client')) {
      console.log('   ✅ Générateur client Prisma configuré')
    } else {
      console.log('   ❌ Générateur client Prisma manquant')
      allChecksPass = false
    }
    
    if (schema.includes('datasource db')) {
      console.log('   ✅ Source de données configurée')
    } else {
      console.log('   ❌ Source de données manquante')
      allChecksPass = false
    }
    
    // Vérifier les modèles principaux
    const requiredModels = ['User', 'Product', 'Sale', 'Customer']
    requiredModels.forEach(model => {
      if (schema.includes(`model ${model}`)) {
        console.log(`   ✅ Modèle ${model} présent`)
      } else {
        console.log(`   ❌ Modèle ${model} manquant`)
        allChecksPass = false
      }
    })
    
  } else {
    console.log('   ❌ Schema Prisma manquant')
    allChecksPass = false
  }
} catch (error) {
  console.log(`   ❌ Erreur vérification Prisma: ${error.message}`)
  allChecksPass = false
}

console.log('')

// Vérifier les variables d'environnement
console.log('🔐 VARIABLES D\'ENVIRONNEMENT :')
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET']
const optionalEnvVars = ['NEXT_PUBLIC_APP_URL', 'NODE_ENV']

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar} définie`)
  } else {
    console.log(`   ⚠️  ${envVar} non définie (sera configurée sur Railway)`)
  }
})

optionalEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar} définie`)
  } else {
    console.log(`   ℹ️  ${envVar} non définie (optionnelle)`)
  }
})

console.log('')

// Vérifier la structure des dossiers
console.log('📂 STRUCTURE DU PROJET :')
const requiredDirs = ['app', 'components', 'lib', 'prisma']
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    console.log(`   ✅ Dossier ${dir}/ présent`)
  } else {
    console.log(`   ❌ Dossier ${dir}/ manquant`)
    allChecksPass = false
  }
})

console.log('')

// Vérifier les migrations
console.log('🔄 MIGRATIONS :')
const migrationsDir = 'prisma/migrations'
if (fs.existsSync(migrationsDir)) {
  const migrations = fs.readdirSync(migrationsDir).filter(f => 
    fs.statSync(path.join(migrationsDir, f)).isDirectory()
  )
  console.log(`   ✅ ${migrations.length} migration(s) trouvée(s)`)
  migrations.slice(-3).forEach(migration => {
    console.log(`   📄 ${migration}`)
  })
} else {
  console.log('   ⚠️  Aucune migration trouvée (utilisez prisma db push)')
}

console.log('')

// Résumé final
console.log('📊 RÉSUMÉ :')
if (allChecksPass) {
  console.log('   ✅ Toutes les vérifications sont passées')
  console.log('   🚀 Votre projet est prêt pour le déploiement Railway !')
  console.log('')
  console.log('🎯 PROCHAINES ÉTAPES :')
  console.log('   1. Installez Railway CLI : npm install -g @railway/cli')
  console.log('   2. Connectez-vous : railway login')
  console.log('   3. Initialisez : railway init')
  console.log('   4. Ajoutez PostgreSQL : railway add postgresql')
  console.log('   5. Configurez les variables : railway variables set JWT_SECRET="..."')
  console.log('   6. Déployez : railway up')
  console.log('')
  console.log('📚 Guide complet : node scripts/deploy-railway.js')
} else {
  console.log('   ❌ Certaines vérifications ont échoué')
  console.log('   🔧 Corrigez les problèmes avant de déployer')
  console.log('')
  console.log('💡 AIDE :')
  console.log('   • Vérifiez que tous les fichiers requis sont présents')
  console.log('   • Assurez-vous que les dépendances sont correctes')
  console.log('   • Vérifiez la configuration Prisma')
}

console.log('')
process.exit(allChecksPass ? 0 : 1)
