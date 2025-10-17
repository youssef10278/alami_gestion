#!/usr/bin/env node

console.log('🔍 DEBUG - Analyse des mouvements de stock\n');

// Simuler un appel à l'API pour vérifier les mouvements
const testStockMovements = async () => {
  console.log('📊 VÉRIFICATION DES MOUVEMENTS DE STOCK:');
  console.log('');
  
  console.log('1️⃣ STRUCTURE ATTENDUE:');
  console.log('   • Table: StockMovement');
  console.log('   • Champs: id, productId, quantity, type, reason, reference, createdAt');
  console.log('   • Types: IN (entrée), OUT (sortie)');
  console.log('   • Raisons: "Stock initial", "Vente #xxx", "Ajout manuel", etc.');
  console.log('');
  
  console.log('2️⃣ CRÉATION AUTOMATIQUE:');
  console.log('   ✅ Création produit avec stock > 0 → mouvement "Stock initial"');
  console.log('   ✅ Vente → mouvement "Vente #xxx" (type OUT)');
  console.log('   ✅ Ajout manuel → mouvement "Ajout manuel" (type IN)');
  console.log('');
  
  console.log('3️⃣ PROBLÈME IDENTIFIÉ:');
  console.log('   ❌ Le code utilise userId dans StockMovement');
  console.log('   ❌ Mais le modèle Prisma n\'a pas de champ userId');
  console.log('   ❌ Cela peut causer des erreurs lors de la création');
  console.log('');
  
  console.log('4️⃣ VÉRIFICATIONS À FAIRE:');
  console.log('   • Vérifier si des mouvements existent en base');
  console.log('   • Tester l\'API /api/stock/movements');
  console.log('   • Vérifier les logs d\'erreur lors des ventes');
  console.log('   • Corriger le problème userId si nécessaire');
  console.log('');
  
  console.log('🔧 SOLUTIONS POSSIBLES:');
  console.log('');
  
  console.log('OPTION A - Supprimer userId du code:');
  console.log('   • Modifier app/api/stock/movements/route.ts');
  console.log('   • Supprimer userId: session.userId des créations');
  console.log('   • Supprimer l\'include user des requêtes');
  console.log('');
  
  console.log('OPTION B - Ajouter userId au modèle:');
  console.log('   • Ajouter userId String? au modèle StockMovement');
  console.log('   • Créer une migration Prisma');
  console.log('   • Ajouter la relation avec User');
  console.log('');
  
  console.log('📋 TESTS RECOMMANDÉS:');
  console.log('   1. Créer un produit avec stock initial');
  console.log('   2. Faire une vente');
  console.log('   3. Vérifier la page /dashboard/stock');
  console.log('   4. Contrôler les mouvements récents');
  console.log('');
  
  console.log('🎯 DIAGNOSTIC RAPIDE:');
  console.log('   Si "Aucun mouvement récent" s\'affiche:');
  console.log('   → Les mouvements ne sont pas créés en base');
  console.log('   → Erreur silencieuse lors des ventes');
  console.log('   → Problème avec le champ userId manquant');
  console.log('');
};

testStockMovements();

console.log('💡 PROCHAINE ÉTAPE:');
console.log('   Corriger le problème userId pour permettre la création des mouvements');
console.log('');
