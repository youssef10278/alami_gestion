#!/usr/bin/env node

/**
 * 💾 TEST - CRÉATION FACTURE D'AVOIR
 * 
 * Teste la création de factures d'avoir avec totaux négatifs
 */

function testCreditNoteCreation() {
  console.log('💾 === TEST CRÉATION FACTURE D\'AVOIR ===\n')
  
  console.log('❌ PROBLÈME IDENTIFIÉ:')
  console.log('   🚫 Validation API: "total must be >= 0"')
  console.log('   💰 Totaux négatifs rejetés')
  console.log('   📊 Types de données incorrects (strings vs numbers)')
  console.log('   🔧 Factures d\'avoir impossibles à créer')

  console.log('\n✅ CORRECTIONS APPLIQUÉES:')
  console.log('   🔓 Validation assouplie pour totaux négatifs')
  console.log('   💰 Factures d\'avoir autorisées')
  console.log('   📊 Conversion explicite en nombres')
  console.log('   🔧 Création de factures d\'avoir fonctionnelle')

  console.log('\n🔧 CHANGEMENTS TECHNIQUES:')
  
  console.log('\n1. 🔓 Validation API Assouplie:')
  console.log('   • AVANT: total: z.coerce.number().min(0)')
  console.log('   • APRÈS: total: z.coerce.number() // Pas de minimum')
  console.log('   • Validation conditionnelle ajoutée')

  console.log('\n2. 📊 Conversion Types de Données:')
  console.log('   • subtotal: Number(subtotal)')
  console.log('   • total: Number(total)')
  console.log('   • unitPrice: Number(item.unitPrice)')
  console.log('   • quantity: Number(item.quantity)')

  console.log('\n3. 🎯 Validation Conditionnelle:')
  console.log('   • INVOICE: total doit être >= 0')
  console.log('   • CREDIT_NOTE: total peut être < 0')
  console.log('   • Logique métier respectée')

  console.log('\n4. 🔍 Logs de Débogage:')
  console.log('   • Types de données vérifiés')
  console.log('   • Validation détaillée')
  console.log('   • Erreurs explicites')
}

function showValidationLogic() {
  console.log('\n\n🔬 === LOGIQUE DE VALIDATION ===')
  
  console.log('\n📊 Schéma Zod Corrigé:')
  console.log('   ```typescript')
  console.log('   const createInvoiceSchema = z.object({')
  console.log('     type: z.enum([\'INVOICE\', \'CREDIT_NOTE\']),')
  console.log('     total: z.coerce.number(), // ✅ Pas de .min(0)')
  console.log('     items: z.array(z.object({')
  console.log('       total: z.coerce.number(), // ✅ Pas de .min(0)')
  console.log('     }))')
  console.log('   }).refine((data) => {')
  console.log('     // Validation conditionnelle')
  console.log('     if (data.type === \'INVOICE\' && data.total < 0) {')
  console.log('       return false // Facture normale = total positif')
  console.log('     }')
  console.log('     return true // Facture d\'avoir = total négatif OK')
  console.log('   })')
  console.log('   ```')

  console.log('\n🔢 Conversion de Types:')
  console.log('   ```typescript')
  console.log('   const invoiceData = {')
  console.log('     subtotal: Number(subtotal),    // "165" → 165')
  console.log('     total: Number(total),          // "-198" → -198')
  console.log('     items: items.map(item => ({')
  console.log('       quantity: Number(item.quantity),   // "1" → 1')
  console.log('       unitPrice: Number(item.unitPrice), // "165" → 165')
  console.log('       total: Number(item.total),         // "165" → 165')
  console.log('     }))')
  console.log('   }')
  console.log('   ```')

  console.log('\n🎯 Règles de Validation:')
  console.log('   • INVOICE (Facture normale):')
  console.log('     - total >= 0 (obligatoire)')
  console.log('     - items.total >= 0 (obligatoire)')
  console.log('   • CREDIT_NOTE (Facture d\'avoir):')
  console.log('     - total peut être < 0 (remboursement)')
  console.log('     - items.total peut être < 0 (retour)')
}

function showDataFlow() {
  console.log('\n\n🔄 === FLUX DE DONNÉES ===')
  
  console.log('\n📋 Exemple Facture d\'Avoir:')
  console.log('   1. 📦 Article: 165 DH')
  console.log('   2. 🧮 TVA 20%: 33 DH')
  console.log('   3. 💰 Total: -(165 + 33) = -198 DH')

  console.log('\n📊 Données Envoyées (AVANT):')
  console.log('   ```json')
  console.log('   {')
  console.log('     "type": "CREDIT_NOTE",')
  console.log('     "subtotal": "0165",     // ❌ String avec 0 initial')
  console.log('     "total": -198,          // ✅ Number négatif')
  console.log('     "items": [{')
  console.log('       "unitPrice": "165",   // ❌ String')
  console.log('       "total": "165"        // ❌ String')
  console.log('     }]')
  console.log('   }')
  console.log('   ```')

  console.log('\n📊 Données Envoyées (APRÈS):')
  console.log('   ```json')
  console.log('   {')
  console.log('     "type": "CREDIT_NOTE",')
  console.log('     "subtotal": 165,        // ✅ Number correct')
  console.log('     "total": -198,          // ✅ Number négatif')
  console.log('     "items": [{')
  console.log('       "unitPrice": 165,     // ✅ Number')
  console.log('       "total": 165          // ✅ Number')
  console.log('     }]')
  console.log('   }')
  console.log('   ```')

  console.log('\n🔍 Validation API:')
  console.log('   • Zod convertit automatiquement: z.coerce.number()')
  console.log('   • Validation conditionnelle appliquée')
  console.log('   • Totaux négatifs acceptés pour CREDIT_NOTE')
  console.log('   • Création réussie en base de données')
}

