'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, FileText, BarChart3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'
import AddCheckDialog from '@/components/suppliers/AddCheckDialog'

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

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showAddCheckDialog, setShowAddCheckDialog] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)

  useEffect(() => {
    fetchSuppliers()
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
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
      toast.error('Erreur lors de la suppression')
    }
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-sm sm:text-base">Chargement des fournisseurs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header avec gradient - Responsive */}
      <div className="relative bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">👥 Fournisseurs</h1>
              <p className="text-violet-100 text-sm sm:text-base">Gestion des fournisseurs et paiements</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Link href="/dashboard/suppliers/checks/analytics" className="w-full sm:w-auto">
                <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 w-full sm:w-auto">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Analytics </span>Chèques
                </Button>
              </Link>
              <Link href="/dashboard/suppliers/new" className="w-full sm:w-auto">
                <Button className="bg-white text-violet-600 hover:bg-violet-50 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Nouveau </span>Fournisseur
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Filtres - Responsive */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  type="text"
                  placeholder="🔍 Rechercher par nom, entreprise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 h-10 sm:h-11 text-sm sm:text-base w-full sm:w-auto"
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

        {/* Desktop Table */}
        <Card className="hidden lg:block">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSupplier(supplier)
                              setShowAddCheckDialog(true)
                            }}
                            title="Ajouter un chèque"
                          >
                            <FileText className="w-4 h-4 text-violet-600" />
                          </Button>
                          <Link href={`/dashboard/suppliers/${supplier.id}`}>
                            <Button variant="ghost" size="sm" title="Voir détails">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(supplier.id)}
                            title="Supprimer"
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

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {filteredSuppliers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl sm:text-3xl">👥</span>
                </div>
                <p className="text-gray-500 text-sm sm:text-base">Aucun fournisseur trouvé</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-2">
                  Les fournisseurs apparaîtront ici une fois ajoutés
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredSuppliers.map((supplier) => (
              <Card key={supplier.id} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                        {supplier.name}
                      </h3>
                      {supplier.company && (
                        <p className="text-sm text-gray-500 truncate">{supplier.company}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      <div className={`w-3 h-3 rounded-full ${supplier.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-blue-600">📞</span>
                      <span className="truncate">{supplier.phone}</span>
                    </div>
                    {supplier.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-green-600">✉️</span>
                        <span className="truncate">{supplier.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Transactions</div>
                      <div className="text-sm font-bold">{supplier._count.transactions}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Chèques</div>
                      <div className="text-sm font-bold">{supplier._count.checks}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedSupplier(supplier)
                        setShowAddCheckDialog(true)
                      }}
                      className="flex-1 text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Chèque
                    </Button>
                    <Link href={`/dashboard/suppliers/${supplier.id}`} className="flex-1">
                      <Button variant="ghost" size="sm" className="w-full">
                        <Edit className="w-4 h-4 mr-2" />
                        Détails
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(supplier.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Dialogue pour ajouter un chèque */}
      <AddCheckDialog
        open={showAddCheckDialog}
        onOpenChange={setShowAddCheckDialog}
        supplier={selectedSupplier ? {
          id: selectedSupplier.id,
          name: selectedSupplier.name,
          company: selectedSupplier.company
        } : null}
        onSuccess={() => {
          fetchSuppliers()
        }}
      />
    </div>
  )
}

