'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    // Collecter les informations de debug
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      url: window.location.href,
      referrer: document.referrer,
      cookies: document.cookie,
      localStorage: typeof Storage !== 'undefined',
      sessionStorage: typeof Storage !== 'undefined',
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: screen.width,
        height: screen.height
      },
      timestamp: new Date().toISOString()
    }
    setDebugInfo(info)
  }, [])

  const clearCookies = () => {
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    window.location.reload()
  }

  const goToLogin = () => {
    window.location.href = '/login'
  }

  const goToDashboard = () => {
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              🔧 Page de Diagnostic - Alami Gestion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={clearCookies} variant="destructive" size="sm">
                  Effacer les cookies
                </Button>
                <Button onClick={goToLogin} variant="outline" size="sm">
                  Aller à Login
                </Button>
                <Button onClick={goToDashboard} variant="outline" size="sm">
                  Aller au Dashboard
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                  Recharger
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations du Navigateur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Badge variant="outline">User Agent</Badge>
                <p className="text-sm mt-1 break-all">{debugInfo.userAgent}</p>
              </div>
              <div>
                <Badge variant="outline">Platform</Badge>
                <p className="text-sm mt-1">{debugInfo.platform}</p>
              </div>
              <div>
                <Badge variant="outline">Language</Badge>
                <p className="text-sm mt-1">{debugInfo.language}</p>
              </div>
              <div>
                <Badge variant="outline">Cookies Enabled</Badge>
                <p className="text-sm mt-1">{debugInfo.cookieEnabled ? '✅ Oui' : '❌ Non'}</p>
              </div>
              <div>
                <Badge variant="outline">Online</Badge>
                <p className="text-sm mt-1">{debugInfo.onLine ? '✅ Oui' : '❌ Non'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations de Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Badge variant="outline">URL Actuelle</Badge>
                <p className="text-sm mt-1 break-all">{debugInfo.url}</p>
              </div>
              <div>
                <Badge variant="outline">Referrer</Badge>
                <p className="text-sm mt-1 break-all">{debugInfo.referrer || 'Aucun'}</p>
              </div>
              <div>
                <Badge variant="outline">Cookies</Badge>
                <p className="text-sm mt-1 break-all">{debugInfo.cookies || 'Aucun cookie'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations d'Affichage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Badge variant="outline">Viewport</Badge>
                <p className="text-sm mt-1">
                  {debugInfo.viewport?.width} x {debugInfo.viewport?.height}
                </p>
              </div>
              <div>
                <Badge variant="outline">Écran</Badge>
                <p className="text-sm mt-1">
                  {debugInfo.screen?.width} x {debugInfo.screen?.height}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support du Stockage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Badge variant="outline">LocalStorage</Badge>
                <p className="text-sm mt-1">{debugInfo.localStorage ? '✅ Supporté' : '❌ Non supporté'}</p>
              </div>
              <div>
                <Badge variant="outline">SessionStorage</Badge>
                <p className="text-sm mt-1">{debugInfo.sessionStorage ? '✅ Supporté' : '❌ Non supporté'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          Généré le: {debugInfo.timestamp}
        </div>
      </div>
    </div>
  )
}
