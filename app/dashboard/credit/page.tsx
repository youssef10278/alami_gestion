'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CreditCard, Users, AlertTriangle, TrendingUp, Plus, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import PaymentDialog from '@/components/credit/PaymentDialog'

import { safeToFixed, safeNumber } from '@/lib/utils'
interface CreditSummary {
  totalCustomers: number
  customersWithCredit: number
  blockedCustomers: number
  highCreditCustomers: number
  totalCreditLimit: number
  totalCreditUsed: number
  totalCreditAvailable: number
  recentPayments: Payment[]
}

interface Payment {
  id: string
  amount: number
  paymentMethod: string
  createdAt: string
  customer: {
    name: string
    company: string | null
  }
}

interface Customer {
  id: string
  name: string
  company: string | null
  creditLimit: number
  creditUsed: number
  isBlocked: boolean
}

export default function CreditPage() {
  const [summary, setSummary] = useState<CreditSummary | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [summaryRes, customersRes] = await Promise.all([
        fetch('/api/credit/summary'),
        fetch('/api/customers?limit=100'),
      ])

      const summaryData = await summaryRes.json()
      const customersData = await customersRes.json()

      setSummary(summaryData)
      setCustomers(customersData.customers || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    fetchData()
    setPaymentDialogOpen(false)
    setSelectedCustomer(null)
  }

  const handleAddPayment = (customer: Customer) => {
    setSelectedCustomer(customer)
    setPaymentDialogOpen(true)
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

  const customersWithDebt = customers.filter((c) => safeNumber(c.creditUsed) > 0)

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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-cyan-400/20 backdrop-blur-3xl"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-1 drop-shadow-lg">
                Gestion du Crédit
              </h1>
              <p className="text-indigo-100 text-sm">
                Suivez et gérez les crédits clients en temps réel
              </p>
              {summary && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="text-xs text-white/80 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                    💳 {safeToFixed(summary.totalCreditUsed, 0)} DH utilisés
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats avec design premium */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Crédit Total Utilisé */}
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-orange-50 to-amber-100/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-orange-900">
                Crédit Total Utilisé
              </CardTitle>
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                {safeToFixed(summary.totalCreditUsed, 0)} DH
              </div>
              <p className="text-xs text-orange-600 mt-2 font-medium">
                💳 sur {safeToFixed(summary.totalCreditLimit, 0)} DH
              </p>
            </CardContent>
          </Card>

          {/* Clients avec Crédit */}
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-indigo-100/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-blue-900">
                Clients avec Crédit
              </CardTitle>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                {summary.customersWithCredit}
              </div>
              <p className="text-xs text-blue-600 mt-2 font-medium">
                👥 sur {summary.totalCustomers} clients
              </p>
            </CardContent>
          </Card>

          {/* Crédit Disponible */}
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-100/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-green-900">
                Crédit Disponible
              </CardTitle>
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                {safeToFixed(summary.totalCreditAvailable, 0)} DH
              </div>
              <p className="text-xs text-green-600 mt-2 font-medium">
                ✅ Disponible
              </p>
            </CardContent>
          </Card>

          {/* Alertes */}
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-red-50 to-rose-100/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-red-900">
                Alertes
              </CardTitle>
              <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg animate-pulse">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
                {summary.blockedCustomers + summary.highCreditCustomers}
              </div>
              <p className="text-xs text-red-600 mt-2 font-medium">
                🚨 {summary.blockedCustomers} bloqués, {summary.highCreditCustomers} à risque
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clients avec crédit */}
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Clients avec Crédit</CardTitle>
            <Badge variant="secondary">{customersWithDebt.length}</Badge>
          </CardHeader>
          <CardContent>
            {customersWithDebt.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucun client avec crédit
              </p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {customersWithDebt.map((customer) => {
                  const creditPercentage =
                    safeNumber(customer.creditLimit) > 0
                      ? (safeNumber(customer.creditUsed) / safeNumber(customer.creditLimit)) * 100
                      : 0

                  return (
                    <div
                      key={customer.id}
                      className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{customer.name}</h4>
                          {customer.company && (
                            <p className="text-sm text-gray-500">{customer.company}</p>
                          )}
                        </div>
                        {customer.isBlocked && (
                          <Badge variant="destructive">Bloqué</Badge>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Crédit utilisé</span>
                          <span className="font-semibold text-orange-600">
                            {safeToFixed(customer.creditUsed, 2)} DH
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              creditPercentage > 80
                                ? 'bg-red-500'
                                : creditPercentage > 50
                                ? 'bg-orange-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(creditPercentage, 100)}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            Limite: {safeToFixed(customer.creditLimit, 2)} DH
                          </span>
                          <span className="text-xs font-medium text-gray-600">
                            {safeToFixed(creditPercentage, 0)}% utilisé
                          </span>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleAddPayment(customer)}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          Encaisser le crédit
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paiements récents */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Paiements Récents</CardTitle>
          </CardHeader>
          <CardContent>
            {summary && summary.recentPayments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucun paiement récent
              </p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {summary?.recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{payment.customer.name}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(payment.createdAt), 'dd MMM yyyy HH:mm', {
                          locale: fr,
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        +{safeToFixed(payment.amount, 2)} DH
                      </p>
                      <p className="text-xs text-gray-500">
                        {getPaymentMethodLabel(payment.paymentMethod)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        customer={selectedCustomer}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}

