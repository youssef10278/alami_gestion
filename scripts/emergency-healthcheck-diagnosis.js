#!/usr/bin/env node

console.log('🚨 DIAGNOSTIC URGENCE - HEALTHCHECK FAILED')
console.log('')

console.log('❌ PROBLÈME CRITIQUE :')
console.log('   Healthcheck /api/health échoue constamment')
console.log('   → 14 tentatives, toutes "service unavailable"')
console.log('   → Container ne démarre pas ou crash')
console.log('   → Application inaccessible')
console.log('')

console.log('🔍 CAUSES POSSIBLES :')
console.log('')

console.log('1️⃣ SCRIPT START.SH DÉFAILLANT :')
console.log('   • Erreur de syntaxe dans le script généré')
console.log('   • Problème avec les échappements de quotes')
console.log('   • Script non exécutable')
console.log('   • Erreur dans les commandes echo')
console.log('')

console.log('2️⃣ ERREUR MIGRATIONS PRISMA :')
console.log('   • DATABASE_URL toujours manquante')
console.log('   • Prisma migrate deploy échoue')
console.log('   • Prisma db push échoue aussi')
console.log('   • Script exit 1 et container crash')
console.log('')

console.log('3️⃣ PROBLÈME NEXT.JS :')
console.log('   • server.js non trouvé')
console.log('   • Port 3000 non accessible')
console.log('   • Erreur au démarrage Next.js')
console.log('   • Dépendances manquantes')
console.log('')

console.log('4️⃣ PROBLÈME DOCKER :')
console.log('   • Permissions fichiers incorrectes')
console.log('   • Utilisateur nextjs sans droits')
console.log('   • Répertoires manquants')
console.log('   • Variables d\'environnement')
console.log('')

console.log('🚨 ACTIONS URGENTES NÉCESSAIRES :')
console.log('')

console.log('1️⃣ CONSULTER LOGS RAILWAY :')
console.log('   • Aller sur Railway Dashboard')
console.log('   • Projet alami_gestion → Service')
console.log('   • Onglet "Logs" ou "Deployments"')
console.log('   • Voir les erreurs de démarrage')
console.log('')

console.log('2️⃣ VÉRIFIER VARIABLES ENVIRONNEMENT :')
console.log('   • DATABASE_URL configurée ?')
console.log('   • JWT_SECRET présent ?')
console.log('   • NODE_ENV = production ?')
console.log('   • NEXT_PUBLIC_APP_URL définie ?')
console.log('')

console.log('3️⃣ TESTER SCRIPT LOCALEMENT :')
console.log('   • Extraire le script généré')
console.log('   • Vérifier syntaxe bash')
console.log('   • Tester commandes une par une')
console.log('')

console.log('🔧 SOLUTIONS RAPIDES :')
console.log('')

console.log('OPTION A - SIMPLIFIER SCRIPT :')
console.log('   • Retirer vérifications complexes')
console.log('   • Démarrer directement node server.js')
console.log('   • Migrations en post-déploiement')
console.log('')

console.log('OPTION B - RETOUR MÉTHODE SIMPLE :')
console.log('   • CMD ["node", "server.js"] direct')
console.log('   • Pas de script start.sh')
console.log('   • Migrations manuelles après')
console.log('')

console.log('OPTION C - CORRIGER SCRIPT :')
console.log('   • Simplifier les echo commands')
console.log('   • Enlever caractères spéciaux')
console.log('   • Tester syntaxe bash')
console.log('')

console.log('📋 INFORMATIONS NÉCESSAIRES :')
console.log('')

console.log('   🔍 LOGS RAILWAY :')
console.log('   • Messages d\'erreur au démarrage')
console.log('   • Sortie du script start.sh')
console.log('   • Erreurs Prisma ou Next.js')
console.log('   • Code de sortie du container')
console.log('')

console.log('   🌍 VARIABLES ENV :')
console.log('   • DATABASE_URL présente et valide')
console.log('   • Toutes les variables requises')
console.log('   • Format des variables correct')
console.log('')

console.log('⚡ SOLUTION TEMPORAIRE IMMÉDIATE :')
console.log('')

console.log('   🚀 DÉMARRAGE SIMPLE :')
console.log('   • Modifier Dockerfile temporairement')
console.log('   • CMD ["node", "server.js"]')
console.log('   • Retirer script start.sh')
console.log('   • Faire fonctionner l\'app d\'abord')
console.log('')

console.log('   🗄️ MIGRATIONS MANUELLES :')
console.log('   • Une fois app démarrée')
console.log('   • Console Railway')
console.log('   • npx prisma migrate deploy')
console.log('   • npx prisma db push')
console.log('')

console.log('🎯 PRIORITÉS :')
console.log('')

console.log('   1. VOIR LES LOGS (URGENT)')
console.log('   2. IDENTIFIER L\'ERREUR EXACTE')
console.log('   3. SOLUTION RAPIDE POUR DÉMARRER')
console.log('   4. CORRIGER LE SCRIPT APRÈS')
console.log('')

console.log('📞 PROCHAINES ÉTAPES :')
console.log('')

console.log('   1️⃣ Consultez les logs Railway')
console.log('   2️⃣ Partagez l\'erreur exacte')
console.log('   3️⃣ On applique la solution appropriée')
console.log('')

console.log('🚨 L\'APPLICATION EST DOWN - ACTION IMMÉDIATE REQUISE !')
console.log('')

console.log('💡 CONSEIL :')
console.log('   Commencez par les logs Railway pour voir')
console.log('   l\'erreur exacte du script start.sh')
console.log('')

console.log('🔄 FALLBACK READY :')
console.log('   Si logs montrent erreur script,')
console.log('   on revient à CMD ["node", "server.js"]')
console.log('   pour faire fonctionner l\'app rapidement')
