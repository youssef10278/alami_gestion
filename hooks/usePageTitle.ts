'use client'

import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    // Update document title
    document.title = `${title} - Alami Gestion`
    
    // Dispatch custom event for layout to listen to
    window.dispatchEvent(new CustomEvent('pageTitle', { detail: title }))
  }, [title])
}
