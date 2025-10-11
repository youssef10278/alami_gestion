// Script de débogage spécialisé pour le logo du bon de livraison
// À exécuter dans la console du navigateur

console.log('🔍 DÉBOGAGE LOGO BON DE LIVRAISON - Démarrage...')

// Fonction pour tester l'API des paramètres
async function testCompanySettingsAPI() {
  console.log('\n1️⃣ Test de l\'API des paramètres de l\'entreprise...')
  
  try {
    const response = await fetch('/api/settings/company')
    console.log('📡 Réponse API:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Données récupérées:')
      console.log('  📛 Nom:', data.companyName)
      console.log('  🖼️ Logo:', data.companyLogo)
      console.log('  📍 Adresse:', data.companyAddress)
      console.log('  📞 Téléphone:', data.companyPhone)
      console.log('  📧 Email:', data.companyEmail)
      
      if (data.companyLogo) {
        console.log('  🔗 URL complète du logo:', data.companyLogo)
        
        // Tester l'accessibilité du logo
        try {
          const logoResponse = await fetch(data.companyLogo)
          console.log('  📡 Test d\'accès au logo:', {
            status: logoResponse.status,
            ok: logoResponse.ok,
            contentType: logoResponse.headers.get('content-type'),
            contentLength: logoResponse.headers.get('content-length')
          })
          
          if (logoResponse.ok) {
            console.log('  ✅ Logo accessible')
          } else {
            console.error('  ❌ Logo non accessible:', logoResponse.status)
          }
        } catch (logoError) {
          console.error('  ❌ Erreur lors du test du logo:', logoError)
        }
      } else {
        console.warn('  ⚠️ Aucun logo configuré dans les paramètres')
      }
      
      return data
    } else {
      console.error('❌ Erreur API:', response.status, response.statusText)
      return null
    }
  } catch (error) {
    console.error('❌ Erreur lors du test de l\'API:', error)
    return null
  }
}

// Fonction pour intercepter et analyser la génération du bon de livraison
async function interceptDeliveryNoteGeneration() {
  console.log('\n2️⃣ Interception de la génération du bon de livraison...')
  
  // Sauvegarder le fetch original
  const originalFetch = window.fetch
  
  // Intercepter les appels fetch
  window.fetch = async function(...args) {
    const [url, options] = args
    
    // Détecter les appels vers l'API de bon de livraison
    if (url.includes('/delivery-note')) {
      console.log('🚚 Appel API bon de livraison détecté:', url)
      console.log('📋 Options:', options)
      
      try {
        const response = await originalFetch(...args)
        
        console.log('📡 Réponse API bon de livraison:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length')
        })
        
        if (response.ok) {
          console.log('✅ Bon de livraison généré avec succès')
          
          // Cloner la réponse pour pouvoir la lire
          const responseClone = response.clone()
          const arrayBuffer = await responseClone.arrayBuffer()
          console.log('📄 Taille du PDF:', arrayBuffer.byteLength, 'bytes')
          
          if (arrayBuffer.byteLength > 0) {
            console.log('✅ PDF non vide généré')
          } else {
            console.warn('⚠️ PDF vide généré')
          }
        } else {
          console.error('❌ Erreur lors de la génération:', response.status)
          const errorText = await response.text()
          console.error('❌ Détails de l\'erreur:', errorText)
        }
        
        return response
      } catch (error) {
        console.error('❌ Erreur lors de l\'appel API:', error)
        throw error
      } finally {
        // Restaurer le fetch original après un délai
        setTimeout(() => {
          window.fetch = originalFetch
          console.log('🔄 Fetch original restauré')
        }, 5000)
      }
    }
    
    return originalFetch(...args)
  }
  
  console.log('✅ Interception activée. Générez un bon de livraison maintenant.')
  console.log('⏱️ L\'interception sera désactivée dans 5 secondes après la première génération.')
}

// Fonction pour vérifier les logs côté serveur (simulation)
function checkServerLogs() {
  console.log('\n3️⃣ Instructions pour vérifier les logs côté serveur...')
  console.log('📋 Ouvrez les logs du serveur et cherchez ces messages:')
  console.log('  📄 "Début génération PDF bon de livraison"')
  console.log('  📋 "Paramètres récupérés:"')
  console.log('  🏢 "Informations entreprise mappées:"')
  console.log('  🖼️ "Tentative d\'ajout du logo:"')
  console.log('  📥 "Chargement du logo depuis:"')
  console.log('  🌐 "Tentative de fetch de l\'image:"')
  console.log('  📡 "Réponse fetch:"')
  console.log('  📦 "Blob créé:"')
  console.log('  ✅ "Image convertie en base64"')
  console.log('  ✅ "Logo ajouté au PDF avec succès"')
}

