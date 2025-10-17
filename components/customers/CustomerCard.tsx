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
    <Card className={`glass hover:shadow-lg transition-all duration-200 ${customer.isBlocked ? 'border-red-300' : ''}`}>
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{customer.name}</h3>
              {customer.company && (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {customer.company}
                </p>
              )}
            </div>
          </div>
          {customer.isBlocked && (
            <Badge variant="destructive" className="gap-1">
              <Ban className="w-3 h-3" />
              Bloqué
            </Badge>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {customer.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="truncate">{customer.email}</span>
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{customer.phone}</span>
            </div>
          )}
          {customer.address && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{customer.address}</span>
            </div>
          )}
          {customer.ice && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Hash className="w-4 h-4" />
              <span className="font-mono">ICE: {customer.ice}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <ShoppingCart className="w-3 h-3" />
              Ventes
            </div>
            <div className="text-lg font-bold">{customer._count.sales}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <CreditCard className="w-3 h-3" />
              Crédit
            </div>
            <div className={`text-lg font-bold ${creditPercentage > 80 ? 'text-red-600' : 'text-green-600'}`}>
              {Number(customer.creditUsed).toFixed(2)} DH
            </div>
          </div>
        </div>

        {/* Credit Progress */}
        {customer.creditLimit > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Limite de crédit</span>
              <span className="font-semibold">{Number(customer.creditLimit).toFixed(2)} DH</span>
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
                {creditAvailable.toFixed(2)} DH
              </span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(customer)}
        >
          <Edit className="w-4 h-4 mr-2" />
          Modifier
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(customer.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

