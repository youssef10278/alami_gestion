'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import DeliveryNoteButton from '@/components/sales/DeliveryNoteButton'
import SaleEditDialog from '@/components/sales/SaleEditDialog'
import { Eye, Calendar, DollarSign, Printer, Edit3, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

import { safeToFixed, safeNumber } from '@/lib/utils'
interface Sale {
  id: string
  saleNumber: string
  totalAmount: number
  paidAmount: number
  creditAmount: number
  paymentMethod: string
  status: string
  deliveryNoteGenerated: boolean
  deliveryNoteGeneratedAt?: string
  createdAt: string
  customer: {
    name: string
    company: string | null
    phone: string | null
    email: string | null
  } | null
  seller: {
    name: string
  }
  items: {
    id: string
    quantity: number
    unitPrice: number
    total: number
    product: {
      name: string
      sku: string
    }
  }[]
}

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [filterPayment, setFilterPayment] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [userRole, setUserRole] = useState<string>('')
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    fetchSales()
    fetchUserInfo()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [sales, filterStatus, filterPayment, searchTerm])

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales')
      const data = await response.json()
      setSales(data.sales || [])
    } catch (error) {
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        console.log('User data fetched:', userData) // Debug
        setUserRole(userData.role)
        setUserId(userData.id)
      } else {
        console.error('Failed to fetch user info:', response.status)
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }

  // Vérifier si l'utilisateur peut modifier une vente
  const canEditSale = (sale: Sale) => {
    console.log('Checking edit permissions:', { userRole, userId, sale: sale.id, seller: sale.seller }) // Debug

    if (userRole === 'OWNER') {
      console.log('Owner can edit') // Debug
      return true
    }

    // Pour les vendeurs, vérifier que c'est leur vente et dans les délais
    if (userRole === 'SELLER') {
      const timeSinceCreation = Date.now() - new Date(sale.createdAt).getTime()
      const maxEditTime = 24 * 60 * 60 * 1000 // 24 heures
      const canEdit = timeSinceCreation <= maxEditTime
      console.log('Seller edit check:', { timeSinceCreation, maxEditTime, canEdit }) // Debug
      return canEdit
    }

    console.log('No edit permission') // Debug
    return false
  }

  // Vérifier si l'utilisateur peut supprimer une vente
  const canDeleteSale = (sale: Sale) => {
    if (userRole === 'OWNER') return true

    // Pour les vendeurs, vérifier que c'est leur vente et dans les délais
    if (userRole === 'SELLER') {
      const timeSinceCreation = Date.now() - new Date(sale.createdAt).getTime()
      const maxDeleteTime = 2 * 60 * 60 * 1000 // 2 heures
      return timeSinceCreation <= maxDeleteTime
    }

    return false
  }

  const applyFilters = () => {
    let filtered = [...sales]

    // Filtre par statut
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(sale => sale.status === filterStatus)
    }

    // Filtre par méthode de paiement
    if (filterPayment !== 'ALL') {
      filtered = filtered.filter(sale => sale.paymentMethod === filterPayment)
    }

    // Recherche par client ou numéro de vente
    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (sale.customer?.company?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      )
    }

    setFilteredSales(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="completed">Complétée</Badge>
      case 'PENDING':
        return <Badge variant="pending">En attente</Badge>
      case 'CANCELLED':
        return <Badge variant="cancelled">Annulée</Badge>
      default:
        return <Badge variant="draft">{status}</Badge>
    }
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

  const printReceipt = async (sale: Sale) => {
    // Récupérer les informations de la société
    let companySettings = null
    try {
      const response = await fetch('/api/settings/company')
      if (response.ok) {
        companySettings = await response.json()
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error)
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Impossible d\'ouvrir la fenêtre d\'impression')
      return
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reçu de Vente - ${sale.saleNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            max-width: 80mm;
            margin: 0 auto;
          }
          .receipt {
            border: 2px solid #000;
            padding: 15px;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .header .logo {
            max-width: 80px;
            max-height: 80px;
            margin: 0 auto 10px;
            display: block;
          }
          .header h1 {
            font-size: 18px;
            margin-bottom: 5px;
            font-weight: bold;
          }
          .header p {
            font-size: 11px;
            margin: 2px 0;
            color: #333;
          }
          .header .receipt-title {
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0 5px;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            padding: 5px 0;
          }
          .info {
            margin: 10px 0;
            font-size: 12px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          .items {
            border-top: 2px dashed #000;
            border-bottom: 2px dashed #000;
            padding: 10px 0;
            margin: 10px 0;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 12px;
          }
          .item-name {
            flex: 1;
          }
          .item-qty {
            width: 60px;
            text-align: center;
          }
          .item-price {
            width: 80px;
            text-align: right;
          }
          .totals {
            margin: 10px 0;
            font-size: 13px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .total-row.grand {
            font-weight: bold;
            font-size: 16px;
            border-top: 2px solid #000;
            padding-top: 5px;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 2px dashed #000;
            font-size: 11px;
          }
          @media print {
            body {
              padding: 0;
            }
            .receipt {
              border: none;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            ${companySettings?.companyLogo ? `
              <img src="${companySettings.companyLogo}" alt="Logo" class="logo" />
            ` : ''}
            <h1>${companySettings?.companyName || 'ALAMI GESTION'}</h1>
            ${companySettings?.companyAddress ? `<p>📍 ${companySettings.companyAddress}</p>` : ''}
            ${companySettings?.companyPhone ? `<p>📞 ${companySettings.companyPhone}</p>` : ''}
            ${companySettings?.companyEmail ? `<p>📧 ${companySettings.companyEmail}</p>` : ''}
            ${companySettings?.companyICE ? `<p>ICE: ${companySettings.companyICE}</p>` : ''}
            <p class="receipt-title">REÇU DE VENTE</p>
            <p><strong>N° ${sale.saleNumber}</strong></p>
          </div>

          <div class="info">
            <div class="info-row">
              <span>Date:</span>
              <span>${new Date(sale.createdAt).toLocaleString('fr-FR')}</span>
            </div>
            <div class="info-row">
              <span>Client:</span>
              <span>${sale.customer ? sale.customer.name : 'Client de passage'}</span>
            </div>
            <div class="info-row">
              <span>Vendeur:</span>
              <span>${sale.seller.name}</span>
            </div>
            <div class="info-row">
              <span>Paiement:</span>
              <span>${getPaymentMethodLabel(sale.paymentMethod)}</span>
            </div>
          </div>

          <div class="items">
            <div class="item" style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px;">
              <div class="item-name">Article</div>
              <div class="item-qty">Qté</div>
              <div class="item-price">Prix</div>
            </div>
            ${sale.items.map((item) => `
              <div class="item">
                <div class="item-name">${item.product.name}</div>
                <div class="item-qty">${item.quantity}</div>
                <div class="item-price">${safeToFixed(item.total, 2)} DH</div>
              </div>
              <div class="item" style="font-size: 10px; color: #666; margin-top: -3px;">
                <div class="item-name" style="padding-left: 10px;">
                  ${item.quantity} × ${safeToFixed(item.unitPrice, 2)} DH
                </div>
                <div class="item-qty"></div>
                <div class="item-price"></div>
              </div>
            `).join('')}
          </div>

          <div class="totals">
            <div class="total-row">
              <span>Sous-total:</span>
              <span>${safeToFixed(sale.totalAmount, 2)} DH</span>
            </div>
            <div class="total-row">
              <span>Montant payé:</span>
              <span>${safeToFixed(sale.paidAmount, 2)} DH</span>
            </div>
            ${safeNumber(sale.creditAmount) > 0 ? `
              <div class="total-row" style="color: #d97706;">
                <span>Reste à payer:</span>
                <span>${safeToFixed(sale.creditAmount, 2)} DH</span>
              </div>
            ` : ''}
            <div class="total-row grand">
              <span>TOTAL:</span>
              <span>${safeToFixed(sale.totalAmount, 2)} DH</span>
            </div>
          </div>

          <div class="footer">
            <p>Merci pour votre achat !</p>
            <p>À bientôt chez ${companySettings?.companyName || 'Alami Gestion'}</p>
            <p style="margin-top: 10px; font-size: 10px;">
              Réimprimé le ${new Date().toLocaleString('fr-FR')}
            </p>
          </div>
        </div>

        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; background: #3b82f6; color: white; border: none; border-radius: 5px; margin-right: 10px;">
            🖨️ Imprimer
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; background: #6b7280; color: white; border: none; border-radius: 5px;">
            Fermer
          </button>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(receiptHTML)
    printWindow.document.close()
  }

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header Premium - Responsive */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-600 via-rose-600 to-red-600 p-4 sm:p-6 lg:p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-red-400/20 backdrop-blur-3xl"></div>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 drop-shadow-lg">
                Historique des Ventes
              </h1>
              <p className="text-pink-100 text-xs sm:text-sm">
                Consultez toutes les ventes effectuées
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-xs text-white/80 bg-white/10 px-2 sm:px-3 py-1 rounded-lg backdrop-blur-sm">
                  📋 {sales.length} vente{sales.length > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres - Responsive */}
      <Card className="glass">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {/* Recherche */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                🔍 Rechercher
              </label>
              <input
                type="text"
                placeholder="Client, N° vente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Filtre Statut */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                📊 Statut
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="ALL">Tous</option>
                <option value="COMPLETED">Complétée</option>
                <option value="PENDING">En attente</option>
                <option value="CANCELLED">Annulée</option>
              </select>
            </div>

            {/* Filtre Paiement */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                💳 Paiement
              </label>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="ALL">Tous</option>
                <option value="CASH">Espèces</option>
                <option value="CARD">Carte</option>
                <option value="TRANSFER">Virement</option>
                <option value="CREDIT">Crédit</option>
              </select>
            </div>

            {/* Bouton Reset */}
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setFilterStatus('ALL')
                  setFilterPayment('ALL')
                }}
                className="w-full h-9 sm:h-10 text-xs sm:text-sm px-2"
              >
                🔄 <span className="hidden sm:inline ml-1">Réinit.</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats avec design premium - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Ventes */}
        <Card className="relative overflow-hidden border-0 shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 hover:-translate-y-0 sm:hover:-translate-y-1 bg-gradient-to-br from-pink-50 to-rose-100/50">
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-pink-500/10 rounded-full -mr-8 sm:-mr-12 lg:-mr-16 -mt-8 sm:-mt-12 lg:-mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-pink-900 truncate">
              Total Ventes
            </CardTitle>
            <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
              {filteredSales.length}
            </div>
            <p className="text-xs text-pink-600 mt-2 font-medium">
              📋 Transactions
            </p>
          </CardContent>
        </Card>

        {/* Chiffre d'Affaires */}
        <Card className="relative overflow-hidden border-0 shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 hover:-translate-y-0 sm:hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-100/50">
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-green-500/10 rounded-full -mr-8 sm:-mr-12 lg:-mr-16 -mt-8 sm:-mt-12 lg:-mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-green-900 truncate">
              <span className="hidden sm:inline">Chiffre d'Affaires</span>
              <span className="sm:hidden">CA</span>
            </CardTitle>
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent truncate">
              {safeToFixed(filteredSales.reduce((sum, s) => sum + safeNumber(s.totalAmount), 0), 0)} DH
            </div>
            <p className="text-xs text-green-600 mt-2 font-medium">
              💰 Total généré
            </p>
          </CardContent>
        </Card>

        {/* Montant Payé */}
        <Card className="relative overflow-hidden border-0 shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 hover:-translate-y-0 sm:hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-indigo-100/50 sm:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-blue-500/10 rounded-full -mr-8 sm:-mr-12 lg:-mr-16 -mt-8 sm:-mt-12 lg:-mt-16"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-blue-900 truncate">
              <span className="hidden sm:inline">Montant Payé</span>
              <span className="sm:hidden">Payé</span>
            </CardTitle>
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent truncate">
              {safeToFixed(filteredSales.reduce((sum, s) => sum + safeNumber(s.paidAmount), 0), 0)} DH
            </div>
            <p className="text-xs text-blue-600 mt-2 font-medium">
              ✅ Encaissé
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales List - Responsive */}
      {loading ? (
        <div className="text-center py-8 sm:py-12">
          <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-pink-600"></div>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">Chargement...</p>
        </div>
      ) : filteredSales.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-8 sm:py-12 text-center px-4">
            <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-sm sm:text-base">
              {sales.length === 0 ? 'Aucune vente trouvée' : 'Aucune vente ne correspond aux filtres'}
            </p>
            {sales.length === 0 && (
              <p className="text-gray-500 text-xs sm:text-sm mt-2">
                Les ventes apparaîtront ici une fois effectuées
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="glass hidden lg:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendeur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Méthode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {format(new Date(sale.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {sale.customer ? sale.customer.name : '🚶 Client de passage'}
                        </div>
                        {sale.customer?.company && (
                          <div className="text-sm text-gray-500">
                            {sale.customer.company}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.seller.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                        {safeToFixed(sale.totalAmount, 2)} DH
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {safeToFixed(sale.paidAmount, 2)} DH
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getPaymentMethodLabel(sale.paymentMethod)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(sale.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSale(sale)}
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {/* Debug: Afficher toujours le bouton pour tester */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              console.log('Edit button clicked, userRole:', userRole, 'userId:', userId)
                              setEditingSale(sale)
                            }}
                            title="Modifier la vente (DEBUG)"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>

                          {/* Version conditionnelle (commentée pour debug) */}
                          {/* {canEditSale(sale) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingSale(sale)}
                              title="Modifier la vente"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          )} */}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => printReceipt(sale)}
                            title="Imprimer le reçu"
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          {sale.status !== 'CANCELLED' && (
                            <DeliveryNoteButton
                              saleId={sale.id}
                              saleNumber={sale.saleNumber}
                              isGenerated={sale.deliveryNoteGenerated}
                              customerPhone={sale.customer?.phone}
                              customerName={sale.customer?.name}
                              customerEmail={sale.customer?.email}
                              className="ml-1"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {filteredSales.map((sale) => (
            <Card key={sale.id} className="glass hover:shadow-lg transition-all duration-200">
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600 truncate">
                        {format(new Date(sale.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate">
                      {sale.customer ? sale.customer.name : '🚶 Client de passage'}
                    </h3>
                    {sale.customer?.company && (
                      <p className="text-xs text-gray-500 truncate">{sale.customer.company}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {getStatusBadge(sale.status)}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <span className="text-gray-500">Vendeur:</span>
                    <p className="font-medium truncate">{sale.seller.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Méthode:</span>
                    <p className="font-medium">{getPaymentMethodLabel(sale.paymentMethod)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total:</span>
                    <p className="font-bold text-gray-900">{safeToFixed(sale.totalAmount, 2)} DH</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Payé:</span>
                    <p className="font-bold text-green-600">{safeToFixed(sale.paidAmount, 2)} DH</p>
                  </div>
                </div>

                {/* Actions - Responsive */}
                <div className="pt-3 border-t space-y-2">
                  {/* Première ligne - Actions principales */}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSale(sale)}
                      className="flex-1 text-xs sm:text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1 sm:mr-2" />
                      Voir
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSale(sale)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3"
                      title="Modifier"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => printReceipt(sale)}
                      className="px-3"
                      title="Imprimer reçu"
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Deuxième ligne - Bon de livraison (si disponible) */}
                  {sale.status !== 'CANCELLED' && (
                    <DeliveryNoteButton
                      saleId={sale.id}
                      saleNumber={sale.saleNumber}
                      isGenerated={sale.deliveryNoteGenerated}
                      customerPhone={sale.customer?.phone}
                      customerName={sale.customer?.name}
                      customerEmail={sale.customer?.email}
                      className="w-full"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </>
      )}

      {/* Sale Details Modal - Responsive */}
      {selectedSale && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => setSelectedSale(null)}
        >
          <Card
            className="max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Détails de la vente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Date</p>
                  <p className="font-medium text-sm sm:text-base">
                    {format(new Date(selectedSale.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Statut</p>
                  {getStatusBadge(selectedSale.status)}
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Client</p>
                  <p className="font-medium text-sm sm:text-base">
                    {selectedSale.customer ? selectedSale.customer.name : '🚶 Client de passage'}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Vendeur</p>
                  <p className="font-medium text-sm sm:text-base">{selectedSale.seller.name}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 text-sm sm:text-base">Articles</h4>
                <div className="space-y-2">
                  {selectedSale.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{item.product.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {item.quantity} × {safeToFixed(item.unitPrice, 2)} DH
                        </p>
                      </div>
                      <p className="font-semibold text-sm sm:text-base ml-2">{safeToFixed(item.total, 2)} DH</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Total:</span>
                  <span className="font-bold">{safeToFixed(selectedSale.totalAmount, 2)} DH</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Payé:</span>
                  <span className="text-green-600 font-semibold">
                    {safeToFixed(selectedSale.paidAmount, 2)} DH
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Reste:</span>
                  <span className="text-orange-600 font-semibold">
                    {safeToFixed(selectedSale.creditAmount, 2)} DH
                  </span>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Button
                  onClick={() => {
                    printReceipt(selectedSale)
                    setSelectedSale(null)
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-10 sm:h-11 text-sm sm:text-base"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimer le Reçu
                </Button>

                {selectedSale.status !== 'CANCELLED' && (
                  <DeliveryNoteButton
                    saleId={selectedSale.id}
                    saleNumber={selectedSale.saleNumber}
                    isGenerated={selectedSale.deliveryNoteGenerated}
                    customerPhone={selectedSale.customer?.phone}
                    customerName={selectedSale.customer?.name}
                    customerEmail={selectedSale.customer?.email}
                    className="w-full h-10 sm:h-11"
                  />
                )}

                <Button
                  onClick={() => setSelectedSale(null)}
                  variant="outline"
                  className="w-full h-10 sm:h-11 text-sm sm:text-base"
                >
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dialog de modification */}
      <SaleEditDialog
        sale={editingSale}
        isOpen={!!editingSale}
        onClose={() => setEditingSale(null)}
        onSaleUpdated={() => {
          fetchSales()
          setEditingSale(null)
        }}
        userRole={userRole}
        userId={userId}
      />
    </div>
  )
}

