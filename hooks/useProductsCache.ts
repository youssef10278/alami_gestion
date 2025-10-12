import { useState, useEffect, useCallback } from 'react'

interface Product {
  id: string
  name: string
  sku: string
  barcode?: string
  price: number
  stock: number
  image?: string
  isActive: boolean
  category?: {
    id: string
    name: string
    color?: string
  }
}

interface ProductsCache {
  products: Product[]
  timestamp: number
  total: number
}

const CACHE_KEY = 'alami_products_cache'
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

/**
 * Hook personnalisé pour gérer le cache des produits
 * - Cache persistant en localStorage
 * - Mise à jour intelligente
 * - Invalidation automatique
 */
export function useProductsCache() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number>(0)

  // Charger depuis le cache localStorage
  const loadFromCache = useCallback((): ProductsCache | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null

      const parsedCache: ProductsCache = JSON.parse(cached)
      const now = Date.now()
      
      // Vérifier si le cache est encore valide
      if (now - parsedCache.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY)
        return null
      }

      return parsedCache
    } catch (error) {
      console.error('Erreur lors du chargement du cache:', error)
      localStorage.removeItem(CACHE_KEY)
      return null
    }
  }, [])

  // Sauvegarder dans le cache localStorage
  const saveToCache = useCallback((products: Product[], total: number) => {
    try {
      const cache: ProductsCache = {
        products,
        timestamp: Date.now(),
        total
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
      setLastUpdated(cache.timestamp)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du cache:', error)
    }
  }, [])

  // Charger les produits depuis l'API
  const fetchProducts = useCallback(async (forceRefresh = false): Promise<void> => {
    try {
      setError(null)

      // Vérifier le cache d'abord (sauf si forceRefresh)
      if (!forceRefresh) {
        const cached = loadFromCache()
        if (cached) {
          console.log('📦 Produits chargés depuis le cache:', cached.products.length)
          setProducts(cached.products)
          setLastUpdated(cached.timestamp)
          setLoading(false)
          return
        }
      }

      setLoading(true)
      console.log('🔄 Chargement des produits depuis l\'API...')

      const response = await fetch('/api/products?limit=all')
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const fetchedProducts = data.products || []
      const total = data.pagination?.total || 0

      console.log('✅ Produits chargés depuis l\'API:', fetchedProducts.length)

      // Mettre à jour l'état et le cache
      setProducts(fetchedProducts)
      saveToCache(fetchedProducts, total)
      setLoading(false)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('❌ Erreur lors du chargement des produits:', errorMessage)
      setError(errorMessage)
      setLoading(false)
    }
  }, [loadFromCache, saveToCache])

  // Mettre à jour le stock d'un produit spécifique
  const updateProductStock = useCallback((productId: string, newStock: number) => {
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(product =>
        product.id === productId
          ? { ...product, stock: newStock }
          : product
      )

      // Mettre à jour le cache
      const cached = loadFromCache()
      if (cached) {
        saveToCache(updatedProducts, cached.total)
      }

      return updatedProducts
    })
  }, [loadFromCache, saveToCache])

  // Invalider le cache
  const invalidateCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY)
    setLastUpdated(0)
    console.log('🗑️ Cache invalidé')
  }, [])

  // Vérifier si le cache est récent
  const isCacheRecent = useCallback(() => {
    const cached = loadFromCache()
    if (!cached) return false
    
    const age = Date.now() - cached.timestamp
    return age < 2 * 60 * 1000 // Moins de 2 minutes = récent
  }, [loadFromCache])

  // Charger les produits au montage du composant
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Calculer l'âge du cache
  const cacheAge = lastUpdated > 0 ? Math.round((Date.now() - lastUpdated) / 1000) : 0

  return {
    products,
    loading,
    error,
    lastUpdated,
    cacheAge,
    fetchProducts,
    updateProductStock,
    invalidateCache,
    isCacheRecent,
    refresh: () => fetchProducts(true)
  }
}
