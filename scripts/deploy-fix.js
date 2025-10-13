/**
 * Script de déploiement pour résoudre la migration échouée
 * À exécuter avant le déploiement sur Railway
 */

const { PrismaClient } = require('@prisma/client')

async function fixFailedMigration() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔧 Résolution de la migration échouée...')
    
    // Marquer la migration échouée comme résolue
    await prisma.$executeRaw`
      UPDATE "_prisma_migrations" 
      SET finished_at = NOW(), 
          logs = 'Migration manually resolved - replaced by 20251013113457_add_return_system_v2'
      WHERE migration_name = '20251013104557_add_product_return_system' 
      AND finished_at IS NULL;
    `
    
    console.log('✅ Migration échouée marquée comme résolue')
    
    // Vérifier le statut
    const migration = await prisma.$queryRaw`
      SELECT migration_name, started_at, finished_at, logs 
      FROM "_prisma_migrations" 
      WHERE migration_name = '20251013104557_add_product_return_system';
    `
    
    console.log('📊 Statut de la migration:', migration)
    
  } catch (error) {
    console.error('❌ Erreur lors de la résolution:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  fixFailedMigration()
}

module.exports = { fixFailedMigration }
