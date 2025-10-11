'use client'

import { useRef } from 'react'
import { Camera, Upload, X } from 'lucide-react'
import { Button } from './button'
import Image from 'next/image'

interface SimpleCameraInputProps {
  value?: string
  onChange: (imageData: string) => void
  onRemove?: () => void
  disabled?: boolean
}

export function SimpleCameraInput({
  value,
  onChange,
  onRemove,
  disabled = false,
}: SimpleCameraInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Convertir le fichier en base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Gérer la sélection de fichier
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const base64 = await fileToBase64(file)
      onChange(base64)
    } catch (error) {
      console.error('Erreur lors de la conversion:', error)
      alert('Erreur lors du traitement de l\'image')
    }

    // Réinitialiser l'input
    e.target.value = ''
  }

  // Ouvrir la galerie
  const openGallery = () => {
    fileInputRef.current?.click()
  }

  // Ouvrir la caméra (mobile)
  const openCamera = () => {
    cameraInputRef.current?.click()
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
    <div className="space-y-4">
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
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Interface d'upload */}
      {!value && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-blue-50 rounded-full">
              <Camera className="w-8 h-8 text-blue-600" />
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">
                Ajouter une photo du produit
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Utilisez l'appareil photo ou choisissez depuis la galerie
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Button
                type="button"
                onClick={openCamera}
                disabled={disabled}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Camera className="w-4 h-4 mr-2" />
                Prendre une photo
              </Button>
              
              <Button
                type="button"
                onClick={openGallery}
                disabled={disabled}
                variant="outline"
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choisir depuis la galerie
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Boutons de modification si image existe */}
      {value && !disabled && (
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={openCamera}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <Camera className="w-4 h-4 mr-2" />
            Nouvelle photo
          </Button>
          <Button
            type="button"
            onClick={openGallery}
            variant="outline"
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Galerie
          </Button>
        </div>
      )}

      {/* Input caché pour la galerie */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Input caché pour la caméra (mobile) */}
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
  )
}
