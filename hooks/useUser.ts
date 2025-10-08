'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'OWNER' | 'SELLER'
  isActive: boolean
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()

        if (response.ok) {
          setUser(data.user)
        } else {
          setError(data.error || 'Erreur lors du chargement de l\'utilisateur')
        }
      } catch (err) {
        setError('Erreur de connexion au serveur')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading, error, isOwner: user?.role === 'OWNER' }
}
