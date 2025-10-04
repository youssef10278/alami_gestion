'use client'

import { useState, useRef } from 'react'
import { Upload, Camera, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { processUploadedImage, formatFileSize } from '@/lib/image-optimizer'
import { toast } from 'sonner'

interface ImageUploadProps {
  value?: string
  onChange: (imageData: string) => void
  onRemove?: () => void
  disabled?: boolean
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  className,
}: ImageUploadProps) {
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Ouvrir le sélecteur de fichiers
  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  // Gérer le fichier sélectionné avec optimisation
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)

    try {
      // Optimiser l'image
      const result = await processUploadedImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85,
        format: 'jpeg',
      })

      if (!result.success) {
        toast.error('Erreur', {
          description: result.error,
        })
        return
      }

      // Afficher les statistiques d'optimisation
      if (result.originalSize && result.optimizedSize) {
        const savedBytes = result.originalSize - result.optimizedSize
        const savedPercent = Math.round((savedBytes / result.originalSize) * 100)

        if (savedPercent > 10) {
          toast.success('Image optimisée', {
            description: `Taille réduite de ${savedPercent}% (${formatFileSize(savedBytes)} économisés)`,
          })
        }
      }

      onChange(result.data!)
    } catch (error) {
      toast.error('Erreur', {
        description: 'Impossible de traiter l\'image',
      })
    } finally {
      setIsProcessing(false)
      // Réinitialiser l'input pour permettre de sélectionner le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Ouvrir la caméra
  const handleOpenCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      setCameraStream(stream)
      setShowCamera(true)

      // Attendre que la vidéo soit prête
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }, 100)
    } catch (error) {
      console.error('Erreur d\'accès à la caméra:', error)
      alert('Impossible d\'accéder à la caméra. Veuillez vérifier les permissions.')
    }
  }

  // Fermer la caméra
  const handleCloseCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
    setShowCamera(false)
  }

  // Capturer la photo avec optimisation
  const handleCapture = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      setIsProcessing(true)

      try {
        // Définir les dimensions du canvas (max 800px)
        let width = video.videoWidth
        let height = video.videoHeight

        const maxSize = 800
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        canvas.width = width
        canvas.height = height

        // Dessiner l'image de la vidéo sur le canvas
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(video, 0, 0, width, height)

          // Convertir en base64 avec compression
          const imageData = canvas.toDataURL('image/jpeg', 0.85)
          onChange(imageData)

          toast.success('Photo capturée', {
            description: 'Image optimisée automatiquement',
          })

          // Fermer la caméra
          handleCloseCamera()
        }
      } catch (error) {
        toast.error('Erreur', {
          description: 'Impossible de capturer la photo',
        })
      } finally {
        setIsProcessing(false)
      }
    }
  }

  // Supprimer l'image
  const handleRemove = () => {
    if (onRemove) {
      onRemove()
    } else {
      onChange('')
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Prévisualisation de l'image */}
      {value && !showCamera && !isProcessing && (
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
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Indicateur de traitement */}
      {isProcessing && (
        <div className="w-full h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-600 font-medium">
            Optimisation de l'image...
          </p>
        </div>
      )}

      {/* Caméra */}
      {showCamera && (
        <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <Button
              type="button"
              onClick={handleCapture}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Camera className="w-4 h-4 mr-2" />
              Capturer
            </Button>
            <Button
              type="button"
              onClick={handleCloseCamera}
              variant="outline"
              className="bg-white"
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Boutons d'upload */}
      {!value && !showCamera && !isProcessing && (
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
                PNG, JPG jusqu'à 5 MB • Optimisation automatique
              </p>
            </div>

            <div className="flex gap-3">
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
                onClick={handleOpenCamera}
                disabled={disabled}
                variant="outline"
              >
                <Camera className="w-4 h-4 mr-2" />
                Prendre une photo
              </Button>
            </div>
          </div>

          {/* Input file caché */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
          />
        </div>
      )}

      {/* Boutons de modification si image existe */}
      {value && !showCamera && !disabled && !isProcessing && (
        <div className="flex gap-2">
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
            onClick={handleOpenCamera}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Camera className="w-4 h-4 mr-2" />
            Nouvelle photo
          </Button>
        </div>
      )}
    </div>
  )
}

