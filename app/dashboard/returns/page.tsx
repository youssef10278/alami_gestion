'use client'

import { useState, useEffect } from 'react'
import { Package, AlertTriangle, XCircle, Search, Filter, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import Link from 'next/link'

/**
 * 🔄 PAGE GESTION DES RETOURS PRODUITS
 * 
 * Interface complète pour visualiser et gérer tous les retours
 */

interface ProductReturn {
  id: string
  invoiceId: string
  productId: string
  quantity: number
  returnStatus: 'GOOD' | 'DEFECTIVE' | 'UNUSABLE'
  reason?: string
  restockedQuantity: number
  processedAt: string
  createdAt: string
  product: {
    id: string
    name: string
    sku: string
    stock: number
    defectiveStock: number
  }
  invoice: {
    id: string
    invoiceNumber: string
    type: string
    customerName: string
  }
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ProductReturn[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Statistiques des retours
  const [stats, setStats] = useState({
    total: 0,
    good: 0,
    defective: 0,
    unusable: 0,
    totalRestocked: 0
  })

  const fetchReturns = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })

      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/product-returns?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReturns(data.returns || [])
        setTotalPages(data.pagination?.pages || 1)
        
        // Calculer les statistiques
        const allReturns = data.returns || []
        setStats({
          total: allReturns.length,
          good: allReturns.filter(r => r.returnStatus === 'GOOD').length,
          defective: allReturns.filter(r => r.returnStatus === 'DEFECTIVE').length,
          unusable: allReturns.filter(r => r.returnStatus === 'UNUSABLE').length,
          totalRestocked: allReturns.reduce((sum, r) => sum + r.restockedQuantity, 0)
        })
      } else {
        toast.error('Erreur lors du chargement des retours')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des retours')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReturns()
  }, [page, statusFilter])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'GOOD':
        return <Package className="w-4 h-4 text-green-600" />
      case 'DEFECTIVE':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />
      case 'UNUSABLE':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'GOOD':
        return <Badge className="bg-green-100 text-green-800">Bon État</Badge>
      case 'DEFECTIVE':
        return <Badge className="bg-orange-100 text-orange-800">Défectueux</Badge>
      case 'UNUSABLE':
        return <Badge className="bg-red-100 text-red-800">Inutilisable</Badge>
      default:
        return <Badge>Inconnu</Badge>
    }
  }

  const filteredReturns = returns.filter(ret =>
    ret.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ret.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ret.invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ret.invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Retours</h1>
          <p className="text-gray-600 mt-2">
            Suivi complet des retours produits et impact sur les stocks
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Retours</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bon État</p>
                <p className="text-2xl font-bold text-green-600">{stats.good}</p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Défectueux</p>
                <p className="text-2xl font-bold text-orange-600">{stats.defective}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inutilisables</p>
                <p className="text-2xl font-bold text-red-600">{stats.unusable}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Restockés</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalRestocked}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par produit, SKU, facture ou client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="GOOD">Bon État</SelectItem>
                  <SelectItem value="DEFECTIVE">Défectueux</SelectItem>
                  <SelectItem value="UNUSABLE">Inutilisable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des retours */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Retours</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement des retours...</p>
            </div>
          ) : filteredReturns.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun retour trouvé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReturns.map((ret) => (
                <div key={ret.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(ret.returnStatus)}
                        <h3 className="font-medium">{ret.product.name}</h3>
                        {getStatusBadge(ret.returnStatus)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">SKU:</span> {ret.product.sku}
                        </div>
                        <div>
                          <span className="font-medium">Quantité:</span> {ret.quantity}
                        </div>
                        <div>
                          <span className="font-medium">Restocké:</span> {ret.restockedQuantity}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Facture:</span>{' '}
                          <Link 
                            href={`/dashboard/invoices/${ret.invoice.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {ret.invoice.invoiceNumber}
                          </Link>
                        </div>
                        <div>
                          <span className="font-medium">Client:</span> {ret.invoice.customerName}
                        </div>
                      </div>

                      {ret.reason && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium text-gray-600">Raison:</span>{' '}
                          <span className="text-gray-800">{ret.reason}</span>
                        </div>
                      )}

                      <div className="mt-3 text-xs text-gray-500">
                        Traité le {new Date(ret.processedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">Stock Actuel</div>
                      <div className="text-lg font-semibold text-green-600">
                        {ret.product.stock}
                      </div>
                      {ret.product.defectiveStock > 0 && (
                        <div className="text-sm text-orange-600">
                          +{ret.product.defectiveStock} défectueux
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Précédent
          </Button>
          <span className="flex items-center px-4">
            Page {page} sur {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  )
}
