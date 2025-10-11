'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, Camera, XCircle } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { toast } from 'sonner'

interface CloudinaryImageUploadProps {
  value?: string
  onChange: (imageUrl: string, publicId?: string) => void
  onRemove?: () => void
  disabled?: boolean
  className?: string
  productId?: string
}

export function CloudinaryImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  className,
  productId,
}: CloudinaryImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [currentPublicId, setCurrentPublicId] = useState<string>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)
      const isTouchDevice = 'ontouchstart' in window
      setIsMobile(isMobileDevice || isTouchDevice)
    }
    
    checkMobile()
  }, [])

  // Upload vers Cloudinary
  const uploadToCloudinary = async (file: File) => {
    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      if (productId) {
        formData.append('productId', productId)
      }

      const response = await fetch('/api/upload/product', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'upload')
      }

      setCurrentPublicId(result.publicId)
      onChange(result.url, result.publicId)
      
      toast.success('Image uploadée avec succès !', {
        description: `Taille: ${Math.round(result.size / 1024)} KB`
      })

    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Erreur lors de l\'upload', {
        description: error instanceof Error ? error.message : 'Erreur inconnue'
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Gérer la sélection de fichier
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation côté client
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Type de fichier non autorisé', {
        description: 'Utilisez JPG, PNG, GIF ou WebP'
      })
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error('Fichier trop volumineux', {
        description: 'Taille maximale : 10MB'
      })
      return
    }

    await uploadToCloudinary(file)
    
    // Réinitialiser l'input
    e.target.value = ''
  }

  // Ouvrir la sélection de fichier
  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  // Ouvrir la caméra (mobile)
  const handleCameraSelect = () => {
    cameraInputRef.current?.click()
  }

  // Démarrer la caméra avancée
  const startCamera = async () => {
    try {
      // Vérifier le support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Votre navigateur ne supporte pas l\'accès à la caméra')
      }

      // Vérifier HTTPS
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        throw new Error('L\'accès à la caméra nécessite une connexion HTTPS')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
        toast.success('Caméra activée !')
      }

    } catch (error: any) {
      let errorMessage = 'Impossible d\'accéder à la caméra.'
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Permission refusée. Autorisez l\'accès à la caméra dans les paramètres.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Aucune caméra trouvée sur cet appareil.'
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Votre navigateur ne supporte pas l\'accès à la caméra.'
      }

      toast.error('Erreur caméra', { description: errorMessage })
    }
  }

  // Prendre une photo
  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // Configurer le canvas
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Dessiner l'image
    ctx.drawImage(video, 0, 0)

    // Convertir en blob
    canvas.toBlob(async (blob) => {
      if (!blob) return

      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })
      await uploadToCloudinary(file)
      stopCamera()
    }, 'image/jpeg', 0.8)
  }

  // Arrêter la caméra
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCameraActive(false)
  }

  // Supprimer l'image
  const handleRemove = async () => {
    if (currentPublicId) {
      try {
        await fetch(`/api/upload/product?publicId=${currentPublicId}`, {
          method: 'DELETE',
        })
      } catch (error) {
        console.error('Error deleting image:', error)
      }
    }

    if (onRemove) {
      onRemove()
    } else {
      onChange('', '')
    }
    setCurrentPublicId(undefined)
  }

  // Nettoyage
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Prévisualisation de l'image */}
      {value && (
        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden group">
          <Image
            src={value}
            alt="Aperçu du produit"
            fill
            className="object-contain"
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Interface de caméra */}
      {isCameraActive && (
        <div className="space-y-4">
          <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={takePhoto}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 mr-2" />
              )}
              Prendre la photo
            </Button>
            <Button
              type="button"
              onClick={stopCamera}
              variant="outline"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Canvas caché pour la capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Interface d'upload */}
      {!value && !isUploading && !isCameraActive && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-blue-50 rounded-full">
              <ImageIcon className="w-8 h-8 text-blue-600" />
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">
                Ajouter une photo du produit
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG jusqu'à 10 MB • Stockage cloud optimisé
              </p>
            </div>

            <div className="flex gap-2">
              {isMobile ? (
                // Sur mobile, prioriser la prise de photo
                <>
                  <Button
                    type="button"
                    onClick={handleCameraSelect}
                    disabled={disabled}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Prendre une photo
                  </Button>
                  <Button
                    type="button"
                    onClick={startCamera}
                    disabled={disabled}
                    variant="outline"
                    className="bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 border-violet-200"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Caméra avancée
                  </Button>
                </>
              ) : (
                // Sur desktop, garder l'ordre original
                <>
                  <Button
                    type="button"
                    onClick={handleFileSelect}
                    disabled={disabled}
                    variant="outline"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choisir un fichier
                  </Button>
                  <Button
                    type="button"
                    onClick={startCamera}
                    disabled={disabled}
                    variant="outline"
                    className="bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 border-violet-200"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Prendre une photo
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Input file caché pour galerie */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
          />

          {/* Input file caché pour caméra mobile */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
          />
        </div>
      )}

      {/* État de chargement */}
      {isUploading && (
        <div className="flex items-center justify-center p-8 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-900">
              Upload vers Cloudinary...
            </p>
            <p className="text-xs text-blue-600">
              Optimisation et stockage en cours
            </p>
          </div>
        </div>
      )}

      {/* Boutons de modification si image existe */}
      {value && !disabled && !isUploading && !isCameraActive && (
        <div className="flex gap-2">
          {isMobile ? (
            // Sur mobile, prioriser la prise de photo
            <>
              <Button
                type="button"
                onClick={handleCameraSelect}
                variant="outline"
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-blue-600"
              >
                <Camera className="w-4 h-4 mr-2" />
                Nouvelle photo
              </Button>
              <Button
                type="button"
                onClick={startCamera}
                variant="outline"
                size="sm"
                className="flex-1 bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 border-violet-200"
              >
                <Camera className="w-4 h-4 mr-2" />
                Caméra avancée
              </Button>
            </>
          ) : (
            // Sur desktop, garder l'ordre original
            <>
              <Button
                type="button"
                onClick={handleFileSelect}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Changer l'image
              </Button>
              <Button
                type="button"
                onClick={startCamera}
                variant="outline"
                size="sm"
                className="flex-1 bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 border-violet-200"
              >
                <Camera className="w-4 h-4 mr-2" />
                Nouvelle photo
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
