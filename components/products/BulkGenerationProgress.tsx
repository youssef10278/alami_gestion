'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface GenerationProgress {
  id: string
  total: number
  completed: number
  currentBatch: number
  totalBatches: number
  status: 'pending' | 'running' | 'completed' | 'error'
  startTime: number
  endTime?: number
  error?: string
  percentage: number
  estimatedTimeRemaining: string
}

interface BulkGenerationProgressProps {
  generationId: string | null
  onComplete: () => void
  onError: (error: string) => void
}

export default function BulkGenerationProgress({ 
  generationId, 
  onComplete, 
  onError 
}: BulkGenerationProgressProps) {
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  // Polling pour mettre à jour la progression
  useEffect(() => {
    if (!generationId || isPolling) return

    setIsPolling(true)
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/products/generate-bulk?id=${generationId}`)
        const data = await response.json()

        if (response.ok) {
          setProgress(data.progress)

          // Arrêter le polling si terminé ou en erreur
          if (data.progress.status === 'completed') {
            clearInterval(interval)
            setIsPolling(false)
            toast.success(`🎉 Génération terminée ! ${data.progress.completed} produits créés`)
            onComplete()
          } else if (data.progress.status === 'error') {
            clearInterval(interval)
            setIsPolling(false)
            toast.error(`❌ Erreur: ${data.progress.error}`)
            onError(data.progress.error || 'Erreur inconnue')
          }
        } else {
          console.error('Erreur lors de la récupération du statut:', data.error)
        }
      } catch (error) {
        console.error('Erreur de polling:', error)
      }
    }, 1000) // Polling toutes les secondes

    return () => {
      clearInterval(interval)
      setIsPolling(false)
    }
  }, [generationId, onComplete, onError])

  if (!progress) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Initialisation de la génération...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'running':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (progress.status) {
      case 'pending':
        return 'En attente'
      case 'running':
        return 'En cours'
      case 'completed':
        return 'Terminé'
      case 'error':
        return 'Erreur'
      default:
        return 'Inconnu'
    }
  }

  const getStatusColor = () => {
    switch (progress.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (startTime: number, endTime?: number) => {
    const end = endTime || Date.now()
    const duration = end - startTime
    const minutes = Math.floor(duration / 60000)
    const seconds = Math.floor((duration % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Génération en Masse
          </CardTitle>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Barre de progression principale */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression globale</span>
            <span>{progress.percentage}%</span>
          </div>
          <Progress value={progress.percentage} className="h-3" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{progress.completed.toLocaleString()} / {progress.total.toLocaleString()} produits</span>
            <span>Lot {progress.currentBatch} / {progress.totalBatches}</span>
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">Produits créés</p>
            <p className="text-2xl font-bold text-blue-600">
              {progress.completed.toLocaleString()}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">Temps écoulé</p>
            <p className="text-2xl font-bold text-green-600">
              {formatDuration(progress.startTime, progress.endTime)}
            </p>
          </div>
        </div>

        {/* Temps estimé restant (seulement si en cours) */}
        {progress.status === 'running' && progress.estimatedTimeRemaining && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">
                Temps estimé restant: {progress.estimatedTimeRemaining}
              </span>
            </div>
          </div>
        )}

        {/* Message d'erreur */}
        {progress.status === 'error' && progress.error && (
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-700">
                Erreur: {progress.error}
              </span>
            </div>
          </div>
        )}

        {/* Message de succès */}
        {progress.status === 'completed' && (
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-700">
                Génération terminée avec succès ! {progress.completed} produits créés.
              </span>
            </div>
          </div>
        )}

        {/* Bouton d'action */}
        {progress.status === 'completed' && (
          <div className="flex justify-center">
            <Button onClick={onComplete} className="w-full">
              Continuer
            </Button>
          </div>
        )}

        {progress.status === 'error' && (
          <div className="flex justify-center">
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Réessayer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
