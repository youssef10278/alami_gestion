import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Analytics des chèques fournisseurs
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer tous les chèques
    const allChecks = await prisma.check.findMany({
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    })

    // Calculer les statistiques globales
    const totalAmount = allChecks.reduce((sum, check) => sum + Number(check.amount), 0)
    const issuedAmount = allChecks
      .filter(c => c.status === 'ISSUED')
      .reduce((sum, check) => sum + Number(check.amount), 0)
    const cashedAmount = allChecks
      .filter(c => c.status === 'CASHED')
      .reduce((sum, check) => sum + Number(check.amount), 0)
    const cancelledAmount = allChecks
      .filter(c => c.status === 'CANCELLED')
      .reduce((sum, check) => sum + Number(check.amount), 0)
    const bouncedAmount = allChecks
      .filter(c => c.status === 'BOUNCED')
      .reduce((sum, check) => sum + Number(check.amount), 0)

    // Chèques par statut
    const checksByStatus = {
      ISSUED: allChecks.filter(c => c.status === 'ISSUED').length,
      CASHED: allChecks.filter(c => c.status === 'CASHED').length,
      CANCELLED: allChecks.filter(c => c.status === 'CANCELLED').length,
      BOUNCED: allChecks.filter(c => c.status === 'BOUNCED').length,
    }

    // Chèques en retard (ISSUED et dueDate passée)
    const now = new Date()
    const overdueChecks = allChecks.filter(
      c => c.status === 'ISSUED' && new Date(c.dueDate) < now
    )
    const overdueAmount = overdueChecks.reduce((sum, check) => sum + Number(check.amount), 0)

    // Chèques à échéance dans 7 jours
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    const upcomingChecks = allChecks.filter(
      c => c.status === 'ISSUED' && 
      new Date(c.dueDate) >= now && 
      new Date(c.dueDate) <= sevenDaysFromNow
    )
    const upcomingAmount = upcomingChecks.reduce((sum, check) => sum + Number(check.amount), 0)

    // Chèques par mois (6 derniers mois)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthChecks = allChecks.filter(c => {
        const issueDate = new Date(c.issueDate)
        return issueDate >= monthStart && issueDate <= monthEnd
      })

      monthlyData.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        total: monthChecks.reduce((sum, c) => sum + Number(c.amount), 0),
        count: monthChecks.length,
        issued: monthChecks.filter(c => c.status === 'ISSUED').length,
        cashed: monthChecks.filter(c => c.status === 'CASHED').length,
      })
    }

    // Top 5 fournisseurs par montant de chèques
    const supplierStats = new Map()
    allChecks.forEach(check => {
      const supplierId = check.supplier.id
      if (!supplierStats.has(supplierId)) {
        supplierStats.set(supplierId, {
          id: supplierId,
          name: check.supplier.name,
          company: check.supplier.company,
          totalAmount: 0,
          checkCount: 0,
          issuedAmount: 0,
          cashedAmount: 0,
        })
      }
      const stats = supplierStats.get(supplierId)
      stats.totalAmount += Number(check.amount)
      stats.checkCount += 1
      if (check.status === 'ISSUED') stats.issuedAmount += Number(check.amount)
      if (check.status === 'CASHED') stats.cashedAmount += Number(check.amount)
    })

    const topSuppliers = Array.from(supplierStats.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5)

    // Répartition par statut (pour graphique en camembert)
    const statusDistribution = [
      { name: 'Émis', value: issuedAmount, count: checksByStatus.ISSUED, color: '#f59e0b' },
      { name: 'Encaissés', value: cashedAmount, count: checksByStatus.CASHED, color: '#10b981' },
      { name: 'Annulés', value: cancelledAmount, count: checksByStatus.CANCELLED, color: '#6b7280' },
      { name: 'Rejetés', value: bouncedAmount, count: checksByStatus.BOUNCED, color: '#ef4444' },
    ].filter(item => item.value > 0)

    // Statistiques de performance
    const averageCheckAmount = allChecks.length > 0 ? totalAmount / allChecks.length : 0
    const cashingRate = allChecks.length > 0 
      ? (checksByStatus.CASHED / allChecks.length) * 100 
      : 0

    return NextResponse.json({
      summary: {
        totalAmount,
        totalChecks: allChecks.length,
        issuedAmount,
        issuedCount: checksByStatus.ISSUED,
        cashedAmount,
        cashedCount: checksByStatus.CASHED,
        cancelledAmount,
        cancelledCount: checksByStatus.CANCELLED,
        bouncedAmount,
        bouncedCount: checksByStatus.BOUNCED,
        overdueAmount,
        overdueCount: overdueChecks.length,
        upcomingAmount,
        upcomingCount: upcomingChecks.length,
        averageCheckAmount,
        cashingRate,
      },
      monthlyData,
      statusDistribution,
      topSuppliers,
      alerts: {
        overdue: overdueChecks.map(c => ({
          id: c.id,
          checkNumber: c.checkNumber,
          supplier: c.supplier.name,
          amount: Number(c.amount),
          dueDate: c.dueDate,
          daysOverdue: Math.floor((now.getTime() - new Date(c.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
        })),
        upcoming: upcomingChecks.map(c => ({
          id: c.id,
          checkNumber: c.checkNumber,
          supplier: c.supplier.name,
          amount: Number(c.amount),
          dueDate: c.dueDate,
          daysUntilDue: Math.floor((new Date(c.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        })),
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des analytics:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des analytics' },
      { status: 500 }
    )
  }
}

