import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Récupérer les paramètres de design du devis
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer les paramètres de design du devis
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          startsWith: 'quote_design_'
        }
      }
    })

    // Convertir en objet
    const designSettings: Record<string, any> = {}
    settings.forEach(setting => {
      const key = setting.key.replace('quote_design_', '')
      try {
        designSettings[key] = JSON.parse(setting.value)
      } catch {
        designSettings[key] = setting.value
      }
    })

    return NextResponse.json(designSettings)
  } catch (error) {
    console.error('Get quote design settings error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    )
  }
}

// POST - Sauvegarder les paramètres de design du devis
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const settings = await request.json()

    // Sauvegarder chaque paramètre
    const settingsToSave = Object.entries(settings).map(([key, value]) => ({
      key: `quote_design_${key}`,
      value: typeof value === 'string' ? value : JSON.stringify(value),
      description: `Paramètre de design du devis: ${key}`
    }))

    // Utiliser upsert pour chaque paramètre
    await Promise.all(
      settingsToSave.map(setting =>
        prisma.setting.upsert({
          where: { key: setting.key },
          update: { 
            value: setting.value,
            updatedAt: new Date()
          },
          create: setting
        })
      )
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Paramètres de design du devis sauvegardés' 
    })
  } catch (error) {
    console.error('Save quote design settings error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde des paramètres' },
      { status: 500 }
    )
  }
}

// DELETE - Réinitialiser les paramètres de design du devis
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Supprimer tous les paramètres de design du devis
    await prisma.setting.deleteMany({
      where: {
        key: {
          startsWith: 'quote_design_'
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Paramètres de design du devis réinitialisés' 
    })
  } catch (error) {
    console.error('Reset quote design settings error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation des paramètres' },
      { status: 500 }
    )
  }
}
