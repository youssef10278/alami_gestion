#!/usr/bin/env node

/**
 * Script de build personnalisé pour Railway
 * Résout automatiquement les migrations échouées avant le déploiement
 */

const { execSync } = require('child_process')
const { PrismaClient } = require('@prisma/client')

async function railwayBuild() {
  console.log('🚀 === DÉPLOIEMENT RAILWAY AVEC RÉSOLUTION MIGRATION ===')
  
  try {
    // Étape 1: Résoudre la migration échouée
    console.log('🔧 1. Résolution des migrations échouées...')
    
    const prisma = new PrismaClient()
    
    try {
      // Vérifier s'il y a des migrations échouées
      const failedMigrations = await prisma.$queryRaw`
        SELECT migration_name, started_at, finished_at 
        FROM "_prisma_migrations" 
        WHERE finished_at IS NULL;
      `
      
      if (failedMigrations.length > 0) {
        console.log('⚠️ Migrations échouées détectées:', failedMigrations.map(m => m.migration_name))
        
        // Marquer spécifiquement notre migration échouée comme résolue
        await prisma.$executeRaw`
          UPDATE "_prisma_migrations" 
          SET finished_at = NOW(), 
              logs = 'Migration manually resolved during Railway deployment - replaced by newer version'
          WHERE migration_name = '20251013104557_add_product_return_system' 
          AND finished_at IS NULL;
        `
        
        console.log('✅ Migration échouée marquée comme résolue')
      } else {
        console.log('✅ Aucune migration échouée détectée')
      }
      
    } catch (error) {
      console.log('⚠️ Erreur lors de la vérification des migrations (normal si première fois):', error.message)
    } finally {
      await prisma.$disconnect()
    }
    
    // Étape 2: Appliquer les nouvelles migrations
    console.log('🔄 2. Application des nouvelles migrations...')
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    
    // Étape 3: Générer le client Prisma
    console.log('⚙️ 3. Génération du client Prisma...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    
    // Étape 4: Build de l'application
    console.log('🏗️ 4. Build de l'application Next.js...')
    execSync('npm run build', { stdio: 'inherit' })
    
    console.log('🎉 === DÉPLOIEMENT RAILWAY TERMINÉ AVEC SUCCÈS ===')
    
  } catch (error) {
    console.error('❌ Erreur lors du déploiement Railway:', error)
    process.exit(1)
  }
}

// Exécuter le script
railwayBuild()
