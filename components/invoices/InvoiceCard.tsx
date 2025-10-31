'use client'

import { useState } from 'react'
import { FileText, Download, Eye, Trash2, Calendar, User, Banknote, Edit } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

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

interface InvoiceCardProps {
  invoice: Invoice
  onDelete: (invoiceId: string, invoiceNumber: string) => void
}

export default function InvoiceCard({ invoice, onDelete }: InvoiceCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true)
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${invoice.invoiceNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('PDF téléchargé avec succès')
      } else {
        toast.error('Erreur lors du téléchargement du PDF')
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast.error('Erreur lors du téléchargement du PDF')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleViewPDF = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        window.open(url, '_blank')
        toast.success('PDF ouvert dans un nouvel onglet')
      } else {
        toast.error('Erreur lors de l\'ouverture du PDF')
      }
    } catch (error) {
      console.error('Error viewing PDF:', error)
      toast.error('Erreur lors de l\'ouverture du PDF')
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'CREDIT_NOTE' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
  }

  const getTypeLabel = (type: string) => {
    return type === 'CREDIT_NOTE' ? 'Facture d\'Avoir' : 'Facture'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const formatAmount = (amount: number) => {
    return `${amount.toLocaleString('fr-FR')} DH`
  }

  return (
    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white h-full flex flex-col">
      {/* Badge de type - Responsive */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
        <Badge className={`${getTypeColor(invoice.type)} text-xs sm:text-sm`}>
          <span className="hidden sm:inline">{getTypeLabel(invoice.type)}</span>
          <span className="sm:hidden">{invoice.type === 'CREDIT_NOTE' ? 'Avoir' : 'Facture'}</span>
        </Badge>
      </div>

      <CardHeader className="pb-3 p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <CardTitle className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {invoice.invoiceNumber}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600 truncate">
                {invoice.customerName}
                {invoice.customer?.company && (
                  <span className="hidden sm:inline"> ({invoice.customer.company})</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 flex-1 flex flex-col">
        {/* Informations principales - Responsive */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">Créée le </span>{formatDate(invoice.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">Par </span>{invoice.creator.name}
            </span>
          </div>

          {invoice.originalInvoice && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-orange-600">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">Réf: {invoice.originalInvoice.invoiceNumber}</span>
            </div>
          )}
        </div>

        {/* Montant - Responsive */}
        <div className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-100">
          <div className="flex items-center gap-1 sm:gap-2">
            <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <span className="font-semibold text-gray-700 text-sm sm:text-base">Total</span>
          </div>
          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
            {formatAmount(invoice.total)}
          </span>
        </div>

        {/* Actions - Responsive */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          {/* Première ligne */}
          <Button
            onClick={handleViewPDF}
            variant="outline"
            size="sm"
            className="w-full border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 h-8 sm:h-9 text-xs sm:text-sm"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Voir
          </Button>

          <Button
            onClick={() => window.location.href = `/dashboard/invoices/${invoice.id}/edit`}
            variant="outline"
            size="sm"
            className="w-full border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all duration-300 h-8 sm:h-9 text-xs sm:text-sm"
          >
            <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden xs:inline">Modifier</span>
            <span className="xs:hidden">Edit</span>
          </Button>

          {/* Deuxième ligne */}
          <Button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            size="sm"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300 h-8 sm:h-9 text-xs sm:text-sm"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">{isDownloading ? 'Téléch...' : 'Télécharger'}</span>
            <span className="sm:hidden">{isDownloading ? '...' : 'PDF'}</span>
          </Button>

          <Button
            onClick={() => onDelete(invoice.id, invoice.invoiceNumber)}
            variant="destructive"
            size="sm"
            className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-md hover:shadow-lg transition-all duration-300 h-8 sm:h-9 text-xs sm:text-sm"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden xs:inline">Supprimer</span>
            <span className="xs:hidden">Del</span>
          </Button>
        </div>

        {/* Informations supplémentaires - Responsive */}
        {invoice._count.creditNotes > 0 && (
          <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
            <span className="hidden sm:inline">{invoice._count.creditNotes} facture(s) d'avoir associée(s)</span>
            <span className="sm:hidden">{invoice._count.creditNotes} avoir</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}