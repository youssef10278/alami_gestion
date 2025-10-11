// Script de débogage spécialisé pour le problème de logo
// Le système affiche "S" au lieu du vrai logo

console.log('🔍 DÉBOGAGE PROBLÈME LOGO - Le fallback "S" est utilisé')

// Test 1: Vérifier les paramètres de l'entreprise
async function checkCompanySettings() {
  console.log('\n1️⃣ === VÉRIFICATION PARAMÈTRES ENTREPRISE ===')

  try {
    const response = await fetch('/api/settings/company')
    const data = await response.json()

    console.log('📊 Paramètres récupérés:')
    console.log('  📛 Nom entreprise:', data.companyName)
    console.log('  🖼️ Logo URL:', data.companyLogo)
    console.log('  📍 Adresse:', data.companyAddress)
    console.log('  📞 Téléphone:', data.companyPhone)

    if (!data.companyLogo) {
      console.error('❌ PROBLÈME IDENTIFIÉ: Aucun logo configuré!')
      console.log('💡 SOLUTION:')
      console.log('1. Allez sur /dashboard/settings')
      console.log('2. Ajoutez un logo dans "Informations de l\'entreprise"')
      console.log('3. Sauvegardez')
      return { hasLogo: false, data }
    }

    console.log('✅ Logo configuré:', data.companyLogo)
    return { hasLogo: true, data, logoUrl: data.companyLogo }

  } catch (error) {
    console.error('❌ Erreur API:', error)
    return { hasLogo: false, error }
  }
}

// Test 2: Tester l'accessibilité du logo
async function testLogoAccess(logoUrl) {
  console.log('\n2️⃣ === TEST ACCESSIBILITÉ LOGO ===')
  console.log('🔗 URL testée:', logoUrl)

  try {
    const response = await fetch(logoUrl)
    console.log('📡 Réponse:', {
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get('content-type')
    })

    if (!response.ok) {
      console.error('❌ PROBLÈME IDENTIFIÉ: Logo non accessible!')
      console.log('💡 SOLUTIONS:')
      console.log('1. Vérifiez que l\'URL est correcte')
      console.log('2. Testez l\'URL dans le navigateur')
      console.log('3. Vérifiez les permissions du fichier')
      return { accessible: false, status: response.status }
    }

    const blob = await response.blob()
    console.log('✅ Logo accessible:', {
      size: blob.size,
      type: blob.type,
      sizeKB: Math.round(blob.size / 1024)
    })

    return { accessible: true, blob, size: blob.size, type: blob.type }

  } catch (error) {
    console.error('❌ PROBLÈME IDENTIFIÉ: Erreur lors du fetch!')
    console.error('Détails:', error.message)
    console.log('💡 SOLUTIONS:')
    console.log('1. Vérifiez votre connexion internet')
    console.log('2. Vérifiez que l\'URL est complète (avec http/https)')
    console.log('3. Testez avec une autre URL d\'image')
    return { accessible: false, error: error.message }
  }
}

// Test 3: Simuler la conversion base64
async function testBase64Conversion(blob) {
  console.log('\n3️⃣ === TEST CONVERSION BASE64 ===')

  try {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })

    console.log('✅ Conversion base64 réussie:', {
      length: base64.length,
      format: base64.substring(0, 30) + '...'
    })

    return { success: true, base64, length: base64.length }

  } catch (error) {
    console.error('❌ PROBLÈME IDENTIFIÉ: Erreur conversion base64!')
    console.error('Détails:', error)
    return { success: false, error }
  }
}

// Test 4: Intercepter la génération pour voir les logs serveur
function interceptGeneration() {
  console.log('\n4️⃣ === INTERCEPTION GÉNÉRATION ===')

  const originalFetch = window.fetch

  window.fetch = async function(...args) {
    const [url] = args

    if (url.includes('/delivery-note')) {
      console.log('🚚 Génération bon de livraison interceptée!')
      console.log('📋 URL:', url)

      try {
        const response = await originalFetch(...args)

        console.log('📊 Résultat génération:', {
          status: response.status,
          ok: response.ok,
          contentType: response.headers.get('content-type')
        })

        if (response.ok) {
          const blob = await response.clone().blob()
          console.log('📄 PDF généré:', {
            size: blob.size,
            sizeKB: Math.round(blob.size / 1024)
          })

          // Télécharger pour inspection
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `debug-delivery-note-${Date.now()}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)

          console.log('📥 PDF téléchargé pour inspection')
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

  console.log('✅ Interception activée')
  console.log('🎯 Générez maintenant un bon de livraison')
}

// Test 5: Forcer un logo de test
async function forceTestLogo() {
  console.log('\n5️⃣ === FORCE LOGO DE TEST ===')

  // Logo de test public
  const testLogoUrl = 'https://via.placeholder.com/200x200/2563EB/FFFFFF?text=TEST'

  try {
    // Récupérer les paramètres actuels
    const currentResponse = await fetch('/api/settings/company')
    const currentSettings = await currentResponse.json()

    console.log('💾 Sauvegarde des paramètres actuels...')
    const originalLogo = currentSettings.companyLogo

    // Mettre à jour avec le logo de test
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
      console.log('🎯 Générez un bon de livraison maintenant')
      console.log('⏱️ Le logo original sera restauré dans 30 secondes')

      // Restaurer après 30 secondes
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
          console.log('🔄 Logo original restauré')
        } catch (error) {
          console.error('❌ Erreur restauration:', error)
        }
      }, 30000)

      return { success: true, testUrl: testLogoUrl, originalLogo }
    } else {
      console.error('❌ Erreur lors de la configuration du logo de test')
      return { success: false }
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
    return { success: false, error }
  }
}

// Diagnostic complet
async function runCompleteDiagnostic() {
  console.log('🚀 === DIAGNOSTIC COMPLET PROBLÈME LOGO ===\n')

  // 1. Vérifier les paramètres
  const settingsResult = await checkCompanySettings()

  if (!settingsResult.hasLogo) {
    console.log('\n🎯 CONCLUSION: Aucun logo configuré')
    console.log('📝 Action requise: Configurer un logo dans les paramètres')
    return
  }

  // 2. Tester l'accessibilité
  const accessResult = await testLogoAccess(settingsResult.logoUrl)

  if (!accessResult.accessible) {
    console.log('\n🎯 CONCLUSION: Logo configuré mais non accessible')
    console.log('📝 Action requise: Corriger l\'URL ou les permissions')
    return
  }

  // 3. Tester la conversion
  const conversionResult = await testBase64Conversion(accessResult.blob)

  if (!conversionResult.success) {
    console.log('\n🎯 CONCLUSION: Logo accessible mais conversion échoue')
    console.log('📝 Action requise: Vérifier le format de l\'image')
    return
  }

  console.log('\n🎯 CONCLUSION: Logo configuré et accessible')
  console.log('📝 Le problème est probablement côté serveur')
  console.log('🔍 Activons l\'interception pour voir les logs...')

  // 4. Activer l'interception
  interceptGeneration()
}

// Rendre les fonctions disponibles
window.checkCompanySettings = checkCompanySettings
window.testLogoAccess = testLogoAccess
window.forceTestLogo = forceTestLogo
window.interceptGeneration = interceptGeneration
window.runCompleteDiagnostic = runCompleteDiagnostic

console.log('✅ Script de débogage chargé!')
console.log('\n🎯 Fonctions disponibles:')
console.log('- runCompleteDiagnostic() - Diagnostic complet')
console.log('- forceTestLogo() - Forcer un logo de test')
console.log('- interceptGeneration() - Intercepter génération')

// Lancer automatiquement
runCompleteDiagnostic()