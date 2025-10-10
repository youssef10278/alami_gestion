'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CreditCard,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react'
import { safeToFixed } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default function DashboardStatsCards() {
  const {
    totalProducts,
    totalCustomers,
    totalSales,
    completedSales,
    totalRevenue,
    totalPaid,
    creditUsed,
    lowStockProducts,
    averageOrderValue,
    paymentRate,
    pendingSales,
    recentSales,
    loading,
    error,
    refreshStats
  } = useDashboardStats()

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border border-[hsl(var(--border))] shadow-lg animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-gray-200 rounded mb-2"></div>
              <div className="h-1 w-full bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">Erreur de chargement</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshStats}
              className="mt-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Ventes */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalSales}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  {completedSales} complétées
                  {pendingSales > 0 && (
                    <>
                      <Clock className="w-3 h-3 text-orange-500 ml-2" />
                      {pendingSales} en attente
                    </>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Chiffre d'Affaires */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {safeToFixed(totalRevenue)} DH
                </div>
                <p className="text-xs text-muted-foreground">
                  Moy: {safeToFixed(averageOrderValue)} DH/vente
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Montant Payé */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant Payé</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600">
                  {safeToFixed(totalPaid)} DH
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {safeToFixed(paymentRate)}% encaissé
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Crédit Utilisé */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crédit Utilisé</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-600">
                  {safeToFixed(creditUsed)} DH
                </div>
                <p className="text-xs text-muted-foreground">
                  À recouvrer
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistiques secondaires */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Produits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <div className="flex items-center gap-2 text-xs">
                  {lowStockProducts > 0 ? (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {lowStockProducts} stock faible
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Stock OK
                    </Badge>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Clients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  Clients enregistrés
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bouton de rafraîchissement */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Données</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshStats}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualiser
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Mise à jour automatique
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ventes récentes */}
      {recentSales && recentSales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ventes Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recentSales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{sale.saleNumber}</span>
                        <Badge variant={sale.status === 'COMPLETED' ? 'default' : 'secondary'}>
                          {sale.status === 'COMPLETED' ? 'Complétée' : 'En attente'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {sale.customer ? sale.customer.name : 'Client de passage'} • 
                        {sale.seller.name} • 
                        {new Date(sale.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {safeToFixed(sale.totalAmount)} DH
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {sale.itemsCount} article{sale.itemsCount > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
