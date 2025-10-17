const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkCreditNotes() {
  try {
    console.log('🔍 === VÉRIFICATION DES FACTURES D\'AVOIR ===\n')

    // Récupérer toutes les factures d'avoir
    const creditNotes = await prisma.invoice.findMany({
      where: {
        type: 'CREDIT_NOTE'
      },
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 Nombre de factures d'avoir trouvées: ${creditNotes.length}\n`)

    if (creditNotes.length === 0) {
      console.log('❌ Aucune facture d\'avoir trouvée dans la base de données')
      console.log('💡 Le problème pourrait être que la facture n\'a pas été créée avec le bon type')
      return
    }

    // Afficher les détails de chaque facture d'avoir
    creditNotes.forEach((invoice, index) => {
      console.log(`📄 Facture d'avoir #${index + 1}:`)
      console.log(`   ID: ${invoice.id}`)
      console.log(`   Numéro: ${invoice.invoiceNumber}`)
      console.log(`   Type: ${invoice.type}`)
      console.log(`   Client: ${invoice.customerName}`)
      console.log(`   Total: ${invoice.total} MAD`)
      console.log(`   Date: ${invoice.createdAt.toLocaleDateString('fr-FR')}`)
      console.log(`   Nombre d'articles: ${invoice.items.length}`)
      console.log('')
    })

    // Récupérer aussi toutes les factures normales pour comparaison
    const normalInvoices = await prisma.invoice.findMany({
      where: {
        type: 'INVOICE'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    console.log(`📊 Dernières factures normales (pour comparaison): ${normalInvoices.length}\n`)
    
    normalInvoices.forEach((invoice, index) => {
      console.log(`📄 Facture normale #${index + 1}:`)
      console.log(`   Numéro: ${invoice.invoiceNumber}`)
      console.log(`   Type: ${invoice.type}`)
      console.log(`   Client: ${invoice.customerName}`)
      console.log(`   Total: ${invoice.total} MAD`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCreditNotes()
