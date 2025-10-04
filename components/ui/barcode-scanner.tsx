'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Camera, AlertCircle } from 'lucide-react'
import { Button } from './button'
import { Card } from './card'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef<any>(null)
  const readerIdRef = useRef<string>('reader-' + Math.random().toString(36).substr(2, 9))

  useEffect(() => {
    let html5QrCode: any = null

    const initScanner = async () => {
      try {
        // Check camera permission
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setHasPermission(false)
          setError('Votre navigateur ne supporte pas l\'accès à la caméra.')
          return
        }

        // Request camera permission
        await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        setHasPermission(true)

        // Dynamically import Html5Qrcode
        const { Html5Qrcode } = await import('html5-qrcode')

        html5QrCode = new Html5Qrcode(readerIdRef.current)
        scannerRef.current = html5QrCode

        // Start scanning
        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText: string) => {
            // Success callback
            onScan(decodedText)
            onClose()
          },
          (errorMessage: string) => {
            // Error callback (can be ignored for continuous scanning)
          }
        )

        setIsScanning(true)
      } catch (err: any) {
        console.error('Scanner initialization error:', err)
        setHasPermission(false)
        setError('Accès à la caméra refusé. Veuillez autoriser l\'accès à la caméra.')
      }
    }

    initScanner()

    // Cleanup
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current.clear()
          })
          .catch((err: any) => {
            console.error('Error stopping scanner:', err)
          })
      }
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
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={onClose} variant="outline">
                Fermer
              </Button>
            </div>
          )}

          {hasPermission === true && (
            <div className="space-y-4">
              {/* Scanner container */}
              <div
                id={readerIdRef.current}
                className="rounded-lg overflow-hidden"
                style={{ width: '100%' }}
              />

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Positionnez le code-barres dans le cadre vert
                </p>
                <p className="text-xs text-gray-500">
                  Le scan se fera automatiquement
                </p>
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

