'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Download, 
  Upload, 
  Shield, 
  Clock, 
  FileText, 
  Zap,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { formatFileSize } from '@/lib/backup-utils'

interface ExportStats {
  totalRecords: number
  fileSize: number
  processingTime: number
  compressionRatio?: string
}

export default function BackupPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [lastExport, setLastExport] = useState<Date | null>(null)
  const [exportStats, setExportStats] = useState<ExportStats | null>(null)

  // Export manuel des données
  const handleManualExport = async (compressed = true) => {
    setIsExporting(true)
    
    try {
      toast.info('🔄 Export en cours...', {
        description: 'Récupération et traitement des données'
      })

      const startTime = Date.now()
      const format = compressed ? 'gzip' : 'json'
      const response = await fetch(`/api/backup/export?compress=${compressed}&format=${format}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Erreur lors de l\'export')
      }

      // Récupérer les statistiques depuis les headers
      const totalRecords = parseInt(response.headers.get('X-Total-Records') || '0')
      const fileSize = parseInt(response.headers.get('X-File-Size') || response.headers.get('X-Compressed-Size') || '0')
      const processingTime = parseInt(response.headers.get('X-Processing-Time') || '0')
      const compressionRatio = response.headers.get('X-Compression-Ratio')

      // Télécharger le fichier
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      // Nom du fichier basé sur la date
      const today = new Date().toISOString().split('T')[0]
      const filename = compressed 
        ? `alami-backup-${today}.json.gz`
        : `alami-backup-${today}.json`
      
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Mettre à jour les statistiques
      const stats: ExportStats = {
        totalRecords,
        fileSize,
        processingTime,
        compressionRatio: compressionRatio || undefined
      }
      
      setExportStats(stats)
      setLastExport(new Date())

      const totalTime = Date.now() - startTime
      
      toast.success('✅ Export terminé !', {
        description: `${totalRecords} enregistrements exportés en ${totalTime}ms`
      })

    } catch (error) {
      console.error('Erreur export:', error)
      toast.error('❌ Erreur lors de l\'export', {
        description: error instanceof Error ? error.message : 'Erreur inconnue'
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Import manuel des données (placeholder pour Phase 2)
  const handleManualImport = () => {
    toast.info('🚧 Import en développement', {
      description: 'Cette fonctionnalité sera disponible dans la Phase 2'
    })
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold">Sauvegarde & Restauration</h1>
        <p className="text-muted-foreground mt-2">
          Gérez vos sauvegardes de données pour protéger votre activité
        </p>
      </div>

      {/* Statut de la dernière sauvegarde */}
      {lastExport && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-800">Dernière sauvegarde</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-green-600 font-medium">Date</p>
                <p className="text-green-800">{lastExport.toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-green-600 font-medium">Heure</p>
                <p className="text-green-800">{lastExport.toLocaleTimeString('fr-FR')}</p>
              </div>
              {exportStats && (
                <>
                  <div>
                    <p className="text-green-600 font-medium">Enregistrements</p>
                    <p className="text-green-800">{exportStats.totalRecords.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-green-600 font-medium">Taille</p>
                    <p className="text-green-800">{formatFileSize(exportStats.fileSize)}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Manuel */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            <CardTitle>Export Manuel</CardTitle>
          </div>
          <CardDescription>
            Téléchargez une sauvegarde complète de toutes vos données
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => handleManualExport(true)}
              disabled={isExporting}
              className="flex-1"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export Compressé (.gz)
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => handleManualExport(false)}
              disabled={isExporting}
              className="flex-1"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Export JSON
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Données sécurisées</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Compression automatique</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              <span>Export rapide</span>
            </div>
          </div>

          {exportStats && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Dernières statistiques</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Enregistrements</p>
                  <p className="font-medium">{exportStats.totalRecords.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Taille</p>
                  <p className="font-medium">{formatFileSize(exportStats.fileSize)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Temps</p>
                  <p className="font-medium">{exportStats.processingTime}ms</p>
                </div>
                {exportStats.compressionRatio && (
                  <div>
                    <p className="text-muted-foreground">Compression</p>
                    <p className="font-medium">{exportStats.compressionRatio}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Manuel */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            <CardTitle>Import Manuel</CardTitle>
            <Badge variant="secondary">Phase 2</Badge>
          </div>
          <CardDescription>
            Restaurez vos données à partir d'un fichier de sauvegarde
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={handleManualImport}
            disabled={true}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importer des Données
          </Button>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-blue-800 font-medium">Fonctionnalité en développement</p>
                <p className="text-blue-700 text-sm mt-1">
                  L'import de données sera disponible dans la Phase 2 du développement.
                  Cette fonctionnalité permettra de restaurer vos données depuis un fichier de sauvegarde.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Informations */}
      <Card>
        <CardHeader>
          <CardTitle>Informations Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <h4 className="font-medium mb-2">🔒 Sécurité</h4>
              <p className="text-sm text-muted-foreground">
                Les mots de passe et données sensibles sont automatiquement exclus des sauvegardes.
                Chaque fichier inclut un checksum pour vérifier l'intégrité.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">📁 Format des Fichiers</h4>
              <p className="text-sm text-muted-foreground">
                Les sauvegardes sont au format JSON avec structure hiérarchique.
                La compression GZIP réduit la taille de 70-80% en moyenne.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">💾 Stockage</h4>
              <p className="text-sm text-muted-foreground">
                Les fichiers sont téléchargés dans votre dossier Téléchargements.
                Nom du fichier : alami-backup-YYYY-MM-DD.json(.gz)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
