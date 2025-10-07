const { z } = require('zod')

// Copie du schéma de validation de l'API
const createInvoiceSchema = z.object({
  type: z.enum(['INVOICE', 'CREDIT_NOTE']).default('INVOICE'),
  invoiceNumber: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().min(1, 'Le nom du client est requis'),
  customerPhone: z.string().optional(),
  customerEmail: z.string().optional().refine((email) => !email || z.string().email().safeParse(email).success, {
    message: "Format d'email invalide"
  }),
  customerAddress: z.string().optional(),
  customerTaxId: z.string().optional(),
  originalInvoiceId: z.string().optional(),
  subtotal: z.coerce.number().min(0),
  discountAmount: z.coerce.number().min(0).default(0),
  taxRate: z.coerce.number().min(0).max(100).default(20),
  taxAmount: z.coerce.number().min(0).default(0),
  total: z.coerce.number().min(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
  dueDate: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().optional(),
    productName: z.string().min(1),
    productSku: z.string().optional(),
    description: z.string().optional(),
    quantity: z.coerce.number().int().min(1),
    unitPrice: z.coerce.number().min(0),
    discountAmount: z.coerce.number().min(0).default(0),
    total: z.coerce.number().min(0),
  })).min(1, 'Au moins un article est requis'),
})

function testValidation() {
  console.log('🧪 Test de validation Zod...\n')
  
  // Données de test typiques d'un formulaire
  const testData1 = {
    type: 'INVOICE',
    customerName: 'Test Client',
    customerPhone: '+212 123 456 789',
    customerEmail: 'test@example.com',
    customerAddress: '123 Rue Test',
    subtotal: '1000', // String comme venant d'un formulaire
    discountAmount: '0',
    taxRate: '20',
    taxAmount: '200',
    total: '1200',
    notes: 'Test',
    items: [
      {
        productName: 'Produit 1',
        quantity: '2', // String
        unitPrice: '500', // String
        total: '1000' // String
      }
    ]
  }
  
  // Test avec des données vides (cas d'erreur probable)
  const testData2 = {
    type: 'INVOICE',
    customerName: '',
    subtotal: '',
    total: '',
    items: []
  }
  
  // Test avec des données partielles
  const testData3 = {
    customerName: 'Client Test',
    subtotal: 100,
    total: 120,
    items: [
      {
        productName: 'Produit',
        quantity: 1,
        unitPrice: 100,
        total: 100
      }
    ]
  }
  
  const testCases = [
    { name: 'Données complètes', data: testData1 },
    { name: 'Données vides', data: testData2 },
    { name: 'Données partielles', data: testData3 }
  ]
  
  testCases.forEach(({ name, data }) => {
    console.log(`\n--- Test: ${name} ---`)
    console.log('Données:', JSON.stringify(data, null, 2))
    
    const result = createInvoiceSchema.safeParse(data)
    
    if (result.success) {
      console.log('✅ Validation réussie')
      console.log('Données validées:', JSON.stringify(result.data, null, 2))
    } else {
      console.log('❌ Erreurs de validation:')
      result.error.issues.forEach(issue => {
        console.log(`- ${issue.path.join('.')}: ${issue.message}`)
        if (issue.received !== undefined) {
          console.log(`  Reçu: ${issue.received}`)
        }
      })
    }
  })
}

testValidation()
