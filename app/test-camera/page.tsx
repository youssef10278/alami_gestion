'use client'

import { useState } from 'react'
import { SimpleCameraInput } from '@/components/ui/simple-camera-input'
import { ImageUpload } from '@/components/ui/image-upload'

export default function TestCameraPage() {
  const [simpleImage, setSimpleImage] = useState('')
  const [advancedImage, setAdvancedImage] = useState('')

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '30px',
          color: '#1f2937'
        }}>
          🧪 Test Caméra Mobile
        </h1>

        {/* Test Simple Camera Input */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '15px',
            color: '#374151'
          }}>
            📱 Version Simple (Recommandée pour mobile)
          </h2>
          
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '15px'
          }}>
            Utilise l'attribut `capture` pour ouvrir directement l'appareil photo sur mobile.
          </p>

          <SimpleCameraInput
            value={simpleImage}
            onChange={setSimpleImage}
            onRemove={() => setSimpleImage('')}
          />

          {simpleImage && (
            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              color: '#166534',
              fontSize: '14px'
            }}>
              ✅ Image capturée avec succès ! Taille: {Math.round(simpleImage.length / 1024)} KB
            </div>
          )}
        </div>

        {/* Test Advanced Camera */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '15px',
            color: '#374151'
          }}>
            📷 Version Avancée (Caméra en direct)
          </h2>
          
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '15px'
          }}>
            Utilise l'API getUserMedia pour un contrôle avancé de la caméra.
          </p>

          <ImageUpload
            value={advancedImage}
            onChange={setAdvancedImage}
            onRemove={() => setAdvancedImage('')}
          />

          {advancedImage && (
            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              color: '#166534',
              fontSize: '14px'
            }}>
              ✅ Image capturée avec succès ! Taille: {Math.round(advancedImage.length / 1024)} KB
            </div>
          )}
        </div>

        {/* Informations de debug */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '15px',
            color: '#374151'
          }}>
            🔍 Informations de Debug
          </h2>
          
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent.substring(0, 80) + '...' : 'N/A'}</p>
            <p><strong>Support getUserMedia:</strong> {typeof window !== 'undefined' && navigator.mediaDevices ? '✅ Oui' : '❌ Non'}</p>
            <p><strong>Protocol:</strong> {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}</p>
            <p><strong>Hostname:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</p>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '10px',
            color: '#92400e'
          }}>
            📋 Instructions de test
          </h3>
          
          <ol style={{
            fontSize: '14px',
            color: '#92400e',
            paddingLeft: '20px',
            lineHeight: '1.6'
          }}>
            <li>Testez d'abord la <strong>Version Simple</strong> - elle devrait ouvrir directement l'appareil photo</li>
            <li>Si ça ne fonctionne pas, essayez la <strong>Version Avancée</strong></li>
            <li>Vérifiez que vous êtes en HTTPS (requis pour la caméra)</li>
            <li>Autorisez l'accès à la caméra quand demandé</li>
            <li>Testez sur différents navigateurs mobiles (Safari, Chrome, Firefox)</li>
          </ol>
        </div>

        {/* Liens de navigation */}
        <div style={{ textAlign: 'center' }}>
          <a 
            href="/mobile-test"
            style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              margin: '5px'
            }}
          >
            ← Retour au test mobile
          </a>
          
          <a 
            href="/debug"
            style={{
              display: 'inline-block',
              backgroundColor: 'transparent',
              color: '#3b82f6',
              border: '1px solid #3b82f6',
              padding: '10px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              margin: '5px'
            }}
          >
            Page de diagnostic
          </a>
        </div>
      </div>
    </div>
  )
}
