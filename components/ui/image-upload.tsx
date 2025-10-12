'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, Camera, XCircle } from 'lucide-react'
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
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)



  // Nettoyer le stream de la caméra
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Ouvrir le sélecteur de fichiers
  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  // Activer la caméra
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Caméra arrière par défaut
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCameraActive(true)
      }
    } catch (error) {
      console.error('Erreur d\'accès à la caméra:', error)
      toast.error('Erreur', {
        description: 'Impossible d\'accéder à la caméra. Vérifiez les permissions.',
      })
    }
  }

  // Arrêter la caméra
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }

  // Capturer la photo
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    // Définir les dimensions du canvas
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Dessiner l'image de la vidéo sur le canvas
    const context = canvas.getContext('2d')
    if (!context) return

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convertir le canvas en blob
    canvas.toBlob(async (blob) => {
      if (!blob) return

      setIsProcessing(true)
      stopCamera()

      try {
        // Créer un fichier à partir du blob
        const file = new File([blob], 'photo-produit.jpg', { type: 'image/jpeg' })

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
            toast.success('Photo capturée et optimisée', {
              description: `Taille réduite de ${savedPercent}% (${formatFileSize(savedBytes)} économisés)`,
            })
          } else {
            toast.success('Photo capturée avec succès')
          }
        } else {
          toast.success('Photo capturée avec succès')
        }

        onChange(result.data!)
      } catch (error) {
        toast.error('Erreur', {
          description: 'Impossible de traiter la photo',
        })
      } finally {
        setIsProcessing(false)
      }
    }, 'image/jpeg', 0.95)
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
      {value && !isProcessing && (
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



      {/* Vue caméra active */}
      {isCameraActive && (
        <div className="space-y-4">
          <div className="relative w-full h-96 bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Overlay avec grille de composition */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="border border-white/20" />
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={capturePhoto}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              disabled={disabled}
            >
              <Camera className="w-4 h-4 mr-2" />
              Capturer la photo
            </Button>
            <Button
              type="button"
              onClick={stopCamera}
              variant="outline"
              disabled={disabled}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Canvas caché pour la capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Boutons d'upload */}
      {!value && !isProcessing && !isCameraActive && (
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

            <div className="flex gap-2">
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
      {value && !disabled && !isProcessing && !isCameraActive && (
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
            onClick={startCamera}
            variant="outline"
            size="sm"
            className="flex-1 bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 border-violet-200"
          >
            <Camera className="w-4 h-4 mr-2" />
            Nouvelle photo
          </Button>
        </div>
      )}
    </div>
  )
}

