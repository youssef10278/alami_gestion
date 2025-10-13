'use client'

import { useState } from 'react'
import { FileText, Download, Eye, Trash2, Calendar, User, Euro, Edit } from 'lucide-react'
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
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  return (
    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white">
      {/* Badge de type */}
      <div className="absolute top-4 right-4 z-10">
        <Badge className={getTypeColor(invoice.type)}>
          {getTypeLabel(invoice.type)}
        </Badge>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {invoice.invoiceNumber}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {invoice.customerName}
                {invoice.customer?.company && ` (${invoice.customer.company})`}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informations principales */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Créée le {formatDate(invoice.createdAt)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="w-4 h-4" />
            <span>Par {invoice.creator.name}</span>
          </div>

          {invoice.originalInvoice && (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <FileText className="w-4 h-4" />
              <span>Réf: {invoice.originalInvoice.invoiceNumber}</span>
            </div>
          )}
        </div>

        {/* Montant */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-100">
          <div className="flex items-center gap-2">
            <Euro className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-700">Total</span>
          </div>
          <span className="text-2xl font-bold text-blue-600">
            {formatAmount(invoice.total)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleViewPDF}
            variant="outline"
            size="sm"
            className="flex-1 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
          >
            <Eye className="w-4 h-4 mr-2" />
            Voir
          </Button>

          <Button
            onClick={() => window.location.href = `/dashboard/invoices/${invoice.id}/edit`}
            variant="outline"
            size="sm"
            className="flex-1 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all duration-300"
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>

          <Button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            size="sm"
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? 'Téléchargement...' : 'Télécharger'}
          </Button>

          <Button
            onClick={() => onDelete(invoice.id, invoice.invoiceNumber)}
            variant="destructive"
            size="sm"
            className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Informations supplémentaires */}
        {invoice._count.creditNotes > 0 && (
          <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
            {invoice._count.creditNotes} facture(s) d'avoir associée(s)
          </div>
        )}
      </CardContent>
    </Card>
  )
}