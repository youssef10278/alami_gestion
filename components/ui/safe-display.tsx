'use client'

import { safeToFixed, safeNumber } from '@/lib/utils'

interface SafeDisplayProps {
  value: any
  decimals?: number
  fallback?: number
  prefix?: string
  suffix?: string
  className?: string
}

/**
 * Composant pour afficher des valeurs numériques de manière sécurisée
 * Évite les erreurs "Cannot read properties of undefined (reading 'toFixed')"
 */
export function SafeDisplay({ 
  value, 
  decimals = 2, 
  fallback = 0, 
  prefix = '', 
  suffix = '', 
  className = '' 
}: SafeDisplayProps) {
  const formattedValue = safeToFixed(value, decimals, fallback)
  
  return (
    <span className={className}>
      {prefix}{formattedValue}{suffix}
    </span>
  )
}

interface SafeNumberProps {
  value: any
  fallback?: number
  className?: string
}

/**
 * Composant pour afficher des nombres de manière sécurisée
 */
export function SafeNumber({ 
  value, 
  fallback = 0, 
  className = '' 
}: SafeNumberProps) {
  const safeValue = safeNumber(value, fallback)
  
  return (
    <span className={className}>
      {safeValue}
    </span>
  )
}

interface SafeCurrencyProps {
  value: any
  decimals?: number
  fallback?: number
  currency?: string
  className?: string
}

/**
 * Composant pour afficher des montants de manière sécurisée
 */
export function SafeCurrency({ 
  value, 
  decimals = 2, 
  fallback = 0, 
  currency = 'DH',
  className = '' 
}: SafeCurrencyProps) {
  const formattedValue = safeToFixed(value, decimals, fallback)
  
  return (
    <span className={className}>
      {formattedValue} {currency}
    </span>
  )
}
