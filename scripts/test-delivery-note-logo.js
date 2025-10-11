// Script de test pour vérifier le logo dans le bon de livraison
// À exécuter dans la console du navigateur

console.log('🧪 Test du logo dans le bon de livraison - Démarrage...')

// Fonction pour tester la génération d'un bon de livraison
async function testDeliveryNoteLogo() {
  console.log('📋 Test de génération du bon de livraison...')
  
  try {
    // Trouver une vente dans l'historique
    const salesRows = document.querySelectorAll('[data-testid="sale-row"], tr')
    console.log(`✅ ${salesRows.length} lignes de vente trouvées`)
    
    if (salesRows.length === 0) {
      console.error('❌ Aucune vente trouvée. Allez sur /dashboard/sales/history')
      return
    }
    
    // Chercher un bouton de bon de livraison
    const deliveryButtons = document.querySelectorAll('button:has(.lucide-truck), button[class*="orange"]')
    console.log(`📦 ${deliveryButtons.length} boutons de livraison trouvés`)
    
    if (deliveryButtons.length === 0) {
      console.error('❌ Aucun bouton de bon de livraison trouvé')
      return
    }
    
    // Tester le premier bouton
    const firstButton = deliveryButtons[0]
    console.log('🖱️ Simulation du clic sur le bouton de livraison...')
    
    // Ajouter un listener pour capturer la requête
    const originalFetch = window.fetch
    window.fetch = async function(...args) {
      const [url, options] = args
      
      if (url.includes('/delivery-note')) {
        console.log('🌐 Requête de bon de livraison détectée:', url)
        
        try {
          const response = await originalFetch(...args)
          
          if (response.ok) {
            console.log('✅ Bon de livraison généré avec succès')
            console.log('📄 Type de contenu:', response.headers.get('content-type'))
            console.log('📏 Taille:', response.headers.get('content-length'), 'bytes')
            
            // Vérifier si c'est bien un PDF
            const contentType = response.headers.get('content-type')
            if (contentType && contentType.includes('application/pdf')) {
              console.log('✅ Format PDF confirmé')
            } else {
              console.warn('⚠️ Format inattendu:', contentType)
            }
          } else {
            console.error('❌ Erreur lors de la génération:', response.status, response.statusText)
          }
          
          return response
        } catch (error) {
          console.error('❌ Erreur de requête:', error)
          throw error
        } finally {
          // Restaurer fetch original
          window.fetch = originalFetch
        }
      }
      
      return originalFetch(...args)
    }
    
    // Cliquer sur le bouton
    firstButton.click()
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

// Fonction pour vérifier les paramètres de l'entreprise
async function checkCompanySettings() {
  console.log('🏢 Vérification des paramètres de l\'entreprise...')
  
  try {
    const response = await fetch('/api/company/settings')
    
    if (response.ok) {
      const settings = await response.json()
      console.log('✅ Paramètres de l\'entreprise récupérés:')
      console.log('  📛 Nom:', settings.name || 'Non défini')
      console.log('  📍 Adresse:', settings.address || 'Non définie')
      console.log('  📞 Téléphone:', settings.phone || 'Non défini')
      console.log('  📧 Email:', settings.email || 'Non défini')
      console.log('  🖼️ Logo:', settings.logo ? '✅ Défini' : '❌ Non défini')
      
      if (settings.logo) {
        console.log('  🔗 URL du logo:', settings.logo)
        
        // Tester si le logo est accessible
        try {
          const logoResponse = await fetch(settings.logo)
          if (logoResponse.ok) {
            console.log('  ✅ Logo accessible')
            console.log('  📏 Taille du logo:', logoResponse.headers.get('content-length'), 'bytes')
            console.log('  🎨 Type:', logoResponse.headers.get('content-type'))
          } else {
            console.warn('  ⚠️ Logo non accessible:', logoResponse.status)
          }
        } catch (error) {
          console.warn('  ⚠️ Erreur lors du test du logo:', error.message)
        }
      } else {
        console.warn('  ⚠️ Aucun logo configuré - un cercle avec initiale sera utilisé')
      }
      
      return settings
    } else {
      console.error('❌ Erreur lors de la récupération des paramètres:', response.status)
      return null
    }
  } catch (error) {
    console.error('❌ Erreur de requête:', error)
    return null
  }
}

// Fonction pour vérifier si on est sur la bonne page
function checkCurrentPage() {
  const currentPath = window.location.pathname
  console.log('📍 Page actuelle:', currentPath)
  
  if (currentPath.includes('/sales/history')) {
    console.log('✅ Sur la page d\'historique des ventes')
    return true
  } else if (currentPath.includes('/sales')) {
    console.log('ℹ️ Sur une page de ventes, mais pas l\'historique')
    console.log('💡 Suggestion: Allez sur /dashboard/sales/history pour tester')
    return false
  } else {
    console.log('ℹ️ Pas sur une page de ventes')
    console.log('💡 Suggestion: Allez sur /dashboard/sales/history pour tester')
    return false
  }
}

// Fonction principale de test
async function runFullTest() {
  console.log('🚀 Démarrage du test complet du bon de livraison...\n')
  
  // 1. Vérifier la page actuelle
  console.log('1️⃣ Vérification de la page...')
  const onCorrectPage = checkCurrentPage()
  console.log('')
  
  // 2. Vérifier les paramètres de l'entreprise
  console.log('2️⃣ Vérification des paramètres de l\'entreprise...')
  const settings = await checkCompanySettings()
  console.log('')
  
  // 3. Tester la génération si on est sur la bonne page
  if (onCorrectPage) {
    console.log('3️⃣ Test de génération du bon de livraison...')
    await testDeliveryNoteLogo()
  } else {
    console.log('3️⃣ Test de génération ignoré (mauvaise page)')
  }
  
  console.log('\n✅ Test terminé!')
  console.log('\n📋 Résumé:')
  console.log('- Page correcte:', onCorrectPage ? '✅' : '❌')
  console.log('- Paramètres entreprise:', settings ? '✅' : '❌')
  console.log('- Logo configuré:', settings?.logo ? '✅' : '❌')
  
  if (!settings?.logo) {
    console.log('\n💡 Pour configurer un logo:')
    console.log('1. Allez sur /dashboard/settings')
    console.log('2. Ajoutez un logo dans les paramètres de l\'entreprise')
    console.log('3. Retestez la génération du bon de livraison')
  }
}

// Rendre les fonctions disponibles globalement
window.testDeliveryNoteLogo = testDeliveryNoteLogo
window.checkCompanySettings = checkCompanySettings
window.runFullTest = runFullTest

console.log('✅ Script de test chargé!')
console.log('\n🎯 Fonctions disponibles:')
console.log('- runFullTest() - Test complet')
console.log('- testDeliveryNoteLogo() - Test de génération')
console.log('- checkCompanySettings() - Vérifier les paramètres')

// Lancer le test automatiquement
runFullTest()
