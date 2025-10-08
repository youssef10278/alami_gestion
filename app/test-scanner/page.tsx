'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarcodeScannerButton } from '@/components/ui/barcode-scanner'
import { BarcodeInput } from '@/components/ui/barcode-input'
import { Camera, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { toast } from 'sonner'

export default function TestScannerPage() {
  const [scannedCode, setScannedCode] = useState('')
  const [manualCode, setManualCode] = useState('')
  const [diagnostics, setDiagnostics] = useState<any>({})

  const runDiagnostics = async () => {
    const results: any = {}

    // Test 1: Browser support
    results.browserSupport = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)

    // Test 2: HTTPS check
    results.httpsCheck = window.location.protocol === 'https:' || 
                        window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1'

    // Test 3: Camera permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      results.cameraPermission = true
    } catch (error: any) {
      results.cameraPermission = false
      results.cameraError = error.name
    }

    // Test 4: Html5Qrcode library
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      results.libraryLoaded = true
    } catch (error) {
      results.libraryLoaded = false
    }

    setDiagnostics(results)
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
            <BarcodeScannerButton 
              onScan={handleScan}
              className="px-8 py-4 text-lg"
            />
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
                <li>• Protocole: {window.location.protocol}</li>
                <li>• Hostname: {window.location.hostname}</li>
                <li>• User Agent: {navigator.userAgent.split(' ')[0]}</li>
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
