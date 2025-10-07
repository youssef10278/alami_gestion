'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Edit, Trash2, Download, FileText, Receipt, Eye, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface InvoiceItem {
  id: string
  productName: string
  productSku?: string
  description?: string
  quantity: number
  unitPrice: number
  discountAmount: number
  total: number
  product?: {
    id: string
    name: string
    sku: string
  }
}

interface Invoice {
  id: string
  invoiceNumber: string
  type: 'INVOICE' | 'CREDIT_NOTE'
  customerName: string
  customerPhone?: string
  customerEmail?: string
  customerAddress?: string
  customerTaxId?: string
  subtotal: number
  discountAmount: number
  taxRate: number
  taxAmount: number
  total: number
  notes?: string
  terms?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  customer?: {
    id: string
    name: string
    company?: string
    email?: string
  }
  originalInvoice?: {
    id: string
    invoiceNumber: string
    customerName: string
    total: number
  }
  creditNotes?: {
    id: string
    invoiceNumber: string
    total: number
    createdAt: string
  }[]
  creator: {
    id: string
    name: string
  }
  items: InvoiceItem[]
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [invoiceId, setInvoiceId] = useState<string>('')

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params
      setInvoiceId(id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice()
    }
  }, [invoiceId])

  const fetchInvoice = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/invoices/${invoiceId}`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
      } else if (response.status === 404) {
        toast.error('Facture non trouvée')
        router.push('/dashboard/invoices')
      } else {
        toast.error('Erreur lors du chargement de la facture')
      }
    } catch (error) {
      console.error('Error fetching invoice:', error)
      toast.error('Erreur lors du chargement de la facture')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!invoice) return

    if (!confirm(`Êtes-vous sûr de vouloir supprimer la facture ${invoice.invoiceNumber} ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Facture supprimée avec succès')
        router.push('/dashboard/invoices')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting invoice:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const getTypeLabel = (type: string) => {
    return type === 'CREDIT_NOTE' ? 'Facture d\'avoir' : 'Facture'
  }

  const getTypeBadgeVariant = (type: string) => {
    return type === 'CREDIT_NOTE' ? 'destructive' : 'default'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Facture non trouvée</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`bg-gradient-to-r ${
        invoice.type === 'CREDIT_NOTE' 
          ? 'from-red-600 via-pink-600 to-purple-600' 
          : 'from-blue-600 via-purple-600 to-indigo-600'
      } rounded-xl p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/invoices">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">
                  {invoice.type === 'CREDIT_NOTE' ? '🧾' : '📄'} {invoice.invoiceNumber}
                </h1>
                <Badge variant={invoice.type === 'CREDIT_NOTE' ? 'secondary' : 'outline'} className="bg-white text-gray-800">
                  {getTypeLabel(invoice.type)}
                </Badge>
              </div>
              <p className={`${invoice.type === 'CREDIT_NOTE' ? 'text-red-100' : 'text-blue-100'} mt-1`}>
                Client: {invoice.customerName}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="border-white text-white hover:bg-white hover:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
            <Button
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations client */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Informations Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-600">Nom:</span>
                  <p className="font-semibold">{invoice.customerName}</p>
                </div>
                {invoice.customerPhone && (
                  <div>
                    <span className="font-medium text-gray-600">Téléphone:</span>
                    <p>{invoice.customerPhone}</p>
                  </div>
                )}
                {invoice.customerEmail && (
                  <div>
                    <span className="font-medium text-gray-600">Email:</span>
                    <p>{invoice.customerEmail}</p>
                  </div>
                )}
                {invoice.customerTaxId && (
                  <div>
                    <span className="font-medium text-gray-600">Numéro Fiscal:</span>
                    <p>{invoice.customerTaxId}</p>
                  </div>
                )}
              </div>
              {invoice.customerAddress && (
                <div>
                  <span className="font-medium text-gray-600">Adresse:</span>
                  <p className="whitespace-pre-line">{invoice.customerAddress}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Articles */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.items.map((item) => (
                  <div key={item.id} className={`border rounded-lg p-4 ${
                    invoice.type === 'CREDIT_NOTE' ? 'bg-red-50 border-red-200' : 'bg-gray-50'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.productName}</h4>
                        {item.productSku && (
                          <p className="text-sm text-gray-500">SKU: {item.productSku}</p>
                        )}
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          invoice.type === 'CREDIT_NOTE' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {invoice.type === 'CREDIT_NOTE' ? '-' : ''}
                          {item.total.toLocaleString('fr-FR')} €
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Quantité:</span> {item.quantity}
                      </div>
                      <div>
                        <span className="font-medium">Prix unitaire:</span> {item.unitPrice.toLocaleString('fr-FR')} €
                      </div>
                      {item.discountAmount > 0 && (
                        <div>
                          <span className="font-medium">Remise:</span> {item.discountAmount.toLocaleString('fr-FR')} €
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes et conditions */}
          {(invoice.notes || invoice.terms) && (
            <Card className="glass">
              <CardHeader>
                <CardTitle>Notes et Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {invoice.notes && (
                  <div>
                    <h4 className="font-medium text-gray-600 mb-2">
                      {invoice.type === 'CREDIT_NOTE' ? 'Motif du remboursement:' : 'Notes:'}
                    </h4>
                    <p className="whitespace-pre-line">{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <h4 className="font-medium text-gray-600 mb-2">Conditions:</h4>
                    <p className="whitespace-pre-line">{invoice.terms}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Totaux */}
          <Card className={`glass ${invoice.type === 'CREDIT_NOTE' ? 'border-red-200' : ''}`}>
            <CardHeader>
              <CardTitle className={invoice.type === 'CREDIT_NOTE' ? 'text-red-700' : ''}>
                {invoice.type === 'CREDIT_NOTE' ? 'Montant du Remboursement' : 'Totaux'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span className={`font-semibold ${invoice.type === 'CREDIT_NOTE' ? 'text-red-600' : ''}`}>
                  {invoice.type === 'CREDIT_NOTE' ? '-' : ''}
                  {invoice.subtotal.toLocaleString('fr-FR')} €
                </span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span>Remise:</span>
                  <span className={`font-semibold ${invoice.type === 'CREDIT_NOTE' ? '' : 'text-red-600'}`}>
                    {invoice.type === 'CREDIT_NOTE' ? '+' : '-'}
                    {invoice.discountAmount.toLocaleString('fr-FR')} €
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>TVA ({invoice.taxRate}%):</span>
                <span className={`font-semibold ${invoice.type === 'CREDIT_NOTE' ? 'text-red-600' : ''}`}>
                  {invoice.type === 'CREDIT_NOTE' ? '-' : ''}
                  {invoice.taxAmount.toLocaleString('fr-FR')} €
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg">
                  <span className="font-bold">
                    {invoice.type === 'CREDIT_NOTE' ? 'Total à rembourser:' : 'Total TTC:'}
                  </span>
                  <span className={`font-bold ${
                    invoice.type === 'CREDIT_NOTE' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {invoice.type === 'CREDIT_NOTE' ? '-' : ''}
                    {invoice.total.toLocaleString('fr-FR')} €
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations de la facture */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium text-gray-600">Créée le:</span>
                <p>{format(new Date(invoice.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Créée par:</span>
                <p>{invoice.creator.name}</p>
              </div>
              {invoice.dueDate && (
                <div>
                  <span className="font-medium text-gray-600">Échéance:</span>
                  <p>{format(new Date(invoice.dueDate), 'dd/MM/yyyy', { locale: fr })}</p>
                </div>
              )}
              {invoice.updatedAt !== invoice.createdAt && (
                <div>
                  <span className="font-medium text-gray-600">Modifiée le:</span>
                  <p>{format(new Date(invoice.updatedAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Facture originale (pour les factures d'avoir) */}
          {invoice.originalInvoice && (
            <Card className="glass border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-700">Facture Originale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium text-gray-600">Numéro:</span>
                  <p className="font-semibold">{invoice.originalInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Client:</span>
                  <p>{invoice.originalInvoice.customerName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Montant:</span>
                  <p className="font-semibold text-green-600">
                    {invoice.originalInvoice.total.toLocaleString('fr-FR')} €
                  </p>
                </div>
                <Link href={`/dashboard/invoices/${invoice.originalInvoice.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Voir la facture
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Factures d'avoir (pour les factures normales) */}
          {invoice.type === 'INVOICE' && invoice.creditNotes && invoice.creditNotes.length > 0 && (
            <Card className="glass border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700">Factures d'Avoir</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {invoice.creditNotes.map((creditNote) => (
                  <div key={creditNote.id} className="border rounded-lg p-3 bg-red-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{creditNote.invoiceNumber}</span>
                      <span className="font-semibold text-red-600">
                        -{creditNote.total.toLocaleString('fr-FR')} €
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {format(new Date(creditNote.createdAt), 'dd/MM/yyyy', { locale: fr })}
                    </div>
                    <Link href={`/dashboard/invoices/${creditNote.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        Voir l'avoir
                      </Button>
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Actions rapides */}
          {invoice.type === 'INVOICE' && (
            <Card className="glass">
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/dashboard/invoices/credit-note/new?originalInvoice=${invoice.id}`}>
                  <Button variant="outline" className="w-full">
                    <Receipt className="w-4 h-4 mr-2" />
                    Créer un Avoir
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
