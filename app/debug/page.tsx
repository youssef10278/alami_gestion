'use client'

import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    try {
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
    } catch (error) {
      console.error('Error collecting debug info:', error)
      setDebugInfo({ error: 'Failed to collect debug info' })
    }
  }, [])

  if (!mounted) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Chargement...</h1>
      </div>
    )
  }

  const clearCookies = () => {
    try {
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      window.location.reload()
    } catch (error) {
      alert('Erreur lors de la suppression des cookies')
    }
  }

  const goToLogin = () => {
    window.location.href = '/login'
  }

  const goToDashboard = () => {
    window.location.href = '/dashboard'
  }

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  }

  const buttonStyle = {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    margin: '5px',
    cursor: 'pointer'
  }

  const buttonOutlineStyle = {
    backgroundColor: 'transparent',
    color: '#3b82f6',
    border: '1px solid #3b82f6',
    padding: '8px 16px',
    borderRadius: '6px',
    margin: '5px',
    cursor: 'pointer'
  }

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={cardStyle}>
          <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
            🔧 Page de Diagnostic - Alami Gestion
          </h1>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button onClick={clearCookies} style={{ ...buttonStyle, backgroundColor: '#dc2626' }}>
              Effacer les cookies
            </button>
            <button onClick={goToLogin} style={buttonOutlineStyle}>
              Aller à Login
            </button>
            <button onClick={goToDashboard} style={buttonOutlineStyle}>
              Aller au Dashboard
            </button>
            <button onClick={() => window.location.reload()} style={buttonOutlineStyle}>
              Recharger
            </button>
          </div>
        </div>

        <div style={cardStyle}>
          <h2>Informations du Navigateur</h2>
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            <p><strong>User Agent:</strong> {debugInfo.userAgent}</p>
            <p><strong>Platform:</strong> {debugInfo.platform}</p>
            <p><strong>Language:</strong> {debugInfo.language}</p>
            <p><strong>Cookies Enabled:</strong> {debugInfo.cookieEnabled ? '✅ Oui' : '❌ Non'}</p>
            <p><strong>Online:</strong> {debugInfo.onLine ? '✅ Oui' : '❌ Non'}</p>
          </div>
        </div>

        <div style={cardStyle}>
          <h2>Informations de Session</h2>
          <div style={{ fontSize: '14px', lineHeight: '1.5', wordBreak: 'break-all' }}>
            <p><strong>URL Actuelle:</strong> {debugInfo.url}</p>
            <p><strong>Referrer:</strong> {debugInfo.referrer || 'Aucun'}</p>
            <p><strong>Cookies:</strong> {debugInfo.cookies || 'Aucun cookie'}</p>
          </div>
        </div>

        <div style={cardStyle}>
          <h2>Informations d'Affichage</h2>
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            <p><strong>Viewport:</strong> {debugInfo.viewport?.width} x {debugInfo.viewport?.height}</p>
            <p><strong>Écran:</strong> {debugInfo.screen?.width} x {debugInfo.screen?.height}</p>
          </div>
        </div>

        <div style={cardStyle}>
          <h2>Support du Stockage</h2>
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            <p><strong>LocalStorage:</strong> {debugInfo.localStorage ? '✅ Supporté' : '❌ Non supporté'}</p>
            <p><strong>SessionStorage:</strong> {debugInfo.sessionStorage ? '✅ Supporté' : '❌ Non supporté'}</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
          Généré le: {debugInfo.timestamp}
        </div>
      </div>
    </div>
  )
}
