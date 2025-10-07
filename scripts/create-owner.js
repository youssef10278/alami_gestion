/**
 * Script pour créer un compte owner
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createOwner() {
  console.log('👤 Création d\'un compte owner...')

  try {
    // Données du compte owner
    const ownerData = {
      email: 'owner@alami.com',
      name: 'Propriétaire Alami',
      password: 'admin123', // Mot de passe par défaut
      role: 'OWNER'
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: ownerData.email }
    })

    if (existingUser) {
      console.log('⚠️  L\'utilisateur existe déjà')
      console.log(`   Email: ${existingUser.email}`)
      console.log(`   Nom: ${existingUser.name}`)
      console.log(`   Rôle: ${existingUser.role}`)
      
      // Proposer de réinitialiser le mot de passe
      console.log('')
      console.log('🔄 Réinitialisation du mot de passe...')
      
      const hashedPassword = await bcrypt.hash(ownerData.password, 12)
      
      await prisma.user.update({
        where: { email: ownerData.email },
        data: { password: hashedPassword }
      })
      
      console.log('✅ Mot de passe réinitialisé avec succès')
    } else {
      // Créer un nouveau utilisateur
      console.log('🆕 Création d\'un nouveau compte...')
      
      const hashedPassword = await bcrypt.hash(ownerData.password, 12)
      
      const user = await prisma.user.create({
        data: {
          email: ownerData.email,
          name: ownerData.name,
          password: hashedPassword,
          role: ownerData.role
        }
      })
      
      console.log('✅ Compte créé avec succès')
      console.log(`   ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Nom: ${user.name}`)
      console.log(`   Rôle: ${user.role}`)
    }

    console.log('')
    console.log('🔑 Informations de connexion :')
    console.log(`   Email: ${ownerData.email}`)
    console.log(`   Mot de passe: ${ownerData.password}`)
    console.log('')
    console.log('⚠️  IMPORTANT: Changez ce mot de passe après la première connexion !')

  } catch (error) {
    console.error('❌ Erreur lors de la création :', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function createOwnerWithCustomPassword(email, password, name = 'Propriétaire') {
  console.log('👤 Création d\'un compte owner personnalisé...')

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    const hashedPassword = await bcrypt.hash(password, 12)

    if (existingUser) {
      console.log('⚠️  L\'utilisateur existe déjà, mise à jour...')
      
      await prisma.user.update({
        where: { email },
        data: { 
          password: hashedPassword,
          name,
          role: 'OWNER'
        }
      })
      
      console.log('✅ Compte mis à jour avec succès')
    } else {
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'OWNER'
        }
      })
      
      console.log('✅ Compte créé avec succès')
      console.log(`   ID: ${user.id}`)
    }

    console.log('')
    console.log('🔑 Informations de connexion :')
    console.log(`   Email: ${email}`)
    console.log(`   Mot de passe: ${password}`)
    console.log(`   Nom: ${name}`)

  } catch (error) {
    console.error('❌ Erreur lors de la création :', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter la création
if (require.main === module) {
  // Vérifier les arguments de ligne de commande
  const args = process.argv.slice(2)
  
  if (args.length >= 2) {
    // Mode personnalisé : node create-owner.js email password [nom]
    const [email, password, name] = args
    createOwnerWithCustomPassword(email, password, name)
      .then(() => {
        console.log('🎉 Création terminée !')
        process.exit(0)
      })
      .catch((error) => {
        console.error('💥 Erreur :', error)
        process.exit(1)
      })
  } else {
    // Mode par défaut
    createOwner()
      .then(() => {
        console.log('🎉 Création terminée !')
        process.exit(0)
      })
      .catch((error) => {
        console.error('💥 Erreur :', error)
        process.exit(1)
      })
  }
}

module.exports = { createOwner, createOwnerWithCustomPassword }
