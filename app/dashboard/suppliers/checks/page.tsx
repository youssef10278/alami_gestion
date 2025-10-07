'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Search, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Check {
  id: string
  checkNumber: string
  supplierId: string
  amount: number
  issueDate: string
  dueDate: string
  cashDate: string | null
  status: 'ISSUED' | 'CASHED' | 'CANCELLED' | 'BOUNCED'
  bankName: string
  accountNumber: string | null
  notes: string | null
  supplier: {
    id: string
    name: string
    company: string | null
  }
  transaction: {
    id: string
    transactionNumber: string
    description: string
  } | null
}

export default function ChecksPage() {
  const [checks, setChecks] = useState<Check[]>([])
  const [filteredChecks, setFilteredChecks] = useState<Check[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selectedCheck, setSelectedCheck] = useState<Check | null>(null)

  useEffect(() => {
    fetchChecks()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [checks, searchTerm, filterStatus])

  const fetchChecks = async () => {
    try {
      const response = await fetch('/api/suppliers/checks')
      if (response.ok) {
        const data = await response.json()
        setChecks(data)
      }
    } catch (error) {
      console.error('Error fetching checks:', error)
      toast.error('Erreur lors du chargement des chèques')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...checks]

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(check =>
        check.checkNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        check.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        check.supplier.company?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtre par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(check => check.status === filterStatus)
    }

    setFilteredChecks(filtered)
  }

  const handleUpdateStatus = async (checkId: string, newStatus: string, cashDate?: string) => {
    try {
      const response = await fetch('/api/suppliers/checks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: checkId,
          status: newStatus,
          cashDate: cashDate || null,
        }),
      })

      if (response.ok) {
        toast.success('Statut du chèque mis à jour')
        fetchChecks()
        setSelectedCheck(null)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Error updating check:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ISSUED':
        return <Badge className="bg-orange-100 text-orange-700">🟡 Émis</Badge>
      case 'CASHED':
        return <Badge className="bg-green-100 text-green-700">🟢 Encaissé</Badge>
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-700">⚫ Annulé</Badge>
      case 'BOUNCED':
        return <Badge className="bg-red-100 text-red-700">🔴 Rejeté</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const stats = {
    total: checks.length,
    issued: checks.filter(c => c.status === 'ISSUED').length,
    cashed: checks.filter(c => c.status === 'CASHED').length,
    problems: checks.filter(c => c.status === 'BOUNCED').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-2">📝 Gestion des Chèques</h1>
          <p className="text-violet-100">Suivi des chèques donnés aux fournisseurs</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Chèques
              </CardTitle>
              <FileText className="w-5 h-5 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">Chèques émis</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                En Attente
              </CardTitle>
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.issued}</div>
              <p className="text-xs text-gray-500 mt-1">Chèques émis</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Encaissés
              </CardTitle>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.cashed}</div>
              <p className="text-xs text-gray-500 mt-1">Chèques encaissés</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Problèmes
              </CardTitle>
              <XCircle className="w-5 h-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.problems}</div>
              <p className="text-xs text-gray-500 mt-1">Chèques rejetés</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="🔍 Rechercher par N° chèque ou fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="all">📋 Tous</option>
                <option value="ISSUED">🟡 Émis</option>
                <option value="CASHED">🟢 Encaissés</option>
                <option value="CANCELLED">⚫ Annulés</option>
                <option value="BOUNCED">🔴 Rejetés</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Tableau */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      N° Chèque
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fournisseur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Émission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Échéance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredChecks.map((check) => (
                    <tr key={check.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{check.checkNumber}</div>
                        <div className="text-sm text-gray-500">{check.bankName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{check.supplier.name}</div>
                        {check.supplier.company && (
                          <div className="text-sm text-gray-500">{check.supplier.company}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {Number(check.amount).toFixed(2)} DH
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(check.issueDate), 'dd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(check.dueDate), 'dd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(check.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {check.status === 'ISSUED' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateStatus(check.id, 'CASHED', new Date().toISOString())}
                                title="Marquer comme encaissé"
                              >
                                ✅
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Êtes-vous sûr de vouloir annuler ce chèque ?')) {
                                    handleUpdateStatus(check.id, 'CANCELLED')
                                  }
                                }}
                                title="Annuler"
                              >
                                ❌
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateStatus(check.id, 'BOUNCED')}
                                title="Marquer comme rejeté"
                              >
                                🔴
                              </Button>
                            </>
                          )}
                          {(check.status === 'CASHED' || check.status === 'CANCELLED' || check.status === 'BOUNCED') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm('Revenir au statut "Émis" ?')) {
                                  handleUpdateStatus(check.id, 'ISSUED', undefined)
                                }
                              }}
                              title="Revenir au statut Émis"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              🔄
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCheck(check)}
                            title="Voir détails"
                          >
                            👁️
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredChecks.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Aucun chèque trouvé</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Détails */}
      {selectedCheck && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCheck(null)}
        >
          <Card
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>Détails du Chèque #{selectedCheck.checkNumber}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Fournisseur</p>
                  <p className="font-medium">{selectedCheck.supplier.name}</p>
                  {selectedCheck.supplier.company && (
                    <p className="text-sm text-gray-500">{selectedCheck.supplier.company}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Montant</p>
                  <p className="font-bold text-lg">{Number(selectedCheck.amount).toFixed(2)} DH</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Banque</p>
                  <p className="font-medium">{selectedCheck.bankName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  {getStatusBadge(selectedCheck.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date d'émission</p>
                  <p className="font-medium">
                    {format(new Date(selectedCheck.issueDate), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date d'échéance</p>
                  <p className="font-medium">
                    {format(new Date(selectedCheck.dueDate), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
                {selectedCheck.cashDate && (
                  <div>
                    <p className="text-sm text-gray-600">Date d'encaissement</p>
                    <p className="font-medium">
                      {format(new Date(selectedCheck.cashDate), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                )}
                {selectedCheck.accountNumber && (
                  <div>
                    <p className="text-sm text-gray-600">N° Compte</p>
                    <p className="font-medium">{selectedCheck.accountNumber}</p>
                  </div>
                )}
              </div>

              {selectedCheck.transaction && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Transaction liée</p>
                  <p className="font-medium">{selectedCheck.transaction.transactionNumber}</p>
                  <p className="text-sm text-gray-500">{selectedCheck.transaction.description}</p>
                </div>
              )}

              {selectedCheck.notes && (
                <div>
                  <p className="text-sm text-gray-600">Notes</p>
                  <p className="text-sm">{selectedCheck.notes}</p>
                </div>
              )}

              <Button
                onClick={() => setSelectedCheck(null)}
                className="w-full"
              >
                Fermer
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

