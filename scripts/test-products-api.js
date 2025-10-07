/**
 * Script pour tester l'API des produits
 */

const fetch = require('node-fetch')

async function testProductsAPI() {
  try {
    console.log('🧪 Test de l\'API des produits...\n')
    
    // Tester l'endpoint des produits
    const response = await fetch('http://localhost:3000/api/products?limit=10')
    
    if (!response.ok) {
      console.error(`❌ Erreur HTTP: ${response.status} ${response.statusText}`)
      return
    }
    
    const data = await response.json()
    
    console.log('📊 Réponse de l\'API:')
    console.log(`- Nombre de produits: ${data.products?.length || 0}`)
    console.log(`- Total: ${data.total || 'N/A'}`)
    console.log(`- Page: ${data.page || 'N/A'}`)
    
    if (data.products && data.products.length > 0) {
      console.log('\n📦 Premier produit:')
      const firstProduct = data.products[0]
      console.log(`- ID: ${firstProduct.id}`)
      console.log(`- Nom: ${firstProduct.name}`)
      console.log(`- SKU: ${firstProduct.sku || 'N/A'}`)
      console.log(`- Prix: ${firstProduct.price} (type: ${typeof firstProduct.price})`)
      console.log(`- Catégorie: ${firstProduct.category?.name || 'N/A'}`)
      console.log(`- Actif: ${firstProduct.isActive}`)
      
      // Tester la conversion du prix
      const price = typeof firstProduct.price === 'string' ? parseFloat(firstProduct.price) : firstProduct.price
      console.log(`- Prix converti: ${price.toFixed(2)} DH`)
    } else {
      console.log('\n❌ Aucun produit trouvé')
    }
    
    console.log('\n✅ Test de l\'API terminé')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
  }
}

// Exécuter le test
testProductsAPI()
