'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SimpleBarcodeButton } from '@/components/ui/simple-barcode-scanner'
import { BarcodeInput } from '@/components/ui/barcode-input'
import { Camera, CheckCircle, XCircle, AlertTriangle, Info, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { cameraUtilsV2 } from '@/lib/camera-manager-v2'

export default function TestScannerPage() {
  const [scannedCode, setScannedCode] = useState('')
  const [manualCode, setManualCode] = useState('')
  const [diagnostics, setDiagnostics] = useState<any>({})

  const runDiagnostics = async () => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      setDiagnostics({ error: 'Diagnostics only available in browser' })
      return
    }

    try {
      // Utiliser le gestionnaire de caméra pour les diagnostics
      const cameraInfo = await cameraUtilsV2.getDiagnostics()

      // Test Html5Qrcode library
      let libraryLoaded = true
      try {
        await import('html5-qrcode')
      } catch (error) {
        libraryLoaded = false
      }

      const results = {
        browserSupport: cameraInfo.supported,
        httpsCheck: cameraInfo.httpsOk,
        cameraPermission: cameraInfo.permission === 'granted',
        cameraError: cameraInfo.permission === 'denied' ? 'NotAllowedError' :
                    cameraInfo.permission === 'prompt' ? 'PermissionPrompt' : null,
        libraryLoaded,
        cameraCurrentUser: cameraInfo.currentUser,
        cameraAvailable: cameraInfo.available
      }

      setDiagnostics(results)
    } catch (error) {
      setDiagnostics({ error: 'Erreur lors des diagnostics' })
    }
  }

  const handleScan = (code: string) => {
    setScannedCode(code)
    toast.success('Code scanné avec succès !', {
      description: code,
      icon: <CheckCircle className="w-4 h-4" />
    })
  }

  const DiagnosticItem = ({ title, status, error }: { title: string, status: boolean | null, error?: string }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <span className="font-medium">{title}</span>
      <div className="flex items-center gap-2">
        {status === true && <CheckCircle className="w-5 h-5 text-green-500" />}
        {status === false && <XCircle className="w-5 h-5 text-red-500" />}
        {status === null && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
        {error && <span className="text-sm text-red-600">({error})</span>}
      </div>
    </div>
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Camera className="w-8 h-8 text-blue-600" />
          Test Scanner Code-Barres
        </h1>
        <p className="text-gray-600">
          Page de diagnostic pour tester le scanner de code-barres par caméra
        </p>
      </div>

      {/* Diagnostics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Diagnostics Système
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runDiagnostics} className="w-full">
            Lancer les diagnostics
          </Button>

          {Object.keys(diagnostics).length > 0 && (
            <div className="space-y-3">
              <DiagnosticItem 
                title="Support navigateur (getUserMedia)" 
                status={diagnostics.browserSupport} 
              />
              <DiagnosticItem 
                title="HTTPS / Localhost" 
                status={diagnostics.httpsCheck} 
              />
              <DiagnosticItem 
                title="Permission caméra" 
                status={diagnostics.cameraPermission} 
                error={diagnostics.cameraError}
              />
              <DiagnosticItem
                title="Bibliothèque html5-qrcode"
                status={diagnostics.libraryLoaded}
              />
              <DiagnosticItem
                title="Caméra disponible"
                status={diagnostics.cameraAvailable}
                error={diagnostics.cameraCurrentUser ? `Utilisée par: ${diagnostics.cameraCurrentUser}` : undefined}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Scanner Caméra */}
      <Card>
        <CardHeader>
          <CardTitle>Test Scanner Caméra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <SimpleBarcodeButton
              onScan={handleScan}
              className="px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Zap className="w-5 h-5 mr-2" />
              Scanner V2 (Nouveau)
            </SimpleBarcodeButton>
          </div>
          
          {scannedCode && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">✅ Code scanné avec succès !</p>
              <p className="text-green-700 font-mono text-lg mt-2">{scannedCode}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Input avec Scanner */}
      <Card>
        <CardHeader>
          <CardTitle>Test Input avec Scanner Intégré</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <BarcodeInput
            value={manualCode}
            onChange={setManualCode}
            onScan={(code) => {
              setManualCode(code)
              toast.success('Code scanné dans l\'input !', { description: code })
            }}
            placeholder="Scanner ou saisir un code-barres"
            showCameraButton={true}
          />
          
          {manualCode && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">📝 Code dans l'input :</p>
              <p className="text-blue-700 font-mono text-lg mt-2">{manualCode}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations */}
      <Card>
        <CardHeader>
          <CardTitle>Informations Techniques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">🌐 Environnement</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Protocole: {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}</li>
                <li>• Hostname: {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</li>
                <li>• User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'N/A'}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">📊 Formats Supportés</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• QR Code</li>
                <li>• EAN-13, EAN-8</li>
                <li>• UPC-A, UPC-E</li>
                <li>• Code 128, Code 39</li>
                <li>• Et 8 autres formats</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ Prérequis</h4>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• HTTPS requis (sauf localhost)</li>
              <li>• Autorisation caméra nécessaire</li>
              <li>• Navigateur moderne (Chrome, Firefox, Safari, Edge)</li>
              <li>• Caméra fonctionnelle</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
