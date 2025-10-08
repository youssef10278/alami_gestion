import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { uploadImage } from '@/lib/cloudinary'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Upload Cloudinary - Début')
    
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      console.log('❌ Accès non autorisé')
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    console.log('✅ Session validée:', session.userId)

    const formData = await request.formData()
    const file = formData.get('logo') as File
    const type = formData.get('type') as string || 'logo' // logo, product, etc.

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

    // Vérifier la taille du fichier (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.log('❌ Fichier trop volumineux:', file.size)
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux. Taille maximale : 10MB.' },
        { status: 400 }
      )
    }

    console.log('🔄 Upload vers Cloudinary...')

    // Upload vers Cloudinary
    const folder = type === 'logo' ? 'alami-gestion/logos' : `alami-gestion/${type}`
    const result = await uploadImage(file, folder)

    console.log('✅ Upload Cloudinary réussi:', result.url)

    // Si c'est un logo, sauvegarder dans la BDD
    if (type === 'logo') {
      console.log('💾 Sauvegarde du logo dans la BDD...')
      
      const existingSettings = await prisma.companySettings.findFirst()
      
      if (existingSettings) {
        console.log('🔄 Mise à jour des paramètres existants')
        await prisma.companySettings.update({
          where: { id: existingSettings.id },
          data: { companyLogo: result.url }
        })
      } else {
        console.log('➕ Création de nouveaux paramètres')
        await prisma.companySettings.create({
          data: {
            companyName: 'Mon Entreprise',
            companyLogo: result.url,
            invoicePrefix: 'FAC',
            creditNotePrefix: 'FAV',
            defaultTaxRate: 20
          }
        })
      }

      console.log('✅ Logo sauvegardé dans la BDD')
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      filename: file.name,
      size: file.size,
      type: file.type,
      message: 'Image uploadée avec succès sur Cloudinary'
    })

  } catch (error) {
    console.error('❌ Error uploading to Cloudinary:', error)
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