// Fonction pour tester manuellement le chargement d'image
async function testImageLoading(imageUrl) {
  console.log('\n4️⃣ Test manuel du chargement d\'image...')
  console.log('🔗 URL testée:', imageUrl)
  
  try {
    // Test 1: Fetch simple
    console.log('📡 Test 1: Fetch simple...')
    const response = await fetch(imageUrl)
    console.log('  Status:', response.status)
    console.log('  OK:', response.ok)
    console.log('  Content-Type:', response.headers.get('content-type'))
    console.log('  Content-Length:', response.headers.get('content-length'))
    
    if (!response.ok) {
      console.error('  ❌ Fetch échoué')
      return false
    }
    
    // Test 2: Conversion en blob
    console.log('📦 Test 2: Conversion en blob...')
    const blob = await response.blob()
    console.log('  Taille blob:', blob.size)
    console.log('  Type blob:', blob.type)
    
    // Test 3: Conversion en base64
    console.log('🔄 Test 3: Conversion en base64...')
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    
    console.log('  ✅ Base64 généré, taille:', base64.length, 'caractères')
    console.log('  🎯 Début base64:', base64.substring(0, 50) + '...')
    
    return true
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
    return false
  }
}

// Fonction principale de diagnostic
async function runFullDiagnostic() {
  console.log('🚀 DIAGNOSTIC COMPLET DU LOGO BON DE LIVRAISON\n')
  
  // 1. Tester l'API des paramètres
  const settings = await testCompanySettingsAPI()
  
  // 2. Si un logo est configuré, le tester
  if (settings && settings.companyLogo) {
    await testImageLoading(settings.companyLogo)
  }
  
  // 3. Activer l'interception
  interceptDeliveryNoteGeneration()
  
  // 4. Instructions pour les logs serveur
  checkServerLogs()
  
  console.log('\n✅ Diagnostic terminé!')
  console.log('\n📋 RÉSUMÉ:')
  console.log('- Paramètres récupérés:', settings ? '✅' : '❌')
  console.log('- Logo configuré:', settings?.companyLogo ? '✅' : '❌')
  console.log('- Interception activée:', '✅')
  
  if (!settings?.companyLogo) {
    console.log('\n💡 SOLUTION:')
    console.log('1. Allez sur /dashboard/settings')
    console.log('2. Ajoutez un logo dans "Informations de l\'entreprise"')
    console.log('3. Sauvegardez les modifications')
    console.log('4. Retestez la génération du bon de livraison')
  } else {
    console.log('\n🎯 PROCHAINES ÉTAPES:')
    console.log('1. Générez un bon de livraison maintenant')
    console.log('2. Observez les logs dans cette console')
    console.log('3. Vérifiez les logs du serveur')
    console.log('4. Si le problème persiste, vérifiez l\'URL du logo')
  }
}

// Fonction pour tester avec une URL de logo spécifique
async function testWithSpecificLogo(logoUrl) {
  console.log('\n🧪 Test avec URL spécifique:', logoUrl)
  
  const success = await testImageLoading(logoUrl)
  
  if (success) {
    console.log('✅ L\'URL fonctionne. Le problème pourrait être:')
    console.log('  - Mapping incorrect des champs dans le code')
    console.log('  - Problème d\'async/await')
    console.log('  - Erreur silencieuse dans jsPDF')
  } else {
    console.log('❌ L\'URL ne fonctionne pas. Vérifiez:')
    console.log('  - L\'URL est-elle correcte?')
    console.log('  - Le fichier existe-t-il?')
    console.log('  - Y a-t-il des restrictions CORS?')
  }
}

// Rendre les fonctions disponibles globalement
window.testCompanySettingsAPI = testCompanySettingsAPI
window.interceptDeliveryNoteGeneration = interceptDeliveryNoteGeneration
window.testImageLoading = testImageLoading
window.testWithSpecificLogo = testWithSpecificLogo
window.runFullDiagnostic = runFullDiagnostic

console.log('✅ Script de débogage chargé!')
console.log('\n🎯 Fonctions disponibles:')
console.log('- runFullDiagnostic() - Diagnostic complet')
console.log('- testCompanySettingsAPI() - Test API paramètres')
console.log('- testImageLoading(url) - Test chargement image')
console.log('- testWithSpecificLogo(url) - Test avec URL spécifique')
console.log('- interceptDeliveryNoteGeneration() - Intercepter génération')

// Lancer le diagnostic automatiquement
runFullDiagnostic()
