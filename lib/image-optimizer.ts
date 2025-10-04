/**
 * Utilitaires d'optimisation d'images
 * - Redimensionnement automatique
 * - Compression intelligente
 * - Conversion de format
 */

export interface ImageOptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

/**
 * Redimensionne et compresse une image
 * @param base64 - Image en base64
 * @param options - Options d'optimisation
 * @returns Promise<string> - Image optimisée en base64
 */
export async function optimizeImage(
  base64: string,
  options: ImageOptimizationOptions = {}
): Promise<string> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
    format = 'jpeg',
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      try {
        // Calculer les nouvelles dimensions en gardant le ratio
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        // Créer un canvas pour le redimensionnement
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'))
          return
        }

        // Améliorer la qualité du redimensionnement
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height)

        // Convertir en base64 avec compression
        const mimeType = `image/${format}`
        const optimizedBase64 = canvas.toDataURL(mimeType, quality)

        resolve(optimizedBase64)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Erreur de chargement de l\'image'))
    }

    img.src = base64
  })
}

/**
 * Obtient les dimensions d'une image
 * @param base64 - Image en base64
 * @returns Promise<{width: number, height: number}>
 */
export async function getImageDimensions(
  base64: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      reject(new Error('Erreur de chargement de l\'image'))
    }

    img.src = base64
  })
}

/**
 * Obtient la taille d'une image en base64 (en bytes)
 * @param base64 - Image en base64
 * @returns number - Taille en bytes
 */
export function getBase64Size(base64: string): number {
  // Retirer le préfixe data:image/...;base64,
  const base64String = base64.split(',')[1] || base64
  
  // Calculer la taille
  const padding = (base64String.match(/=/g) || []).length
  const size = (base64String.length * 3) / 4 - padding
  
  return size
}

/**
 * Formate la taille en bytes en format lisible
 * @param bytes - Taille en bytes
 * @returns string - Taille formatée (ex: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Valide une image
 * @param file - Fichier à valider
 * @param maxSize - Taille maximale en bytes (défaut: 5MB)
 * @returns {valid: boolean, error?: string}
 */
export function validateImage(
  file: File,
  maxSize: number = 5 * 1024 * 1024
): { valid: boolean; error?: string } {
  // Vérifier le type
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Le fichier doit être une image (PNG, JPG, GIF, WebP)',
    }
  }

  // Vérifier la taille
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `L'image ne doit pas dépasser ${formatFileSize(maxSize)}`,
    }
  }

  return { valid: true }
}

/**
 * Convertit un fichier en base64
 * @param file - Fichier à convertir
 * @returns Promise<string> - Image en base64
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onloadend = () => {
      resolve(reader.result as string)
    }

    reader.onerror = () => {
      reject(new Error('Erreur de lecture du fichier'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Optimise une image uploadée
 * - Valide le fichier
 * - Convertit en base64
 * - Redimensionne et compresse
 * @param file - Fichier à optimiser
 * @param options - Options d'optimisation
 * @returns Promise<{success: boolean, data?: string, error?: string, originalSize?: number, optimizedSize?: number}>
 */
export async function processUploadedImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<{
  success: boolean
  data?: string
  error?: string
  originalSize?: number
  optimizedSize?: number
}> {
  try {
    // Valider le fichier
    const validation = validateImage(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Convertir en base64
    const base64 = await fileToBase64(file)
    const originalSize = getBase64Size(base64)

    // Optimiser l'image
    const optimized = await optimizeImage(base64, options)
    const optimizedSize = getBase64Size(optimized)

    return {
      success: true,
      data: optimized,
      originalSize,
      optimizedSize,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Crée une miniature d'une image
 * @param base64 - Image en base64
 * @param size - Taille de la miniature (défaut: 150px)
 * @returns Promise<string> - Miniature en base64
 */
export async function createThumbnail(
  base64: string,
  size: number = 150
): Promise<string> {
  return optimizeImage(base64, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'jpeg',
  })
}

