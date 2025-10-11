// Script de test pour la version améliorée du bon de livraison
// À exécuter dans la console du navigateur

console.log('🚀 TEST BON DE LIVRAISON - VERSION AMÉLIORÉE')

// Fonction pour tester l'API des paramètres avec validation complète
async function testEnhancedCompanySettings() {
  console.log('\n🏢 === TEST PARAMÈTRES ENTREPRISE AMÉLIORÉ ===')
  
  try {
    const response = await fetch('/api/settings/company')
    console.log('📡 Réponse API:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      contentType: response.headers.get('content-type')
    })
    
    if (!response.ok) {
      console.error('❌ Erreur API:', response.status, response.statusText)
      return null
    }
    
    const data = await response.json()
    console.log('✅ Données récupérées avec succès')
    
    // Validation détaillée des paramètres
    const validation = {
      companyName: {
        value: data.companyName,
        valid: !!data.companyName && data.companyName.trim().length > 0,
        status: data.companyName ? '✅' : '❌'
      },
      companyLogo: {
        value: data.companyLogo,
        valid: !!data.companyLogo && data.companyLogo.trim().length > 0,
        status: data.companyLogo ? '✅' : '❌'
      },
      companyAddress: {
        value: data.companyAddress,
        valid: !!data.companyAddress,
        status: data.companyAddress ? '✅' : '⚠️'
      },
      companyPhone: {
        value: data.companyPhone,
        valid: !!data.companyPhone,
        status: data.companyPhone ? '✅' : '⚠️'
      },
      companyEmail: {
        value: data.companyEmail,
        valid: !!data.companyEmail,
        status: data.companyEmail ? '✅' : '⚠️'
      }
    }
    
    console.log('📊 Validation des paramètres:')
    Object.entries(validation).forEach(([key, info]) => {
      console.log(`  ${info.status} ${key}:`, info.value || 'Non configuré')
    })
    
    // Test spécifique du logo
    if (data.companyLogo) {
      console.log('\n🖼️ === TEST SPÉCIFIQUE DU LOGO ===')
      console.log('🔗 URL du logo:', data.companyLogo)
      
      // Validation de l'URL
      try {
        const logoUrl = new URL(data.companyLogo)
        console.log('✅ URL valide:', {
          protocol: logoUrl.protocol,
          hostname: logoUrl.hostname,
          pathname: logoUrl.pathname
        })
        
        // Test d'accessibilité
        console.log('📡 Test d\'accessibilité du logo...')
        const logoResponse = await fetch(data.companyLogo)
        console.log('📊 Résultat du test:', {
          status: logoResponse.status,
          ok: logoResponse.ok,
          contentType: logoResponse.headers.get('content-type'),
          contentLength: logoResponse.headers.get('content-length')
        })
        
        if (logoResponse.ok) {
          const blob = await logoResponse.blob()
          console.log('✅ Logo accessible:', {
            size: blob.size,
            type: blob.type,
            sizeKB: Math.round(blob.size / 1024)
          })
          
          // Test de conversion base64
          console.log('🔄 Test de conversion base64...')
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
          
          return { data, logoTest: 'success', logoBase64: base64 }
        } else {
          console.error('❌ Logo non accessible:', logoResponse.status)
          return { data, logoTest: 'failed', error: 'Logo non accessible' }
        }
        
      } catch (urlError) {
        console.error('❌ URL du logo invalide:', urlError.message)
        return { data, logoTest: 'failed', error: 'URL invalide' }
      }
    } else {
      console.log('\n⚠️ Aucun logo configuré')
      return { data, logoTest: 'no-logo' }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
    return null
  }
}

