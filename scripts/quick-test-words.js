// Test rapide de la fonction de conversion en lettres
// Usage: node scripts/quick-test-words.js

// Simuler l'import TypeScript en CommonJS
function numberToWords(amount, currency = 'dirhams', subCurrency = 'centimes') {
  // Copie simplifiée de la fonction pour test rapide
  const units = [
    '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
    'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'
  ]

  const tens = [
    '', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'
  ]

  function convertHundreds(num) {
    if (num === 0) return ''
    
    let result = ''
    
    const hundreds = Math.floor(num / 100)
    if (hundreds > 0) {
      if (hundreds === 1) {
        result += 'cent'
      } else {
        result += units[hundreds] + ' cent'
      }
      if (hundreds > 1 && num % 100 === 0) {
        result += 's'
      }
    }
    
    const remainder = num % 100
    if (remainder > 0) {
      if (result) result += ' '
      
      if (remainder < 20) {
        result += units[remainder]
      } else {
        const tensDigit = Math.floor(remainder / 10)
        const unitsDigit = remainder % 10
        
        if (tensDigit === 7) {
          result += 'soixante'
          if (unitsDigit === 1) {
            result += ' et onze'
          } else if (unitsDigit > 1) {
            result += '-' + units[10 + unitsDigit]
          } else {
            result += '-dix'
          }
        } else if (tensDigit === 9) {
          result += 'quatre-vingt'
          if (unitsDigit === 1) {
            result += ' et onze'
          } else if (unitsDigit > 1) {
            result += '-' + units[10 + unitsDigit]
          } else {
            result += '-dix'
          }
        } else {
          result += tens[tensDigit]
          if (tensDigit === 8 && unitsDigit === 0) {
            result += 's'
          }
          
          if (unitsDigit > 0) {
            if (unitsDigit === 1 && (tensDigit === 2 || tensDigit === 3 || tensDigit === 4 || tensDigit === 5 || tensDigit === 6)) {
              result += ' et un'
            } else {
              result += '-' + units[unitsDigit]
            }
          }
        }
      }
    }
    
    return result
  }

  function convertInteger(num) {
    if (num === 0) return 'zéro'
    
    let result = ''
    let scale = 0
    const scales = ['', 'mille', 'million', 'milliard']
    
    while (num > 0) {
      const chunk = num % 1000
      if (chunk > 0) {
        let chunkText = convertHundreds(chunk)
        
        if (scale === 1 && chunk === 1) {
          chunkText = ''
        }
        
        if (scale > 0) {
          chunkText += ' ' + scales[scale]
          if (scale > 1 && chunk > 1) {
            chunkText += 's'
          }
        }
        
        result = chunkText + (result ? ' ' + result : '')
      }
      
      num = Math.floor(num / 1000)
      scale++
    }
    
    return result
  }

  if (isNaN(amount) || amount < 0) {
    return 'montant invalide'
  }
  
  const integerPart = Math.floor(amount)
  const decimalPart = Math.round((amount - integerPart) * 100)
  
  let result = ''
  
  if (integerPart === 0) {
    result = 'zéro ' + currency
  } else {
    const integerWords = convertInteger(integerPart)
    result = integerWords + ' ' + currency
  }
  
  if (decimalPart > 0) {
    const decimalWords = convertInteger(decimalPart)
    result += ' et ' + decimalWords + ' ' + subCurrency
  }
  
  return result
}

function formatAmountInWords(amount) {
  const amountInWords = numberToWords(amount, 'dirhams', 'centimes')
  return `Arrêté la présente facture à la somme de : ${amountInWords}`
}

// Tests
console.log('🧪 Test rapide de conversion en lettres\n')

const testCases = [
  1234.56,
  5000,
  71,
  80,
  81,
  91,
  100,
  200,
  1000,
  1000000
]

testCases.forEach(amount => {
  console.log(`${amount} → ${numberToWords(amount)}`)
})

console.log('\n📄 Format facture:')
console.log(formatAmountInWords(1234.56))

console.log('\n✅ Test terminé!')
