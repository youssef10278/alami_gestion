// Test simple avec ES modules
import { numberToWords, formatAmountInWords } from '../lib/number-to-words.ts'

console.log('🧪 Test de la fonction de conversion\n')

// Tests de base
const tests = [
  1234.56,
  5000,
  71,
  80,
  81,
  91,
  100,
  200,
  1000
]

tests.forEach(amount => {
  const result = numberToWords(amount)
  console.log(`${amount} → "${result}"`)
})

console.log('\n📄 Format facture:')
console.log(formatAmountInWords(1234.56))

console.log('\n✅ Test terminé!')
