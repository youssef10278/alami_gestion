import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testQuote() {
  try {
    console.log('🧪 Testing Quote creation...')

    // Vérifier si on peut se connecter à la DB
    await prisma.$connect()
    console.log('✅ Connected to database')

    // Compter les devis existants
    const count = await prisma.quote.count()
    console.log(`📊 Existing quotes: ${count}`)

    // Essayer de créer un devis de test
    const quote = await prisma.quote.create({
      data: {
        quoteNumber: 'TEST-000001',
        customerName: 'Client Test',
        customerPhone: '0600000000',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
        subtotal: 100,
        discount: 0,
        tax: 0,
        total: 100,
        items: {
          create: [
            {
              productName: 'Produit Test',
              quantity: 1,
              unitPrice: 100,
              discount: 0,
              total: 100,
            },
          ],
        },
      },
      include: {
        items: true,
      },
    })

    console.log('✅ Quote created successfully:', quote)

    // Supprimer le devis de test
    await prisma.quote.delete({
      where: { id: quote.id },
    })
    console.log('🗑️ Test quote deleted')

    console.log('🎉 All tests passed!')
  } catch (error: any) {
    console.error('❌ Test failed:', error)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    if (error.meta) {
      console.error('Error meta:', error.meta)
    }
  } finally {
    await prisma.$disconnect()
  }
}

testQuote()

