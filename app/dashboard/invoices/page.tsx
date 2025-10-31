'use client'

import { useState, useEffect } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Plus, Search, FileText, Receipt, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useDebounce } from '@/hooks/useDebounce'
import { toast } from 'sonner'
import Link from 'next/link'
import InvoiceCard from '@/components/invoices/InvoiceCard'

interface Invoice {
  id: string
  invoiceNumber: string
  type: 'INVOICE' | 'CREDIT_NOTE'
  customerName: string
  customer?: {
    id: string
    name: string
    company?: string
    email?: string
  }
  total: number
  createdAt: string
  creator: {
    id: string
    name: string
  }
  originalInvoice?: {
    id: string
    invoiceNumber: string
  }
  _count: {
    creditNotes: number
  }
}

interface InvoiceStats {
  overview: {
    totalInvoices: number
    totalCreditNotes: number
    totalInvoiceAmount: number
    totalCreditAmount: number
    netAmount: number
  }
}

export default function InvoicesPage() {
  usePageTitle('Factures')

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState<InvoiceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const debouncedSearch = useDebounce(search, 300)

  // Charger les factures
  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: debouncedSearch,
      })

      if (typeFilter !== 'all') {
        params.append('type', typeFilter)
      }

      const response = await fetch(`/api/invoices?${params}`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices)
        setTotalPages(data.pagination.pages)
      } else {
        toast.error('Erreur lors du chargement des factures')
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast.error('Erreur lors du chargement des factures')
    } finally {
      setLoading(false)
    }
  }

  // Charger les statistiques
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/invoices/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // Supprimer une facture
  const handleDelete = async (invoiceId: string, invoiceNumber: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la facture ${invoiceNumber} ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Facture supprimée avec succès')
        fetchInvoices()
        fetchStats()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting invoice:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [debouncedSearch, typeFilter, page])

  useEffect(() => {
    fetchStats()
  }, [])



  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header avec gradient - Responsive */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7" />
              📄 <span className="hidden xs:inline">Gestion des </span>Factures
            </h1>
            <p className="text-blue-100 mt-1 text-sm sm:text-base">
              Créez et gérez vos factures et factures d'avoir
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Link href="/dashboard/invoices/new" className="w-full sm:w-auto">
              <Button variant="invoices" className="text-white w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Nouvelle </span>Facture
              </Button>
            </Link>
            <Link href="/dashboard/invoices/credit-note/new" className="w-full sm:w-auto">
              <Button variant="invoices-outline" className="border-white text-white hover:bg-white w-full sm:w-auto">
                <Receipt className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Facture d'</span>Avoir
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Statistiques - Responsive */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="glass">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">
                    <span className="hidden sm:inline">Total </span>Factures
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">{stats.overview.totalInvoices}</p>
                </div>
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">
                    <span className="hidden sm:inline">Factures d'</span>Avoir
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">{stats.overview.totalCreditNotes}</p>
                </div>
                <Receipt className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">
                    <span className="hidden sm:inline">Montant </span>Total
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                    {stats.overview.totalInvoiceAmount.toLocaleString('fr-FR')} DH
                  </p>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-xs sm:text-sm">DH</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">
                    <span className="hidden sm:inline">Montant </span>Net
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">
                    {stats.overview.netAmount.toLocaleString('fr-FR')} DH
                  </p>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-xs sm:text-sm">DH</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres et recherche - Responsive */}
      <Card className="glass">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par numéro, client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48 h-10 sm:h-11 text-sm sm:text-base">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type de facture" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="INVOICE">Factures</SelectItem>
                <SelectItem value="CREDIT_NOTE">Factures d'avoir</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des factures - Responsive */}
      <Card className="glass">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Liste des Factures</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">Chargement...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">Aucune facture trouvée</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-2">
                Les factures créées apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {invoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Pagination - Responsive */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mt-6 sm:mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="w-full sm:w-auto"
              >
                Précédent
              </Button>
              <span className="flex items-center px-4 text-sm sm:text-base text-gray-600">
                Page {page} sur {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="w-full sm:w-auto"
              >
                Suivant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
