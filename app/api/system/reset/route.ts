import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

// Schéma de validation pour la réinitialisation
const resetSchema = z.object({
  confirmationText: z.string().refine(
    (val) => val === 'RESET_ALL_DATA',
    { message: 'Le texte de confirmation doit être exactement "RESET_ALL_DATA"' }
  ),
  keepCurrentUser: z.boolean().default(true)
})

// POST - Réinitialiser complètement le système (OWNER seulement)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validation des données
    const validatedData = resetSchema.parse(body)
    const { confirmationText, keepCurrentUser } = validatedData

    // Log de sécurité
    console.log(`🚨 RÉINITIALISATION SYSTÈME DEMANDÉE par utilisateur ${session.userId} (${session.email})`)

    // Commencer la transaction de réinitialisation
    const result = await prisma.$transaction(async (tx) => {
      const deletionResults = {
        saleChecks: 0,
        documents: 0,
        saleItems: 0,
        sales: 0,
        stockMovements: 0,
        creditPayments: 0,
        invoiceItems: 0,
        invoices: 0,
        quoteItems: 0,
        quotes: 0,
        supplierTransactions: 0,
        checks: 0,
        suppliers: 0,
        products: 0,
        categories: 0,
        customers: 0,
        users: 0,
        companySettings: 0
      }

      // 1. Supprimer les chèques de vente
      const deletedSaleChecks = await tx.saleCheck.deleteMany({})
      deletionResults.saleChecks = deletedSaleChecks.count

      // 2. Supprimer les documents
      const deletedDocuments = await tx.document.deleteMany({})
      deletionResults.documents = deletedDocuments.count

      // 3. Supprimer les éléments de vente
      const deletedSaleItems = await tx.saleItem.deleteMany({})
      deletionResults.saleItems = deletedSaleItems.count

      // 4. Supprimer les ventes
      const deletedSales = await tx.sale.deleteMany({})
      deletionResults.sales = deletedSales.count

      // 5. Supprimer les mouvements de stock
      const deletedStockMovements = await tx.stockMovement.deleteMany({})
      deletionResults.stockMovements = deletedStockMovements.count

      // 6. Supprimer les paiements de crédit
      const deletedCreditPayments = await tx.creditPayment.deleteMany({})
      deletionResults.creditPayments = deletedCreditPayments.count

      // 7. Supprimer les éléments de facture
      const deletedInvoiceItems = await tx.invoiceItem.deleteMany({})
      deletionResults.invoiceItems = deletedInvoiceItems.count

      // 8. Supprimer les factures
      const deletedInvoices = await tx.invoice.deleteMany({})
      deletionResults.invoices = deletedInvoices.count

      // 9. Supprimer les éléments de devis
      const deletedQuoteItems = await tx.quoteItem.deleteMany({})
      deletionResults.quoteItems = deletedQuoteItems.count

      // 10. Supprimer les devis
      const deletedQuotes = await tx.quote.deleteMany({})
      deletionResults.quotes = deletedQuotes.count

      // 11. Supprimer les transactions fournisseurs
      const deletedSupplierTransactions = await tx.supplierTransaction.deleteMany({})
      deletionResults.supplierTransactions = deletedSupplierTransactions.count

      // 12. Supprimer les chèques fournisseurs
      const deletedChecks = await tx.check.deleteMany({})
      deletionResults.checks = deletedChecks.count

      // 13. Supprimer les fournisseurs
      const deletedSuppliers = await tx.supplier.deleteMany({})
      deletionResults.suppliers = deletedSuppliers.count

      // 14. Supprimer les produits
      const deletedProducts = await tx.product.deleteMany({})
      deletionResults.products = deletedProducts.count

      // 15. Supprimer les catégories
      const deletedCategories = await tx.category.deleteMany({})
      deletionResults.categories = deletedCategories.count

      // 16. Supprimer les clients
      const deletedCustomers = await tx.customer.deleteMany({})
      deletionResults.customers = deletedCustomers.count

      // 17. Supprimer les utilisateurs (sauf l'utilisateur actuel si demandé)
      if (keepCurrentUser) {
        const deletedUsers = await tx.user.deleteMany({
          where: {
            id: {
              not: session.userId
            }
          }
        })
        deletionResults.users = deletedUsers.count
      } else {
        const deletedUsers = await tx.user.deleteMany({})
        deletionResults.users = deletedUsers.count
      }

      // 18. Réinitialiser les paramètres de l'entreprise
      const deletedCompanySettings = await tx.companySettings.deleteMany({})
      deletionResults.companySettings = deletedCompanySettings.count

      // Créer les paramètres par défaut de l'entreprise
      await tx.companySettings.create({
        data: {
          companyName: "Mon Entreprise",
          invoicePrefix: "FAC",
          creditNotePrefix: "FAV",
          defaultTaxRate: 20,
          invoiceTheme: "modern",
          primaryColor: "#2563EB",
          secondaryColor: "#10B981",
          tableHeaderColor: "#10B981"
        }
      })

      return deletionResults
    })

    // Log de succès
    console.log(`✅ RÉINITIALISATION SYSTÈME TERMINÉE par utilisateur ${session.userId}`)
    console.log('📊 Données supprimées:', result)

    return NextResponse.json({
      success: true,
      message: 'Système réinitialisé avec succès',
      deletedData: result,
      timestamp: new Date().toISOString(),
      resetBy: {
        userId: session.userId,
        email: session.email || 'N/A'
      }
    })

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation du système:', error)

    // Erreur de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    // Erreur Prisma
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: 'Erreur de contrainte de base de données. Veuillez réessayer.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur lors de la réinitialisation' },
      { status: 500 }
    )
  }
}

// GET - Obtenir des informations sur l'état du système (OWNER seulement)
export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Compter les enregistrements dans chaque table
    const systemStats = await prisma.$transaction(async (tx) => {
      const [
        usersCount,
        categoriesCount,
        productsCount,
        customersCount,
        suppliersCount,
        salesCount,
        invoicesCount,
        quotesCount,
        stockMovementsCount,
        documentsCount
      ] = await Promise.all([
        tx.user.count(),
        tx.category.count(),
        tx.product.count(),
        tx.customer.count(),
        tx.supplier.count(),
        tx.sale.count(),
        tx.invoice.count(),
        tx.quote.count(),
        tx.stockMovement.count(),
        tx.document.count()
      ])

      return {
        users: usersCount,
        categories: categoriesCount,
        products: productsCount,
        customers: customersCount,
        suppliers: suppliersCount,
        sales: salesCount,
        invoices: invoicesCount,
        quotes: quotesCount,
        stockMovements: stockMovementsCount,
        documents: documentsCount
      }
    })

    const totalRecords = Object.values(systemStats).reduce((sum, count) => sum + count, 0)

    return NextResponse.json({
      systemStats,
      totalRecords,
      isEmpty: totalRecords <= 1, // Considéré vide s'il n'y a que l'utilisateur actuel
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques système:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
