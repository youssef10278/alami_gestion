'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Users, DollarSign, CreditCard, FileText, Edit, Trash2, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'
import SupplierAnalyticsDashboard from '@/components/suppliers/SupplierAnalyticsDashboard'

interface Supplier {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string
  address: string | null
  taxId: string | null
  totalDebt: number
  totalPaid: number
  balance: number
  notes: string | null
  isActive: boolean
  createdAt: string
  _count: {
    transactions: number
    checks: number
  }
}

interface Stats {
  totalSuppliers: number
  totalDebt: number
  totalPaidThisMonth: number
  pendingChecks: number
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [stats, setStats] = useState<Stats>({
    totalSuppliers: 0,
    totalDebt: 0,
    totalPaidThisMonth: 0,
    pendingChecks: 0,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'suppliers' | 'analytics'>('suppliers')

  useEffect(() => {
    fetchSuppliers()
    fetchStats()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [suppliers, searchTerm, filterStatus])

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers')
      if (response.ok) {
        const data = await response.json()
        setSuppliers(data)
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      toast.error('Erreur lors du chargement des fournisseurs')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/suppliers/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const applyFilters = () => {
    let filtered = [...suppliers]

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.phone.includes(searchTerm)
      )
    }

    // Filtre par statut
    if (filterStatus === 'with_debt') {
      filtered = filtered.filter(supplier => Number(supplier.balance) > 0)
    } else if (filterStatus === 'clear') {
      filtered = filtered.filter(supplier => Number(supplier.balance) <= 0)
    } else if (filterStatus === 'active') {
      filtered = filtered.filter(supplier => supplier.isActive)
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(supplier => !supplier.isActive)
    }

    setFilteredSuppliers(filtered)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      return
    }

    try {
      const response = await fetch(`/api/suppliers?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Fournisseur supprimé avec succès')
        fetchSuppliers()
        fetchStats()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const getBalanceColor = (balance: number) => {
    if (balance <= 0) return 'text-green-600'
    if (balance < 10000) return 'text-orange-600'
    return 'text-red-600'
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
      {/* Header avec gradient */}
      <div className="relative bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">👥 Fournisseurs</h1>
              <p className="text-violet-100">Gestion des fournisseurs et paiements</p>
            </div>
            <Link href="/dashboard/suppliers/new">
              <Button className="bg-white text-violet-600 hover:bg-violet-50">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Fournisseur
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Onglets */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`${
                activeTab === 'suppliers'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
            >
              <Users className="w-5 h-5" />
              Liste des Fournisseurs
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`${
                activeTab === 'analytics'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
            >
              <BarChart3 className="w-5 h-5" />
              Analytics des Chèques
            </button>
          </nav>
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'suppliers' ? (
          <>
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Fournisseurs
              </CardTitle>
              <Users className="w-5 h-5 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalSuppliers}</div>
              <p className="text-xs text-gray-500 mt-1">Fournisseurs actifs</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Dû
              </CardTitle>
              <DollarSign className="w-5 h-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.totalDebt.toFixed(2)} DH</div>
              <p className="text-xs text-gray-500 mt-1">Montant total à payer</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Payé ce Mois
              </CardTitle>
              <CreditCard className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.totalPaidThisMonth.toFixed(2)} DH</div>
              <p className="text-xs text-gray-500 mt-1">Paiements du mois</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Chèques en Attente
              </CardTitle>
              <FileText className="w-5 h-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.pendingChecks}</div>
              <p className="text-xs text-gray-500 mt-1">Chèques émis</p>
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
                  placeholder="🔍 Rechercher par nom, entreprise ou téléphone..."
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
                <option value="with_debt">💰 Avec dette</option>
                <option value="clear">✅ À jour</option>
                <option value="active">🟢 Actifs</option>
                <option value="inactive">⚫ Inactifs</option>
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
                      Fournisseur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Dû
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Payé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Solde
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                          {supplier.company && (
                            <div className="text-sm text-gray-500">{supplier.company}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{supplier.phone}</div>
                        {supplier.email && (
                          <div className="text-sm text-gray-500">{supplier.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Number(supplier.totalDebt).toFixed(2)} DH
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {Number(supplier.totalPaid).toFixed(2)} DH
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${getBalanceColor(Number(supplier.balance))}`}>
                          {Number(supplier.balance).toFixed(2)} DH
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Link href={`/dashboard/suppliers/${supplier.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(supplier.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredSuppliers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Aucun fournisseur trouvé</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
          </>
        ) : (
          /* Onglet Analytics */
          <SupplierAnalyticsDashboard />
        )}
      </div>
    </div>
  )
}

