'use client'

import { useEffect } from 'react'
import { useProductsCache } from '@/hooks/useProductsCache'

/**
 * Composant pour précharger les produits en arrière-plan
 * - Se charge automatiquement au démarrage de l'application
 * - Met à jour le cache périodiquement
 * - Invisible pour l'utilisateur
 */
export default function ProductsPreloader() {
  const { products, loading, isCacheRecent, refresh } = useProductsCache()

  useEffect(() => {
    // Précharger les produits si le cache n'est pas récent
    if (!loading && !isCacheRecent()) {
      console.log('🔄 Préchargement des produits en arrière-plan...')
      refresh()
    }
  }, [loading, isCacheRecent, refresh])

  useEffect(() => {
    // Actualiser le cache toutes les 5 minutes si la page est active
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !isCacheRecent()) {
        console.log('🔄 Actualisation automatique du cache des produits...')
        refresh()
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [isCacheRecent, refresh])

  // Composant invisible
  return null
}
