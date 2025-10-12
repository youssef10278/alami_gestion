import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Version d'urgence - données statiques pour éviter ERR_INSUFFICIENT_RESOURCES
    const fallbackAnalytics = {
      totalSales: 0,
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      salesGrowth: 0,
      revenueGrowth: 0,
      ordersGrowth: 0,
      salesByDay: [],
      salesByHour: [],
      topProducts: [],
      topCustomers: [],
      paymentMethods: [],
      lowStockProducts: 0,
      totalProducts: 0,
      totalCustomers: 0,
      newCustomers: 0,
      completedSales: 0,
      pendingSales: 0,
      cancelledSales: 0
    }

    return NextResponse.json(fallbackAnalytics, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Erreur API analytics:', error)

    // Toujours retourner des données vides plutôt qu'une erreur
    const errorAnalytics = {
      totalSales: 0,
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      salesGrowth: 0,
      revenueGrowth: 0,
      ordersGrowth: 0,
      salesByDay: [],
      salesByHour: [],
      topProducts: [],
      topCustomers: [],
      paymentMethods: [],
      lowStockProducts: 0,
      totalProducts: 0,
      totalCustomers: 0,
      newCustomers: 0,
      completedSales: 0,
      pendingSales: 0,
      cancelledSales: 0
    }

    return NextResponse.json(errorAnalytics, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}
