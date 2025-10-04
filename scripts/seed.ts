import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create owner user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const owner = await prisma.user.upsert({
    where: { email: 'owner@alami.com' },
    update: {},
    create: {
      email: 'owner@alami.com',
      password: hashedPassword,
      name: 'Propriétaire',
      role: 'OWNER',
      isActive: true,
    },
  })

  console.log('✅ Owner created:', owner.email)

  // Create a seller user
  const sellerPassword = await bcrypt.hash('seller123', 10)
  
  const seller = await prisma.user.upsert({
    where: { email: 'seller@alami.com' },
    update: {},
    create: {
      email: 'seller@alami.com',
      password: sellerPassword,
      name: 'Vendeur Test',
      role: 'SELLER',
      isActive: true,
    },
  })

  console.log('✅ Seller created:', seller.email)

  // Create some categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'cat-1' },
      update: {},
      create: {
        id: 'cat-1',
        name: 'Électronique',
        description: 'Produits électroniques',
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-2' },
      update: {},
      create: {
        id: 'cat-2',
        name: 'Vêtements',
        description: 'Vêtements et accessoires',
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-3' },
      update: {},
      create: {
        id: 'cat-3',
        name: 'Alimentation',
        description: 'Produits alimentaires',
      },
    }),
  ])

  console.log('✅ Categories created:', categories.length)

  // Create some sample products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'PROD-001' },
      update: {},
      create: {
        sku: 'PROD-001',
        name: 'Smartphone XYZ',
        description: 'Smartphone dernière génération',
        purchasePrice: 2000.00,
        price: 2999.99,
        stock: 50,
        minStock: 10,
        categoryId: 'cat-1',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'PROD-002' },
      update: {},
      create: {
        sku: 'PROD-002',
        name: 'T-Shirt Premium',
        description: 'T-shirt en coton bio',
        purchasePrice: 120.00,
        price: 199.99,
        stock: 100,
        minStock: 20,
        categoryId: 'cat-2',
      },
    }),
    prisma.product.upsert({
      where: { sku: 'PROD-003' },
      update: {},
      create: {
        sku: 'PROD-003',
        name: 'Café Arabica 1kg',
        description: 'Café arabica premium',
        purchasePrice: 60.00,
        price: 89.99,
        stock: 200,
        minStock: 30,
        categoryId: 'cat-3',
      },
    }),
  ])

  console.log('✅ Products created:', products.length)

  // Create some sample customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { id: 'cust-1' },
      update: {},
      create: {
        id: 'cust-1',
        name: 'Ahmed Benali',
        company: 'Benali SARL',
        email: 'ahmed@benali.com',
        phone: '0612345678',
        address: '123 Rue Mohammed V, Casablanca',
        creditLimit: 10000,
      },
    }),
    prisma.customer.upsert({
      where: { id: 'cust-2' },
      update: {},
      create: {
        id: 'cust-2',
        name: 'Fatima Zahra',
        company: 'FZ Commerce',
        email: 'fatima@fzcommerce.com',
        phone: '0623456789',
        address: '456 Avenue Hassan II, Rabat',
        creditLimit: 15000,
      },
    }),
  ])

  console.log('✅ Customers created:', customers.length)

  console.log('🎉 Seeding completed!')
  console.log('\n📝 Login credentials:')
  console.log('Owner: owner@alami.com / admin123')
  console.log('Seller: seller@alami.com / seller123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