// Fonction pour intercepter et analyser la génération améliorée
function interceptEnhancedGeneration() {
  console.log('\n🎯 === INTERCEPTION GÉNÉRATION AMÉLIORÉE ===')
  
  const originalFetch = window.fetch
  let interceptActive = true
  
  window.fetch = async function(...args) {
    const [url, options] = args
    
    if (url.includes('/delivery-note') && interceptActive) {
      console.log('🚚 === GÉNÉRATION BON DE LIVRAISON DÉTECTÉE ===')
      console.log('📋 URL:', url)
      console.log('📋 Options:', options)
      
      const startTime = Date.now()
      
      try {
        const response = await originalFetch(...args)
        const endTime = Date.now()
        const duration = endTime - startTime
        
        console.log('📊 Résultat de la génération:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length'),
          duration: duration + 'ms'
        })
        
        if (response.ok) {
          console.log('✅ Génération réussie!')
          
          // Analyser le PDF
          const responseClone = response.clone()
          const arrayBuffer = await responseClone.arrayBuffer()
          const pdfSize = arrayBuffer.byteLength
          
          console.log('📄 Analyse du PDF:', {
            size: pdfSize,
            sizeKB: Math.round(pdfSize / 1024),
            sizeMB: (pdfSize / (1024 * 1024)).toFixed(2)
          })
          
          if (pdfSize > 0) {
            console.log('✅ PDF généré avec contenu')
            
            // Créer un lien de téléchargement pour inspection
            const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `test-enhanced-delivery-note-${Date.now()}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            
            console.log('📥 PDF téléchargé pour inspection manuelle')
          } else {
            console.warn('⚠️ PDF vide généré')
          }
        } else {
          console.error('❌ Erreur de génération:', response.status)
          const errorText = await response.text()
          console.error('❌ Détails:', errorText)
        }
        
        return response
        
      } catch (error) {
        console.error('❌ Erreur lors de l\'interception:', error)
        throw error
      } finally {
        // Désactiver l'interception après 10 secondes
        setTimeout(() => {
          if (interceptActive) {
            window.fetch = originalFetch
            interceptActive = false
            console.log('🔄 Interception désactivée automatiquement')
          }
        }, 10000)
      }
    }
    
    return originalFetch(...args)
  }
  
  console.log('✅ Interception activée pour 10 secondes')
  console.log('🎯 Générez maintenant un bon de livraison pour voir les logs détaillés')
  
  // Fonction pour désactiver manuellement
  window.stopIntercept = () => {
    if (interceptActive) {
      window.fetch = originalFetch
      interceptActive = false
      console.log('🔄 Interception désactivée manuellement')
    }
  }
}

// Fonction de diagnostic complet amélioré
async function runEnhancedDiagnostic() {
  console.log('🚀 === DIAGNOSTIC COMPLET AMÉLIORÉ ===\n')
  
  // 1. Test des paramètres entreprise
  const settingsResult = await testEnhancedCompanySettings()
  
  // 2. Résumé du diagnostic
  console.log('\n📊 === RÉSUMÉ DU DIAGNOSTIC ===')
  
  if (!settingsResult) {
    console.log('❌ Impossible de récupérer les paramètres')
    console.log('\n💡 SOLUTION:')
    console.log('1. Vérifiez que l\'API /api/settings/company fonctionne')
    console.log('2. Vérifiez votre connexion')
    console.log('3. Consultez les logs du serveur')
    return
  }
  
  const { data, logoTest } = settingsResult
  
  console.log('✅ Paramètres récupérés:', !!data)
  console.log('📛 Nom entreprise:', data.companyName || 'Non configuré')
  console.log('🖼️ Logo configuré:', logoTest === 'success' ? '✅ Oui' : logoTest === 'no-logo' ? '❌ Non' : '⚠️ Problème')
  
  // 3. Recommandations
  console.log('\n🎯 === RECOMMANDATIONS ===')
  
  if (logoTest === 'no-logo') {
    console.log('📝 Actions requises:')
    console.log('1. Allez sur /dashboard/settings')
    console.log('2. Ajoutez un logo dans "Informations de l\'entreprise"')
    console.log('3. Sauvegardez les modifications')
    console.log('4. Relancez ce diagnostic')
  } else if (logoTest === 'failed') {
    console.log('🔧 Problème avec le logo:')
    console.log('1. Vérifiez que l\'URL du logo est correcte')
    console.log('2. Vérifiez que le fichier existe et est accessible')
    console.log('3. Essayez avec un autre format d\'image (PNG, JPEG)')
    console.log('4. Vérifiez les permissions d\'accès au fichier')
  } else if (logoTest === 'success') {
    console.log('✅ Logo configuré et accessible!')
    console.log('🎯 Prêt pour la génération du bon de livraison')
    
    // 4. Activer l'interception
    interceptEnhancedGeneration()
  }
  
  console.log('\n🔍 Fonctions disponibles:')
  console.log('- testEnhancedCompanySettings() - Test paramètres détaillé')
  console.log('- interceptEnhancedGeneration() - Intercepter génération')
  console.log('- stopIntercept() - Arrêter interception')
}

// Rendre les fonctions disponibles globalement
window.testEnhancedCompanySettings = testEnhancedCompanySettings
window.interceptEnhancedGeneration = interceptEnhancedGeneration
window.runEnhancedDiagnostic = runEnhancedDiagnostic

console.log('✅ Script de test amélioré chargé!')
console.log('\n🎯 Lancer le diagnostic complet:')
console.log('runEnhancedDiagnostic()')

// Lancer automatiquement le diagnostic
runEnhancedDiagnostic()
