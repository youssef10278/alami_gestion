import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultCategories = [
  { name: 'Loyer', icon: '🏢', color: '#3b82f6', description: 'Loyer des locaux commerciaux' },
  { name: 'Salaires', icon: '💰', color: '#10b981', description: 'Salaires et charges sociales' },
  { name: 'Électricité', icon: '⚡', color: '#f59e0b', description: 'Factures d\'électricité' },
  { name: 'Eau', icon: '💧', color: '#06b6d4', description: 'Factures d\'eau' },
  { name: 'Internet', icon: '🌐', color: '#8b5cf6', description: 'Abonnement internet et téléphonie' },
  { name: 'Téléphone', icon: '📱', color: '#ec4899', description: 'Factures téléphoniques' },
  { name: 'Fournitures', icon: '📦', color: '#6366f1', description: 'Fournitures de bureau et consommables' },
  { name: 'Marketing', icon: '📢', color: '#f43f5e', description: 'Publicité et marketing' },
  { name: 'Transport', icon: '🚗', color: '#14b8a6', description: 'Frais de transport et carburant' },
  { name: 'Entretien', icon: '🔧', color: '#84cc16', description: 'Entretien et réparations' },
  { name: 'Assurance', icon: '🛡️', color: '#0ea5e9', description: 'Assurances diverses' },
  { name: 'Taxes', icon: '📊', color: '#ef4444', description: 'Taxes et impôts' },
  { name: 'Formation', icon: '📚', color: '#a855f7', description: 'Formation du personnel' },
  { name: 'Repas', icon: '🍽️', color: '#f97316', description: 'Frais de repas et restauration' },
  { name: 'Autre', icon: '📝', color: '#64748b', description: 'Autres dépenses' }
]

async function main() {
  console.log('🌱 Seeding expense categories...')

  for (const category of defaultCategories) {
    const existing = await prisma.expenseCategory.findUnique({
      where: { name: category.name }
    })

    if (!existing) {
      await prisma.expenseCategory.create({
        data: category
      })
      console.log(`✅ Created category: ${category.icon} ${category.name}`)
    } else {
      console.log(`⏭️  Category already exists: ${category.icon} ${category.name}`)
    }
  }

  console.log('✨ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

