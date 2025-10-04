'use client'

import { useEffect, useRef, useState } from 'react'

interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void
  enabled?: boolean
  minLength?: number
  maxTimeBetweenKeys?: number
}

/**
 * Hook personnalisé pour détecter automatiquement les scans de code-barres
 * depuis un scanner physique (USB/Bluetooth)
 * 
 * Principe de détection :
 * - Les scanners physiques tapent très rapidement (< 50ms entre les touches)
 * - Les humains tapent plus lentement (> 100ms)
 * - Les scanners envoient généralement Enter à la fin
 */
export function useBarcodeScanner({
  onScan,
  enabled = true,
  minLength = 3,
  maxTimeBetweenKeys = 50,
}: UseBarcodeScannerOptions) {
  const [buffer, setBuffer] = useState('')
  const [lastKeyTime, setLastKeyTime] = useState(0)
  const [isScanning, setIsScanning] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!enabled) return

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignorer si c'est dans un input/textarea (sauf si c'est un scan rapide)
      const target = e.target as HTMLElement
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
      
      const currentTime = Date.now()
      const timeDiff = currentTime - lastKeyTime

      // Détection de scan rapide
      const isRapidTyping = timeDiff < maxTimeBetweenKeys && buffer.length > 0

      if (isRapidTyping) {
        setIsScanning(true)
        // Si on scanne rapidement, on empêche l'input normal
        if (isInputField) {
          e.preventDefault()
        }
      }

      // Enter = fin du scan
      if (e.key === 'Enter') {
        if (buffer.length >= minLength && isScanning) {
          e.preventDefault()
          const scannedCode = buffer.trim()
          if (scannedCode) {
            onScan(scannedCode)
          }
          setBuffer('')
          setIsScanning(false)
          return
        }
      }

      // Caractères alphanumériques et quelques symboles
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (isRapidTyping || !isInputField) {
          if (isInputField && isRapidTyping) {
            e.preventDefault()
          }
          setBuffer((prev) => prev + e.key)
          setLastKeyTime(currentTime)

          // Reset du buffer après inactivité
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
          }
          timeoutRef.current = setTimeout(() => {
            setBuffer('')
            setIsScanning(false)
          }, 200)
        }
      }
    }

    document.addEventListener('keypress', handleKeyPress)

    return () => {
      document.removeEventListener('keypress', handleKeyPress)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [buffer, lastKeyTime, isScanning, enabled, minLength, maxTimeBetweenKeys, onScan])

  return {
    isScanning,
    buffer,
  }
}

