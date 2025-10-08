import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Upload logo - Début')

    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      console.log('❌ Accès non autorisé')
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    console.log('✅ Session validée:', session.userId)

    const formData = await request.formData()
    const file = formData.get('logo') as File

    if (!file) {
      console.log('❌ Aucun fichier fourni')
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    console.log('📁 Fichier reçu:', file.name, file.type, file.size)

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Type de fichier non autorisé:', file.type)
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP.' },
        { status: 400 }
      )
    }

    // Vérifier la taille du fichier (max 2MB pour base64)
    const maxSize = 2 * 1024 * 1024 // 2MB (réduit pour base64)
    if (file.size > maxSize) {
      console.log('❌ Fichier trop volumineux:', file.size)
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux. Taille maximale : 2MB.' },
        { status: 400 }
      )
    }

    console.log('🔄 Conversion en base64...')

    // Convertir le fichier en base64 (pour stockage en BDD)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    console.log('✅ Conversion réussie, taille base64:', dataUrl.length)

    // Sauvegarder dans la base de données
    console.log('💾 Sauvegarde dans la BDD...')

    const existingSettings = await prisma.companySettings.findFirst()

    let settings
    if (existingSettings) {
      console.log('🔄 Mise à jour des paramètres existants')
      settings = await prisma.companySettings.update({
        where: { id: existingSettings.id },
        data: { companyLogo: dataUrl }
      })
    } else {
      console.log('➕ Création de nouveaux paramètres')
      settings = await prisma.companySettings.create({
        data: {
          companyName: 'Mon Entreprise',
          companyLogo: dataUrl,
          invoicePrefix: 'FAC',
          creditNotePrefix: 'FAV',
          defaultTaxRate: 20
        }
      })
    }

    console.log('✅ Logo sauvegardé avec succès')

    return NextResponse.json({
      success: true,
      url: dataUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
      message: 'Logo uploadé et sauvegardé avec succès'
    })

  } catch (error) {
    console.error('❌ Error uploading logo:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors de l\'upload du fichier',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

// GET - Récupérer le logo actuel
export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const settings = await prisma.companySettings.findFirst()

    if (!settings || !settings.companyLogo) {
      return NextResponse.json({ logo: null })
    }

    return NextResponse.json({
      logo: settings.companyLogo,
      hasLogo: true
    })

  } catch (error) {
    console.error('Error getting logo:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du logo' },
      { status: 500 }
    )
  }
}
