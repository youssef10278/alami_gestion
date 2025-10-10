'use client'

import { useState, useRef } from 'react'
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
  Loader2,
  FileUp,
  Eye,
  RotateCcw
} from 'lucide-react'
import { formatFileSize } from '@/lib/backup-utils'

interface ExportStats {
  totalRecords: number
  fileSize: number
  processingTime: number
  compressionRatio?: string
}

interface ImportStats {
  products_imported: number
  customers_imported: number
  suppliers_imported: number
  sales_imported: number
  invoices_imported: number
  quotes_imported: number
  errors: number
}

interface ImportResult {
  success: boolean
  message: string
  stats: ImportStats
  errors: string[]
  processingTime: number
}

interface ImportPreview {
  filename: string
  fileSize: number
  version: string
  exported_at: string
  total_records: number
  breakdown: {
    products: number
    customers: number
    suppliers: number
    sales: number
    invoices: number
    quotes: number
  }
}

export default function BackupPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [lastExport, setLastExport] = useState<Date | null>(null)
  const [exportStats, setExportStats] = useState<ExportStats | null>(null)
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Analyse d'un fichier pour aperçu
  const analyzeFile = async (file: File): Promise<ImportPreview | null> => {
    try {
      const fileBuffer = await file.arrayBuffer()
      let jsonString: string

      // Décompression si nécessaire
      if (file.name.endsWith('.gz')) {
        const { gunzip } = await import('zlib')
        const { promisify } = await import('util')
        const gunzipAsync = promisify(gunzip)
        const decompressed = await gunzipAsync(Buffer.from(fileBuffer))
        jsonString = decompressed.toString('utf8')
      } else {
        jsonString = Buffer.from(fileBuffer).toString('utf8')
      }

      const data = JSON.parse(jsonString)

      return {
        filename: file.name,
        fileSize: file.size,
        version: data.metadata?.version || 'Inconnue',
        exported_at: data.metadata?.exported_at || 'Inconnue',
        total_records: data.metadata?.total_records || 0,
        breakdown: {
          products: data.data?.products?.length || 0,
          customers: data.data?.customers?.length || 0,
          suppliers: data.data?.suppliers?.length || 0,
          sales: (data.data?.standalone_sales?.length || 0) +
                 (data.data?.customers?.reduce((sum: number, c: any) => sum + (c.sales?.length || 0), 0) || 0),
          invoices: data.data?.invoices?.length || 0,
          quotes: data.data?.quotes?.length || 0
        }
      }
    } catch (error) {
      console.error('Erreur analyse fichier:', error)
      return null
    }
  }

  // Gestion du drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const file = files[0]

    if (file) {
      await handleFileSelect(file)
    }
  }

  // Sélection de fichier
  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.json') && !file.name.endsWith('.gz')) {
      toast.error('❌ Format de fichier invalide', {
        description: 'Seuls les fichiers .json et .json.gz sont acceptés'
      })
      return
    }

    toast.info('🔍 Analyse du fichier...', {
      description: 'Vérification du contenu et de la structure'
    })

    const preview = await analyzeFile(file)
    if (preview) {
      setImportPreview(preview)
      setImportResult(null)
      toast.success('✅ Fichier analysé', {
        description: `${preview.total_records} enregistrements détectés`
      })
    } else {
      toast.error('❌ Fichier invalide', {
        description: 'Le fichier ne semble pas être une sauvegarde valide'
      })
    }
  }

  // Import manuel des données
  const handleManualImport = async () => {
    if (!importPreview || !fileInputRef.current?.files?.[0]) {
      toast.error('❌ Aucun fichier sélectionné')
      return
    }

    setIsImporting(true)
    setImportResult(null)

    try {
      toast.info('🔄 Import en cours...', {
        description: 'Traitement et insertion des données'
      })

      const formData = new FormData()
      formData.append('file', fileInputRef.current.files[0])
      formData.append('options', JSON.stringify({
        merge_strategy: 'merge',
        validate_relations: true,
        create_backup_before_import: true
      }))

      const response = await fetch('/api/backup/import', {
        method: 'POST',
        body: formData
      })

      const result: ImportResult = await response.json()

      if (response.ok && result.success) {
        setImportResult(result)
        toast.success('✅ Import terminé !', {
          description: `${Object.values(result.stats).reduce((a, b) => a + b, 0) - result.stats.errors} enregistrements importés`
        })
      } else {
        setImportResult(result)
        toast.error('❌ Erreur lors de l\'import', {
          description: result.message || 'Erreur inconnue'
        })
      }

    } catch (error) {
      console.error('Erreur import:', error)
      toast.error('❌ Erreur lors de l\'import', {
        description: error instanceof Error ? error.message : 'Erreur inconnue'
      })
    } finally {
      setIsImporting(false)
    }
  }

  // Réinitialiser l'import
  const resetImport = () => {
    setImportPreview(null)
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
            <Badge variant="default">Opérationnel</Badge>
          </div>
          <CardDescription>
            Restaurez vos données à partir d'un fichier de sauvegarde
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Zone de drag & drop */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.gz"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            <div className="space-y-4">
              <FileUp className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-medium">
                  Glissez votre fichier de sauvegarde ici
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  ou cliquez pour parcourir (.json, .json.gz)
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
              >
                <FileText className="h-4 w-4 mr-2" />
                Parcourir les fichiers
              </Button>
            </div>
          </div>

          {/* Aperçu du fichier */}
          {importPreview && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-blue-800">Aperçu du fichier</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetImport}
                    disabled={isImporting}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-blue-600 font-medium">Fichier</p>
                    <p className="text-blue-800 truncate">{importPreview.filename}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">Taille</p>
                    <p className="text-blue-800">{formatFileSize(importPreview.fileSize)}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">Version</p>
                    <p className="text-blue-800">{importPreview.version}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">Total</p>
                    <p className="text-blue-800">{importPreview.total_records.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs mb-4">
                  <div className="text-center p-2 bg-white rounded">
                    <p className="font-medium">{importPreview.breakdown.products}</p>
                    <p className="text-muted-foreground">Produits</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="font-medium">{importPreview.breakdown.customers}</p>
                    <p className="text-muted-foreground">Clients</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="font-medium">{importPreview.breakdown.suppliers}</p>
                    <p className="text-muted-foreground">Fournisseurs</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="font-medium">{importPreview.breakdown.sales}</p>
                    <p className="text-muted-foreground">Ventes</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="font-medium">{importPreview.breakdown.invoices}</p>
                    <p className="text-muted-foreground">Factures</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="font-medium">{importPreview.breakdown.quotes}</p>
                    <p className="text-muted-foreground">Devis</p>
                  </div>
                </div>

                <Button
                  onClick={handleManualImport}
                  disabled={isImporting}
                  className="w-full"
                >
                  {isImporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isImporting ? 'Import en cours...' : 'Importer ces données'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Résultat de l'import */}
          {importResult && (
            <Card className={importResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {importResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <CardTitle className={importResult.success ? 'text-green-800' : 'text-red-800'}>
                    {importResult.success ? 'Import réussi' : 'Import avec erreurs'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className={`mb-4 ${importResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {importResult.message}
                </p>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs mb-4">
                  <div className="text-center p-2 bg-white rounded">
                    <p className="font-medium">{importResult.stats.products_imported}</p>
                    <p className="text-muted-foreground">Produits</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="font-medium">{importResult.stats.customers_imported}</p>
                    <p className="text-muted-foreground">Clients</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="font-medium">{importResult.stats.suppliers_imported}</p>
                    <p className="text-muted-foreground">Fournisseurs</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="font-medium">{importResult.stats.sales_imported}</p>
                    <p className="text-muted-foreground">Ventes</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="font-medium">{importResult.stats.invoices_imported}</p>
                    <p className="text-muted-foreground">Factures</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="font-medium">{importResult.stats.quotes_imported}</p>
                    <p className="text-muted-foreground">Devis</p>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded">
                    <p className="text-red-800 font-medium mb-2">Erreurs détectées :</p>
                    <ul className="text-red-700 text-sm space-y-1">
                      {importResult.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li>• ... et {importResult.errors.length - 5} autres erreurs</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="mt-4 text-xs text-muted-foreground">
                  Import terminé en {importResult.processingTime}ms
                </div>
              </CardContent>
            </Card>
          )}
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
