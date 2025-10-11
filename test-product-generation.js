/**
 * Script de test pour vérifier la génération de produits
 */

async function testProductGeneration() {
  console.log('🧪 Test de génération de produits')
  console.log('=' .repeat(50))

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const apiUrl = `${baseUrl}/api/products/generate-test`

    console.log(`📡 URL de l'API: ${apiUrl}`)

    // Test avec 10 produits d'abord
    console.log('\n🔬 Test avec 10 produits...')
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ count: 10 })
    })

    console.log(`📊 Status: ${response.status}`)
    console.log(`📊 Status Text: ${response.statusText}`)

    const data = await response.json()
    console.log('📦 Réponse:', JSON.stringify(data, null, 2))

    if (response.ok) {
      console.log('✅ API fonctionne correctement')
      console.log(`✅ ${data.stats.testProducts} produits créés`)
      
      // Test avec 100 produits
      console.log('\n🚀 Test avec 100 produits...')
      
      const bigResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count: 100 })
      })

      const bigData = await bigResponse.json()
      console.log('📦 Réponse 100:', JSON.stringify(bigData, null, 2))

      if (bigResponse.ok) {
        console.log(`✅ ${bigData.stats.testProducts} produits créés avec succès`)
        
        // Test final avec 5000 produits
        console.log('\n🚀 Test final avec 5000 produits...')
        
        const finalResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ count: 5000 })
        })

        const finalData = await finalResponse.json()
        console.log('📦 Réponse 5000:', JSON.stringify(finalData, null, 2))

        if (finalResponse.ok) {
          console.log(`🎉 SUCCÈS: ${finalData.stats.testProducts} produits créés en ${finalData.stats.duration}`)
        } else {
          console.log('❌ Erreur avec 5000 produits:', finalData)
        }
      } else {
        console.log('❌ Erreur avec 100 produits:', bigData)
      }
    } else {
      console.log('❌ Erreur API:', data)
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

// Exécuter le test
testProductGeneration().catch(console.error)
