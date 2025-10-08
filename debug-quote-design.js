// Script de débogage pour l'API quote-design
const testData = {
  quoteTheme: 'modern',
  primaryColor: '#2563EB',
  secondaryColor: '#10B981',
  tableHeaderColor: '#10B981',
  sectionColor: '#10B981',
  accentColor: '#F59E0B',
  textColor: '#1F2937',
  headerTextColor: '#FFFFFF',
  sectionTextColor: '#FFFFFF',
  backgroundColor: '#FFFFFF',
  headerStyle: 'gradient',
  logoPosition: 'left',
  logoSize: 'medium',
  fontFamily: 'helvetica',
  fontSize: 'normal',
  borderRadius: 'rounded',
  showWatermark: false,
  watermarkText: 'DEVIS',
  customCSS: '',
  showValidityPeriod: true,
  validityPeriodText: 'Ce devis est valable 30 jours à compter de la date d\'émission.',
  showTermsAndConditions: true,
  termsAndConditionsText: 'Conditions générales de vente disponibles sur demande.'
}

console.log('🧪 Test des données pour l\'API quote-design:')
console.log('Données:', JSON.stringify(testData, null, 2))
console.log('Nombre de champs:', Object.keys(testData).length)

// Test de validation des champs requis
const requiredFields = [
  'quoteTheme', 'primaryColor', 'secondaryColor', 'tableHeaderColor', 
  'sectionColor', 'accentColor', 'textColor', 'headerTextColor', 
  'sectionTextColor', 'backgroundColor', 'headerStyle', 'logoPosition', 
  'logoSize', 'fontFamily', 'fontSize', 'borderRadius', 'showWatermark', 
  'watermarkText', 'customCSS', 'showValidityPeriod', 'validityPeriodText', 
  'showTermsAndConditions', 'termsAndConditionsText'
]

console.log('\n🔍 Vérification des champs requis:')
requiredFields.forEach(field => {
  const exists = testData.hasOwnProperty(field)
  const value = testData[field]
  console.log(`${exists ? '✅' : '❌'} ${field}: ${value} (${typeof value})`)
})

console.log('\n📊 Résumé:')
console.log(`Champs requis: ${requiredFields.length}`)
console.log(`Champs présents: ${Object.keys(testData).length}`)
console.log(`Champs manquants: ${requiredFields.filter(f => !testData.hasOwnProperty(f)).length}`)
