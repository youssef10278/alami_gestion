import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET - Récupérer toutes les catégories de dépenses
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const categories = await prisma.expenseCategory.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { expenses: true }
        }
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle catégorie
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Seul le propriétaire peut créer des catégories
    if (session.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Accès refusé. Seul le propriétaire peut créer des catégories.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, color, icon } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom de la catégorie est requis' },
        { status: 400 }
      );
    }

    // Vérifier si la catégorie existe déjà
    const existingCategory = await prisma.expenseCategory.findUnique({
      where: { name }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Une catégorie avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    const category = await prisma.expenseCategory.create({
      data: {
        name,
        description,
        color: color || '#3b82f6',
        icon: icon || '💰'
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la catégorie' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une catégorie
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (session.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Accès refusé. Seul le propriétaire peut modifier des catégories.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, name, description, color, icon, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'L\'ID de la catégorie est requis' },
        { status: 400 }
      );
    }

    // Vérifier si le nouveau nom existe déjà (sauf pour la catégorie actuelle)
    if (name) {
      const existingCategory = await prisma.expenseCategory.findFirst({
        where: {
          name,
          NOT: { id }
        }
      });

      if (existingCategory) {
        return NextResponse.json(
          { error: 'Une catégorie avec ce nom existe déjà' },
          { status: 400 }
        );
      }
    }

    const category = await prisma.expenseCategory.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(icon && { icon }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la catégorie' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer (désactiver) une catégorie
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (session.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Accès refusé. Seul le propriétaire peut supprimer des catégories.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'L\'ID de la catégorie est requis' },
        { status: 400 }
      );
    }

    // Vérifier si la catégorie a des dépenses
    const category = await prisma.expenseCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { expenses: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    if (category._count.expenses > 0) {
      // Soft delete si la catégorie a des dépenses
      await prisma.expenseCategory.update({
        where: { id },
        data: { isActive: false }
      });
      return NextResponse.json({ 
        message: 'Catégorie désactivée (elle contient des dépenses)' 
      });
    } else {
      // Hard delete si pas de dépenses
      await prisma.expenseCategory.delete({
        where: { id }
      });
      return NextResponse.json({ message: 'Catégorie supprimée' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la catégorie' },
      { status: 500 }
    );
  }
}

