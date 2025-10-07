/**
 * Script pour vérifier les utilisateurs existants
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  console.log('🔍 Vérification des utilisateurs existants...')

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données')
      return
    }

    console.log(`✅ ${users.length} utilisateur(s) trouvé(s) :`)
    console.log('')

    users.forEach((user, index) => {
      console.log(`👤 Utilisateur ${index + 1}:`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Nom: ${user.name || 'Non défini'}`)
      console.log(`   Rôle: ${user.role}`)
      console.log(`   Créé le: ${user.createdAt.toLocaleDateString('fr-FR')}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Erreur lors de la vérification :', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter la vérification
if (require.main === module) {
  checkUsers()
    .then(() => {
      console.log('🎉 Vérification terminée !')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Erreur :', error)
      process.exit(1)
    })
}

module.exports = { checkUsers }
