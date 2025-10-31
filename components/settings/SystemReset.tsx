'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { 
  AlertTriangle, 
  Database, 
  Trash2, 
  RefreshCw, 
  Shield,
  Users,
  Package,
  ShoppingCart,
  FileText,
  TrendingUp,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface SystemStats {
  users: number
  categories: number
  products: number
  customers: number
  suppliers: number
  sales: number
  invoices: number
  quotes: number
  stockMovements: number
  documents: number
}

interface SystemInfo {
  systemStats: SystemStats
  totalRecords: number
  isEmpty: boolean
  timestamp: string
}

export default function SystemReset() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  const [keepCurrentUser, setKeepCurrentUser] = useState(true)

  // Charger les informations du système
  const fetchSystemInfo = async () => {
    try {
      const response = await fetch('/api/system/reset')
      const data = await response.json()

      if (response.ok) {
        setSystemInfo(data)
      } else {
        toast.error(data.error || 'Erreur lors du chargement des informations système')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSystemInfo()
  }, [])

  // Réinitialiser le système
  const handleSystemReset = async () => {
    if (confirmationText !== 'RESET_ALL_DATA') {
      toast.error('Veuillez saisir exactement "RESET_ALL_DATA" pour confirmer')
      return
    }

    setIsResetting(true)

    try {
      const response = await fetch('/api/system/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmationText,
          keepCurrentUser
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Système réinitialisé avec succès !', {
          description: 'Toutes les données ont été supprimées'
        })
        setIsResetDialogOpen(false)
        setConfirmationText('')
        fetchSystemInfo() // Recharger les statistiques
        
        // Rediriger vers le dashboard après un délai
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      } else {
        toast.error(data.error || 'Erreur lors de la réinitialisation du système')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de connexion au serveur')
    } finally {
      setIsResetting(false)
    }
  }

  const getStatIcon = (key: string) => {
    const icons: Record<string, any> = {
      users: Users,
      categories: Package,
      products: Package,
      customers: Users,
      suppliers: Users,
      sales: ShoppingCart,
      invoices: FileText,
      quotes: FileText,
      stockMovements: TrendingUp,
      documents: FileText
    }
    return icons[key] || Database
  }

  const getStatLabel = (key: string) => {
    const labels: Record<string, string> = {
      users: 'Utilisateurs',
      categories: 'Catégories',
      products: 'Produits',
      customers: 'Clients',
      suppliers: 'Fournisseurs',
      sales: 'Ventes',
      invoices: 'Factures',
      quotes: 'Devis',
      stockMovements: 'Mouvements Stock',
      documents: 'Documents'
    }
    return labels[key] || key
  }

  if (loading) {
    return (
      <Card className="glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass border-red-200 mt-8">
      <CardHeader className="pt-8">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <CardTitle className="text-red-800">Zone de Danger - Réinitialisation Système</CardTitle>
            <p className="text-sm text-red-600 mt-1">
              ⚠️ Cette action supprimera TOUTES les données de l'application de manière IRRÉVERSIBLE
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Statistiques du système */}
          {systemInfo && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">État Actuel du Système</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(systemInfo.systemStats).map(([key, count]) => {
                  const Icon = getStatIcon(key)
                  return (
                    <div key={key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Icon className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-xs text-gray-600">{getStatLabel(key)}</p>
                        <p className="font-semibold text-gray-900">{count}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Database className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Total des enregistrements</p>
                  <p className="text-sm text-blue-700">{systemInfo.totalRecords} enregistrements dans la base de données</p>
                </div>
              </div>
            </div>
          )}

          {/* Avertissements */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-900">⚠️ ATTENTION - Action Irréversible</h4>
                <ul className="text-sm text-red-700 mt-2 space-y-1">
                  <li>• Toutes les ventes, factures et devis seront supprimés</li>
                  <li>• Tous les produits, clients et fournisseurs seront effacés</li>
                  <li>• L'historique des mouvements de stock sera perdu</li>
                  <li>• Les documents générés seront supprimés</li>
                  <li>• Cette action ne peut pas être annulée</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-900">🛡️ Recommandations de Sécurité</h4>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                  <li>• Effectuez une sauvegarde complète avant de procéder</li>
                  <li>• Assurez-vous que tous les utilisateurs sont déconnectés</li>
                  <li>• Informez votre équipe de cette maintenance</li>
                  <li>• Vérifiez que vous avez les droits de propriétaire</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bouton de réinitialisation */}
          <div className="pt-4 border-t border-red-200">
            <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={systemInfo?.isEmpty}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {systemInfo?.isEmpty ? 'Système Déjà Vide' : 'Réinitialiser Complètement le Système'}
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="w-5 h-5" />
                    Confirmation de Réinitialisation
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800 font-medium">
                      ⚠️ Vous êtes sur le point de supprimer TOUTES les données !
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Cette action est irréversible et supprimera définitivement toutes les informations.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmation">
                      Pour confirmer, tapez exactement : <code className="bg-gray-100 px-1 rounded">RESET_ALL_DATA</code>
                    </Label>
                    <Input
                      id="confirmation"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder="RESET_ALL_DATA"
                      className="font-mono"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="keep-user"
                      checked={keepCurrentUser}
                      onCheckedChange={setKeepCurrentUser}
                    />
                    <Label htmlFor="keep-user" className="text-sm">
                      Conserver mon compte utilisateur
                    </Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleSystemReset}
                      disabled={confirmationText !== 'RESET_ALL_DATA' || isResetting}
                      variant="destructive"
                      className="flex-1"
                    >
                      {isResetting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Réinitialisation...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Confirmer la Réinitialisation
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsResetDialogOpen(false)}
                      disabled={isResetting}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
