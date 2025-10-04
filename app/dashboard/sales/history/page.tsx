'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Eye, Calendar, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Sale {
  id: string
  saleNumber: string
  totalAmount: number
  paidAmount: number
  creditAmount: number
  paymentMethod: string
  status: string
  createdAt: string
  customer: {
    name: string
    company: string | null
  }
  seller: {
    name: string
  }
  items: {
    id: string
    quantity: number
    unitPrice: number
    total: number
    product: {
      name: string
      sku: string
    }
  }[]
}

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales')
      const data = await response.json()
      setSales(data.sales || [])
    } catch (error) {
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Complétée</Badge>
      case 'PENDING':
        return <Badge variant="warning">En attente</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Annulée</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'Espèces'
      case 'CARD':
        return 'Carte'
      case 'TRANSFER':
        return 'Virement'
      case 'CREDIT':
        return 'Crédit'
      default:
        return method
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Premium */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-600 via-rose-600 to-red-600 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-red-400/20 backdrop-blur-3xl"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-1 drop-shadow-lg">
                Historique des Ventes
              </h1>
              <p className="text-pink-100 text-sm">
                Consultez toutes les ventes effectuées
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-xs text-white/80 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                  📋 {sales.length} ventes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats avec design premium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Ventes */}
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-pink-50 to-rose-100/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-pink-900">
              Total Ventes
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
              {sales.length}
            </div>
            <p className="text-xs text-pink-600 mt-2 font-medium">
              📋 Transactions
            </p>
          </CardContent>
        </Card>

        {/* Chiffre d'Affaires */}
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-100/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-green-900">
              Chiffre d'Affaires
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              {sales.reduce((sum, s) => sum + Number(s.totalAmount), 0).toFixed(0)} DH
            </div>
            <p className="text-xs text-green-600 mt-2 font-medium">
              💰 Total généré
            </p>
          </CardContent>
        </Card>

        {/* Montant Payé */}
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-indigo-100/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-blue-900">
              Montant Payé
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              {sales.reduce((sum, s) => sum + Number(s.paidAmount), 0).toFixed(0)} DH
            </div>
            <p className="text-xs text-blue-600 mt-2 font-medium">
              ✅ Encaissé
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      ) : sales.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Aucune vente trouvée</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendeur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Méthode
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
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {format(new Date(sale.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {sale.customer.name}
                        </div>
                        {sale.customer.company && (
                          <div className="text-sm text-gray-500">
                            {sale.customer.company}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.seller.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                        {Number(sale.totalAmount).toFixed(2)} DH
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {Number(sale.paidAmount).toFixed(2)} DH
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getPaymentMethodLabel(sale.paymentMethod)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(sale.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSale(sale)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sale Details Modal */}
      {selectedSale && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSale(null)}
        >
          <Card
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>Détails de la vente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedSale.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  {getStatusBadge(selectedSale.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="font-medium">{selectedSale.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vendeur</p>
                  <p className="font-medium">{selectedSale.seller.name}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Articles</h4>
                <div className="space-y-2">
                  {selectedSale.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × {Number(item.price).toFixed(2)} DH
                        </p>
                      </div>
                      <p className="font-semibold">{Number(item.total).toFixed(2)} DH</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-bold">{Number(selectedSale.totalAmount).toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between">
                  <span>Payé:</span>
                  <span className="text-green-600 font-semibold">
                    {Number(selectedSale.paidAmount).toFixed(2)} DH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Reste:</span>
                  <span className="text-orange-600 font-semibold">
                    {Number(selectedSale.creditAmount).toFixed(2)} DH
                  </span>
                </div>
              </div>

              <Button
                onClick={() => setSelectedSale(null)}
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

