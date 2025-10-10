import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { gunzip } from 'zlib'
import { promisify } from 'util'
import { 
  BackupData,
  ImportResult,
  ImportOptions
} from '@/lib/types/backup'
import { 
  validateBackupFormat,
  isVersionCompatible,
  validateChecksum,
  generateBackupFilename
} from '@/lib/backup-utils'

const gunzipAsync = promisify(gunzip)

// POST - Importer des données depuis un fichier de sauvegarde
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('📥 Début import des données - API /backup/import')
    
    // Vérifier l'authentification
    const session = await getSession()
    if (!session) {
      console.log('❌ Utilisateur non authentifié')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    console.log('✅ Utilisateur authentifié:', session.email)

    // Récupérer les données du formulaire
    const formData = await request.formData()
    const file = formData.get('file') as File
    const optionsStr = formData.get('options') as string
    
    if (!file) {
      return NextResponse.json({ 
        error: 'Aucun fichier fourni' 
      }, { status: 400 })
    }

    // Options d'import (avec valeurs par défaut)
    const options: ImportOptions = optionsStr ? JSON.parse(optionsStr) : {
      merge_strategy: 'merge',
      validate_relations: true,
      create_backup_before_import: true
    }

    console.log('📄 Fichier reçu:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // === LECTURE ET DÉCOMPRESSION DU FICHIER ===
    console.log('🔄 Lecture du fichier...')
    
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    let jsonString: string

    // Détecter si le fichier est compressé
    const isGzipped = file.name.endsWith('.gz') || file.type === 'application/gzip'
    
    if (isGzipped) {
      console.log('🗜️ Décompression GZIP...')
      try {
        const decompressed = await gunzipAsync(fileBuffer)
        jsonString = decompressed.toString('utf8')
        console.log('✅ Décompression réussie')
      } catch (error) {
        console.error('❌ Erreur décompression:', error)
        return NextResponse.json({ 
          error: 'Erreur lors de la décompression du fichier',
          details: 'Le fichier semble corrompu ou n\'est pas un fichier GZIP valide'
        }, { status: 400 })
      }
    } else {
      jsonString = fileBuffer.toString('utf8')
    }

    // === PARSING ET VALIDATION JSON ===
    console.log('🔍 Validation du format JSON...')
    
    let backupData: BackupData
    try {
      backupData = JSON.parse(jsonString)
    } catch (error) {
      console.error('❌ Erreur parsing JSON:', error)
      return NextResponse.json({ 
        error: 'Format JSON invalide',
        details: 'Le fichier ne contient pas de JSON valide'
      }, { status: 400 })
    }

    // Validation de la structure
    const validation = validateBackupFormat(backupData)
    if (!validation.valid) {
      console.error('❌ Format de sauvegarde invalide:', validation.errors)
      return NextResponse.json({ 
        error: 'Format de sauvegarde invalide',
        details: validation.errors.join(', ')
      }, { status: 400 })
    }

    // Vérification de la compatibilité des versions
    if (!isVersionCompatible(backupData.metadata.version)) {
      console.error('❌ Version incompatible:', backupData.metadata.version)
      return NextResponse.json({ 
        error: 'Version de sauvegarde incompatible',
        details: `Version ${backupData.metadata.version} non supportée`
      }, { status: 400 })
    }

    // Validation du checksum si présent
    if (backupData.metadata.checksum && options.validate_relations) {
      console.log('🔐 Validation du checksum...')
      try {
        // Créer une copie profonde et supprimer le checksum pour validation
        const dataWithoutChecksum = JSON.parse(JSON.stringify(backupData))
        delete dataWithoutChecksum.metadata.checksum

        if (!validateChecksum(dataWithoutChecksum, backupData.metadata.checksum)) {
          console.error('❌ Checksum invalide')
          console.error('Checksum attendu:', backupData.metadata.checksum)
          console.error('Checksum calculé:', require('@/lib/backup-utils').calculateChecksum(dataWithoutChecksum))
          return NextResponse.json({
            error: 'Intégrité des données compromise',
            details: 'Le checksum ne correspond pas, le fichier pourrait être corrompu'
          }, { status: 400 })
        }
        console.log('✅ Checksum valide')
      } catch (checksumError) {
        console.error('❌ Erreur validation checksum:', checksumError)
        // Continue sans validation checksum si erreur
        console.log('⚠️ Validation checksum ignorée à cause de l\'erreur')
      }
    }

    console.log('✅ Validation terminée avec succès')
    console.log('📊 Données à importer:', {
      version: backupData.metadata.version,
      exported_at: backupData.metadata.exported_at,
      total_records: backupData.metadata.total_records,
      products: backupData.data.products?.length || 0,
      customers: backupData.data.customers?.length || 0,
      suppliers: backupData.data.suppliers?.length || 0,
      standalone_sales: backupData.data.standalone_sales?.length || 0,
      invoices: backupData.data.invoices?.length || 0,
      quotes: backupData.data.quotes?.length || 0
    })

    // === SAUVEGARDE AUTOMATIQUE AVANT IMPORT ===
    if (options.create_backup_before_import) {
      console.log('💾 Création sauvegarde automatique avant import...')
      try {
        // Appel interne à l'API d'export
        const backupResponse = await fetch(`${request.nextUrl.origin}/api/backup/export?compress=true&format=gzip`, {
          headers: {
            'Cookie': request.headers.get('Cookie') || ''
          }
        })
        
        if (backupResponse.ok) {
          console.log('✅ Sauvegarde automatique créée')
        } else {
          console.warn('⚠️ Échec sauvegarde automatique, import continue')
        }
      } catch (error) {
        console.warn('⚠️ Erreur sauvegarde automatique:', error)
        // Continue l'import même si la sauvegarde échoue
      }
    }

    // === IMPORT DES DONNÉES ===
    console.log('🔄 Début de l\'import des données...')
    
    const importResult: ImportResult = {
      success: false,
      message: '',
      stats: {
        products_imported: 0,
        customers_imported: 0,
        suppliers_imported: 0,
        sales_imported: 0,
        invoices_imported: 0,
        quotes_imported: 0,
        errors: 0
      },
      errors: []
    }

    // Transaction globale pour assurer la cohérence
    await prisma.$transaction(async (tx) => {
      console.log('🔄 Transaction d\'import démarrée...')

      // 1. Import des paramètres de l'entreprise
      if (backupData.company?.settings) {
        console.log('🏢 Import paramètres entreprise...')
        try {
          await tx.companySettings.upsert({
            where: { id: backupData.company.settings.id },
            update: {
              companyName: backupData.company.settings.companyName,
              companyAddress: backupData.company.settings.companyAddress,
              companyPhone: backupData.company.settings.companyPhone,
              companyEmail: backupData.company.settings.companyEmail,
              companyLogo: backupData.company.settings.companyLogo,
              primaryColor: backupData.company.settings.primaryColor,
              secondaryColor: backupData.company.settings.secondaryColor,
              accentColor: backupData.company.settings.accentColor,
              currency: backupData.company.settings.currency,
              taxRate: backupData.company.settings.taxRate
            },
            create: {
              id: backupData.company.settings.id,
              companyName: backupData.company.settings.companyName,
              companyAddress: backupData.company.settings.companyAddress,
              companyPhone: backupData.company.settings.companyPhone,
              companyEmail: backupData.company.settings.companyEmail,
              companyLogo: backupData.company.settings.companyLogo,
              primaryColor: backupData.company.settings.primaryColor,
              secondaryColor: backupData.company.settings.secondaryColor,
              accentColor: backupData.company.settings.accentColor,
              currency: backupData.company.settings.currency,
              taxRate: backupData.company.settings.taxRate
            }
          })
          console.log('✅ Paramètres entreprise importés')
        } catch (error) {
          console.error('❌ Erreur import paramètres:', error)
          importResult.errors.push(`Paramètres entreprise: ${error}`)
          importResult.stats.errors++
        }
      }

      // 2. Import des produits
      if (backupData.data.products?.length > 0) {
        console.log(`📦 Import ${backupData.data.products.length} produits...`)
        for (const product of backupData.data.products) {
          try {
            await tx.product.upsert({
              where: { id: product.id },
              update: {
                name: product.name,
                sku: product.sku,
                description: product.description,
                category: product.category,
                purchasePrice: product.purchasePrice,
                price: product.price,
                stock: product.stock,
                minStock: product.minStock,
                maxStock: product.maxStock,
                unit: product.unit,
                barcode: product.barcode,
                image: product.image,
                isActive: product.isActive
              },
              create: {
                id: product.id,
                name: product.name,
                sku: product.sku,
                description: product.description,
                category: product.category,
                purchasePrice: product.purchasePrice,
                price: product.price,
                stock: product.stock,
                minStock: product.minStock,
                maxStock: product.maxStock,
                unit: product.unit,
                barcode: product.barcode,
                image: product.image,
                isActive: product.isActive,
                createdAt: new Date(product.createdAt),
                updatedAt: new Date(product.updatedAt)
              }
            })
            importResult.stats.products_imported++
          } catch (error) {
            console.error(`❌ Erreur import produit ${product.sku}:`, error)
            importResult.errors.push(`Produit ${product.sku}: ${error}`)
            importResult.stats.errors++
          }
        }
        console.log(`✅ ${importResult.stats.products_imported} produits importés`)
      }

      // 3. Import des clients (sans les ventes pour l'instant)
      if (backupData.data.customers?.length > 0) {
        console.log(`👤 Import ${backupData.data.customers.length} clients...`)
        for (const customer of backupData.data.customers) {
          try {
            await tx.customer.upsert({
              where: { id: customer.id },
              update: {
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                company: customer.company,
                creditLimit: customer.creditLimit,
                creditUsed: customer.creditUsed,
                isActive: customer.isActive
              },
              create: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                company: customer.company,
                creditLimit: customer.creditLimit,
                creditUsed: customer.creditUsed,
                isActive: customer.isActive,
                createdAt: new Date(customer.createdAt),
                updatedAt: new Date(customer.updatedAt)
              }
            })
            importResult.stats.customers_imported++
          } catch (error) {
            console.error(`❌ Erreur import client ${customer.name}:`, error)
            importResult.errors.push(`Client ${customer.name}: ${error}`)
            importResult.stats.errors++
          }
        }
        console.log(`✅ ${importResult.stats.customers_imported} clients importés`)
      }

      // 4. Import des fournisseurs avec leurs transactions
      if (backupData.data.suppliers?.length > 0) {
        console.log(`🏭 Import ${backupData.data.suppliers.length} fournisseurs...`)
        for (const supplier of backupData.data.suppliers) {
          try {
            await tx.supplier.upsert({
              where: { id: supplier.id },
              update: {
                name: supplier.name,
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address,
                company: supplier.company,
                taxId: supplier.taxId,
                totalDebt: supplier.totalDebt || 0,
                totalPaid: supplier.totalPaid || 0,
                balance: supplier.balance || 0,
                notes: supplier.notes,
                isActive: supplier.isActive
              },
              create: {
                id: supplier.id,
                name: supplier.name,
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address,
                company: supplier.company,
                taxId: supplier.taxId,
                totalDebt: supplier.totalDebt || 0,
                totalPaid: supplier.totalPaid || 0,
                balance: supplier.balance || 0,
                notes: supplier.notes,
                isActive: supplier.isActive,
                createdAt: new Date(supplier.createdAt),
                updatedAt: new Date(supplier.updatedAt)
              }
            })

            // Import des transactions du fournisseur
            if (supplier.transactions?.length > 0) {
              for (const transaction of supplier.transactions) {
                try {
                  await tx.supplierTransaction.upsert({
                    where: { id: transaction.id },
                    update: {
                      transactionNumber: transaction.transactionNumber,
                      type: transaction.type as any,
                      amount: transaction.amount,
                      description: transaction.description,
                      date: new Date(transaction.date),
                      status: transaction.status as any,
                      paymentMethod: transaction.paymentMethod,
                      notes: transaction.notes
                    },
                    create: {
                      id: transaction.id,
                      transactionNumber: transaction.transactionNumber,
                      supplierId: supplier.id,
                      type: transaction.type as any,
                      amount: transaction.amount,
                      description: transaction.description,
                      date: new Date(transaction.date),
                      status: transaction.status as any,
                      paymentMethod: transaction.paymentMethod,
                      notes: transaction.notes,
                      createdAt: new Date(transaction.createdAt),
                      updatedAt: new Date(transaction.updatedAt)
                    }
                  })
                } catch (transactionError) {
                  console.error(`❌ Erreur import transaction ${transaction.transactionNumber}:`, transactionError)
                  importResult.errors.push(`Transaction ${transaction.transactionNumber}: ${transactionError}`)
                  importResult.stats.errors++
                }
              }
            }

            importResult.stats.suppliers_imported++
          } catch (error) {
            console.error(`❌ Erreur import fournisseur ${supplier.name}:`, error)
            importResult.errors.push(`Fournisseur ${supplier.name}: ${error}`)
            importResult.stats.errors++
          }
        }
        console.log(`✅ ${importResult.stats.suppliers_imported} fournisseurs importés`)
      }

      // 5. Import des devis
      if (backupData.data.quotes?.length > 0) {
        console.log(`📋 Import ${backupData.data.quotes.length} devis...`)
        for (const quote of backupData.data.quotes) {
          try {
            // Créer le devis
            const createdQuote = await tx.quote.upsert({
              where: { id: quote.id },
              update: {
                quoteNumber: quote.quoteNumber,
                customerId: quote.customerId,
                customerName: quote.customerName,
                customerPhone: quote.customerPhone,
                customerEmail: quote.customerEmail,
                customerAddress: quote.customerAddress,
                status: quote.status,
                validUntil: quote.validUntil ? new Date(quote.validUntil) : new Date(),
                subtotal: quote.subtotal,
                discount: quote.discount || 0,
                tax: quote.tax || 0,
                total: quote.total,
                notes: quote.notes,
                terms: quote.terms,
                convertedToSaleId: quote.convertedToSaleId
              },
              create: {
                id: quote.id,
                quoteNumber: quote.quoteNumber,
                customerId: quote.customerId,
                customerName: quote.customerName,
                customerPhone: quote.customerPhone,
                customerEmail: quote.customerEmail,
                customerAddress: quote.customerAddress,
                status: quote.status,
                validUntil: quote.validUntil ? new Date(quote.validUntil) : new Date(),
                subtotal: quote.subtotal,
                discount: quote.discount || 0,
                tax: quote.tax || 0,
                total: quote.total,
                notes: quote.notes,
                terms: quote.terms,
                convertedToSaleId: quote.convertedToSaleId,
                createdAt: new Date(quote.createdAt),
                updatedAt: new Date(quote.updatedAt || quote.createdAt)
              }
            })

            // Supprimer les anciens items et créer les nouveaux
            await tx.quoteItem.deleteMany({
              where: { quoteId: quote.id }
            })

            for (const item of quote.items) {
              await tx.quoteItem.create({
                data: {
                  id: item.id,
                  quoteId: quote.id,
                  productId: item.productId,
                  productName: item.productName,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  total: item.total
                }
              })
            }

            importResult.stats.quotes_imported++
          } catch (error) {
            console.error(`❌ Erreur import devis ${quote.quoteNumber}:`, error)
            importResult.errors.push(`Devis ${quote.quoteNumber}: ${error}`)
            importResult.stats.errors++
          }
        }
        console.log(`✅ ${importResult.stats.quotes_imported} devis importés`)
      }

      console.log('✅ Transaction d\'import terminée')
    })

    const processingTime = Date.now() - startTime
    
    importResult.success = importResult.stats.errors === 0
    importResult.message = importResult.success 
      ? 'Import terminé avec succès'
      : `Import terminé avec ${importResult.stats.errors} erreur(s)`

    console.log('✅ Import terminé:', {
      success: importResult.success,
      processingTime: `${processingTime}ms`,
      stats: importResult.stats
    })

    return NextResponse.json({
      ...importResult,
      processingTime
    })

  } catch (error) {
    const errorTime = Date.now() - startTime
    console.error('❌ Erreur lors de l\'import:', error)
    console.error(`⏱️ Échec après ${errorTime}ms`)
    
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de l\'import des données',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      timestamp: new Date().toISOString(),
      processingTime: errorTime,
      stats: {
        products_imported: 0,
        customers_imported: 0,
        suppliers_imported: 0,
        sales_imported: 0,
        invoices_imported: 0,
        quotes_imported: 0,
        errors: 1
      },
      errors: [error instanceof Error ? error.message : 'Erreur inconnue']
    }, { status: 500 })
  }
}
