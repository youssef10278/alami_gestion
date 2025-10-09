import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convertit une valeur en nombre et applique toFixed de manière sécurisée
 * @param value - La valeur à convertir
 * @param decimals - Nombre de décimales (défaut: 2)
 * @param fallback - Valeur de fallback si la conversion échoue (défaut: 0)
 * @returns String formatée avec toFixed
 */
export function safeToFixed(value: any, decimals: number = 2, fallback: number = 0): string {
  try {
    const num = Number(value)
    if (isNaN(num) || !isFinite(num)) {
      return fallback.toFixed(decimals)
    }
    return num.toFixed(decimals)
  } catch (error) {
    console.warn('safeToFixed error:', error, 'value:', value)
    return fallback.toFixed(decimals)
  }
}

/**
 * Convertit une valeur en nombre de manière sécurisée
 * @param value - La valeur à convertir
 * @param fallback - Valeur de fallback si la conversion échoue (défaut: 0)
 * @returns Nombre ou fallback
 */
export function safeNumber(value: any, fallback: number = 0): number {
  try {
    const num = Number(value)
    if (isNaN(num) || !isFinite(num)) {
      return fallback
    }
    return num
  } catch (error) {
    console.warn('safeNumber error:', error, 'value:', value)
    return fallback
  }
}

