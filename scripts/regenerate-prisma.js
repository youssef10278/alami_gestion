#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Régénération du client Prisma...');

try {
  // Essayer de supprimer le dossier .prisma s'il existe
  const prismaPath = path.join(process.cwd(), 'node_modules', '.prisma');
  if (fs.existsSync(prismaPath)) {
    console.log('🗑️ Tentative de suppression du dossier .prisma...');
    try {
      fs.rmSync(prismaPath, { recursive: true, force: true });
      console.log('✅ Dossier .prisma supprimé');
    } catch (error) {
      console.log('⚠️ Impossible de supprimer le dossier .prisma (processus en cours)');
    }
  }

  // Régénérer le client Prisma
  console.log('🔧 Génération du client Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('✅ Client Prisma régénéré avec succès !');
  console.log('');
  console.log('🎯 Le client Prisma inclut maintenant :');
  console.log('   • PaymentMethod.CHECK');
  console.log('   • SaleCheckStatus enum');
  console.log('   • SaleCheck model');
  console.log('');
  console.log('💡 Vous pouvez maintenant tester les ventes avec paiement par chèque !');
  
} catch (error) {
  console.error('❌ Erreur lors de la régénération:', error.message);
  console.log('');
  console.log('🔧 Solutions possibles :');
  console.log('   1. Redémarrez votre éditeur de code');
  console.log('   2. Redémarrez le serveur de développement');
  console.log('   3. Exécutez manuellement: npx prisma generate');
  console.log('   4. Redémarrez votre ordinateur si nécessaire');
}
