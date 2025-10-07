// Test simple pour vérifier que la page des paramètres fonctionne
console.log('🧪 Test de la page des paramètres...')

// Simuler une requête vers l'API des paramètres
async function testSettingsAPI() {
  try {
    console.log('1. Test de l\'API des paramètres de l\'entreprise...')
    
    // Simuler une requête GET
    const response = await fetch('http://localhost:3002/api/settings/company', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: En production, il faudrait un token d'authentification
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ API GET fonctionne:', {
        companyName: data.companyName,
        companyICE: data.companyICE,
        invoicePrefix: data.invoicePrefix
      })
    } else {
      console.log('⚠️ API GET retourne:', response.status, response.statusText)
      console.log('Note: Ceci est normal si l\'authentification est requise')
    }

  } catch (error) {
    console.log('⚠️ Erreur de connexion à l\'API:', error.message)
    console.log('Note: Assurez-vous que le serveur fonctionne sur le port 3002')
  }
}

// Test des composants
function testComponents() {
  console.log('\n2. Test des composants...')
  
  // Vérifier que les fichiers existent
  const fs = require('fs')
  const path = require('path')
  
  const files = [
    'components/ui/tabs.tsx',
    'components/settings/CompanySettings.tsx',
    'app/dashboard/settings/page.tsx',
    'app/api/settings/company/route.ts'
  ]
  
  files.forEach(file => {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      console.log(`✅ ${file} existe`)
    } else {
      console.log(`❌ ${file} manquant`)
    }
  })
}

async function runTests() {
  console.log('🚀 Démarrage des tests...\n')
  
  testComponents()
  await testSettingsAPI()
  
  console.log('\n🎉 Tests terminés!')
  console.log('\n📋 Instructions pour tester manuellement:')
  console.log('1. Ouvrez http://localhost:3002 dans votre navigateur')
  console.log('2. Connectez-vous avec admin@alami.ma / admin123')
  console.log('3. Cliquez sur "Paramètres" dans la sidebar')
  console.log('4. Vérifiez que les onglets s\'affichent correctement')
  console.log('5. Testez la sauvegarde des paramètres de l\'entreprise')
}

runTests()
