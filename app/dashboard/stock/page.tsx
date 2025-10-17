'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  History,
  DollarSign,
  BarChart3,
  Percent,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import StockMovementDialog from '@/components/stock/StockMovementDialog'

interface Alert {
  id: string
  name: string
  sku: string
  stock: number
  minStock: number
  category: string
  status: 'OUT_OF_STOCK' | 'CRITICAL' | 'WARNING'
  percentage: number
}

interface Movement {
  id: string
  quantity: number
  type: string
  reason: string
  createdAt: string
  product: {
    name: string
    sku: string
  }
  user: {
    name: string
  }
}

export default function StockPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [movementDialogOpen, setMovementDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(
    null
  )
  const [stats, setStats] = useState({
    total: 0,
    outOfStock: 0,
    critical: 0,
    warning: 0,
  })
  const [stockValue, setStockValue] = useState({
    totalSaleValue: 0,
    totalCostValue: 0,
    totalQuantity: 0,
    totalProducts: 0,
    productsInStock: 0,
    productsOutOfStock: 0,
    potentialMargin: 0,
    marginPercentage: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [alertsRes, movementsRes, stockValueRes] = await Promise.all([
        fetch('/api/stock/alerts'),
        fetch('/api/stock/movements?limit=20'),
        fetch('/api/stock/value'),
      ])

      const alertsData = await alertsRes.json()
      const movementsData = await movementsRes.json()
      const stockValueData = await stockValueRes.json()

      setAlerts(alertsData.products || [])
      setStats({
        total: alertsData.total || 0,
        outOfStock: alertsData.outOfStock || 0,
        critical: alertsData.critical || 0,
        warning: alertsData.warning || 0,
      })
      setMovements(movementsData.movements || [])
      setStockValue(stockValueData.stockValue || {
        totalSaleValue: 0,
        totalCostValue: 0,
        totalQuantity: 0,
        totalProducts: 0,
        productsInStock: 0,
        productsOutOfStock: 0,
        potentialMargin: 0,
        marginPercentage: 0,
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMovement = (productId: string, productName: string) => {
    setSelectedProduct({ id: productId, name: productName })
    setMovementDialogOpen(true)
  }

  const handleMovementSuccess = () => {
    fetchData()
    setMovementDialogOpen(false)
    setSelectedProduct(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OUT_OF_STOCK':
        return <Badge variant="destructive">Rupture</Badge>
      case 'CRITICAL':
        return <Badge className="bg-orange-500">Critique</Badge>
      case 'WARNING':
        return <Badge variant="secondary">Alerte</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Premium */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 backdrop-blur-3xl"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-1 drop-shadow-lg">
                Gestion du Stock
              </h1>
              <p className="text-orange-100 text-sm">
                Suivez vos stocks en temps réel et gérez les alertes
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-xs text-white/80 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                  ⚠️ {stats.total} alertes actives
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats avec design premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Alertes */}
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-orange-50 to-amber-100/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-orange-900">
              Total Alertes
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg animate-pulse">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              {stats.total}
            </div>
            <p className="text-xs text-orange-600 mt-2 font-medium">
              ⚠️ Nécessite attention
            </p>
          </CardContent>
        </Card>

        {/* Rupture de Stock */}
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-red-50 to-rose-100/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-red-900">
              Rupture de Stock
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg animate-pulse">
              <Package className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
              {stats.outOfStock}
            </div>
            <p className="text-xs text-red-600 mt-2 font-medium">
              🚨 Action urgente
            </p>
          </CardContent>
        </Card>

        {/* Stock Critique */}
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-orange-50 to-orange-100/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-orange-900">
              Stock Critique
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              {stats.critical}
            </div>
            <p className="text-xs text-orange-600 mt-2 font-medium">
              📉 Niveau bas
            </p>
          </CardContent>
        </Card>

        {/* Alerte Stock Bas */}
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-yellow-50 to-amber-100/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-yellow-900">
              Alerte Stock Bas
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-amber-500 bg-clip-text text-transparent">
              {stats.warning}
            </div>
            <p className="text-xs text-yellow-600 mt-2 font-medium">
              ⚡ Surveiller
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Valeur du Stock */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Valeur du Stock</h2>
            <p className="text-sm text-gray-600">Analyse financière de votre inventaire</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Valeur Totale (Prix de Vente) */}
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-100/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-green-900">
                Valeur Totale
              </CardTitle>
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                {(stockValue.totalSaleValue || 0).toFixed(2)} DH
              </div>
              <p className="text-xs text-green-600 mt-2 font-medium">
                💰 Prix de vente
              </p>
            </CardContent>
          </Card>

          {/* Valeur d'Achat */}
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-cyan-100/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-blue-900">
                Coût d'Achat
              </CardTitle>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                {(stockValue.totalCostValue || 0).toFixed(2)} DH
              </div>
              <p className="text-xs text-blue-600 mt-2 font-medium">
                📊 Investissement
              </p>
            </CardContent>
          </Card>

          {/* Marge Potentielle */}
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-violet-100/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-purple-900">
                Marge Potentielle
              </CardTitle>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-500 bg-clip-text text-transparent">
                {(stockValue.potentialMargin || 0).toFixed(2)} DH
              </div>
              <p className="text-xs text-purple-600 mt-2 font-medium">
                📈 Bénéfice potentiel
              </p>
            </CardContent>
          </Card>

          {/* Pourcentage de Marge */}
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-indigo-50 to-blue-100/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-indigo-900">
                Taux de Marge
              </CardTitle>
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg">
                <Percent className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                {(stockValue.marginPercentage || 0).toFixed(1)}%
              </div>
              <p className="text-xs text-indigo-600 mt-2 font-medium">
                📊 Rentabilité
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Résumé de la valeur du stock */}
        <Card className="bg-gradient-to-r from-slate-50 to-gray-100 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stockValue.totalQuantity || 0}
                </div>
                <p className="text-sm text-gray-600">Articles en stock</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stockValue.totalProducts || 0}
                </div>
                <p className="text-sm text-gray-600">Produits différents</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stockValue.productsInStock || 0}
                </div>
                <p className="text-sm text-gray-600">Produits disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertes de stock */}
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Alertes de Stock</CardTitle>
            <Badge variant="secondary">{alerts.length}</Badge>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucune alerte de stock
              </p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{alert.name}</h4>
                        <p className="text-sm text-gray-500">
                          {alert.sku} • {alert.category}
                        </p>
                      </div>
                      {getStatusBadge(alert.status)}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Stock actuel</span>
                        <span
                          className={`font-semibold ${
                            alert.stock === 0
                              ? 'text-red-600'
                              : alert.stock < alert.minStock * 0.5
                              ? 'text-orange-600'
                              : 'text-yellow-600'
                          }`}
                        >
                          {alert.stock} unités
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            alert.percentage === 0
                              ? 'bg-red-500'
                              : alert.percentage < 50
                              ? 'bg-orange-500'
                              : 'bg-yellow-500'
                          }`}
                          style={{
                            width: `${Math.min(alert.percentage, 100)}%`,
                          }}
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Min: {alert.minStock} unités
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAddMovement(alert.id, alert.name)}
                            className="gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Ajouter
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mouvements récents */}
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Mouvements Récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {movements.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucun mouvement récent
              </p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {movements.map((movement) => (
                  <div
                    key={movement.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          movement.type === 'IN'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {movement.type === 'IN' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{movement.product.name}</p>
                        <p className="text-xs text-gray-500">
                          {movement.reason}
                        </p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(movement.createdAt), 'dd MMM yyyy HH:mm', {
                            locale: fr,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          movement.type === 'IN' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {movement.type === 'IN' ? '+' : '-'}
                        {movement.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stock Movement Dialog */}
      <StockMovementDialog
        open={movementDialogOpen}
        onOpenChange={setMovementDialogOpen}
        product={selectedProduct}
        onSuccess={handleMovementSuccess}
      />
    </div>
  )
}

