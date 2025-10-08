import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Schéma de validation pour créer un utilisateur
const createUserSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  company: z.string().optional().nullable(),
  role: z.enum(['OWNER', 'SELLER'], {
    errorMap: () => ({ message: 'Le rôle doit être OWNER ou SELLER' })
  })
})

// Schéma de validation pour mettre à jour un utilisateur
const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  email: z.string().email('Adresse email invalide').optional(),
  company: z.string().optional().nullable(),
  role: z.enum(['OWNER', 'SELLER']).optional(),
  isActive: z.boolean().optional()
})

// GET - Récupérer tous les utilisateurs (OWNER seulement)
export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouvel utilisateur (OWNER seulement)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validation des données
    const validatedData = createUserSchema.parse(body)
    const { name, email, password, company, role } = validatedData

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cette adresse email existe déjà' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        company: company || null,
        role,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user
    })

  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)

    // Erreur de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    // Erreur Prisma (contrainte unique, etc.)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Un compte avec cette adresse email existe déjà' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un utilisateur
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()

    // Validation des données
    const validatedData = updateUserSchema.parse(body)
    const { id, ...updateData } = validatedData

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier les permissions
    const isOwnProfile = id === session.userId
    const isOwner = session.role === 'OWNER'

    // Seuls les propriétaires peuvent modifier d'autres comptes, ou l'utilisateur peut modifier son propre profil
    if (!isOwnProfile && !isOwner) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Si c'est son propre profil, on ne peut pas changer le rôle ou le statut actif
    if (isOwnProfile) {
      delete updateData.role
      delete updateData.isActive
    }

    // Si l'email est modifié, vérifier qu'il n'existe pas déjà
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email.toLowerCase() }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Un compte avec cette adresse email existe déjà' },
          { status: 400 }
        )
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        email: updateData.email ? updateData.email.toLowerCase() : undefined,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      user: updatedUser
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)

    // Erreur de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
