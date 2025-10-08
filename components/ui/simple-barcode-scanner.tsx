'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Camera, AlertCircle, RotateCcw, Zap } from 'lucide-react'
import { Button } from './button'
import { Card } from './card'
import { toast } from 'sonner'

interface SimpleBarcodeScanner {
  onScan: (barcode: string) => void
  onClose: () => void
}

export function SimpleBarcodeScanner({ onScan, onClose }: SimpleBarcodeScanner) {
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<any>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    initializeCamera()
    
    return () => {
      mountedRef.current = false
      cleanup()
    }
  }, [])

  const initializeCamera = async () => {
    try {
      if (!mountedRef.current) return
      
      setIsInitializing(true)
      setError(null)

      // Vérifications préliminaires
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Caméra non supportée par ce navigateur')
      }

      // Vérifier HTTPS
      if (typeof window !== 'undefined') {
        const needsHttps = window.location.protocol !== 'https:' && 
                          window.location.hostname !== 'localhost' && 
                          window.location.hostname !== '127.0.0.1'
        
        if (needsHttps) {
          throw new Error('HTTPS requis pour accéder à la caméra')
        }
      }

      // Obtenir le flux vidéo
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      })

      if (!mountedRef.current) {
        stream.getTracks().forEach(track => track.stop())
        return
      }

      setCameraStream(stream)

      // Configurer la vidéo
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Élément vidéo non disponible'))
            return
          }

          const video = videoRef.current
          
          const onLoadedMetadata = () => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata)
            video.removeEventListener('error', onError)
            resolve()
          }
          
          const onError = () => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata)
            video.removeEventListener('error', onError)
            reject(new Error('Erreur de chargement vidéo'))
          }

          video.addEventListener('loadedmetadata', onLoadedMetadata)
          video.addEventListener('error', onError)
        })

        await videoRef.current.play()
      }

      if (!mountedRef.current) return

      // Initialiser Html5Qrcode
      await initializeScanner()

    } catch (err: any) {
      if (!mountedRef.current) return
      
      console.error('Erreur initialisation caméra:', err)
      
      let errorMessage = 'Erreur d\'accès à la caméra'
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Accès à la caméra refusé. Autorisez l\'accès dans votre navigateur.'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Aucune caméra trouvée sur cet appareil.'
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Caméra déjà utilisée. Fermez les autres applications utilisant la caméra.'
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setIsInitializing(false)
    }
  }

  const initializeScanner = async () => {
    try {
      if (!mountedRef.current) return

      const { Html5Qrcode } = await import('html5-qrcode')
      
      // Créer un conteneur unique pour Html5Qrcode
      const scannerId = 'simple-scanner-' + Date.now()
      
      // Créer l'élément conteneur
      const container = document.createElement('div')
      container.id = scannerId
      container.style.width = '100%'
      container.style.height = '300px'
      
      // L'ajouter au DOM temporairement
      document.body.appendChild(container)

      const html5QrCode = new Html5Qrcode(scannerId)
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: function(viewfinderWidth, viewfinderHeight) {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight)
            const qrboxSize = Math.floor(minEdge * 0.7)
            return {
              width: Math.min(qrboxSize, 250),
              height: Math.min(qrboxSize, 250)
            }
          },
          aspectRatio: 1.0,
          disableFlip: false
        },
        (decodedText: string) => {
          if (!mountedRef.current) return
          
          console.log('Code scanné:', decodedText)
          toast.success('Code scanné !', {
            description: decodedText,
            duration: 2000
          })
          
          onScan(decodedText)
          cleanup()
          onClose()
        },
        (errorMessage: string) => {
          // Ignorer les erreurs de scan continues
        }
      )

      if (!mountedRef.current) {
        html5QrCode.stop().catch(console.error)
        return
      }

      // Déplacer le contenu du scanner dans notre conteneur
      const scannerElement = document.getElementById(scannerId)
      const targetContainer = document.getElementById('scanner-target-container')
      
      if (scannerElement && targetContainer) {
        // Copier le contenu
        targetContainer.innerHTML = scannerElement.innerHTML
        
        // Supprimer l'élément temporaire
        document.body.removeChild(scannerElement)
      }

      setIsScanning(true)
      setIsInitializing(false)

    } catch (err: any) {
      if (!mountedRef.current) return
      
      console.error('Erreur initialisation scanner:', err)
      setError('Erreur d\'initialisation du scanner: ' + (err.message || 'Erreur inconnue'))
      setIsInitializing(false)
    }
  }

  const cleanup = () => {
    // Arrêter Html5Qrcode
    if (scannerRef.current) {
      scannerRef.current.stop()
        .then(() => scannerRef.current?.clear())
        .catch(console.error)
        .finally(() => {
          scannerRef.current = null
        })
    }

    // Arrêter le flux caméra
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }

    // Nettoyer les éléments temporaires
    const tempElements = document.querySelectorAll('[id^="simple-scanner-"]')
    tempElements.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el)
      }
    })
  }

  const handleRetry = () => {
    cleanup()
    setTimeout(() => {
      if (mountedRef.current) {
        initializeCamera()
      }
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Scanner</h3>
          </div>
          <button
            onClick={() => { cleanup(); onClose(); }}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-4">
          {/* État d'initialisation */}
          {isInitializing && (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
                <Camera className="absolute inset-0 m-auto w-6 h-6 text-blue-600" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-medium text-gray-900">Initialisation</p>
                <p className="text-sm text-gray-600">Accès à la caméra...</p>
              </div>
            </div>
          )}

          {/* État d'erreur */}
          {error && !isInitializing && (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">Erreur caméra</p>
                <p className="text-sm text-red-600">{error}</p>
                <p className="text-xs text-gray-500">
                  Vérifiez les permissions et réessayez
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRetry} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Réessayer
                </Button>
                <Button onClick={() => { cleanup(); onClose(); }} variant="outline" size="sm">
                  Fermer
                </Button>
              </div>
            </div>
          )}

          {/* Scanner actif */}
          {isScanning && !error && (
            <div className="space-y-4">
              {/* Conteneur scanner */}
              <div className="relative bg-black rounded-xl overflow-hidden">
                <div
                  id="scanner-target-container"
                  className="w-full h-64 flex items-center justify-center"
                >
                  {/* Fallback si Html5Qrcode ne charge pas */}
                  <div className="text-white text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm opacity-75">Chargement du scanner...</p>
                  </div>
                </div>
                
                {/* Overlay avec cadre de scan */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Cadre de scan central */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative w-40 h-40">
                      {/* Cadre principal */}
                      <div className="absolute inset-0 border-2 border-green-400 rounded-lg shadow-lg"></div>
                      
                      {/* Coins */}
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-l-4 border-t-4 border-white rounded-tl"></div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-r-4 border-t-4 border-white rounded-tr"></div>
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-4 border-b-4 border-white rounded-bl"></div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-4 border-b-4 border-white rounded-br"></div>
                      
                      {/* Ligne de scan */}
                      <div className="absolute inset-x-2 top-1/2 h-0.5 bg-green-400 animate-pulse shadow-sm"></div>
                    </div>
                  </div>
                  
                  {/* Instructions */}
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-black bg-opacity-80 text-white px-3 py-1.5 rounded-lg text-center">
                      <p className="text-xs font-medium">Centrez le code dans le cadre</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Conseils de scan :</p>
                    <ul className="space-y-0.5 text-xs">
                      <li>• Maintenez l'appareil stable</li>
                      <li>• Assurez-vous d'avoir un bon éclairage</li>
                      <li>• Le scan se fait automatiquement</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bouton annuler */}
              <Button 
                onClick={() => { cleanup(); onClose(); }} 
                variant="outline" 
                className="w-full"
              >
                Annuler
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

// Composant bouton
interface SimpleBarcodeButtonProps {
  onScan: (barcode: string) => void
  className?: string
  children?: React.ReactNode
}

export function SimpleBarcodeButton({ onScan, className, children }: SimpleBarcodeButtonProps) {
  const [showScanner, setShowScanner] = useState(false)

  const handleScan = (barcode: string) => {
    onScan(barcode)
    setShowScanner(false)
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowScanner(true)}
        className={className}
      >
        {children || (
          <>
            <Camera className="w-4 h-4 mr-2" />
            Scanner
          </>
        )}
      </Button>

      {showScanner && (
        <SimpleBarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  )
}
