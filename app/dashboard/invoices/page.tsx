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
    <div className="space-y-6">
      {/* Header avec gradient */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-7 h-7" />
              📄 Gestion des Factures
            </h1>
            <p className="text-blue-100 mt-1">
              Créez et gérez vos factures et factures d'avoir
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/invoices/new">
              <Button variant="invoices" className="text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Facture
              </Button>
            </Link>
            <Link href="/dashboard/invoices/credit-note/new">
              <Button variant="invoices-outline" className="border-white text-white hover:bg-white">
                <Receipt className="w-4 h-4 mr-2" />
                Facture d'Avoir
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Factures</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.overview.totalInvoices}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Factures d'Avoir</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overview.totalCreditNotes}</p>
                </div>
                <Receipt className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Montant Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.overview.totalInvoiceAmount.toLocaleString('fr-FR')} €
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">€</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Montant Net</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.overview.netAmount.toLocaleString('fr-FR')} €
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">€</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres et recherche */}
      <Card className="glass">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par numéro, client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
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

      {/* Liste des factures */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Liste des Factures</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Chargement...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune facture trouvée</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {invoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <span className="flex items-center px-4">
                Page {page} sur {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
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
