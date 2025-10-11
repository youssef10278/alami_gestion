// Script de test pour valider la ligne noire
// À exécuter dans la console du navigateur

console.log('🖤 TEST LIGNE NOIRE - Validation du changement')

async function testBlackLine() {
  console.log('\n🎨 === TEST LIGNE DÉCORATIVE NOIRE ===')
  
  // Intercepter la génération pour télécharger le PDF
  const originalFetch = window.fetch
  
  window.fetch = async function(...args) {
    const [url] = args
    
    if (url.includes('/delivery-note')) {
      console.log('🚚 Génération bon de livraison interceptée!')
      
      try {
        const response = await originalFetch(...args)
        
        if (response.ok) {
          const blob = await response.clone().blob()
          console.log('📄 PDF généré avec ligne noire:', {
            size: blob.size,
            sizeKB: Math.round(blob.size / 1024)
          })
          
          // Télécharger automatiquement pour inspection
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `bon-livraison-ligne-noire-${Date.now()}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          
          console.log('📥 PDF téléchargé pour vérification')
          console.log('🔍 Vérifiez que la ligne sous "BON DE LIVRAISON" est maintenant NOIRE')
          
        } else {
          console.error('❌ Erreur génération:', response.status)
        }
        
        return response
        
      } finally {
        // Restaurer le fetch après 3 secondes
        setTimeout(() => {
          window.fetch = originalFetch
          console.log('🔄 Test terminé')
        }, 3000)
      }
    }
    
    return originalFetch(...args)
  }
  
  console.log('✅ Interception activée!')
  console.log('\n🎯 MAINTENANT:')
  console.log('1. Générez un bon de livraison')
  console.log('2. Le PDF sera téléchargé automatiquement')
  console.log('3. Vérifiez que la ligne décorative est NOIRE au lieu de BLEUE')
  
  console.log('\n📊 CHANGEMENT APPLIQUÉ:')
  console.log('- ❌ Avant: doc.setDrawColor(...primaryColor) // Bleu')
  console.log('- ✅ Après: doc.setDrawColor(...darkGray)    // Noir')
}

// Fonction pour comparer avant/après
function showColorChange() {
  console.log('\n🎨 === COMPARAISON COULEURS ===')
  
  console.log('📊 Couleurs définies:')
  console.log('  🔵 primaryColor: [59, 130, 246]  // Bleu')
  console.log('  ⚫ darkGray:     [64, 64, 64]    // Noir/Gris foncé')
  console.log('  🔘 lightGray:    [156, 163, 175] // Gris clair')
  
  console.log('\n🔄 Changement effectué:')
  console.log('  Ligne décorative sous "BON DE LIVRAISON"')
  console.log('  🔵 AVANT: Bleu (#3B82F6)')
  console.log('  ⚫ APRÈS: Noir/Gris foncé (#404040)')
  
  console.log('\n📍 Position de la ligne:')
  console.log('  - Sous le titre "BON DE LIVRAISON"')
  console.log('  - Épaisseur: 2 points')
  console.log('  - Longueur: 100 points (côté droit)')
}

// Rendre les fonctions disponibles
window.testBlackLine = testBlackLine
window.showColorChange = showColorChange

console.log('✅ Script de test ligne noire chargé!')
console.log('\n🎯 Fonctions disponibles:')
console.log('- testBlackLine() - Tester et télécharger PDF')
console.log('- showColorChange() - Voir les détails du changement')

console.log('\n🖤 MODIFICATION APPLIQUÉE:')
console.log('La ligne décorative sous "BON DE LIVRAISON" est maintenant NOIRE')

// Afficher les détails automatiquement
showColorChange()

console.log('\n🚀 Pour tester:')
console.log('testBlackLine()')
