'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Camera, AlertCircle } from 'lucide-react'
import { Button } from './button'
import { Card } from './card'
import { useCameraManager } from '@/lib/camera-manager'
import styles from './barcode-scanner.module.css'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [showCustomOverlay, setShowCustomOverlay] = useState(false)
  const scannerRef = useRef<any>(null)
  const readerIdRef = useRef<string>('reader-' + Math.random().toString(36).substr(2, 9))
  const { requestCamera, releaseCamera } = useCameraManager()

  useEffect(() => {
    let html5QrCode: any = null
    let mounted = true

    const initScanner = async () => {
      try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
          setError('Scanner non disponible côté serveur')
          return
        }

        // Check if HTTPS is required (production)
        if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          setError('HTTPS requis pour accéder à la caméra. Utilisez une connexion sécurisée.')
          setHasPermission(false)
          return
        }

        // Check camera permission
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setHasPermission(false)
          setError('Votre navigateur ne supporte pas l\'accès à la caméra.')
          return
        }

        // Request camera permission via camera manager
        const cameraResult = await requestCamera('barcode-scanner')

        if (!cameraResult.success) {
          if (!mounted) return
          setHasPermission(false)
          setError(cameraResult.error || 'Erreur d\'accès à la caméra')
          return
        }

        // Test camera access
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          })

          // Stop the stream immediately as Html5Qrcode will handle it
          stream.getTracks().forEach(track => track.stop())

          if (!mounted) return
          setHasPermission(true)
        } catch (permissionError: any) {
          console.error('Camera permission error:', permissionError)
          setHasPermission(false)

          if (permissionError.name === 'NotAllowedError') {
            setError('Accès à la caméra refusé. Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur.')
          } else if (permissionError.name === 'NotFoundError') {
            setError('Aucune caméra trouvée sur cet appareil.')
          } else if (permissionError.name === 'NotReadableError') {
            // Essayer de fermer les autres utilisations de la caméra
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('request-camera-close'))

              // Attendre un peu et réessayer
              setTimeout(async () => {
                try {
                  const retryStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                  })
                  retryStream.getTracks().forEach(track => track.stop())

                  if (mounted) {
                    setHasPermission(true)
                    setError(null)
                    // Relancer l'initialisation
                    initScanner()
                  }
                } catch (retryError) {
                  if (mounted) {
                    setError('Caméra déjà utilisée. Veuillez fermer la prise de photo du produit et réessayer.')
                  }
                }
              }, 1000)

              setError('Tentative de libération de la caméra en cours...')
              return
            }

            setError('Caméra déjà utilisée. Veuillez fermer la prise de photo du produit et réessayer.')
          } else {
            setError('Erreur d\'accès à la caméra: ' + permissionError.message)
          }
          return
        }

        // Dynamically import Html5Qrcode
        const { Html5Qrcode } = await import('html5-qrcode')

        if (!mounted) return

        html5QrCode = new Html5Qrcode(readerIdRef.current)
        scannerRef.current = html5QrCode

        // Start scanning with better configuration
        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: function(viewfinderWidth, viewfinderHeight) {
              // Calculer la taille du cadre en fonction de la taille de l'écran
              const minEdgePercentage = 0.7; // 70% de la plus petite dimension
              const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
              const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);

              return {
                width: Math.min(qrboxSize, 300),
                height: Math.min(qrboxSize, 300)
              };
            },
            aspectRatio: 1.0,
            disableFlip: false,
            // Styles pour le cadre vert
            videoConstraints: {
              facingMode: 'environment'
            },
            // Configuration pour améliorer la visibilité du cadre
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true
            },
            supportedScanTypes: [
              // Support for various barcode formats
              0, // QR_CODE
              1, // AZTEC
              2, // CODABAR
              3, // CODE_39
              4, // CODE_93
              5, // CODE_128
              6, // DATA_MATRIX
              7, // MAXICODE
              8, // ITF
              9, // EAN_13
              10, // EAN_8
              11, // PDF_417
              12, // RSS_14
              13, // RSS_EXPANDED
              14, // UPC_A
              15, // UPC_E
              16, // UPC_EAN_EXTENSION
            ]
          },
          (decodedText: string) => {
            // Success callback
            console.log('Barcode scanned:', decodedText)
            onScan(decodedText)
            onClose()
          },
          (errorMessage: string) => {
            // Error callback (can be ignored for continuous scanning)
            // Only log significant errors
            if (!errorMessage.includes('No MultiFormat Readers')) {
              console.debug('Scanner error:', errorMessage)
            }
          }
        )

        if (mounted) {
          setIsScanning(true)

          // Afficher l'overlay personnalisé après un délai si Html5Qrcode ne charge pas
          setTimeout(() => {
            if (mounted) {
              setShowCustomOverlay(true)
            }
          }, 2000)
        }
      } catch (err: any) {
        console.error('Scanner initialization error:', err)
        if (mounted) {
          setHasPermission(false)
          setError('Erreur d\'initialisation du scanner: ' + err.message)
        }
      }
    }

    initScanner()

    // Cleanup
    return () => {
      mounted = false
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            if (scannerRef.current) {
              scannerRef.current.clear()
            }
          })
          .catch((err: any) => {
            console.error('Error stopping scanner:', err)
          })
          .finally(() => {
            scannerRef.current = null
          })
      }

      // Libérer la caméra
      releaseCamera('barcode-scanner')
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Scanner le code-barres</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scanner or Error */}
          {hasPermission === null && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-gray-600">Initialisation de la caméra...</p>
              </div>
            </div>
          )}

          {hasPermission === false && (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <div className="space-y-2">
                <p className="text-red-600 font-medium">{error}</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>💡 <strong>Solutions possibles :</strong></p>
                  <ul className="text-left space-y-1 max-w-sm">
                    <li>• Autorisez l'accès à la caméra dans votre navigateur</li>
                    <li>• <strong>Fermez la prise de photo du produit</strong> si elle est ouverte</li>
                    <li>• Vérifiez que votre caméra fonctionne</li>
                    <li>• Fermez les autres applications utilisant la caméra</li>
                    <li>• Utilisez HTTPS si vous êtes en production</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                  Réessayer
                </Button>
                <Button onClick={onClose} variant="outline" size="sm">
                  Fermer
                </Button>
              </div>
            </div>
          )}

          {hasPermission === true && (
            <div className="space-y-4">
              {/* Scanner container */}
              <div className={`${styles.scannerContainer} relative bg-black rounded-lg overflow-hidden`}>
                <div
                  id={readerIdRef.current}
                  className="w-full"
                  style={{
                    width: '100%',
                    minHeight: '300px',
                    height: 'auto'
                  }}
                />

                {/* Overlay de scan personnalisé */}
                {isScanning && showCustomOverlay && (
                  <div className="absolute inset-0 pointer-events-none z-10">
                    {/* Zone ombrée */}
                    <div className="absolute inset-0 bg-black bg-opacity-50"></div>

                    {/* Cadre de scan central */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="relative w-64 h-64 border-2 border-green-400 rounded-lg bg-transparent">
                        {/* Coins animés */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-green-400 rounded-tl-lg"></div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 border-green-400 rounded-tr-lg"></div>
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 border-green-400 rounded-bl-lg"></div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-green-400 rounded-br-lg"></div>

                        {/* Ligne de scan animée */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-green-400 opacity-75 animate-pulse"></div>
                        <div className="absolute inset-x-0 top-8 h-0.5 bg-green-300 opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute inset-x-0 top-16 h-0.5 bg-green-300 opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
                      </div>

                      {/* Label de zone de scan */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                          📱 Zone de scan
                        </span>
                      </div>
                    </div>

                    {/* Instructions en bas */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                      <div className="bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg text-center">
                        <p className="text-sm font-medium">Positionnez le code-barres dans le cadre vert</p>
                        <p className="text-xs opacity-75 mt-1">Maintenez l'appareil stable</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    📱 Instructions de scan
                  </p>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p>• Positionnez le code-barres dans le cadre vert</p>
                    <p>• Maintenez l'appareil stable</p>
                    <p>• Assurez-vous d'avoir un bon éclairage</p>
                    <p>• Le scan se fera automatiquement</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  <p>📊 Formats supportés : EAN-13, EAN-8, UPC-A, Code 128, QR Code, etc.</p>
                </div>
              </div>

              <Button onClick={onClose} variant="outline" className="w-full">
                Annuler
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

interface BarcodeScannerButtonProps {
  onScan: (barcode: string) => void
  className?: string
}

export function BarcodeScannerButton({ onScan, className }: BarcodeScannerButtonProps) {
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
        <Camera className="w-4 h-4 mr-2" />
        Scanner
      </Button>

      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  )
}

