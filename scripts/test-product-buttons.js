// Script de test pour vérifier le fonctionnement des boutons dans ProductCard
// À exécuter dans la console du navigateur sur la page /dashboard/products

console.log('🧪 Test des boutons ProductCard - Démarrage...')

// Fonction pour tester les boutons
function testProductButtons() {
  console.log('📋 Recherche des cartes de produits...')
  
  // Trouver toutes les cartes de produits
  const productCards = document.querySelectorAll('[data-testid="product-card"], .group.relative.overflow-hidden')
  console.log(`✅ ${productCards.length} cartes de produits trouvées`)
  
  if (productCards.length === 0) {
    console.error('❌ Aucune carte de produit trouvée. Assurez-vous d\'être en mode grille.')
    return
  }
  
  // Tester chaque carte
  productCards.forEach((card, index) => {
    console.log(`\n🔍 Test de la carte ${index + 1}:`)
    
    // Chercher les boutons dans cette carte
    const editButton = card.querySelector('button:has(svg[data-lucide="edit"]), button:has(.lucide-edit)')
    const deleteButton = card.querySelector('button:has(svg[data-lucide="trash-2"]), button:has(.lucide-trash-2)')
    
    console.log(`  📝 Bouton Modifier: ${editButton ? '✅ Trouvé' : '❌ Non trouvé'}`)
    console.log(`  🗑️ Bouton Supprimer: ${deleteButton ? '✅ Trouvé' : '❌ Non trouvé'}`)
    
    if (editButton) {
      const editRect = editButton.getBoundingClientRect()
      console.log(`  📝 Position Modifier: x=${editRect.x}, y=${editRect.y}, width=${editRect.width}, height=${editRect.height}`)
      console.log(`  📝 Visible: ${editRect.width > 0 && editRect.height > 0 ? '✅' : '❌'}`)
      console.log(`  📝 Cliquable: ${editButton.style.pointerEvents !== 'none' ? '✅' : '❌'}`)
    }
    
    if (deleteButton) {
      const deleteRect = deleteButton.getBoundingClientRect()
      console.log(`  🗑️ Position Supprimer: x=${deleteRect.x}, y=${deleteRect.y}, width=${deleteRect.width}, height=${deleteRect.height}`)
      console.log(`  🗑️ Visible: ${deleteRect.width > 0 && deleteRect.height > 0 ? '✅' : '❌'}`)
      console.log(`  🗑️ Cliquable: ${deleteButton.style.pointerEvents !== 'none' ? '✅' : '❌'}`)
    }
  })
}

// Fonction pour simuler un clic sur le premier bouton modifier
function testEditClick() {
  console.log('\n🖱️ Test de clic sur le bouton Modifier...')
  
  const firstEditButton = document.querySelector('button:has(svg[data-lucide="edit"]), button:has(.lucide-edit)')
  
  if (firstEditButton) {
    console.log('✅ Bouton Modifier trouvé, simulation du clic...')
    
    // Ajouter un listener temporaire pour capturer l'événement
    const originalOnClick = firstEditButton.onclick
    firstEditButton.onclick = function(e) {
      console.log('🎯 Clic capturé sur le bouton Modifier!')
      console.log('Event:', e)
      if (originalOnClick) {
        return originalOnClick.call(this, e)
      }
    }
    
    // Simuler le clic
    firstEditButton.click()
  } else {
    console.error('❌ Aucun bouton Modifier trouvé')
  }
}

// Fonction pour vérifier les z-index
function checkZIndex() {
  console.log('\n📏 Vérification des z-index...')
  
  const cards = document.querySelectorAll('.group.relative.overflow-hidden')
  cards.forEach((card, index) => {
    const cardStyle = window.getComputedStyle(card)
    const footer = card.querySelector('[class*="CardFooter"], .flex.gap-2')
    
    if (footer) {
      const footerStyle = window.getComputedStyle(footer)
      console.log(`Carte ${index + 1}:`)
      console.log(`  Card z-index: ${cardStyle.zIndex}`)
      console.log(`  Footer z-index: ${footerStyle.zIndex}`)
      console.log(`  Footer position: ${footerStyle.position}`)
    }
  })
}

// Exécuter les tests
testProductButtons()
checkZIndex()

console.log('\n🎯 Pour tester manuellement:')
console.log('1. testEditClick() - Simule un clic sur le premier bouton Modifier')
console.log('2. testProductButtons() - Re-teste tous les boutons')
console.log('3. checkZIndex() - Vérifie les z-index')

// Rendre les fonctions disponibles globalement
window.testProductButtons = testProductButtons
window.testEditClick = testEditClick
window.checkZIndex = checkZIndex

console.log('✅ Script de test chargé. Utilisez les fonctions ci-dessus pour diagnostiquer.')
