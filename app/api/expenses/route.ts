import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// GET - Récupérer toutes les dépenses avec filtres
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const paymentMethod = searchParams.get('paymentMethod');

    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: Prisma.ExpenseWhereInput = {
      isActive: true,
      ...(search && {
        OR: [
          { description: { contains: search, mode: 'insensitive' } },
          { reference: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(categoryId && { categoryId }),
      ...(paymentMethod && { paymentMethod: paymentMethod as any }),
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          category: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.expense.count({ where })
    ]);

    return NextResponse.json({
      expenses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des dépenses:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des dépenses' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle dépense
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const {
      amount,
      description,
      date,
      categoryId,
      paymentMethod,
      reference,
      receipt,
      notes
    } = body;

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Le montant doit être supérieur à 0' },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { error: 'La description est requise' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: 'La catégorie est requise' },
        { status: 400 }
      );
    }

    // Vérifier que la catégorie existe
    const category = await prisma.expenseCategory.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        amount,
        description,
        date: date ? new Date(date) : new Date(),
        categoryId,
        paymentMethod: paymentMethod || 'CASH',
        reference,
        receipt,
        notes,
        userId: session.userId
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la dépense:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la dépense' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une dépense
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      amount,
      description,
      date,
      categoryId,
      paymentMethod,
      reference,
      receipt,
      notes
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'L\'ID de la dépense est requis' },
        { status: 400 }
      );
    }

    // Vérifier que la dépense existe
    const existingExpense = await prisma.expense.findUnique({
      where: { id }
    });

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Dépense non trouvée' },
        { status: 404 }
      );
    }

    // Seul le propriétaire ou le créateur peut modifier
    if (session.role !== 'OWNER' && existingExpense.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...(amount && { amount }),
        ...(description && { description }),
        ...(date && { date: new Date(date) }),
        ...(categoryId && { categoryId }),
        ...(paymentMethod && { paymentMethod }),
        ...(reference !== undefined && { reference }),
        ...(receipt !== undefined && { receipt }),
        ...(notes !== undefined && { notes })
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la dépense:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la dépense' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une dépense
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'L\'ID de la dépense est requis' },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.findUnique({
      where: { id }
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'Dépense non trouvée' },
        { status: 404 }
      );
    }

    // Seul le propriétaire ou le créateur peut supprimer
    if (session.role !== 'OWNER' && expense.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    // Soft delete
    await prisma.expense.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({ message: 'Dépense supprimée' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la dépense:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la dépense' },
      { status: 500 }
    );
  }
}

