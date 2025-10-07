/**
 * Script de test pour vérifier l'encodage des caractères spéciaux
 * Teste la fonction cleanText avec différents types de caractères
 */

// Simuler la fonction cleanText pour les tests
function cleanText(text) {
  if (!text) return ''
  
  // Remplacer les caractères problématiques
  return text
    .replace(/[^\x00-\x7F]/g, (char) => {
      // Mapping des caractères spéciaux courants
      const charMap = {
        'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
        'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
        'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
        'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
        'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
        'ç': 'c', 'ñ': 'n', 'œ': 'oe', 'æ': 'ae',
        'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A',
        'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
        'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I',
        'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O',
        'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U',
        'Ç': 'C', 'Ñ': 'N', 'Œ': 'OE', 'Æ': 'AE',
        // Caractères arabes courants - translittération
        'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h',
        'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's',
        'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a',
        'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm',
        'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y', 'ة': 'a', 'ء': 'a',
        'أ': 'a', 'إ': 'i', 'آ': 'aa', 'ؤ': 'ou', 'ئ': 'i',
        // Autres caractères spéciaux
        '€': 'EUR', '£': 'GBP', '$': 'USD',
        '°': 'deg', '©': '(c)', '®': '(r)', '™': '(tm)',
        '"': '"', '"': '"', "'": "'", "'": "'",
        '–': '-', '—': '-', '…': '...'
      }
      
      return charMap[char] || char
    })
    .trim()
}

function testCharacterEncoding() {
  console.log('🧪 Test de l\'encodage des caractères...')
  console.log('')

  const testCases = [
    // Caractères français
    {
      category: 'Français',
      tests: [
        { input: 'Café', expected: 'Cafe' },
        { input: 'Hôtel', expected: 'Hotel' },
        { input: 'Élève', expected: 'Eleve' },
        { input: 'Français', expected: 'Francais' },
        { input: 'Mère', expected: 'Mere' },
        { input: 'Père', expected: 'Pere' },
        { input: 'Frère', expected: 'Frere' },
        { input: 'Sœur', expected: 'Soeur' },
        { input: 'Noël', expected: 'Noel' },
        { input: 'Château', expected: 'Chateau' }
      ]
    },
    // Noms arabes courants
    {
      category: 'Noms arabes',
      tests: [
        { input: 'محمد', expected: 'mhmd' },
        { input: 'فاطمة', expected: 'fatma' },
        { input: 'أحمد', expected: 'ahmd' },
        { input: 'عائشة', expected: 'aaysha' },
        { input: 'علي', expected: 'ali' },
        { input: 'خديجة', expected: 'khdija' },
        { input: 'حسن', expected: 'hsn' },
        { input: 'زينب', expected: 'zinb' }
      ]
    },
    // Villes marocaines
    {
      category: 'Villes marocaines',
      tests: [
        { input: 'الدار البيضاء', expected: 'aldar albydaa' },
        { input: 'الرباط', expected: 'alrbat' },
        { input: 'فاس', expected: 'fas' },
        { input: 'مراكش', expected: 'mraksh' },
        { input: 'طنجة', expected: 'tnja' },
        { input: 'أكادير', expected: 'akadir' }
      ]
    },
    // Caractères spéciaux
    {
      category: 'Caractères spéciaux',
      tests: [
        { input: '€100', expected: 'EUR100' },
        { input: '25°C', expected: '25degC' },
        { input: 'Société™', expected: 'Societe(tm)' },
        { input: 'Copyright©', expected: 'Copyright(c)' },
        { input: '"Guillemets"', expected: '"Guillemets"' },
        { input: 'Prix—Qualité', expected: 'Prix-Qualite' }
      ]
    },
    // Textes mixtes
    {
      category: 'Textes mixtes',
      tests: [
        { input: 'Fatima Zahra', expected: 'Fatima Zahra' },
        { input: 'Mohammed V', expected: 'Mohammed V' },
        { input: 'Café à 15€', expected: 'Cafe a 15EUR' },
        { input: 'Société SARL', expected: 'Societe SARL' },
        { input: 'Téléphone: +212 522 123 456', expected: 'Telephone: +212 522 123 456' }
      ]
    }
  ]

  let totalTests = 0
  let passedTests = 0

  testCases.forEach(category => {
    console.log(`📂 ${category.category}:`)
    
    category.tests.forEach(test => {
      totalTests++
      const result = cleanText(test.input)
      const passed = result === test.expected
      
      if (passed) {
        passedTests++
        console.log(`  ✅ "${test.input}" → "${result}"`)
      } else {
        console.log(`  ❌ "${test.input}" → "${result}" (attendu: "${test.expected}")`)
      }
    })
    
    console.log('')
  })

  console.log('📊 Résultats:')
  console.log(`  Total: ${totalTests} tests`)
  console.log(`  Réussis: ${passedTests} tests`)
  console.log(`  Échoués: ${totalTests - passedTests} tests`)
  console.log(`  Taux de réussite: ${Math.round((passedTests / totalTests) * 100)}%`)

  if (passedTests === totalTests) {
    console.log('')
    console.log('🎉 Tous les tests sont passés !')
    return true
  } else {
    console.log('')
    console.log('⚠️  Certains tests ont échoué.')
    return false
  }
}

// Exécuter le test
if (require.main === module) {
  const success = testCharacterEncoding()
  process.exit(success ? 0 : 1)
}

module.exports = { testCharacterEncoding, cleanText }
