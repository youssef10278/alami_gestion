'use client'

import { Edit, Trash2, User, Building2, Mail, Phone, MapPin, CreditCard, ShoppingCart, Ban, Hash } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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

interface CustomerCardProps {
  customer: Customer
  onEdit: (customer: Customer) => void
  onDelete: (customerId: string) => void
}

export default function CustomerCard({ customer, onEdit, onDelete }: CustomerCardProps) {
  const creditAvailable = Number(customer.creditLimit) - Number(customer.creditUsed)
  const creditPercentage = customer.creditLimit > 0 
    ? (Number(customer.creditUsed) / Number(customer.creditLimit)) * 100 
    : 0

  return (
    <Card className={`glass hover:shadow-lg transition-all duration-200 ${customer.isBlocked ? 'border-red-300' : ''} h-full flex flex-col`}>
      <CardContent className="p-4 sm:p-6 flex-1">
        {/* Header - Responsive */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base sm:text-lg truncate">{customer.name}</h3>
              {customer.company && (
                <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 truncate">
                  <Building2 className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{customer.company}</span>
                </p>
              )}
            </div>
          </div>
          {customer.isBlocked && (
            <Badge variant="destructive" className="gap-1 text-xs flex-shrink-0 ml-2">
              <Ban className="w-3 h-3" />
              <span className="hidden sm:inline">Bloqué</span>
            </Badge>
          )}
        </div>

        {/* Contact Info - Responsive */}
        <div className="space-y-2 mb-4">
          {customer.email && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 min-w-0">
              <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{customer.email}</span>
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>{customer.phone}</span>
            </div>
          )}
          {customer.address && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 min-w-0">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="line-clamp-2 sm:line-clamp-1">{customer.address}</span>
            </div>
          )}
          {customer.ice && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 min-w-0">
              <Hash className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="font-mono truncate">ICE: {customer.ice}</span>
            </div>
          )}
        </div>

        {/* Stats - Responsive */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <ShoppingCart className="w-3 h-3" />
              <span className="hidden sm:inline">Ventes</span>
              <span className="sm:hidden">V.</span>
            </div>
            <div className="text-base sm:text-lg font-bold">{customer._count.sales}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <CreditCard className="w-3 h-3" />
              <span className="hidden sm:inline">Crédit</span>
              <span className="sm:hidden">C.</span>
            </div>
            <div className={`text-sm sm:text-lg font-bold ${creditPercentage > 80 ? 'text-red-600' : 'text-green-600'}`}>
              {Number(customer.creditUsed).toFixed(0)} DH
            </div>
          </div>
        </div>

        {/* Credit Progress - Responsive */}
        {customer.creditLimit > 0 && (
          <div className="space-y-1 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Limite</span>
              <span className="font-semibold">{Number(customer.creditLimit).toFixed(0)} DH</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  creditPercentage > 80 ? 'bg-red-500' : creditPercentage > 50 ? 'bg-orange-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(creditPercentage, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Disponible</span>
              <span className={`font-semibold ${creditAvailable < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {creditAvailable.toFixed(0)} DH
              </span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 p-4 sm:p-6 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 sm:h-9"
          onClick={() => onEdit(customer)}
        >
          <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="text-xs sm:text-sm">Modifier</span>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="h-8 sm:h-9 px-2 sm:px-3"
          onClick={() => onDelete(customer.id)}
        >
          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

