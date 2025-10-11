// Script de test pour valider la correction du logo
// À exécuter dans la console du navigateur

console.log('🎉 TEST CORRECTION LOGO - Version Buffer/Node.js')

// Test de validation de la correction
async function testLogoFix() {
  console.log('\n🔧 === VALIDATION DE LA CORRECTION ===')
  
  try {
    // 1. Vérifier les paramètres
    console.log('1️⃣ Vérification des paramètres...')
    const response = await fetch('/api/settings/company')
    const data = await response.json()
    
    console.log('📊 Paramètres entreprise:')
    console.log('  📛 Nom:', data.companyName)
    console.log('  🖼️ Logo:', data.companyLogo || '❌ Non configuré')
    
    if (!data.companyLogo) {
      console.log('\n⚠️ Aucun logo configuré!')
      console.log('💡 Pour tester la correction:')
      console.log('1. Allez sur /dashboard/settings')
      console.log('2. Ajoutez cette URL de test: https://via.placeholder.com/200x200/2563EB/FFFFFF?text=FIXED')
      console.log('3. Sauvegardez et revenez tester')
      return { hasLogo: false }
    }
    
    // 2. Tester l'accessibilité du logo
    console.log('\n2️⃣ Test d\'accessibilité du logo...')
    const logoResponse = await fetch(data.companyLogo)
    console.log('📡 Réponse logo:', {
      status: logoResponse.status,
      ok: logoResponse.ok,
      contentType: logoResponse.headers.get('content-type')
    })
    
    if (!logoResponse.ok) {
      console.log('❌ Logo non accessible!')
      console.log('💡 Utilisez une URL publique accessible')
      return { hasLogo: true, accessible: false }
    }
    
    console.log('✅ Logo accessible!')
    
    // 3. Intercepter la génération pour voir les nouveaux logs
    console.log('\n3️⃣ Activation de l\'interception...')
    
    const originalFetch = window.fetch
    let interceptActive = true
    
    window.fetch = async function(...args) {
      const [url] = args
      
      if (url.includes('/delivery-note') && interceptActive) {
        console.log('\n🚚 === GÉNÉRATION AVEC CORRECTION DÉTECTÉE ===')
        
        const startTime = Date.now()
        
        try {
          const response = await originalFetch(...args)
          const endTime = Date.now()
          
          console.log('📊 Résultat génération:', {
            status: response.status,
            ok: response.ok,
            duration: (endTime - startTime) + 'ms'
          })
          
          if (response.ok) {
            const blob = await response.clone().blob()
            console.log('📄 PDF généré:', {
              size: blob.size,
              sizeKB: Math.round(blob.size / 1024)
            })
            
            // Télécharger le PDF pour inspection
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `delivery-note-fixed-${Date.now()}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            
            console.log('📥 PDF téléchargé pour vérification manuelle')
            console.log('🔍 Vérifiez si le vrai logo apparaît maintenant!')
          } else {
            console.error('❌ Erreur génération:', response.status)
          }
          
          return response
          
        } finally {
          // Désactiver l'interception après utilisation
          setTimeout(() => {
            if (interceptActive) {
              window.fetch = originalFetch
              interceptActive = false
              console.log('🔄 Interception désactivée')
            }
          }, 3000)
        }
      }
      
      return originalFetch(...args)
    }
    
    console.log('✅ Interception activée!')
    console.log('\n🎯 MAINTENANT:')
    console.log('1. Générez un bon de livraison')
    console.log('2. Observez les nouveaux logs avec Buffer/base64')
    console.log('3. Vérifiez que le vrai logo apparaît dans le PDF')
    
    // Fonction pour arrêter l'interception manuellement
    window.stopLogoTest = () => {
      if (interceptActive) {
        window.fetch = originalFetch
        interceptActive = false
        console.log('🔄 Test arrêté manuellement')
      }
    }
    
    return { hasLogo: true, accessible: true, interceptActive: true }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
    return { error }
  }
}

// Test rapide pour forcer un logo de test
async function setTestLogo() {
  console.log('\n🧪 === CONFIGURATION LOGO DE TEST ===')
  
  const testLogoUrl = 'https://via.placeholder.com/200x200/10B981/FFFFFF?text=FIXED'
  
  try {
    // Récupérer les paramètres actuels
    const currentResponse = await fetch('/api/settings/company')
    const currentSettings = await currentResponse.json()
    
    console.log('💾 Sauvegarde des paramètres actuels...')
    const originalLogo = currentSettings.companyLogo
    
    // Configurer le logo de test
    const updateResponse = await fetch('/api/settings/company', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...currentSettings,
        companyLogo: testLogoUrl
      })
    })
    
    if (updateResponse.ok) {
      console.log('✅ Logo de test configuré:', testLogoUrl)
      console.log('🎯 Testez maintenant la génération du bon de livraison')
      console.log('⏱️ Le logo original sera restauré dans 60 secondes')
      
      // Restaurer automatiquement après 60 secondes
      setTimeout(async () => {
        try {
          await fetch('/api/settings/company', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...currentSettings,
              companyLogo: originalLogo
            })
          })
          console.log('🔄 Logo original restauré automatiquement')
        } catch (error) {
          console.error('❌ Erreur lors de la restauration:', error)
        }
      }, 60000)
      
      return { success: true, testUrl: testLogoUrl, originalLogo }
    } else {
      console.error('❌ Erreur lors de la configuration')
      return { success: false }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
    return { success: false, error }
  }
}

// Fonction principale
async function runLogoFixTest() {
  console.log('🚀 === TEST COMPLET CORRECTION LOGO ===\n')
  
  const result = await testLogoFix()
  
  if (!result.hasLogo) {
    console.log('\n💡 Voulez-vous configurer un logo de test?')
    console.log('Exécutez: setTestLogo()')
  } else if (!result.accessible) {
    console.log('\n💡 Logo configuré mais non accessible')
    console.log('Exécutez: setTestLogo() pour utiliser un logo de test')
  } else if (result.interceptActive) {
    console.log('\n✅ Tout est prêt pour le test!')
    console.log('🎯 Générez un bon de livraison maintenant')
  }
}

// Rendre les fonctions disponibles
window.testLogoFix = testLogoFix
window.setTestLogo = setTestLogo
window.runLogoFixTest = runLogoFixTest

console.log('✅ Script de test de correction chargé!')
console.log('\n🎯 Fonctions disponibles:')
console.log('- runLogoFixTest() - Test complet')
console.log('- setTestLogo() - Configurer logo de test')
console.log('- stopLogoTest() - Arrêter le test')

console.log('\n🔧 CORRECTION APPLIQUÉE:')
console.log('- ❌ FileReader (navigateur) → ✅ Buffer (Node.js)')
console.log('- ❌ Blob conversion → ✅ ArrayBuffer + base64')
console.log('- ✅ Détection MIME améliorée')

// Lancer automatiquement
runLogoFixTest()
