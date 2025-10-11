/**
 * Script pour tester l'API de génération de produits directement
 */

async function testAPI() {
  console.log('🧪 Test de l\'API de génération de produits')
  console.log('=' .repeat(50))

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const apiUrl = `${baseUrl}/api/products/generate-test`

    console.log(`📡 URL de l'API: ${apiUrl}`)

    // Test avec un petit nombre d'abord
    console.log('\n🔬 Test avec 100 produits...')
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: En production, il faudrait un vrai token d'authentification
      },
      body: JSON.stringify({ count: 100 })
    })

    console.log(`📊 Status: ${response.status}`)
    console.log(`📊 Status Text: ${response.statusText}`)

    const data = await response.json()
    console.log('📦 Réponse:', JSON.stringify(data, null, 2))

    if (response.ok) {
      console.log('✅ API fonctionne correctement')
      
      // Test avec 5000 produits
      console.log('\n🚀 Test avec 5000 produits...')
      
      const bigResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count: 5000 })
      })

      const bigData = await bigResponse.json()
      console.log('📦 Réponse 5000:', JSON.stringify(bigData, null, 2))

    } else {
      console.log('❌ Erreur API:', data)
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

testAPI().catch(console.error)
