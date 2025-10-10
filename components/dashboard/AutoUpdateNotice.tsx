'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle, X, Info } from 'lucide-react'

export default function AutoUpdateNotice() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fermé la notification
    const dismissed = localStorage.getItem('dashboard-auto-update-dismissed')
    if (!dismissed) {
      setIsVisible(true)
    } else {
      setHasBeenDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setHasBeenDismissed(true)
    localStorage.setItem('dashboard-auto-update-dismissed', 'true')
  }

  const handleShow = () => {
    setIsVisible(true)
    localStorage.removeItem('dashboard-auto-update-dismissed')
  }

  if (hasBeenDismissed && !isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={handleShow}
          className="bg-white/90 backdrop-blur-sm shadow-lg border-blue-200 hover:border-blue-300"
        >
          <Info className="w-4 h-4 mr-2" />
          Info
        </Button>
      </div>
    )
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-gray-900">Mise à jour automatique</h4>
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Actif
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Les statistiques du dashboard se mettent maintenant à jour automatiquement 
                quand vous modifiez ou supprimez une vente.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Synchronisation en temps réel
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
