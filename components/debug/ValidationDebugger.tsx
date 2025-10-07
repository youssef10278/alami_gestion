'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'

interface ValidationError {
  field: string
  message: string
  received?: any
}

interface ValidationDebuggerProps {
  errors: ValidationError[]
  data: any
  onRetry?: () => void
}

export default function ValidationDebugger({ errors, data, onRetry }: ValidationDebuggerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (errors.length === 0) {
    return null
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-red-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Erreurs de Validation
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isExpanded ? 'Masquer' : 'Détails'}
            </Button>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                Réessayer
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Résumé des erreurs */}
          <div className="flex flex-wrap gap-2">
            {errors.map((error, index) => (
              <Badge key={index} variant="destructive" className="text-xs">
                {error.field}: {error.message}
              </Badge>
            ))}
          </div>

          {/* Détails des erreurs */}
          <div className="space-y-3">
            <h4 className="font-semibold text-red-800">Détails des Erreurs :</h4>
            {errors.map((error, index) => (
              <div key={index} className="bg-white p-3 rounded border border-red-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-red-800">
                      Champ : <code className="bg-red-100 px-1 rounded">{error.field}</code>
                    </div>
                    <div className="text-red-700 mt-1">
                      Message : {error.message}
                    </div>
                    {error.received !== undefined && (
                      <div className="text-red-600 mt-1 text-sm">
                        Valeur reçue : <code className="bg-red-100 px-1 rounded">{JSON.stringify(error.received)}</code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Données envoyées */}
          <div className="space-y-2">
            <h4 className="font-semibold text-red-800">Données Envoyées :</h4>
            <pre className="bg-white p-3 rounded border border-red-200 text-xs overflow-auto max-h-40">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>

          {/* Suggestions de correction */}
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <h4 className="font-semibold text-yellow-800 mb-2">💡 Suggestions :</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Vérifiez que tous les champs requis sont remplis</li>
              <li>• Assurez-vous que les quantités sont supérieures à 0</li>
              <li>• Vérifiez que les prix sont positifs</li>
              <li>• Vérifiez le format des emails</li>
              <li>• Assurez-vous qu'au moins un article est ajouté</li>
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

