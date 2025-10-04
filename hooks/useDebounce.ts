import { useEffect, useState } from 'react'

/**
 * Hook pour debouncer une valeur
 * Utile pour les champs de recherche pour éviter trop d'appels API
 * 
 * @param value - Valeur à debouncer
 * @param delay - Délai en millisecondes (défaut: 500ms)
 * @returns Valeur debouncée
 * 
 * @example
 * const [search, setSearch] = useState('')
 * const debouncedSearch = useDebounce(search, 500)
 * 
 * useEffect(() => {
 *   // Cet effet ne se déclenche que 500ms après la dernière frappe
 *   fetchResults(debouncedSearch)
 * }, [debouncedSearch])
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Créer un timer qui met à jour la valeur après le délai
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Nettoyer le timer si la valeur change avant la fin du délai
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook pour debouncer une fonction callback
 * 
 * @param callback - Fonction à debouncer
 * @param delay - Délai en millisecondes (défaut: 500ms)
 * @returns Fonction debouncée
 * 
 * @example
 * const debouncedSearch = useDebouncedCallback((query: string) => {
 *   fetchResults(query)
 * }, 500)
 * 
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  return (...args: Parameters<T>) => {
    // Annuler le timeout précédent
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Créer un nouveau timeout
    const newTimeoutId = setTimeout(() => {
      callback(...args)
    }, delay)

    setTimeoutId(newTimeoutId)
  }
}

