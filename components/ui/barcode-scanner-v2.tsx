'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Camera, AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from './button'
import { Card } from './card'
import { useCameraManagerV2 } from '@/lib/camera-manager-v2'
import { toast } from 'sonner'

interface BarcodeScannerV2Props {
  onScan: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScannerV2({ onScan, onClose }: BarcodeScannerV2Props) {
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scannerRef = useRef<any>(null)
  const animationRef = useRef<number>()
  const { requestCamera, releaseCamera } = useCameraManagerV2()

  useEffect(() => {
    initializeScanner()
    return cleanup
  }, [])

  const initializeScanner = async () => {
    try {
      setIsInitializing(true)
      setError(null)

      // 1. Demander accès caméra via gestionnaire
      const cameraResult = await requestCamera('barcode-scanner')
      if (!cameraResult.success) {
        throw new Error(cameraResult.error || 'Accès caméra refusé')
      }

      // 2. Obtenir le flux vidéo
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      })

      setCameraStream(stream)

      // 3. Configurer la vidéo
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve
          }
        })
        await videoRef.current.play()
      }

      // 4. Initialiser Html5Qrcode
      const { Html5Qrcode } = await import('html5-qrcode')
      const html5QrCode = new Html5Qrcode('scanner-video-container')
      scannerRef.current = html5QrCode

      // 5. Démarrer le scan
      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: function(viewfinderWidth, viewfinderHeight) {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight)
            const qrboxSize = Math.floor(minEdge * 0.8)
            return {
              width: Math.min(qrboxSize, 300),
              height: Math.min(qrboxSize, 300)
            }
          },
          aspectRatio: 1.0
        },
        (decodedText: string) => {
          console.log('Code scanné:', decodedText)
          onScan(decodedText)
          cleanup()
          onClose()
        },
        (errorMessage: string) => {
          // Ignorer les erreurs de scan continues
        }
      )

      setIsScanning(true)
      setIsInitializing(false)

    } catch (err: any) {
      console.error('Erreur initialisation scanner:', err)
      setError(err.message || 'Erreur d\'initialisation du scanner')
      setIsInitializing(false)
    }
  }

  const cleanup = () => {
    // Arrêter l'animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // Arrêter Html5Qrcode
    if (scannerRef.current) {
      scannerRef.current.stop().catch(console.error)
      scannerRef.current.clear().catch(console.error)
      scannerRef.current = null
    }

    // Arrêter le flux caméra
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }

    // Libérer la caméra
    releaseCamera('barcode-scanner')
  }

  const handleRetry = () => {
    cleanup()
    setTimeout(initializeScanner, 500)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 bg-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Scanner Code-Barres</h3>
          </div>
          <button
            onClick={() => { cleanup(); onClose(); }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-4">
          {/* État d'initialisation */}
          {isInitializing && (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 text-center">
                Initialisation de la caméra...
              </p>
            </div>
          )}

          {/* État d'erreur */}
          {error && !isInitializing && (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <div className="space-y-2">
                <p className="text-red-600 font-medium">{error}</p>
                <p className="text-sm text-gray-600">
                  Vérifiez les permissions de votre caméra
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRetry} variant="outline" size="sm">
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
              {/* Conteneur vidéo */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <div
                  id="scanner-video-container"
                  className="w-full h-64"
                />
                
                {/* Overlay avec cadre de scan */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Zone ombrée */}
                  <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                  
                  {/* Cadre de scan central */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative w-48 h-48">
                      {/* Cadre principal */}
                      <div className="absolute inset-0 border-2 border-green-400 rounded-lg"></div>
                      
                      {/* Coins animés */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-green-400"></div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 border-green-400"></div>
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 border-green-400"></div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-green-400"></div>
                      
                      {/* Ligne de scan animée */}
                      <div className="absolute inset-x-2 top-1/2 h-0.5 bg-green-400 animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Instructions */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded text-center">
                      <p className="text-sm font-medium">Positionnez le code dans le cadre</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 text-center">
                  📱 Maintenez l'appareil stable et assurez-vous d'avoir un bon éclairage
                </p>
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

// Composant bouton pour déclencher le scanner
interface BarcodeScannerButtonV2Props {
  onScan: (barcode: string) => void
  className?: string
}

export function BarcodeScannerButtonV2({ onScan, className }: BarcodeScannerButtonV2Props) {
  const [showScanner, setShowScanner] = useState(false)

  const handleScan = (barcode: string) => {
    onScan(barcode)
    setShowScanner(false)
    toast.success('Code scanné !', {
      description: barcode,
      duration: 3000
    })
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowScanner(true)}
        className={className}
      >
        <Camera className="w-4 h-4 mr-2" />
        Scanner
      </Button>

      {showScanner && (
        <BarcodeScannerV2
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  )
}
