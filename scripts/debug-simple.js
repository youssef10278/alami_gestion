// Script de débogage simple - Copier-coller directement dans la console

console.log('🔍 DÉBOGAGE LOGO BON DE LIVRAISON - Version Simple')

// Test 1: Vérifier les paramètres de l'entreprise
async function testSettings() {
  console.log('\n1️⃣ Test des paramètres de l\'entreprise...')
  try {
    const response = await fetch('/api/settings/company')
    const data = await response.json()
    
    console.log('✅ Paramètres récupérés:')
    console.log('  📛 Nom:', data.companyName)
    console.log('  🖼️ Logo:', data.companyLogo)
    console.log('  📍 Adresse:', data.companyAddress)
    
    if (data.companyLogo) {
      console.log('  🔗 URL complète:', data.companyLogo)
      
      // Tester l'accès au logo
      try {
        const logoTest = await fetch(data.companyLogo)
        console.log('  📡 Test logo - Status:', logoTest.status, logoTest.ok ? '✅' : '❌')
        console.log('  📡 Content-Type:', logoTest.headers.get('content-type'))
      } catch (e) {
        console.error('  ❌ Erreur accès logo:', e.message)
      }
    } else {
      console.warn('  ⚠️ Aucun logo configuré!')
    }
    
    return data
  } catch (error) {
    console.error('❌ Erreur:', error)
    return null
  }
}

// Test 2: Intercepter la génération du bon de livraison
function interceptGeneration() {
  console.log('\n2️⃣ Interception de la génération...')
  
  const originalFetch = window.fetch
  window.fetch = async function(...args) {
    const [url] = args
    
    if (url.includes('/delivery-note')) {
      console.log('🚚 Génération bon de livraison détectée!')
      
      try {
        const response = await originalFetch(...args)
        console.log('📡 Réponse:', response.status, response.ok ? '✅' : '❌')
        
        if (response.ok) {
          const blob = await response.clone().blob()
          console.log('📄 PDF généré, taille:', blob.size, 'bytes')
        }
        
        return response
      } finally {
        // Restaurer après 5 secondes
        setTimeout(() => {
          window.fetch = originalFetch
          console.log('🔄 Interception désactivée')
        }, 5000)
      }
    }
    
    return originalFetch(...args)
  }
  
  console.log('✅ Interception activée pour 5 secondes')
}

// Test 3: Diagnostic complet
async function diagnostic() {
  console.log('🚀 DIAGNOSTIC COMPLET\n')
  
  const settings = await testSettings()
  interceptGeneration()
  
  console.log('\n📋 RÉSUMÉ:')
  console.log('- Paramètres OK:', settings ? '✅' : '❌')
  console.log('- Logo configuré:', settings?.companyLogo ? '✅' : '❌')
  console.log('- Interception active:', '✅')
  
  if (!settings?.companyLogo) {
    console.log('\n💡 SOLUTION:')
    console.log('1. Allez sur /dashboard/settings')
    console.log('2. Configurez un logo dans "Informations entreprise"')
    console.log('3. Sauvegardez et retestez')
  } else {
    console.log('\n🎯 MAINTENANT:')
    console.log('1. Générez un bon de livraison')
    console.log('2. Observez les logs ci-dessus')
  }
}

// Lancer le diagnostic
diagnostic()
