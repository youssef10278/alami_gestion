/**
 * Script de test pour la fonction de conversion de nombres en lettres
 * Usage: node scripts/test-number-to-words.js
 */

// Import de la fonction (en CommonJS pour Node.js)
const { numberToWords, formatAmountInWords } = require('../lib/number-to-words.ts')

console.log('🧪 Test de la conversion de nombres en lettres\n')

// Tests de base
const testCases = [
  0,
  1,
  2,
  10,
  11,
  20,
  21,
  30,
  70,
  71,
  80,
  81,
  90,
  91,
  100,
  101,
  200,
  300,
  1000,
  1001,
  1234,
  1234.56,
  10000,
  100000,
  1000000,
  1234567.89,
  2000000,
  999999999.99
]

console.log('📊 Tests de conversion basique:')
console.log('================================')

testCases.forEach(amount => {
  const result = numberToWords(amount)
  console.log(`${amount.toString().padStart(12)} → ${result}`)
})

console.log('\n📄 Tests de format facture:')
console.log('============================')

const invoiceTestCases = [
  1234.56,
  5000,
  10000.75,
  999999.99,
  1000000,
  2500000.50
]

invoiceTestCases.forEach(amount => {
  const result = formatAmountInWords(amount)
  console.log(`${amount.toString().padStart(10)} →`)
  console.log(`   ${result}\n`)
})

console.log('✅ Tests terminés!')

// Test de cas spéciaux
console.log('\n🔍 Tests de cas spéciaux:')
console.log('=========================')

const specialCases = [
  { amount: 0, expected: 'zéro dirhams' },
  { amount: 1, expected: 'un dirhams' },
  { amount: 21, expected: 'vingt et un dirhams' },
  { amount: 71, expected: 'soixante et onze dirhams' },
  { amount: 80, expected: 'quatre-vingts dirhams' },
  { amount: 81, expected: 'quatre-vingt-un dirhams' },
  { amount: 91, expected: 'quatre-vingt-onze dirhams' },
  { amount: 100, expected: 'cent dirhams' },
  { amount: 200, expected: 'deux cents dirhams' },
  { amount: 1000, expected: 'mille dirhams' },
  { amount: 1001, expected: 'mille un dirhams' },
  { amount: 1234.56, expected: 'mille deux cent trente-quatre dirhams et cinquante-six centimes' }
]

let passedTests = 0
let totalTests = specialCases.length

specialCases.forEach(testCase => {
  const result = numberToWords(testCase.amount)
  const passed = result === testCase.expected
  
  console.log(`${testCase.amount.toString().padStart(8)} → ${passed ? '✅' : '❌'} ${result}`)
  if (!passed) {
    console.log(`         Attendu: ${testCase.expected}`)
  }
  
  if (passed) passedTests++
})

console.log(`\n📈 Résultats: ${passedTests}/${totalTests} tests réussis`)

if (passedTests === totalTests) {
  console.log('🎉 Tous les tests sont passés!')
} else {
  console.log('⚠️  Certains tests ont échoué')
  process.exit(1)
}
