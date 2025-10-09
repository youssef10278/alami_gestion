const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Début de la migration Railway...')

  try {
    // Étape 1 : Ajouter la colonne paymentMethod
    console.log('📝 Ajout de la colonne paymentMethod...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "CreditPayment" 
      ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT NOT NULL DEFAULT 'CASH';
    `)
    console.log('✅ Colonne paymentMethod ajoutée')

    // Étape 2 : Supprimer la contrainte de clé étrangère
    console.log('📝 Suppression de la contrainte de clé étrangère...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "CreditPayment" 
      DROP CONSTRAINT IF EXISTS "CreditPayment_saleId_fkey";
    `)
    console.log('✅ Contrainte supprimée')

    // Étape 3 : Rendre saleId nullable
    console.log('📝 Modification de saleId pour le rendre nullable...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "CreditPayment" 
      ALTER COLUMN "saleId" DROP NOT NULL;
    `)
    console.log('✅ saleId est maintenant nullable')

    // Étape 4 : Recréer la contrainte de clé étrangère
    console.log('📝 Recréation de la contrainte de clé étrangère...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "CreditPayment" 
      ADD CONSTRAINT "CreditPayment_saleId_fkey" 
      FOREIGN KEY ("saleId") REFERENCES "Sale"("id") 
      ON DELETE RESTRICT ON UPDATE CASCADE;
    `)
    console.log('✅ Contrainte recréée')

    console.log('🎉 Migration terminée avec succès !')
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

