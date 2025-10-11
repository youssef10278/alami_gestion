/**
 * Script de test pour le nouveau système de génération en masse
 */

async function testBulkGeneration() {
  console.log('🧪 Test du nouveau système de génération en masse')
  console.log('=' .repeat(60))

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const apiUrl = `${baseUrl}/api/products/generate-bulk`

    console.log(`📡 URL de l'API: ${apiUrl}`)

    // Test avec 100 produits d'abord
    console.log('\n🔬 Test avec 100 produits...')
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 secondes timeout

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ count: 100 }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    console.log(`📊 Status: ${response.status}`)
    console.log(`📊 Status Text: ${response.statusText}`)

    const data = await response.json()
    console.log('📦 Réponse:', JSON.stringify(data, null, 2))

    if (response.ok) {
      console.log('✅ API fonctionne correctement')
      console.log(`✅ Génération ID: ${data.generationId}`)
      
      // Tester le suivi de progression
      console.log('\n📊 Test du suivi de progression...')
      await testProgressTracking(data.generationId, baseUrl)
      
    } else {
      console.log('❌ Erreur API:', data)
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

async function testProgressTracking(generationId, baseUrl) {
  const maxAttempts = 30 // 30 secondes max
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${baseUrl}/api/products/generate-bulk?id=${generationId}`)
      const data = await response.json()

      if (response.ok) {
        const progress = data.progress
        console.log(`📊 Progression: ${progress.completed}/${progress.total} (${progress.percentage}%) - ${progress.status}`)
        
        if (progress.status === 'completed') {
          console.log(`🎉 SUCCÈS: ${progress.completed} produits créés en ${progress.endTime - progress.startTime}ms`)
          break
        } else if (progress.status === 'error') {
          console.log(`❌ ERREUR: ${progress.error}`)
          break
        }
      } else {
        console.log('❌ Erreur lors de la récupération du statut:', data.error)
        break
      }
    } catch (error) {
      console.error('❌ Erreur de polling:', error)
    }

    attempts++
    await new Promise(resolve => setTimeout(resolve, 1000)) // Attendre 1 seconde
  }

  if (attempts >= maxAttempts) {
    console.log('⏰ Timeout: La génération prend trop de temps')
  }
}

// Exécuter le test
testBulkGeneration().catch(console.error)
