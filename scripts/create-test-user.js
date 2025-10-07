const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    console.log('Connexion à la base de données...')

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@alami.ma' }
    })

    if (existingUser) {
      console.log('✅ L\'utilisateur admin@alami.ma existe déjà')
      console.log('Email:', existingUser.email)
      console.log('Nom:', existingUser.name)
      console.log('Rôle:', existingUser.role)
      return
    }

    console.log('Création de l\'utilisateur...')

    // Créer un utilisateur de test
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const user = await prisma.user.create({
      data: {
        email: 'admin@alami.ma',
        name: 'Administrateur',
        password: hashedPassword,
        role: 'OWNER',
        isActive: true
      }
    })

    console.log('✅ Utilisateur créé avec succès!')
    console.log('Email:', user.email)
    console.log('Nom:', user.name)
    console.log('Rôle:', user.role)
    console.log('Mot de passe: admin123')
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error)
  } finally {
    await prisma.$disconnect()
    console.log('Déconnexion de la base de données')
  }
}

createTestUser()
