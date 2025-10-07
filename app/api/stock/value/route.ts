import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Valeur totale du stock
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer tous les produits actifs avec leur stock et prix
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        price: true,
        purchasePrice: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Calculer les statistiques de valeur du stock
    const stockValue = {
      // Valeur totale du stock (prix de vente × quantité)
      totalSaleValue: products.reduce((sum, product) => {
        return sum + (Number(product.price || 0) * Number(product.stock || 0))
      }, 0),
      
      // Valeur totale du stock (prix d'achat × quantité)
      totalCostValue: products.reduce((sum, product) => {
        return sum + (Number(product.purchasePrice || 0) * Number(product.stock || 0))
      }, 0),
      
      // Nombre total d'articles en stock
      totalQuantity: products.reduce((sum, product) => {
        return sum + Number(product.stock || 0)
      }, 0),
      
      // Nombre de produits différents
      totalProducts: products.length,
      
      // Produits en stock (quantité > 0)
      productsInStock: products.filter(p => Number(p.stock || 0) > 0).length,
      
      // Produits en rupture (quantité = 0)
      productsOutOfStock: products.filter(p => Number(p.stock || 0) === 0).length,
      
      // Marge potentielle (valeur vente - valeur achat)
      potentialMargin: products.reduce((sum, product) => {
        const saleValue = Number(product.price || 0) * Number(product.stock || 0)
        const costValue = Number(product.purchasePrice || 0) * Number(product.stock || 0)
        return sum + (saleValue - costValue)
      }, 0),
    }

    // Calculer le pourcentage de marge
    const marginPercentage = stockValue.totalCostValue > 0 
      ? ((stockValue.potentialMargin / stockValue.totalCostValue) * 100)
      : 0

    // Top 5 des produits par valeur de stock
    const topProductsByValue = products
      .map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        stock: Number(product.stock || 0),
        price: Number(product.price || 0),
        purchasePrice: Number(product.purchasePrice || 0),
        category: product.category?.name || 'Sans catégorie',
        stockValue: Number(product.price || 0) * Number(product.stock || 0),
        stockCostValue: Number(product.purchasePrice || 0) * Number(product.stock || 0),
      }))
      .filter(p => p.stockValue > 0)
      .sort((a, b) => b.stockValue - a.stockValue)
      .slice(0, 5)

    // Répartition par catégorie
    const categoryBreakdown = products.reduce((acc, product) => {
      const categoryName = product.category?.name || 'Sans catégorie'
      const stockValue = Number(product.price || 0) * Number(product.stock || 0)
      const quantity = Number(product.stock || 0)
      
      if (!acc[categoryName]) {
        acc[categoryName] = {
          category: categoryName,
          totalValue: 0,
          totalQuantity: 0,
          productCount: 0,
        }
      }
      
      acc[categoryName].totalValue += stockValue
      acc[categoryName].totalQuantity += quantity
      acc[categoryName].productCount += 1
      
      return acc
    }, {} as Record<string, any>)

    const categoryStats = Object.values(categoryBreakdown)
      .sort((a: any, b: any) => b.totalValue - a.totalValue)

    return NextResponse.json({
      stockValue: {
        ...stockValue,
        marginPercentage: Number(marginPercentage.toFixed(2)),
      },
      topProducts: topProductsByValue,
      categoryBreakdown: categoryStats,
      summary: {
        message: `Stock total de ${stockValue.totalQuantity} articles répartis sur ${stockValue.totalProducts} produits`,
        valueMessage: `Valeur totale: ${stockValue.totalSaleValue.toFixed(2)} DH (coût: ${stockValue.totalCostValue.toFixed(2)} DH)`,
        marginMessage: `Marge potentielle: ${stockValue.potentialMargin.toFixed(2)} DH (${marginPercentage.toFixed(1)}%)`,
      },
    })
  } catch (error) {
    console.error('Get stock value error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du calcul de la valeur du stock' },
      { status: 500 }
    )
  }
}
