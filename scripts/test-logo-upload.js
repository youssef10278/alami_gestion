const fs = require('fs')
const path = require('path')

console.log('🧪 Test du système d\'upload de logo...\n')

function testFileStructure() {
  console.log('1. Vérification de la structure des fichiers...')
  
  const files = [
    'app/api/upload/logo/route.ts',
    'components/ui/logo-upload.tsx',
    'public/uploads/logos'
  ]
  
  files.forEach(file => {
    const fullPath = path.join(process.cwd(), file)
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath)
      if (stats.isDirectory()) {
        console.log(`✅ Dossier ${file} existe`)
      } else {
        console.log(`✅ Fichier ${file} existe`)
      }
    } else {
      console.log(`❌ ${file} manquant`)
    }
  })
}

function testUploadDirectory() {
  console.log('\n2. Test du dossier d\'upload...')
  
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'logos')
  
  if (fs.existsSync(uploadsDir)) {
    const stats = fs.statSync(uploadsDir)
    if (stats.isDirectory()) {
      console.log('✅ Dossier uploads/logos créé')
      
      // Vérifier les permissions (approximatif)
      try {
        const testFile = path.join(uploadsDir, 'test.txt')
        fs.writeFileSync(testFile, 'test')
        fs.unlinkSync(testFile)
        console.log('✅ Permissions d\'écriture OK')
      } catch (error) {
        console.log('❌ Problème de permissions d\'écriture:', error.message)
      }
    } else {
      console.log('❌ uploads/logos n\'est pas un dossier')
    }
  } else {
    console.log('❌ Dossier uploads/logos n\'existe pas')
  }
}

function testAPIEndpoint() {
  console.log('\n3. Test de l\'endpoint API...')
  
  // Vérifier que le fichier API existe et a la bonne structure
  const apiFile = path.join(process.cwd(), 'app', 'api', 'upload', 'logo', 'route.ts')
  
  if (fs.existsSync(apiFile)) {
    const content = fs.readFileSync(apiFile, 'utf8')
    
    const checks = [
      { name: 'Export POST', pattern: /export async function POST/ },
      { name: 'Export GET', pattern: /export async function GET/ },
      { name: 'Vérification auth', pattern: /getSession/ },
      { name: 'Validation fichier', pattern: /allowedTypes/ },
      { name: 'Limite taille', pattern: /maxSize/ },
      { name: 'Écriture fichier', pattern: /writeFile/ }
    ]
    
    checks.forEach(check => {
      if (check.pattern.test(content)) {
        console.log(`✅ ${check.name}`)
      } else {
        console.log(`❌ ${check.name} manquant`)
      }
    })
  } else {
    console.log('❌ Fichier API manquant')
  }
}

function testComponent() {
  console.log('\n4. Test du composant LogoUpload...')
  
  const componentFile = path.join(process.cwd(), 'components', 'ui', 'logo-upload.tsx')
  
  if (fs.existsSync(componentFile)) {
    const content = fs.readFileSync(componentFile, 'utf8')
    
    const checks = [
      { name: 'Interface Props', pattern: /interface LogoUploadProps/ },
      { name: 'Drag & Drop', pattern: /onDrop|onDragOver/ },
      { name: 'File Input', pattern: /input.*type="file"/ },
      { name: 'Upload Function', pattern: /handleFileSelect/ },
      { name: 'Image Preview', pattern: /Image.*src/ },
      { name: 'Error Handling', pattern: /toast\.error/ }
    ]
    
    checks.forEach(check => {
      if (check.pattern.test(content)) {
        console.log(`✅ ${check.name}`)
      } else {
        console.log(`❌ ${check.name} manquant`)
      }
    })
  } else {
    console.log('❌ Composant LogoUpload manquant')
  }
}

function showInstructions() {
  console.log('\n📋 Instructions pour tester manuellement:')
  console.log('1. Ouvrez http://localhost:3002 dans votre navigateur')
  console.log('2. Connectez-vous avec admin@alami.ma / admin123')
  console.log('3. Allez dans Paramètres > Entreprise')
  console.log('4. Testez l\'upload de logo:')
  console.log('   - Cliquez sur la zone de drop')
  console.log('   - Ou glissez-déposez une image')
  console.log('   - Ou saisissez une URL dans le champ')
  console.log('5. Vérifiez que l\'image s\'affiche correctement')
  console.log('6. Sauvegardez et vérifiez que le logo apparaît dans les factures')
  
  console.log('\n🎯 Formats supportés: PNG, JPG, GIF, WebP (max 5MB)')
  console.log('📁 Fichiers uploadés dans: public/uploads/logos/')
}

// Exécuter tous les tests
function runTests() {
  testFileStructure()
  testUploadDirectory()
  testAPIEndpoint()
  testComponent()
  showInstructions()
  
  console.log('\n🎉 Tests terminés!')
}

runTests()
