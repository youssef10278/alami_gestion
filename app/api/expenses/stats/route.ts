import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Dates par défaut : mois en cours
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Total des dépenses
    const totalExpenses = await prisma.expense.aggregate({
      where: {
        isActive: true,
        date: {
          gte: start,
          lte: end
        }
      },
      _sum: {
        amount: true
      },
      _count: true
    });

    // Dépenses par catégorie
    const expensesByCategory = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        isActive: true,
        date: {
          gte: start,
          lte: end
        }
      },
      _sum: {
        amount: true
      },
      _count: true
    });

    // Enrichir avec les infos de catégorie
    const categoriesData = await Promise.all(
      expensesByCategory.map(async (item) => {
        const category = await prisma.expenseCategory.findUnique({
          where: { id: item.categoryId }
        });
        return {
          category,
          total: Number(item._sum.amount || 0),
          count: item._count
        };
      })
    );

    // Dépenses par méthode de paiement
    const expensesByPaymentMethodRaw = await prisma.expense.groupBy({
      by: ['paymentMethod'],
      where: {
        isActive: true,
        date: {
          gte: start,
          lte: end
        }
      },
      _sum: {
        amount: true
      },
      _count: true
    });

    // Convertir les Decimal en nombres
    const expensesByPaymentMethod = expensesByPaymentMethodRaw.map(item => ({
      ...item,
      _sum: {
        amount: Number(item._sum.amount || 0)
      }
    }));

    // Évolution mensuelle (6 derniers mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyExpenses = await prisma.$queryRaw<Array<{
      month: string;
      total: number;
      count: number;
    }>>`
      SELECT 
        TO_CHAR(date, 'YYYY-MM') as month,
        SUM(amount)::float as total,
        COUNT(*)::int as count
      FROM "Expense"
      WHERE "isActive" = true
        AND date >= ${sixMonthsAgo}
      GROUP BY TO_CHAR(date, 'YYYY-MM')
      ORDER BY month ASC
    `;

    // Top 5 des dépenses récentes
    const recentExpensesRaw = await prisma.expense.findMany({
      where: {
        isActive: true,
        date: {
          gte: start,
          lte: end
        }
      },
      orderBy: { amount: 'desc' },
      take: 5,
      include: {
        category: true,
        user: {
          select: {
            name: true
          }
        }
      }
    });

    // Convertir les Decimal en nombres
    const recentExpenses = recentExpensesRaw.map(expense => ({
      ...expense,
      amount: Number(expense.amount)
    }));

    // Comparaison avec le mois précédent
    const previousMonthStart = new Date(start);
    previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
    const previousMonthEnd = new Date(start);
    previousMonthEnd.setDate(previousMonthEnd.getDate() - 1);

    const previousMonthTotal = await prisma.expense.aggregate({
      where: {
        isActive: true,
        date: {
          gte: previousMonthStart,
          lte: previousMonthEnd
        }
      },
      _sum: {
        amount: true
      }
    });

    const currentTotal = Number(totalExpenses._sum.amount || 0);
    const previousTotal = Number(previousMonthTotal._sum.amount || 0);
    const percentageChange = previousTotal > 0
      ? ((currentTotal - previousTotal) / previousTotal) * 100
      : 0;

    return NextResponse.json({
      total: currentTotal,
      count: totalExpenses._count,
      byCategory: categoriesData,
      byPaymentMethod: expensesByPaymentMethod,
      monthlyTrend: monthlyExpenses,
      recentExpenses,
      comparison: {
        currentMonth: currentTotal,
        previousMonth: previousTotal,
        percentageChange: Math.round(percentageChange * 100) / 100
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}

