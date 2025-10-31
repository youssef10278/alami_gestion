'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Users, CreditCard, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { safeToFixed } from '@/lib/utils'
import CustomerDialog from '@/components/customers/CustomerDialog'
import CustomerCard from '@/components/customers/CustomerCard'

interface Customer {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  address: string | null
  ice: string | null
  creditLimit: number
  creditUsed: number
  isBlocked: boolean
  _count: {
    sales: number
  }
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    fetchCustomers()
  }, [search])

  const fetchCustomers = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)

      const response = await fetch(`/api/customers?${params}`)
      const data = await response.json()
      setCustomers(data.customers || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomerSaved = () => {
    fetchCustomers()
    setDialogOpen(false)
    setEditingCustomer(null)
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setDialogOpen(true)
  }

  const handleDelete = async (customerId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchCustomers()
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('Erreur lors de la suppression du client')
    }
  }

  const totalCredit = customers.reduce((sum, c) => sum + Number(c.creditUsed), 0)
  const blockedCount = customers.filter(c => c.isBlocked).length

  return (
    <div className="space-y-6">
      {/* Header Premium - Responsive */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 p-4 sm:p-6 lg:p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-teal-400/20 backdrop-blur-3xl"></div>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 drop-shadow-lg">
                Gestion des Clients
              </h1>
              <p className="text-green-100 text-xs sm:text-sm">
                Gérez vos clients et leur crédit en temps réel
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-xs text-white/80 bg-white/10 px-2 sm:px-3 py-1 rounded-lg backdrop-blur-sm">
                  👥 {customers.length} clients actifs
                </div>
              </div>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingCustomer(null)
              setDialogOpen(true)
            }}
            variant="customers"
            className="gap-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-4 sm:px-6 py-3 sm:py-6 text-sm sm:text-base font-semibold w-full sm:w-auto"
            size="lg"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Nouveau Client</span>
            <span className="xs:hidden">Nouveau</span>
          </Button>
        </div>
      </div>

      {/* Stats avec design premium - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Clients */}
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-100/50">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-green-500/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-green-900">
              Total Clients
            </CardTitle>
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              {customers.length}
            </div>
            <p className="text-xs text-green-600 mt-2 font-medium">
              👥 Clients actifs
            </p>
          </CardContent>
        </Card>

        {/* Crédit Total */}
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-orange-50 to-amber-100/50">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-orange-500/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-orange-900">
              Crédit Total
            </CardTitle>
            <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              {safeToFixed(totalCredit, 2)} DH
            </div>
            <p className="text-xs text-orange-600 mt-2 font-medium">
              💳 Crédit utilisé
            </p>
          </CardContent>
        </Card>

        {/* Clients Bloqués */}
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-red-50 to-rose-100/50 sm:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-red-500/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-red-900">
              Clients Bloqués
            </CardTitle>
            <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg animate-pulse">
              <Ban className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
              {blockedCount}
            </div>
            <p className="text-xs text-red-600 mt-2 font-medium">
              🚫 Accès restreint
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search avec design moderne - Responsive */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="relative group">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-green-500 transition-colors" />
            <Input
              placeholder="🔍 Rechercher par nom, entreprise, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 sm:pl-12 h-10 sm:h-12 border-2 border-gray-200 focus:border-green-500 rounded-xl shadow-sm hover:shadow-md transition-all text-sm sm:text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid - Responsive */}
      {loading ? (
        <div className="text-center py-8 sm:py-12">
          <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">Chargement...</p>
        </div>
      ) : customers.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-8 sm:py-12 text-center px-4">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-sm sm:text-base mb-4">
              {search ? 'Aucun client trouvé pour cette recherche' : 'Aucun client trouvé'}
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              variant="outline"
              className="w-full sm:w-auto"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter votre premier client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Customer Dialog */}
      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editingCustomer}
        onSaved={handleCustomerSaved}
      />
    </div>
  )
}

