const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPrismaModels() {
  console.log('🧪 Test des modèles Prisma...\n')
  
  console.log('Modèles disponibles dans Prisma:')
  console.log(Object.keys(prisma))
  
  console.log('\nRecherche du modèle CompanySettings...')
  
  // Tester différentes variantes
  const variants = [
    'companySettings',
    'CompanySettings', 
    'company_settings',
    'companysettings'
  ]
  
  for (const variant of variants) {
    if (prisma[variant]) {
      console.log(`✅ Trouvé: prisma.${variant}`)
      
      try {
        // Tester une requête simple
        const count = await prisma[variant].count()
        console.log(`   Nombre d'enregistrements: ${count}`)
      } catch (error) {
        console.log(`   Erreur lors du test: ${error.message}`)
      }
    } else {
      console.log(`❌ Non trouvé: prisma.${variant}`)
    }
  }
  
  await prisma.$disconnect()
}

testPrismaModels().catch(console.error)
