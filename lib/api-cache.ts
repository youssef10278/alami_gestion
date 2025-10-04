/**
 * Système de cache pour les appels API
 * - Cache en mémoire avec TTL
 * - Invalidation automatique
 * - Gestion des erreurs
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class APICache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private defaultTTL: number = 5 * 60 * 1000 // 5 minutes par défaut

  /**
   * Récupère une valeur du cache
   * @param key - Clé du cache
   * @returns T | null - Données ou null si expiré/inexistant
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Vérifier si le cache est expiré
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Stocke une valeur dans le cache
   * @param key - Clé du cache
   * @param data - Données à stocker
   * @param ttl - Durée de vie en millisecondes (optionnel)
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    })
  }

  /**
   * Invalide une entrée du cache
   * @param key - Clé du cache
   */
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Invalide toutes les entrées correspondant à un pattern
   * @param pattern - Pattern de clé (ex: "products/*")
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'))
    const keysToDelete: string[] = []

    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach((key) => this.cache.delete(key))
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Nettoie les entrées expirées
   */
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach((key) => this.cache.delete(key))
  }

  /**
   * Obtient la taille du cache
   */
  size(): number {
    return this.cache.size
  }
}

// Instance singleton
const apiCache = new APICache()

// Nettoyer le cache toutes les 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup()
  }, 10 * 60 * 1000)
}

export default apiCache

/**
 * Hook pour utiliser le cache avec fetch
 * @param url - URL de l'API
 * @param options - Options de fetch
 * @param cacheOptions - Options de cache
 * @returns Promise<T> - Données de l'API
 */
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit,
  cacheOptions?: {
    ttl?: number
    forceRefresh?: boolean
  }
): Promise<T> {
  const cacheKey = `fetch:${url}:${JSON.stringify(options || {})}`

  // Vérifier le cache si pas de forceRefresh
  if (!cacheOptions?.forceRefresh) {
    const cached = apiCache.get<T>(cacheKey)
    if (cached !== null) {
      return cached
    }
  }

  // Faire l'appel API
  const response = await fetch(url, options)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()

  // Stocker dans le cache
  apiCache.set(cacheKey, data, cacheOptions?.ttl)

  return data
}

/**
 * Invalide le cache pour une URL
 * @param url - URL de l'API
 */
export function invalidateCache(url: string): void {
  apiCache.invalidatePattern(`fetch:${url}*`)
}

/**
 * Invalide le cache pour un pattern
 * @param pattern - Pattern d'URL (ex: "/api/products*")
 */
export function invalidateCachePattern(pattern: string): void {
  apiCache.invalidatePattern(`fetch:${pattern}`)
}

