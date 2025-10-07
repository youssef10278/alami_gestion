'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeft, Download, CheckCircle, XCircle, Send, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'

interface Quote {
  id: string
  quoteNumber: string
  customerName: string
  customerPhone: string | null
  customerEmail: string | null
  customerAddress: string | null
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED'
  validUntil: string
  subtotal: number
  discount: number
  tax: number
  total: number
  notes: string | null
  terms: string | null
  createdAt: string
  customer: {
    id: string
    name: string
  } | null
  items: {
    id: string
    productName: string
    productSku: string | null
    quantity: number
    unitPrice: number
    discount: number
    total: number
    product: {
      id: string
      name: string
      stock: number
    } | null
  }[]
  convertedToSale: {
    id: string
    saleNumber: string
    seller: {
      name: string
    }
  } | null
}

export default function QuoteDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [paidAmount, setPaidAmount] = useState(0)

  useEffect(() => {
    fetchQuote()
  }, [params.id])

  const fetchQuote = async () => {
    try {
      const response = await fetch(`/api/quotes/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setQuote(data)
        setPaidAmount(Number(data.total))
      } else {
        toast.error('Devis non trouvé')
        router.push('/dashboard/quotes')
      }
    } catch (error) {
      console.error('Error fetching quote:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const response = await fetch('/api/quotes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: params.id,
          status: newStatus,
        }),
      })

      if (response.ok) {
        toast.success('Statut mis à jour')
        fetchQuote()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleConvert = async () => {
    if (!quote) return

    try {
      const response = await fetch('/api/quotes/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId: quote.id,
          paymentMethod,
          paidAmount: paymentMethod === 'CREDIT' ? paidAmount : Number(quote.total),
        }),
      })

      if (response.ok) {
        const sale = await response.json()
        toast.success('Devis converti en vente avec succès !')
        router.push(`/dashboard/sales/history`)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erreur lors de la conversion')
      }
    } catch (error) {
      console.error('Error converting quote:', error)
      toast.error('Erreur lors de la conversion')
    }
  }

  const downloadPDF = () => {
    if (!quote) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error("Impossible d'ouvrir la fenêtre d'impression")
      return
    }

    const quoteHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Devis ${quote.quoteNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            max-width: 210mm;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #2563eb;
            font-size: 32px;
            margin-bottom: 10px;
          }
          .header .quote-number {
            font-size: 18px;
            color: #666;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .info-box {
            flex: 1;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            margin: 0 10px;
          }
          .info-box h3 {
            color: #2563eb;
            margin-bottom: 10px;
            font-size: 14px;
            text-transform: uppercase;
          }
          .info-box p {
            margin: 5px 0;
            font-size: 13px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th {
            background: #2563eb;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 13px;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
          }
          tr:hover {
            background: #f8f9fa;
          }
          .totals {
            margin-top: 30px;
            text-align: right;
          }
          .totals table {
            margin-left: auto;
            width: 300px;
          }
          .totals td {
            border: none;
            padding: 8px;
          }
          .totals .total-row {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            border-top: 2px solid #2563eb;
          }
          .terms {
            margin-top: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-left: 4px solid #2563eb;
            border-radius: 4px;
          }
          .terms h3 {
            color: #2563eb;
            margin-bottom: 10px;
            font-size: 14px;
          }
          .terms p {
            font-size: 12px;
            line-height: 1.6;
            color: #666;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 DEVIS</h1>
          <div class="quote-number">${quote.quoteNumber}</div>
        </div>

        <div class="info-section">
          <div class="info-box">
            <h3>Client</h3>
            <p><strong>${quote.customerName}</strong></p>
            ${quote.customerPhone ? `<p>📞 ${quote.customerPhone}</p>` : ''}
            ${quote.customerEmail ? `<p>📧 ${quote.customerEmail}</p>` : ''}
            ${quote.customerAddress ? `<p>📍 ${quote.customerAddress}</p>` : ''}
          </div>
          <div class="info-box">
            <h3>Informations</h3>
            <p><strong>Date :</strong> ${format(new Date(quote.createdAt), 'dd/MM/yyyy', { locale: fr })}</p>
            <p><strong>Valide jusqu'au :</strong> ${format(new Date(quote.validUntil), 'dd/MM/yyyy', { locale: fr })}</p>
            <p><strong>Statut :</strong> ${quote.status === 'DRAFT' ? 'Brouillon' : quote.status === 'SENT' ? 'Envoyé' : quote.status === 'ACCEPTED' ? 'Accepté' : quote.status === 'REJECTED' ? 'Rejeté' : quote.status === 'EXPIRED' ? 'Expiré' : 'Converti'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th style="text-align: center;">Quantité</th>
              <th style="text-align: right;">Prix Unit.</th>
              <th style="text-align: right;">Remise</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${quote.items.map(item => `
              <tr>
                <td>
                  <strong>${item.productName}</strong>
                  ${item.productSku ? `<br><small style="color: #666;">SKU: ${item.productSku}</small>` : ''}
                </td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${Number(item.unitPrice).toFixed(2)} DH</td>
                <td style="text-align: right;">${Number(item.discount).toFixed(2)} DH</td>
                <td style="text-align: right;"><strong>${Number(item.total).toFixed(2)} DH</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr>
              <td>Sous-total :</td>
              <td style="text-align: right;"><strong>${Number(quote.subtotal).toFixed(2)} DH</strong></td>
            </tr>
            ${Number(quote.discount) > 0 ? `
              <tr>
                <td>Remise :</td>
                <td style="text-align: right; color: #dc2626;">-${Number(quote.discount).toFixed(2)} DH</td>
              </tr>
            ` : ''}
            ${Number(quote.tax) > 0 ? `
              <tr>
                <td>TVA / Taxe :</td>
                <td style="text-align: right;">+${Number(quote.tax).toFixed(2)} DH</td>
              </tr>
            ` : ''}
            <tr class="total-row">
              <td>TOTAL :</td>
              <td style="text-align: right;">${Number(quote.total).toFixed(2)} DH</td>
            </tr>
          </table>
        </div>

        ${quote.terms ? `
          <div class="terms">
            <h3>Conditions Générales</h3>
            <p>${quote.terms}</p>
          </div>
        ` : ''}

        ${quote.notes ? `
          <div class="terms" style="border-left-color: #f59e0b;">
            <h3 style="color: #f59e0b;">Notes</h3>
            <p>${quote.notes}</p>
          </div>
        ` : ''}

        <div class="footer">
          <p>Alami Gestion - Système de Gestion d'Entreprise</p>
          <p>Document généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `

    printWindow.document.write(quoteHTML)
    printWindow.document.close()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge className="bg-gray-100 text-gray-700">📝 Brouillon</Badge>
      case 'SENT':
        return <Badge className="bg-blue-100 text-blue-700">📤 Envoyé</Badge>
      case 'ACCEPTED':
        return <Badge className="bg-green-100 text-green-700">✅ Accepté</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-700">❌ Rejeté</Badge>
      case 'EXPIRED':
        return <Badge className="bg-orange-100 text-orange-700">⏰ Expiré</Badge>
      case 'CONVERTED':
        return <Badge className="bg-purple-100 text-purple-700">🎉 Converti</Badge>
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

  if (!quote) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/dashboard/quotes">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Devis {quote.quoteNumber}</h1>
              <p className="text-blue-100">{quote.customerName}</p>
            </div>
            <div className="flex gap-2">
              {getStatusBadge(quote.status)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-6">
          {quote.status === 'DRAFT' && (
            <Button
              onClick={() => handleUpdateStatus('SENT')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Marquer comme Envoyé
            </Button>
          )}
          
          {(quote.status === 'SENT' || quote.status === 'DRAFT') && (
            <>
              <Button
                onClick={() => handleUpdateStatus('ACCEPTED')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Accepter
              </Button>
              <Button
                onClick={() => handleUpdateStatus('REJECTED')}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rejeter
              </Button>
            </>
          )}

          {(quote.status === 'ACCEPTED' || quote.status === 'SENT') && (
            <Button
              onClick={() => setShowConvertModal(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Convertir en Vente
            </Button>
          )}

          <Button variant="outline" onClick={downloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Télécharger PDF
          </Button>
        </div>

        {/* Informations converties */}
        {quote.convertedToSale && (
          <Card className="mb-6 border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <span className="text-purple-700 font-medium">
                  🎉 Ce devis a été converti en vente : 
                </span>
                <Link href={`/dashboard/sales/history`}>
                  <Button variant="link" className="text-purple-700 p-0 h-auto">
                    {quote.convertedToSale.saleNumber}
                  </Button>
                </Link>
                <span className="text-purple-600">
                  par {quote.convertedToSale.seller.name}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Détails */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations Client */}
            <Card>
              <CardHeader>
                <CardTitle>👤 Informations Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nom</p>
                    <p className="font-medium">{quote.customerName}</p>
                  </div>
                  {quote.customerPhone && (
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="font-medium">{quote.customerPhone}</p>
                    </div>
                  )}
                  {quote.customerEmail && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{quote.customerEmail}</p>
                    </div>
                  )}
                  {quote.customerAddress && (
                    <div>
                      <p className="text-sm text-gray-600">Adresse</p>
                      <p className="font-medium">{quote.customerAddress}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Articles */}
            <Card>
              <CardHeader>
                <CardTitle>📦 Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qté</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prix Unit.</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remise</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {quote.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                            {item.productSku && (
                              <div className="text-sm text-gray-500">SKU: {item.productSku}</div>
                            )}
                            {item.product && (
                              <div className="text-sm text-gray-500">Stock: {item.product.stock}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm">{Number(item.unitPrice).toFixed(2)} DH</td>
                          <td className="px-4 py-3 text-sm">{Number(item.discount).toFixed(2)} DH</td>
                          <td className="px-4 py-3 text-sm font-semibold">{Number(item.total).toFixed(2)} DH</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Notes et Conditions */}
            {(quote.notes || quote.terms) && (
              <Card>
                <CardHeader>
                  <CardTitle>📝 Notes et Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quote.notes && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Notes internes</p>
                      <p className="text-sm">{quote.notes}</p>
                    </div>
                  )}
                  {quote.terms && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Conditions générales</p>
                      <p className="text-sm">{quote.terms}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Résumé */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>📊 Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date de création :</span>
                  <span className="font-medium">
                    {format(new Date(quote.createdAt), 'dd MMM yyyy', { locale: fr })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Valide jusqu'au :</span>
                  <span className="font-medium">
                    {format(new Date(quote.validUntil), 'dd MMM yyyy', { locale: fr })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Nombre d'articles :</span>
                  <span className="font-medium">{quote.items.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>💰 Totaux</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total :</span>
                  <span className="font-medium">{Number(quote.subtotal).toFixed(2)} DH</span>
                </div>
                {Number(quote.discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remise :</span>
                    <span className="font-medium text-red-600">-{Number(quote.discount).toFixed(2)} DH</span>
                  </div>
                )}
                {Number(quote.tax) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">TVA / Taxe :</span>
                    <span className="font-medium">+{Number(quote.tax).toFixed(2)} DH</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total :</span>
                  <span className="text-blue-600">{Number(quote.total).toFixed(2)} DH</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal Conversion */}
      {showConvertModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowConvertModal(false)}
        >
          <Card
            className="max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>🔄 Convertir en Vente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Cette action va créer une vente à partir de ce devis et mettre à jour le stock.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Mode de paiement</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CASH">💵 Espèces</option>
                      <option value="CARD">💳 Carte</option>
                      <option value="TRANSFER">🏦 Virement</option>
                      <option value="CREDIT">📝 Crédit</option>
                    </select>
                  </div>

                  {paymentMethod === 'CREDIT' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Montant payé</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max={Number(quote.total)}
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Crédit : {(Number(quote.total) - paidAmount).toFixed(2)} DH
                      </p>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-900">
                      <strong>Total :</strong> {Number(quote.total).toFixed(2)} DH
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleConvert}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  ✅ Confirmer
                </Button>
                <Button
                  onClick={() => setShowConvertModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

