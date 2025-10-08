'use client'

import { useState, useEffect, useRef } from 'react'
import { Keyboard } from 'lucide-react'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface BarcodeInputProps {
  value: string
  onChange: (value: string) => void
  onScan?: (barcode: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

/**
 * Composant intelligent qui supporte :
 * 1. Saisie manuelle au clavier
 * 2. Scanner physique (USB/Bluetooth) - détection automatique
 */
export function BarcodeInput({
  value,
  onChange,
  onScan,
  placeholder = 'Scanner ou saisir le code-barres',
  disabled = false,
  className,
}: BarcodeInputProps) {
  const [scanBuffer, setScanBuffer] = useState('')
  const [lastKeyTime, setLastKeyTime] = useState(0)
  const [scannerDetected, setScannerDetected] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scanTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Détection automatique du scanner physique
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignorer si l'input n'est pas focus ou si disabled
      if (disabled) return

      const currentTime = Date.now()
      const timeDiff = currentTime - lastKeyTime

      // Les scanners physiques tapent très rapidement (< 50ms entre les touches)
      // Les humains tapent plus lentement (> 100ms)
      const isLikelyScanner = timeDiff < 50 && scanBuffer.length > 0

      if (isLikelyScanner) {
        setScannerDetected(true)
      }

      // Enter = fin du scan
      if (e.key === 'Enter' && scanBuffer.length > 0) {
        e.preventDefault()
        
        // Si c'est un scanner physique, on traite le buffer
        if (scannerDetected || scanBuffer.length >= 8) {
          const scannedCode = scanBuffer.trim()
          if (scannedCode) {
            onChange(scannedCode)
            if (onScan) {
              onScan(scannedCode)
            }
          }
          setScanBuffer('')
          setScannerDetected(false)
          return
        }
      }

      // Caractères alphanumériques
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setScanBuffer((prev) => prev + e.key)
        setLastKeyTime(currentTime)

        // Reset du buffer après 100ms d'inactivité
        if (scanTimeoutRef.current) {
          clearTimeout(scanTimeoutRef.current)
        }
        scanTimeoutRef.current = setTimeout(() => {
          setScanBuffer('')
          setScannerDetected(false)
        }, 100)
      }
    }

    // Écouter les événements clavier au niveau du document
    document.addEventListener('keypress', handleKeyPress)

    return () => {
      document.removeEventListener('keypress', handleKeyPress)
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current)
      }
    }
  }, [scanBuffer, lastKeyTime, scannerDetected, disabled, onChange, onScan])

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }



  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          {/* Indicateur de scanner détecté */}
          {scannerDetected && (
            <div className="absolute -top-6 left-0 text-xs text-green-600 flex items-center gap-1 animate-pulse">
              <Keyboard className="w-3 h-3" />
              Scanner détecté
            </div>
          )}
          
          <Input
            ref={inputRef}
            value={value}
            onChange={handleManualChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn('pr-10', className)}
          />

          {/* Icône indicatrice */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Keyboard className="w-4 h-4" />
          </div>
        </div>


      </div>

      {/* Aide contextuelle */}
      <p className="text-xs text-gray-500 mt-1">
        {scannerDetected ? (
          <span className="text-green-600 font-medium">
            ✓ Scanner physique actif
          </span>
        ) : (
          <>
            Scannez avec un scanner physique ou saisissez manuellement
          </>
        )}
      </p>
    </div>
  )
}

