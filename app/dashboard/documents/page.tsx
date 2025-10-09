'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { FileText, Download, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Document {
  id: string
  documentNumber: string
  type: 'INVOICE' | 'QUOTE' | 'CREDIT_NOTE' | 'DELIVERY_NOTE'
  createdAt: string
  totalAmount: number
  status: string
  customer: {
    name: string
    company?: string | null
  } | null
  saleNumber?: string // Pour les bons de livraison
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    fetchDocuments()
  }, [filter])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const allDocuments: Document[] = []

      // Récupérer les factures
      if (filter === 'all' || filter === 'INVOICE') {
        try {
          const invoicesRes = await fetch('/api/invoices?limit=100')
          if (invoicesRes.ok) {
            const invoicesData = await invoicesRes.json()
            if (invoicesData.invoices && Array.isArray(invoicesData.invoices)) {
              const invoices = invoicesData.invoices.map((inv: any) => ({
                id: inv.id,
                documentNumber: inv.invoiceNumber,
                type: 'INVOICE' as const,
                createdAt: inv.createdAt,
                totalAmount: inv.totalAmount,
                status: inv.status,
                customer: inv.customer
              }))
              allDocuments.push(...invoices)
            }
          }
        } catch (error) {
          console.error('Error fetching invoices:', error)
        }
      }

      // Récupérer les devis
      if (filter === 'all' || filter === 'QUOTE') {
        try {
          const quotesRes = await fetch('/api/quotes?limit=100')
          if (quotesRes.ok) {
            const quotesData = await quotesRes.json()
            // L'API /api/quotes retourne directement un tableau, pas un objet avec .quotes
            const quotesArray = Array.isArray(quotesData) ? quotesData : (quotesData.quotes || [])
            if (quotesArray.length > 0) {
              const quotes = quotesArray.map((quote: any) => ({
                id: quote.id,
                documentNumber: quote.quoteNumber,
                type: 'QUOTE' as const,
                createdAt: quote.createdAt,
                totalAmount: quote.totalAmount,
                status: quote.status,
                customer: quote.customer
              }))
              allDocuments.push(...quotes)
            }
          }
        } catch (error) {
          console.error('Error fetching quotes:', error)
        }
      }

      // Récupérer les bons de livraison
      if (filter === 'all' || filter === 'DELIVERY_NOTE') {
        try {
          const deliveryNotesRes = await fetch('/api/delivery-notes?limit=100')
          if (deliveryNotesRes.ok) {
            const deliveryNotesData = await deliveryNotesRes.json()
            if (deliveryNotesData.deliveryNotes && Array.isArray(deliveryNotesData.deliveryNotes)) {
              const deliveryNotes = deliveryNotesData.deliveryNotes.map((dn: any) => ({
                id: dn.id,
                documentNumber: dn.documentNumber,
                type: 'DELIVERY_NOTE' as const,
                createdAt: dn.createdAt,
                totalAmount: dn.totalAmount,
                status: dn.status,
                customer: dn.customer,
                saleNumber: dn.saleNumber
              }))
              allDocuments.push(...deliveryNotes)
            }
          }
        } catch (error) {
          console.error('Error fetching delivery notes:', error)
        }
      }

      // Trier par date décroissante
      allDocuments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      setDocuments(allDocuments)
    } catch (error) {
      console.error('Error fetching documents:', error)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewPDF = async (doc: Document) => {
    try {
      let url = ''
      if (doc.type === 'INVOICE') {
        url = `/api/invoices/${doc.id}/pdf`
      } else if (doc.type === 'QUOTE') {
        url = `/api/quotes/${doc.id}/pdf`
      } else if (doc.type === 'DELIVERY_NOTE') {
        url = `/api/sales/${doc.id}/delivery-note`
      }

      if (url) {
        // Récupérer le PDF et créer un blob URL pour l'aperçu
        const response = await fetch(url)
        const blob = await response.blob()
        const blobUrl = window.URL.createObjectURL(blob)
        setPreviewUrl(blobUrl)
        setPreviewDoc(doc)
      }
    } catch (error) {
      console.error('Error viewing PDF:', error)
    }
  }

  const handleDownloadPDF = async (doc: Document) => {
    try {
      let url = ''
      if (doc.type === 'INVOICE') {
        url = `/api/invoices/${doc.id}/pdf`
      } else if (doc.type === 'QUOTE') {
        url = `/api/quotes/${doc.id}/pdf`
      } else if (doc.type === 'DELIVERY_NOTE') {
        url = `/api/sales/${doc.id}/delivery-note`
      }

      if (url) {
        const response = await fetch(url)
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = `${doc.documentNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(downloadUrl)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  const closePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl('')
    setPreviewDoc(null)
  }

  const getDocumentTypeBadge = (type: string) => {
    switch (type) {
      case 'INVOICE':
        return <Badge className="bg-blue-500">Facture</Badge>
      case 'QUOTE':
        return <Badge className="bg-purple-500">Devis</Badge>
      case 'CREDIT_NOTE':
        return <Badge className="bg-orange-500">Facture d'avoir</Badge>
      case 'DELIVERY_NOTE':
        return <Badge className="bg-green-500">Bon de livraison</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  const stats = {
    total: documents.length,
    invoices: documents.filter((d) => d.type === 'INVOICE').length,
    quotes: documents.filter((d) => d.type === 'QUOTE').length,
    creditNotes: documents.filter((d) => d.type === 'CREDIT_NOTE').length,
    deliveryNotes: documents.filter((d) => d.type === 'DELIVERY_NOTE').length,
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20 backdrop-blur-3xl"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-1 drop-shadow-lg">
                Documents Commerciaux
              </h1>
              <p className="text-violet-100 text-sm">
                Gérez vos factures, devis et bons de livraison
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-xs text-white/80 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                  📄 {stats.total} documents
                </div>
              </div>
            </div>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[220px] bg-white/20 backdrop-blur-sm border-white/30 text-white h-12 rounded-xl shadow-lg hover:bg-white/30 transition-all">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">📁 Tous les documents</SelectItem>
              <SelectItem value="INVOICE">📄 Factures</SelectItem>
              <SelectItem value="QUOTE">📋 Devis</SelectItem>
              <SelectItem value="CREDIT_NOTE">📝 Factures d'avoir</SelectItem>
              <SelectItem value="DELIVERY_NOTE">📦 Bons de livraison</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats avec design premium */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Documents */}
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-violet-50 to-purple-100/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-violet-900">
              Total Documents
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
              {stats.total}
            </div>
            <p className="text-xs text-violet-600 mt-2 font-medium">
              📁 Tous types
            </p>
          </CardContent>
        </Card>

        {/* Factures */}
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-indigo-100/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-blue-900">
              Factures
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              {stats.invoices}
            </div>
            <p className="text-xs text-blue-600 mt-2 font-medium">
              📄 Factures émises
            </p>
          </CardContent>
        </Card>

        {/* Devis */}
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-fuchsia-100/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-purple-900">
              Devis
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-xl shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
              {stats.quotes}
            </div>
            <p className="text-xs text-purple-600 mt-2 font-medium">
              📋 Devis créés
            </p>
          </CardContent>
        </Card>

        {/* Bons de livraison */}
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-100/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-green-900">
              Bons de livraison
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              {stats.deliveryNotes}
            </div>
            <p className="text-xs text-green-600 mt-2 font-medium">
              📦 Bons émis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des documents */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Liste des Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun document trouvé</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      N° Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {doc.documentNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getDocumentTypeBadge(doc.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div>
                          <p className="font-medium">{doc.customer?.name || 'Client de passage'}</p>
                          {doc.customer?.company && (
                            <p className="text-gray-500 text-xs">
                              {doc.customer.company}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                        {Number(doc.totalAmount).toFixed(2)} DH
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(doc.createdAt), 'dd MMM yyyy', {
                          locale: fr,
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewPDF(doc)}
                            title="Voir le PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownloadPDF(doc)}
                            title="Télécharger le PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal d'aperçu PDF */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <div
            className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header du modal */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-violet-600 to-purple-600 text-white p-4 flex items-center justify-between z-10 shadow-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6" />
                <div>
                  <h3 className="font-bold text-lg">{previewDoc?.documentNumber}</h3>
                  <p className="text-sm text-violet-100">
                    {previewDoc?.customer?.name || 'Client de passage'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => previewDoc && handleDownloadPDF(previewDoc)}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={closePreview}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* Viewer PDF */}
            <iframe
              src={previewUrl}
              className="w-full h-full pt-20"
              title="Aperçu du document"
            />
          </div>
        </div>
      )}
    </div>
  )
}

