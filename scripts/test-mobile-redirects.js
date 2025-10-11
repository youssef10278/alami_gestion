/**
 * Script pour tester les redirections et éviter les boucles
 * Usage: node scripts/test-mobile-redirects.js
 */

async function testRedirects() {
  console.log('🔍 Test des redirections pour éviter les boucles')
  console.log('=' .repeat(50))

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  const testCases = [
    {
      name: 'Page racine sans token',
      url: '/',
      expectedRedirect: '/login',
      headers: {}
    },
    {
      name: 'Page racine avec token invalide',
      url: '/',
      expectedRedirect: '/login',
      headers: { 'Cookie': 'auth-token=invalid-token' }
    },
    {
      name: 'Page login sans token',
      url: '/login',
      expectedStatus: 200,
      headers: {}
    },
    {
      name: 'Page dashboard sans token',
      url: '/dashboard',
      expectedRedirect: '/login',
      headers: {}
    }
  ]

  for (const testCase of testCases) {
    console.log(`\n🧪 Test: ${testCase.name}`)
    console.log(`📡 URL: ${baseUrl}${testCase.url}`)
    
    try {
      const response = await fetch(`${baseUrl}${testCase.url}`, {
        method: 'GET',
        headers: testCase.headers,
        redirect: 'manual' // Ne pas suivre les redirections automatiquement
      })

      console.log(`📊 Status: ${response.status}`)
      console.log(`📊 Status Text: ${response.statusText}`)

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location')
        console.log(`🔄 Redirection vers: ${location}`)
        
        if (testCase.expectedRedirect) {
          if (location && location.includes(testCase.expectedRedirect)) {
            console.log('✅ Redirection correcte')
          } else {
            console.log(`❌ Redirection incorrecte. Attendu: ${testCase.expectedRedirect}, Reçu: ${location}`)
          }
        }
      } else if (testCase.expectedStatus && response.status === testCase.expectedStatus) {
        console.log('✅ Status correct')
      } else {
        console.log(`⚠️ Status inattendu: ${response.status}`)
      }

      // Vérifier s'il y a des cookies de session
      const setCookie = response.headers.get('set-cookie')
      if (setCookie) {
        console.log(`🍪 Cookies: ${setCookie}`)
      }

    } catch (error) {
      console.log(`❌ Erreur: ${error.message}`)
    }
  }

  console.log('\n🎯 Recommandations pour mobile:')
  console.log('• Vérifiez que les redirections ne créent pas de boucles')
  console.log('• Testez avec différents navigateurs mobiles')
  console.log('• Vérifiez que les cookies sont correctement définis')
  console.log('• Assurez-vous que le middleware exclut les fichiers statiques')
}

testRedirects().catch(console.error)
