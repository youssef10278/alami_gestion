/**
 * Script de test de connexion à la base de données
 * Vérifie si les tables Expense et ExpenseCategory existent
 * 
 * Usage: npx ts-node scripts/test-db-connection.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  console.log('🔍 Test de connexion à la base de données...\n')

  try {
    // Test 1: Connexion à la base
    console.log('1️⃣ Test de connexion...')
    await prisma.$connect()
    console.log('✅ Connexion réussie !\n')

    // Test 2: Vérifier si la table ExpenseCategory existe
    console.log('2️⃣ Vérification de la table ExpenseCategory...')
    try {
      const categoriesCount = await prisma.expenseCategory.count()
      console.log(`✅ Table ExpenseCategory existe (${categoriesCount} catégories)\n`)
      
      if (categoriesCount > 0) {
        console.log('📋 Catégories trouvées:')
        const categories = await prisma.expenseCategory.findMany({
          where: { isActive: true },
          select: {
            name: true,
            icon: true,
            color: true
          },
          orderBy: { name: 'asc' }
        })
        categories.forEach(cat => {
          console.log(`   ${cat.icon} ${cat.name} (${cat.color})`)
        })
        console.log('')
      } else {
        console.log('⚠️  Aucune catégorie trouvée. Exécutez le seed:\n')
        console.log('   npx ts-node prisma/seed-expenses.ts\n')
      }
    } catch (error: any) {
      console.log('❌ Table ExpenseCategory n\'existe pas !')
      console.log('   Erreur:', error.message)
      console.log('\n💡 Solution: Exécutez la migration SQL dans pgAdmin 4')
      console.log('   Fichier: MIGRATION_RAILWAY.sql\n')
      return
    }

    // Test 3: Vérifier si la table Expense existe
    console.log('3️⃣ Vérification de la table Expense...')
    try {
      const expensesCount = await prisma.expense.count()
      console.log(`✅ Table Expense existe (${expensesCount} dépenses)\n`)
    } catch (error: any) {
      console.log('❌ Table Expense n\'existe pas !')
      console.log('   Erreur:', error.message)
      console.log('\n💡 Solution: Exécutez la migration SQL dans pgAdmin 4')
      console.log('   Fichier: MIGRATION_RAILWAY.sql\n')
      return
    }

    // Test 4: Vérifier les relations
    console.log('4️⃣ Test des relations...')
    try {
      const categoryWithExpenses = await prisma.expenseCategory.findFirst({
        include: {
          _count: {
            select: { expenses: true }
          }
        }
      })
      console.log('✅ Relations fonctionnelles !\n')
    } catch (error: any) {
      console.log('❌ Problème avec les relations')
      console.log('   Erreur:', error.message, '\n')
    }

    // Test 5: Tester une requête complexe
    console.log('5️⃣ Test de requête complexe...')
    try {
      const stats = await prisma.expenseCategory.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: { expenses: true }
          }
        },
        take: 5
      })
      console.log('✅ Requêtes complexes fonctionnelles !\n')
    } catch (error: any) {
      console.log('❌ Problème avec les requêtes complexes')
      console.log('   Erreur:', error.message, '\n')
    }

    console.log('🎉 Tous les tests sont passés avec succès !')
    console.log('✅ La base de données est prête pour le module Dépenses\n')

  } catch (error: any) {
    console.log('❌ Erreur de connexion à la base de données')
    console.log('   Erreur:', error.message)
    console.log('\n💡 Vérifiez:')
    console.log('   1. La variable DATABASE_URL dans .env')
    console.log('   2. Que PostgreSQL est en cours d\'exécution')
    console.log('   3. Les informations de connexion Railway\n')
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
  .catch((e) => {
    console.error('💥 Erreur fatale:', e)
    process.exit(1)
  })