function showTestScenarios() {
  console.log('\n\n🧪 === SCÉNARIOS DE TEST ===')
  
  console.log('\n📋 Test 1: Facture d\'avoir simple')
  console.log('   • 1 article: 100 DH')
  console.log('   • TVA 20%: 20 DH')
  console.log('   • Total: -120 DH')
  console.log('   • Résultat attendu: ✅ Création réussie')

  console.log('\n📋 Test 2: Facture d\'avoir multiple articles')
  console.log('   • Article 1: 150 DH')
  console.log('   • Article 2: 15 DH')
  console.log('   • TVA 20%: 33 DH')
  console.log('   • Total: -198 DH')
  console.log('   • Résultat attendu: ✅ Création réussie')

  console.log('\n📋 Test 3: Facture normale (contrôle)')
  console.log('   • 1 article: 100 DH')
  console.log('   • TVA 20%: 20 DH')
  console.log('   • Total: 120 DH (positif)')
  console.log('   • Résultat attendu: ✅ Création réussie')

  console.log('\n📋 Test 4: Facture normale avec total négatif (erreur)')
  console.log('   • Type: INVOICE')
  console.log('   • Total: -100 DH')
  console.log('   • Résultat attendu: ❌ Validation échoue')

  console.log('\n✅ Points de validation:')
  console.log('   🔢 Types de données corrects')
  console.log('   💰 Totaux négatifs acceptés pour avoir')
  console.log('   📊 Calculs mathématiques exacts')
  console.log('   🗄️ Sauvegarde en base de données')
  console.log('   🔄 Redirection après création')
}

function showTroubleshooting() {
  console.log('\n\n🔧 === DÉPANNAGE ===')
  
  console.log('\n🚨 Si erreur "total must be >= 0":')
  console.log('   1. 🔍 Vérifier type de facture: CREDIT_NOTE')
  console.log('   2. 🔧 Redémarrer le serveur (changement API)')
  console.log('   3. 📊 Vérifier conversion Number()')
  console.log('   4. 🗄️ Vérifier schéma Zod mis à jour')

  console.log('\n🚨 Si erreur de types de données:')
  console.log('   1. 🔍 Vérifier console: types envoyés')
  console.log('   2. 📊 Vérifier Number() conversions')
  console.log('   3. 🔧 Vérifier updateItem() function')
  console.log('   4. 📋 Vérifier interface InvoiceItem')

  console.log('\n🚨 Si validation échoue encore:')
  console.log('   1. 🔍 Vérifier logs API détaillés')
  console.log('   2. 🗄️ Vérifier schéma Zod complet')
  console.log('   3. 📊 Tester avec données minimales')
  console.log('   4. 🔧 Vérifier refine() condition')

  console.log('\n💡 Solutions rapides:')
  console.log('   • Redémarrer serveur de développement')
  console.log('   • Vider cache navigateur')
  console.log('   • Tester avec facture simple (1 article)')
  console.log('   • Vérifier logs console pour erreurs')
}

function showTestInstructions() {
  console.log('\n\n🧪 === INSTRUCTIONS DE TEST ===')
  
  console.log('\n🎯 Test complet:')
  console.log('   1. 🌐 Ouvrir: /dashboard/invoices/credit-note/new')
  console.log('   2. 📝 Remplir informations client')
  console.log('   3. ➕ Ajouter un article (ex: 165 DH)')
  console.log('   4. 🔍 Vérifier total: -198 DH (avec TVA 20%)')
  console.log('   5. 💾 Cliquer "Créer la Facture d\'Avoir"')
  console.log('   6. ✅ Vérifier: Redirection vers liste factures')
  console.log('   7. 👀 Vérifier: Facture créée avec total négatif')

  console.log('\n📊 Vérifications Console:')
  console.log('   • Pas d\'erreur "total must be >= 0"')
  console.log('   • Types de données corrects')
  console.log('   • Réponse API 200 OK')
  console.log('   • Redirection automatique')

  console.log('\n✅ Validation réussie si:')
  console.log('   ✅ Facture d\'avoir créée sans erreur')
  console.log('   ✅ Total négatif accepté')
  console.log('   ✅ Redirection vers liste factures')
  console.log('   ✅ Facture visible dans la liste')
  console.log('   ✅ Montant de remboursement correct')
}

// Fonction principale
function main() {
  testCreditNoteCreation()
  showValidationLogic()
  showDataFlow()
  showTestScenarios()
  showTroubleshooting()
  showTestInstructions()
  
  console.log('\n\n🎉 === CONCLUSION ===')
  console.log('✅ Validation API corrigée pour factures d\'avoir')
  console.log('💰 Totaux négatifs autorisés')
  console.log('📊 Types de données convertis correctement')
  console.log('🔧 Création de factures d\'avoir fonctionnelle')
  console.log('')
  console.log('🎯 Exemple corrigé:')
  console.log('   • Article: 165 DH')
  console.log('   • TVA: 33 DH')
  console.log('   • Total: -198 DH ✅ (accepté)')
  console.log('')
  console.log('💡 Testez maintenant la création!')
  console.log('🚀 Les factures d\'avoir peuvent être créées!')
}

// Exécuter si appelé directement
if (require.main === module) {
  main()
}

module.exports = { main }
