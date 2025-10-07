'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeft, Edit, Trash2, Plus, DollarSign, CreditCard, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'

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
  transactions: Transaction[]
  checks: Check[]
  _count: {
    transactions: number
    checks: number
  }
}

interface Transaction {
  id: string
  transactionNumber: string
  type: 'PURCHASE' | 'PAYMENT' | 'ADJUSTMENT'
  amount: number
  description: string
  date: string
  status: string
  paymentMethod: string | null
  notes: string | null
}

interface Check {
  id: string
  checkNumber: string
  amount: number
  issueDate: string
  dueDate: string
  cashDate: string | null
  status: 'ISSUED' | 'CASHED' | 'CANCELLED' | 'BOUNCED'
  bankName: string
  accountNumber: string | null
}

export default function SupplierDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'transactions' | 'checks' | 'info'>('transactions')
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    notes: '',
  })

  useEffect(() => {
    fetchSupplier()
  }, [params.id])

  const fetchSupplier = async () => {
    try {
      const response = await fetch(`/api/suppliers/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setSupplier(data)
        setFormData({
          name: data.name,
          company: data.company || '',
          email: data.email || '',
          phone: data.phone,
          address: data.address || '',
          taxId: data.taxId || '',
          notes: data.notes || '',
        })
      } else {
        toast.error('Fournisseur non trouvé')
        router.push('/dashboard/suppliers')
      }
    } catch (error) {
      console.error('Error fetching supplier:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/suppliers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: params.id,
          ...formData,
        }),
      })

      if (response.ok) {
        toast.success('Fournisseur mis à jour avec succès')
        setEditMode(false)
        fetchSupplier()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Error updating supplier:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      return
    }

    try {
      const response = await fetch(`/api/suppliers?id=${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Fournisseur supprimé avec succès')
        router.push('/dashboard/suppliers')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return <Badge className="bg-red-100 text-red-700">🛒 Achat</Badge>
      case 'PAYMENT':
        return <Badge className="bg-green-100 text-green-700">💳 Paiement</Badge>
      case 'ADJUSTMENT':
        return <Badge className="bg-orange-100 text-orange-700">⚙️ Ajustement</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  const getCheckStatusBadge = (status: string) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!supplier) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/dashboard/suppliers">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{supplier.name}</h1>
              {supplier.company && (
                <p className="text-violet-100 text-lg">{supplier.company}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => setEditMode(!editMode)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Achats
              </CardTitle>
              <DollarSign className="w-5 h-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {Number(supplier.totalDebt).toFixed(2)} DH
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Payé
              </CardTitle>
              <CreditCard className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Number(supplier.totalPaid).toFixed(2)} DH
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Solde Actuel
              </CardTitle>
              <DollarSign className="w-5 h-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${Number(supplier.balance) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {Number(supplier.balance).toFixed(2)} DH
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Chèques
              </CardTitle>
              <FileText className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {supplier._count.checks}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Rapides */}
        <div className="flex gap-4 mb-8">
          <Link href="/dashboard/suppliers/transactions/new" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Transaction
            </Button>
          </Link>
        </div>

        {/* Onglets */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`${
                  activeTab === 'transactions'
                    ? 'border-violet-500 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                📋 Transactions ({supplier._count.transactions})
              </button>
              <button
                onClick={() => setActiveTab('checks')}
                className={`${
                  activeTab === 'checks'
                    ? 'border-violet-500 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                📝 Chèques ({supplier._count.checks})
              </button>
              <button
                onClick={() => setActiveTab('info')}
                className={`${
                  activeTab === 'info'
                    ? 'border-violet-500 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                ℹ️ Informations
              </button>
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'transactions' && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        N° Transaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Montant
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {supplier.transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(transaction.date), 'dd MMM yyyy', { locale: fr })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.transactionNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getTransactionTypeBadge(transaction.type)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                          <span className={transaction.type === 'PURCHASE' ? 'text-red-600' : 'text-green-600'}>
                            {transaction.type === 'PURCHASE' ? '+' : '-'}{Number(transaction.amount).toFixed(2)} DH
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {supplier.transactions.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Aucune transaction</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'checks' && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        N° Chèque
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Banque
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date Échéance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {supplier.checks.map((check) => (
                      <tr key={check.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {check.checkNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {check.bankName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {Number(check.amount).toFixed(2)} DH
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(check.dueDate), 'dd MMM yyyy', { locale: fr })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getCheckStatusBadge(check.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            {check.status === 'ISSUED' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch('/api/suppliers/checks', {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          id: check.id,
                                          status: 'CASHED',
                                          cashDate: new Date().toISOString(),
                                        }),
                                      })
                                      if (response.ok) {
                                        toast.success('Chèque marqué comme encaissé')
                                        fetchSupplier()
                                      } else {
                                        toast.error('Erreur lors de la mise à jour')
                                      }
                                    } catch (error) {
                                      toast.error('Erreur lors de la mise à jour')
                                    }
                                  }}
                                  title="Marquer comme encaissé"
                                >
                                  ✅
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    if (confirm('Êtes-vous sûr de vouloir annuler ce chèque ?')) {
                                      try {
                                        const response = await fetch('/api/suppliers/checks', {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            id: check.id,
                                            status: 'CANCELLED',
                                          }),
                                        })
                                        if (response.ok) {
                                          toast.success('Chèque annulé')
                                          fetchSupplier()
                                        } else {
                                          toast.error('Erreur lors de l\'annulation')
                                        }
                                      } catch (error) {
                                        toast.error('Erreur lors de l\'annulation')
                                      }
                                    }
                                  }}
                                  title="Annuler"
                                >
                                  ❌
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch('/api/suppliers/checks', {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          id: check.id,
                                          status: 'BOUNCED',
                                        }),
                                      })
                                      if (response.ok) {
                                        toast.success('Chèque marqué comme rejeté')
                                        fetchSupplier()
                                      } else {
                                        toast.error('Erreur lors de la mise à jour')
                                      }
                                    } catch (error) {
                                      toast.error('Erreur lors de la mise à jour')
                                    }
                                  }}
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
                                onClick={async () => {
                                  if (confirm('Revenir au statut "Émis" ?')) {
                                    try {
                                      const response = await fetch('/api/suppliers/checks', {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          id: check.id,
                                          status: 'ISSUED',
                                          cashDate: null,
                                        }),
                                      })
                                      if (response.ok) {
                                        toast.success('Chèque remis au statut "Émis"')
                                        fetchSupplier()
                                      } else {
                                        toast.error('Erreur lors de la mise à jour')
                                      }
                                    } catch (error) {
                                      toast.error('Erreur lors de la mise à jour')
                                    }
                                  }
                                }}
                                title="Revenir au statut Émis"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                🔄 Réactiver
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {supplier.checks.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Aucun chèque</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'info' && (
          <Card>
            <CardHeader>
              <CardTitle>Informations du Fournisseur</CardTitle>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom <span className="text-red-500">*</span></Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Entreprise</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone <span className="text-red-500">*</span></Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="taxId">Numéro Fiscal (ICE / IF)</Label>
                    <Input
                      id="taxId"
                      name="taxId"
                      value={formData.taxId}
                      onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1">
                      ✅ Enregistrer
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditMode(false)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Nom</p>
                      <p className="font-medium">{supplier.name}</p>
                    </div>
                    {supplier.company && (
                      <div>
                        <p className="text-sm text-gray-600">Entreprise</p>
                        <p className="font-medium">{supplier.company}</p>
                      </div>
                    )}
                    {supplier.email && (
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{supplier.email}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="font-medium">{supplier.phone}</p>
                    </div>
                    {supplier.address && (
                      <div>
                        <p className="text-sm text-gray-600">Adresse</p>
                        <p className="font-medium">{supplier.address}</p>
                      </div>
                    )}
                    {supplier.taxId && (
                      <div>
                        <p className="text-sm text-gray-600">Numéro Fiscal</p>
                        <p className="font-medium">{supplier.taxId}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Date de création</p>
                      <p className="font-medium">
                        {format(new Date(supplier.createdAt), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>

                  {supplier.notes && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">Notes</p>
                      <p className="text-sm">{supplier.notes}</p>
                    </div>
                  )}

                  <Button onClick={() => setEditMode(true)} className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier les Informations
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

