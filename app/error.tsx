'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  const handleGoHome = () => {
    // Clear any problematic cookies and go to login
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            Oops ! Une erreur s'est produite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            Nous rencontrons un problème technique. Cela peut être dû à une connexion instable ou à un problème temporaire.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-800 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              onClick={reset}
              className="w-full gap-2"
              variant="default"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </Button>
            
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full gap-2"
            >
              <Home className="w-4 h-4" />
              Retour à l'accueil
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Si le problème persiste, veuillez rafraîchir la page ou redémarrer l'application.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
