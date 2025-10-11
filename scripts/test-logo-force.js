// Script pour forcer un logo de test dans le bon de livraison
// À exécuter dans la console du navigateur

console.log('🧪 FORCE LOGO TEST - Démarrage...')

// URL d'un logo de test (logo public accessible)
const TEST_LOGO_URL = 'https://via.placeholder.com/200x200/2563EB/FFFFFF?text=LOGO'

// Fonction pour forcer la mise à jour des paramètres avec un logo de test
async function forceTestLogo() {
  console.log('🔧 Forçage d\'un logo de test...')
  
  try {
    // 1. Récupérer les paramètres actuels
    const currentResponse = await fetch('/api/settings/company')
    const currentSettings = await currentResponse.json()
    
    console.log('📋 Paramètres actuels:', {
      name: currentSettings.companyName,
      logo: currentSettings.companyLogo
    })
    
    // 2. Mettre à jour avec le logo de test
    const updateResponse = await fetch('/api/settings/company', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...currentSettings,
        companyLogo: TEST_LOGO_URL
      })
    })
    
    if (updateResponse.ok) {
      const updatedSettings = await updateResponse.json()
      console.log('✅ Logo de test configuré:', TEST_LOGO_URL)
      console.log('📋 Nouveaux paramètres:', updatedSettings)
      return true
    } else {
      console.error('❌ Erreur lors de la mise à jour:', updateResponse.status)
      return false
    }
  } catch (error) {
    console.error('❌ Erreur:', error)
    return false
  }
}

// Fonction pour restaurer les paramètres originaux
async function restoreOriginalSettings(originalLogo = null) {
  console.log('🔄 Restauration des paramètres originaux...')
  
  try {
    const currentResponse = await fetch('/api/settings/company')
    const currentSettings = await currentResponse.json()
    
    const updateResponse = await fetch('/api/settings/company', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...currentSettings,
        companyLogo: originalLogo
      })
    })
    
    if (updateResponse.ok) {
      console.log('✅ Paramètres originaux restaurés')
      return true
    } else {
      console.error('❌ Erreur lors de la restauration:', updateResponse.status)
      return false
    }
  } catch (error) {
    console.error('❌ Erreur:', error)
    return false
  }
}

// Fonction pour tester la génération avec le logo forcé
async function testWithForcedLogo() {
  console.log('🧪 Test avec logo forcé...')
  
  // 1. Sauvegarder les paramètres actuels
  const currentResponse = await fetch('/api/settings/company')
  const currentSettings = await currentResponse.json()
  const originalLogo = currentSettings.companyLogo
  
  console.log('💾 Logo original sauvegardé:', originalLogo)
  
  try {
    // 2. Forcer le logo de test
    const forced = await forceTestLogo()
    if (!forced) {
      console.error('❌ Impossible de forcer le logo de test')
      return
    }
    
    // 3. Attendre un peu pour que les changements soient pris en compte
    console.log('⏱️ Attente de 2 secondes...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 4. Intercepter la génération
    console.log('🎯 Interception de la prochaine génération...')
    const originalFetch = window.fetch
    
    window.fetch = async function(...args) {
      const [url, options] = args
      
      if (url.includes('/delivery-note')) {
        console.log('🚚 Génération avec logo forcé détectée!')
        
        try {
          const response = await originalFetch(...args)
          
          if (response.ok) {
            console.log('✅ Génération réussie avec logo forcé')
            
            // Télécharger et analyser le PDF
            const blob = await response.clone().blob()
            console.log('📄 PDF généré, taille:', blob.size, 'bytes')
            
            // Créer un lien de téléchargement pour inspection manuelle
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'test-logo-force.pdf'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            
            console.log('📥 PDF téléchargé pour inspection manuelle')
          } else {
            console.error('❌ Erreur génération:', response.status)
          }
          
          return response
        } finally {
          // Restaurer le fetch et les paramètres
          window.fetch = originalFetch
          
          setTimeout(async () => {
            await restoreOriginalSettings(originalLogo)
            console.log('🔄 Test terminé, paramètres restaurés')
          }, 1000)
        }
      }
      
      return originalFetch(...args)
    }
    
    console.log('✅ Interception activée')
    console.log('🎯 Générez maintenant un bon de livraison pour tester')
    console.log('📥 Le PDF sera automatiquement téléchargé pour inspection')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
    // Restaurer en cas d'erreur
    await restoreOriginalSettings(originalLogo)
  }
}

// Fonction pour créer un logo de test en base64
function createTestLogoBase64() {
  console.log('🎨 Création d\'un logo de test en base64...')
  
  // Créer un canvas avec un logo simple
  const canvas = document.createElement('canvas')
  canvas.width = 200
  canvas.height = 200
  const ctx = canvas.getContext('2d')
  
  // Fond bleu
  ctx.fillStyle = '#2563EB'
  ctx.fillRect(0, 0, 200, 200)
  
  // Cercle blanc
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(100, 100, 80, 0, 2 * Math.PI)
  ctx.fill()
  
  // Texte
  ctx.fillStyle = '#2563EB'
  ctx.font = 'bold 40px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('LOGO', 100, 110)
  
  // Convertir en base64
  const base64 = canvas.toDataURL('image/png')
  console.log('✅ Logo base64 créé, taille:', base64.length, 'caractères')
  
  return base64
}

// Fonction pour tester avec un logo base64
async function testWithBase64Logo() {
  console.log('🧪 Test avec logo base64...')
  
  const base64Logo = createTestLogoBase64()
  
  // Sauvegarder les paramètres actuels
  const currentResponse = await fetch('/api/settings/company')
  const currentSettings = await currentResponse.json()
  const originalLogo = currentSettings.companyLogo
  
  try {
    // Mettre à jour avec le logo base64
    const updateResponse = await fetch('/api/settings/company', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...currentSettings,
        companyLogo: base64Logo
      })
    })
    
    if (updateResponse.ok) {
      console.log('✅ Logo base64 configuré')
      console.log('🎯 Générez un bon de livraison pour tester')
      
      // Programmer la restauration
      setTimeout(async () => {
        await restoreOriginalSettings(originalLogo)
        console.log('🔄 Paramètres restaurés après test base64')
      }, 30000) // 30 secondes
      
    } else {
      console.error('❌ Erreur lors de la configuration base64')
    }
  } catch (error) {
    console.error('❌ Erreur:', error)
    await restoreOriginalSettings(originalLogo)
  }
}

// Rendre les fonctions disponibles globalement
window.forceTestLogo = forceTestLogo
window.testWithForcedLogo = testWithForcedLogo
window.testWithBase64Logo = testWithBase64Logo
window.restoreOriginalSettings = restoreOriginalSettings

console.log('✅ Script de test forcé chargé!')
console.log('\n🎯 Fonctions disponibles:')
console.log('- testWithForcedLogo() - Test avec logo URL forcé')
console.log('- testWithBase64Logo() - Test avec logo base64')
console.log('- forceTestLogo() - Forcer logo de test')
console.log('- restoreOriginalSettings() - Restaurer paramètres')

console.log('\n💡 UTILISATION:')
console.log('1. testWithForcedLogo() - Lance un test complet avec logo forcé')
console.log('2. Générez un bon de livraison quand demandé')
console.log('3. Le PDF sera téléchargé automatiquement')
console.log('4. Les paramètres seront restaurés automatiquement')

console.log('\n🔗 Logo de test utilisé:', TEST_LOGO_URL)
