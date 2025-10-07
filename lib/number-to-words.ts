/**
 * Convertit un nombre en mots en français
 * @param amount - Le montant à convertir
 * @returns Le montant en lettres
 */
export function formatAmountInWords(amount: number): string {
  if (amount === 0) return 'Zéro dirhams'
  
  const integerPart = Math.floor(amount)
  const decimalPart = Math.round((amount - integerPart) * 100)
  
  let result = ''
  
  if (integerPart > 0) {
    result += convertNumberToWords(integerPart)
    result += integerPart === 1 ? ' dirham' : ' dirhams'
  }
  
  if (decimalPart > 0) {
    if (integerPart > 0) result += ' et '
    result += convertNumberToWords(decimalPart)
    result += decimalPart === 1 ? ' centime' : ' centimes'
  }
  
  return result.charAt(0).toUpperCase() + result.slice(1)
}

/**
 * Convertit un nombre entier en mots
 */
function convertNumberToWords(num: number): string {
  if (num === 0) return 'zéro'
  
  const ones = [
    '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
    'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'
  ]
  
  const tens = [
    '', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'
  ]
  
  if (num < 20) {
    return ones[num]
  }
  
  if (num < 100) {
    const ten = Math.floor(num / 10)
    const one = num % 10
    
    if (ten === 7) {
      // Soixante-dix, soixante et onze, etc.
      return one === 0 ? 'soixante-dix' : `soixante-${ones[10 + one]}`
    }
    
    if (ten === 9) {
      // Quatre-vingt-dix, quatre-vingt-onze, etc.
      return one === 0 ? 'quatre-vingt-dix' : `quatre-vingt-${ones[10 + one]}`
    }
    
    if (ten === 8) {
      // Quatre-vingt, quatre-vingt-un, etc.
      return one === 0 ? 'quatre-vingts' : `quatre-vingt-${ones[one]}`
    }
    
    if (ten === 1) {
      // Dix, onze, douze, etc.
      return ones[num]
    }
    
    // Vingt, trente, quarante, etc.
    if (one === 0) {
      return tens[ten]
    }
    
    if (one === 1 && ten !== 8) {
      return `${tens[ten]}-et-un`
    }
    
    return `${tens[ten]}-${ones[one]}`
  }
  
  if (num < 1000) {
    const hundred = Math.floor(num / 100)
    const remainder = num % 100
    
    let result = hundred === 1 ? 'cent' : `${ones[hundred]}-cent`
    if (hundred > 1 && remainder === 0) result += 's'
    
    if (remainder > 0) {
      result += `-${convertNumberToWords(remainder)}`
    }
    
    return result
  }
  
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000)
    const remainder = num % 1000
    
    let result = thousand === 1 ? 'mille' : `${convertNumberToWords(thousand)}-mille`
    
    if (remainder > 0) {
      result += `-${convertNumberToWords(remainder)}`
  }
  
  return result
}

  if (num < 1000000000) {
    const million = Math.floor(num / 1000000)
    const remainder = num % 1000000
    
    let result = million === 1 ? 'un-million' : `${convertNumberToWords(million)}-millions`
    
    if (remainder > 0) {
      result += `-${convertNumberToWords(remainder)}`
    }
    
    return result
  }
  
  // Pour les très gros nombres, on retourne une version simplifiée
  return 'Montant très élevé'
}