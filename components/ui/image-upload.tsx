'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
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
  const fileInputRef = useRef<HTMLInputElement>(null)



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



      {/* Boutons d'upload */}
      {!value && !isProcessing && (
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

            <Button
              type="button"
              onClick={handleFileSelect}
              disabled={disabled}
              variant="outline"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choisir un fichier
            </Button>
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
      {value && !disabled && !isProcessing && (
        <Button
          type="button"
          onClick={handleFileSelect}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Changer l'image
        </Button>
      )}
    </div>
  )
}

