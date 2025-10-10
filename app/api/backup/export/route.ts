import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { gzip } from 'zlib'
import { promisify } from 'util'
import {
  BackupData,
  BackupProductData,
  BackupCustomerData,
  BackupSupplierData,
  BackupStandaloneSale,
  BackupInvoiceData,
  BackupQuoteData
} from '@/lib/types/backup'
import {
  generateBackupMetadata,
  calculateChecksum,
  countTotalRecords,
  sanitizeDataForExport,
  formatFileSize,
  estimateJsonSize,
  generateBackupFilename
} from '@/lib/backup-utils'

const gzipAsync = promisify(gzip)

// GET - Exporter toutes les données
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    console.log('📄 Début export des données - API /backup/export')

    // Vérifier l'authentification
    const session = await getSession()
    if (!session) {
      console.log('❌ Utilisateur non authentifié')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    console.log('✅ Utilisateur authentifié:', session.email)

    // Vérifier les paramètres de requête
    const { searchParams } = new URL(request.url)
    const compress = searchParams.get('compress') !== 'false' // Par défaut true
    const format = searchParams.get('format') || 'json' // json ou gzip

    // === RÉCUPÉRATION DES DONNÉES OPTIMISÉE ===
    console.log('📊 Récupération des données depuis la base...')

    // Exécution en parallèle pour optimiser les performances
    const [
      companySettings,
      users,
      products,
      customers,
      suppliers,
      standaloneSales,
      invoices,
      quotes
    ] = await Promise.all([
      // 1. Paramètres de l'entreprise
      prisma.companySettings.findFirst(),

      // 2. Utilisateurs (sans mots de passe)
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'asc' }
      }),

      // 3. Produits
      prisma.product.findMany({
        orderBy: { createdAt: 'asc' }
      }),

      // 4. Clients avec leurs ventes
      prisma.customer.findMany({
        include: {
          sales: {
            include: {
              items: {
                include: {
                  product: {
                    select: { name: true, sku: true }
                  }
                }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'asc' }
      }),

      // 5. Fournisseurs avec leurs achats
      prisma.supplier.findMany({
        include: {
          purchases: {
            include: {
              items: {
                include: {
                  product: {
                    select: { name: true, sku: true }
                  }
                }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'asc' }
      }),

      // 6. Ventes sans client (standalone)
      prisma.sale.findMany({
        where: { customerId: null },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, sku: true }
              }
            }
          },
          seller: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      }),

      // 7. Factures
      prisma.invoice.findMany({
        include: {
          items: {
            include: {
              product: {
                select: { name: true, sku: true }
              }
            }
          },
          customer: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      }),

      // 8. Devis
      prisma.quote.findMany({
        include: {
          items: {
            include: {
              product: {
                select: { name: true, sku: true }
              }
            }
          },
          customer: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      })
    ])

    const dataRetrievalTime = Date.now() - startTime
    console.log(`✅ Toutes les données récupérées en ${dataRetrievalTime}ms`)

    // === STRUCTURATION DES DONNÉES ===
    console.log('🔄 Structuration des données...')

    // Transformer les produits
    const backupProducts: BackupProductData[] = products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      description: product.description,
      category: product.category,
      purchasePrice: Number(product.purchasePrice),
      price: Number(product.price),
      stock: product.stock,
      minStock: product.minStock,
      maxStock: product.maxStock,
      unit: product.unit,
      barcode: product.barcode,
      image: product.image,
      isActive: product.isActive,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    }))

    // Transformer les clients avec ventes imbriquées
    const backupCustomers: BackupCustomerData[] = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      company: customer.company,
      creditLimit: customer.creditLimit ? Number(customer.creditLimit) : undefined,
      creditUsed: customer.creditUsed ? Number(customer.creditUsed) : undefined,
      isActive: customer.isActive,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
      sales: customer.sales.map(sale => ({
        id: sale.id,
        saleNumber: sale.saleNumber,
        totalAmount: Number(sale.totalAmount),
        paidAmount: Number(sale.paidAmount),
        creditAmount: Number(sale.creditAmount),
        paymentMethod: sale.paymentMethod,
        status: sale.status,
        notes: sale.notes,
        createdAt: sale.createdAt.toISOString(),
        items: sale.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.product?.name || item.productName || 'Produit inconnu',
          productSku: item.product?.sku,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          total: Number(item.total)
        }))
      }))
    }))

    // Transformer les fournisseurs avec achats imbriqués
    const backupSuppliers: BackupSupplierData[] = suppliers.map(supplier => ({
      id: supplier.id,
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      company: supplier.company,
      isActive: supplier.isActive,
      createdAt: supplier.createdAt.toISOString(),
      updatedAt: supplier.updatedAt.toISOString(),
      purchases: supplier.purchases.map(purchase => ({
        id: purchase.id,
        purchaseNumber: purchase.purchaseNumber,
        totalAmount: Number(purchase.totalAmount),
        paidAmount: Number(purchase.paidAmount),
        status: purchase.status,
        notes: purchase.notes,
        createdAt: purchase.createdAt.toISOString(),
        items: purchase.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.product?.name || item.productName || 'Produit inconnu',
          productSku: item.product?.sku,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          total: Number(item.total)
        }))
      }))
    }))

    // Transformer les ventes standalone
    const backupStandaloneSales: BackupStandaloneSale[] = standaloneSales.map(sale => ({
      id: sale.id,
      saleNumber: sale.saleNumber,
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      customerEmail: sale.customerEmail,
      totalAmount: Number(sale.totalAmount),
      paidAmount: Number(sale.paidAmount),
      creditAmount: Number(sale.creditAmount),
      paymentMethod: sale.paymentMethod,
      status: sale.status,
      notes: sale.notes,
      createdAt: sale.createdAt.toISOString(),
      sellerId: sale.sellerId,
      sellerName: sale.seller?.name || 'Vendeur inconnu',
      items: sale.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name || item.productName || 'Produit inconnu',
        productSku: item.product?.sku,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total)
      }))
    }))

    // Transformer les factures
    const backupInvoices: BackupInvoiceData[] = invoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      customerName: invoice.customer?.name || invoice.customerName || 'Client inconnu',
      totalAmount: Number(invoice.totalAmount),
      paidAmount: Number(invoice.paidAmount),
      status: invoice.status,
      dueDate: invoice.dueDate?.toISOString(),
      notes: invoice.notes,
      createdAt: invoice.createdAt.toISOString(),
      items: invoice.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name || item.productName || 'Produit inconnu',
        productSku: item.product?.sku,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total)
      }))
    }))

    // Transformer les devis
    const backupQuotes: BackupQuoteData[] = quotes.map(quote => ({
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      customerId: quote.customerId,
      customerName: quote.customer?.name || quote.customerName || 'Client inconnu',
      customerPhone: quote.customerPhone,
      customerEmail: quote.customerEmail,
      customerAddress: quote.customerAddress,
      totalAmount: Number(quote.totalAmount),
      status: quote.status,
      validUntil: quote.validUntil?.toISOString(),
      notes: quote.notes,
      terms: quote.terms,
      createdAt: quote.createdAt.toISOString(),
      items: quote.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name || item.productName || 'Produit inconnu',
        productSku: item.product?.sku,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total)
      }))
    }))

    // === ASSEMBLAGE FINAL ===
    const backupData: Partial<BackupData> = {
      company: {
        settings: companySettings ? {
          id: companySettings.id,
          companyName: companySettings.companyName,
          companyAddress: companySettings.companyAddress,
          companyPhone: companySettings.companyPhone,
          companyEmail: companySettings.companyEmail,
          companyLogo: companySettings.companyLogo,
          primaryColor: companySettings.primaryColor,
          secondaryColor: companySettings.secondaryColor,
          accentColor: companySettings.accentColor,
          currency: companySettings.currency,
          taxRate: companySettings.taxRate ? Number(companySettings.taxRate) : undefined,
          createdAt: companySettings.createdAt.toISOString(),
          updatedAt: companySettings.updatedAt.toISOString()
        } : {
          id: 'default',
          companyName: 'Alami Gestion',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        users: users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        }))
      },
      data: {
        products: backupProducts,
        customers: backupCustomers,
        suppliers: backupSuppliers,
        standalone_sales: backupStandaloneSales,
        invoices: backupInvoices,
        quotes: backupQuotes
      }
    }

    // Compter les enregistrements et générer métadonnées
    const totalRecords = countTotalRecords(backupData)
    const metadata = generateBackupMetadata(totalRecords)
    metadata.compressed = compress

    // Assembler la sauvegarde finale
    const finalBackup: BackupData = {
      metadata,
      ...backupData
    } as BackupData

    // Nettoyer les données sensibles
    const sanitizedBackup = sanitizeDataForExport(finalBackup)

    // Calculer le checksum
    const checksum = calculateChecksum(sanitizedBackup)
    sanitizedBackup.metadata.checksum = checksum

    // Préparer la réponse
    const jsonString = JSON.stringify(sanitizedBackup, null, 0)
    const originalSize = Buffer.byteLength(jsonString, 'utf8')

    const processingTime = Date.now() - startTime
    console.log(`🔄 Données traitées en ${processingTime}ms`)

    // Compression si demandée
    if (compress && format === 'gzip') {
      console.log('🗜️ Compression GZIP en cours...')
      const compressedData = await gzipAsync(jsonString)
      const compressedSize = compressedData.length
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1)

      console.log('✅ Export compressé terminé')
      console.log('📊 Statistiques:', {
        totalRecords,
        originalSize: formatFileSize(originalSize),
        compressedSize: formatFileSize(compressedSize),
        compressionRatio: `${compressionRatio}%`,
        processingTime: `${processingTime}ms`,
        checksum: checksum.substring(0, 8) + '...'
      })

      return new NextResponse(compressedData, {
        headers: {
          'Content-Type': 'application/gzip',
          'Content-Disposition': `attachment; filename="${generateBackupFilename().replace('.json', '.json.gz')}"`,
          'Content-Encoding': 'gzip',
          'X-Original-Size': originalSize.toString(),
          'X-Compressed-Size': compressedSize.toString(),
          'X-Compression-Ratio': compressionRatio
        }
      })
    } else {
      console.log('✅ Export JSON terminé')
      console.log('📊 Statistiques:', {
        totalRecords,
        size: formatFileSize(originalSize),
        processingTime: `${processingTime}ms`,
        checksum: checksum.substring(0, 8) + '...'
      })

      return NextResponse.json(sanitizedBackup, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${generateBackupFilename()}"`,
          'X-Total-Records': totalRecords.toString(),
          'X-File-Size': originalSize.toString(),
          'X-Processing-Time': processingTime.toString()
        }
      })
    }

  } catch (error) {
    const errorTime = Date.now() - startTime
    console.error('❌ Erreur lors de l\'export:', error)
    console.error(`⏱️ Échec après ${errorTime}ms`)

    // Log détaillé pour debug
    if (error instanceof Error) {
      console.error('📋 Stack trace:', error.stack)
    }

    return NextResponse.json(
      {
        error: 'Erreur lors de l\'export des données',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString(),
        processingTime: errorTime
      },
      { status: 500 }
    )
  }
}
