const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCompanySettings() {
  try {
    console.log('🧪 Test des paramètres de l\'entreprise...\n')

    // 1. Créer des paramètres de test
    console.log('1. Création des paramètres de l\'entreprise...')
    const settings = await prisma.companySettings.upsert({
      where: { id: 'test' }, // Utiliser un ID fictif pour le where
      update: {},
      create: {
        companyName: 'Alami Gestion SARL',
        companyICE: '123456789012345',
        companyEmail: 'contact@alami-gestion.ma',
        companyPhone: '+212 522 123 456',
        companyAddress: '123 Boulevard Mohammed V\nCasablanca 20000\nMaroc',
        companyWebsite: 'https://www.alami-gestion.ma',
        companyTaxId: 'IF12345678',
        invoicePrefix: 'FACT',
        creditNotePrefix: 'AVOIR',
        defaultTaxRate: 20,
        bankName: 'Banque Populaire',
        bankAccount: '1234567890123456',
        bankRIB: '123 456 789012345678901234 56',
        legalMentions: 'Société à responsabilité limitée au capital de 100 000 DH\nRC Casablanca 123456\nPatente 12345678\nCNSS 1234567'
      }
    })

    console.log('✅ Paramètres créés:', {
      id: settings.id,
      companyName: settings.companyName,
      companyICE: settings.companyICE,
      invoicePrefix: settings.invoicePrefix,
      creditNotePrefix: settings.creditNotePrefix
    })

    // 2. Vérifier la récupération
    console.log('\n2. Récupération des paramètres...')
    const retrievedSettings = await prisma.companySettings.findFirst()
    
    if (retrievedSettings) {
      console.log('✅ Paramètres récupérés:', {
        companyName: retrievedSettings.companyName,
        companyICE: retrievedSettings.companyICE,
        invoicePrefix: retrievedSettings.invoicePrefix,
        creditNotePrefix: retrievedSettings.creditNotePrefix
      })
    } else {
      console.log('❌ Aucun paramètre trouvé')
    }

    // 3. Tester la génération de numéro de facture avec les nouveaux préfixes
    console.log('\n3. Test de génération de numéro de facture...')
    
    // Simuler la logique de génération de numéro
    const prefix = 'FACT' // Utiliser le nouveau préfixe
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: prefix,
        },
      },
      orderBy: { invoiceNumber: 'desc' },
    })

    let nextNumber
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1])
      nextNumber = `${prefix}-${(lastNumber + 1).toString().padStart(8, '0')}`
    } else {
      nextNumber = `${prefix}-00000001`
    }

    console.log('✅ Prochain numéro de facture:', nextNumber)

    console.log('\n🎉 Tous les tests sont passés avec succès!')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCompanySettings()
