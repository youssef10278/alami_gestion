import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { uploadImage, deleteImage } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Upload Product Image - Début')
    
    const session = await getSession()
    if (!session) {
      console.log('❌ Non authentifié')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Les vendeurs peuvent aussi uploader des images de produits
    if (session.role !== 'OWNER' && session.role !== 'SELLER') {
      console.log('❌ Accès non autorisé')
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    console.log('✅ Session validée:', session.userId)

    const formData = await request.formData()
    const file = formData.get('image') as File
    const productId = formData.get('productId') as string

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

    // Upload vers Cloudinary avec transformations optimisées
    const folder = 'alami-gestion/products'
    const result = await uploadImage(file, folder)

    console.log('✅ Upload Cloudinary réussi:', result.url)

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      filename: file.name,
      size: file.size,
      type: file.type,
      message: 'Image de produit uploadée avec succès sur Cloudinary'
    })

  } catch (error) {
    console.error('❌ Error uploading product image to Cloudinary:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'upload de l\'image',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une image de produit
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Delete Product Image - Début')
    
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (session.role !== 'OWNER' && session.role !== 'SELLER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get('publicId')

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID requis' }, { status: 400 })
    }

    console.log('🔄 Suppression de Cloudinary:', publicId)

    await deleteImage(publicId)

    console.log('✅ Image supprimée de Cloudinary')

    return NextResponse.json({
      success: true,
      message: 'Image supprimée avec succès'
    })

  } catch (error) {
    console.error('❌ Error deleting product image from Cloudinary:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la suppression de l\'image',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
