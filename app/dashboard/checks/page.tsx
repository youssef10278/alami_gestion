'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Search, FileText, Calendar, User, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface SaleCheck {
  id: string
  checkNumber: string
  issuer: string
  beneficiary: string
  checkDate: string
  amount: number
  status: 'PENDING' | 'CASHED' | 'BOUNCED' | 'CANCELLED'
  cashedDate?: string
  notes?: string
  createdAt: string
  sale: {
    id: string
    saleNumber: string
    customer?: {
      name: string
      email?: string
    }
    seller: {
      name: string
    }
  }
}

export default function ChecksPage() {
  const [checks, setChecks] = useState<SaleCheck[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Charger les chèques
  const fetchChecks = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/sale-checks?${params}`)
      if (response.ok) {
        const data = await response.json()
        setChecks(data)
      } else {
        toast.error('Erreur lors du chargement des chèques')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des chèques')
    } finally {
      setLoading(false)
    }
  }

  // Mettre à jour le statut d'encaissement
  const updateCheckStatus = async (checkId: string, newStatus: 'PENDING' | 'CASHED') => {
    try {
      const response = await fetch(`/api/sale-checks/${checkId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          cashedDate: newStatus === 'CASHED' ? new Date().toISOString() : null
        }),
      })

      if (response.ok) {
        toast.success(newStatus === 'CASHED' ? 'Chèque marqué comme encaissé' : 'Chèque remis en attente')
        fetchChecks() // Recharger la liste
      } else {
        toast.error('Erreur lors de la mise à jour du statut')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  // Obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-orange-600 border-orange-300"><Clock className="w-3 h-3 mr-1" />En attente</Badge>
      case 'CASHED':
        return <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Encaissé</Badge>
      case 'BOUNCED':
        return <Badge variant="outline" className="text-red-600 border-red-300"><AlertCircle className="w-3 h-3 mr-1" />Rejeté</Badge>
      case 'CANCELLED':
        return <Badge variant="outline" className="text-gray-600 border-gray-300">Annulé</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Calculer les statistiques
  const stats = {
    total: checks.length,
    pending: checks.filter(c => c.status === 'PENDING').length,
    cashed: checks.filter(c => c.status === 'CASHED').length,
    totalAmount: checks.reduce((sum, c) => sum + Number(c.amount || 0), 0),
    pendingAmount: checks.filter(c => c.status === 'PENDING').reduce((sum, c) => sum + Number(c.amount || 0), 0)
  }

  useEffect(() => {
    fetchChecks()
  }, [statusFilter, searchTerm])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des chèques...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Chèques</h1>
          <p className="text-gray-600">Suivi et encaissement des chèques reçus</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total chèques</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Encaissés</p>
                <p className="text-xl font-bold">{stats.cashed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-xl font-bold">{(stats.pendingAmount || 0).toFixed(2)} DH</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Numéro de chèque, émetteur, bénéficiaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <Label className="text-sm font-medium">Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous les statuts</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="CASHED">Encaissés</SelectItem>
                  <SelectItem value="BOUNCED">Rejetés</SelectItem>
                  <SelectItem value="CANCELLED">Annulés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des chèques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Liste des Chèques ({checks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {checks.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun chèque trouvé</p>
              <p className="text-sm text-gray-500">Les chèques apparaîtront ici lors des ventes avec paiement par chèque</p>
            </div>
          ) : (
            <div className="space-y-4">
              {checks.map((check) => (
                <div key={check.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Informations du chèque */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-blue-600">#{check.checkNumber}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(check.checkDate).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-lg font-bold text-green-600 mt-1">
                          {Number(check.amount || 0).toFixed(2)} DH
                        </p>
                      </div>

                      {/* Émetteur et bénéficiaire */}
                      <div>
                        <p className="text-sm text-gray-500">Émetteur</p>
                        <p className="font-medium">{check.issuer}</p>
                        <p className="text-sm text-gray-500 mt-2">Bénéficiaire</p>
                        <p className="font-medium">{check.beneficiary}</p>
                      </div>

                      {/* Vente associée */}
                      <div>
                        <p className="text-sm text-gray-500">Vente</p>
                        <p className="font-medium">#{check.sale.saleNumber}</p>
                        <p className="text-sm text-gray-600">
                          <User className="w-3 h-3 inline mr-1" />
                          {check.sale.customer?.name || 'Client de passage'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Vendeur: {check.sale.seller.name}
                        </p>
                      </div>

                      {/* Statut et actions */}
                      <div className="flex flex-col items-end gap-3">
                        {getStatusBadge(check.status)}

                        {check.status === 'CASHED' && check.cashedDate && (
                          <p className="text-xs text-gray-500">
                            Encaissé le {new Date(check.cashedDate).toLocaleDateString('fr-FR')}
                          </p>
                        )}

                        {/* Toggle d'encaissement */}
                        {(check.status === 'PENDING' || check.status === 'CASHED') && (
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Encaissé</Label>
                            <Switch
                              checked={check.status === 'CASHED'}
                              onCheckedChange={(checked) =>
                                updateCheckStatus(check.id, checked ? 'CASHED' : 'PENDING')
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes si présentes */}
                  {check.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {check.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
