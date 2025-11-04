'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Search, Filter, TrendingUp, TrendingDown, Calendar, DollarSign, Receipt, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ExpenseDialog } from '@/components/expenses/ExpenseDialog'
import { CategoryDialog } from '@/components/expenses/CategoryDialog'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ExpenseCategory {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  _count?: {
    expenses: number
  }
}

interface Expense {
  id: string
  amount: number
  description: string
  date: string
  paymentMethod: string
  reference?: string
  receipt?: string
  notes?: string
  category: ExpenseCategory
  user: {
    id: string
    name: string
  }
}

interface Stats {
  total: number
  count: number
  byCategory: Array<{
    category: ExpenseCategory
    total: number
    count: number
  }>
  comparison: {
    currentMonth: number
    previousMonth: number
    percentageChange: number
  }
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null)

  useEffect(() => {
    fetchCategories()
    fetchExpenses()
    fetchStats()
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [search, selectedCategory, startDate, endDate])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/expenses/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    }
  }

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(search && { search }),
        ...(selectedCategory !== 'all' && { categoryId: selectedCategory }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })

      const response = await fetch(`/api/expenses?${params}`)
      if (response.ok) {
        const data = await response.json()
        setExpenses(data.expenses)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des dépenses:', error)
      toast.error('Erreur lors du chargement des dépenses')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams({
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })
      const response = await fetch(`/api/expenses/stats?${params}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) return

    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Dépense supprimée')
        fetchExpenses()
        fetchStats()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setIsExpenseDialogOpen(true)
  }

  const handleExpenseSuccess = () => {
    setIsExpenseDialogOpen(false)
    setEditingExpense(null)
    fetchExpenses()
    fetchStats()
  }

  const handleCategorySuccess = () => {
    setIsCategoryDialogOpen(false)
    setEditingCategory(null)
    fetchCategories()
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      CASH: 'Espèces',
      CARD: 'Carte',
      TRANSFER: 'Virement',
      CHECK: 'Chèque',
      CREDIT: 'Crédit'
    }
    return labels[method] || method
  }

  const totalExpenses = stats?.total || 0
  const percentageChange = stats?.comparison.percentageChange || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              💸 Gestion des Dépenses
            </h1>
            <p className="text-gray-600 mt-2">Suivez et analysez vos dépenses</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsCategoryDialogOpen(true)}
              variant="outline"
              className="bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Catégorie
            </Button>
            <Button
              onClick={() => setIsExpenseDialogOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Dépense
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total des Dépenses
              </CardTitle>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {totalExpenses.toFixed(2)} DH
              </div>
              <div className="flex items-center mt-2 text-sm">
                {percentageChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                )}
                <span className={percentageChange >= 0 ? 'text-red-500' : 'text-green-500'}>
                  {Math.abs(percentageChange).toFixed(1)}%
                </span>
                <span className="text-gray-500 ml-1">vs mois dernier</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-pink-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Nombre de Dépenses
              </CardTitle>
              <Receipt className="w-5 h-5 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-600">
                {stats?.count || 0}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Dépenses enregistrées
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Catégories Actives
              </CardTitle>
              <Filter className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {categories.length}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Catégories disponibles
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Date début"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Date fin"
              />
            </div>
          </CardContent>
        </Card>

        {/* Expenses List */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Liste des Dépenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Chargement...</div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune dépense trouvée
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${expense.category.color}20` }}
                      >
                        {expense.category.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {expense.description}
                          </h3>
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${expense.category.color}20`,
                              color: expense.category.color
                            }}
                          >
                            {expense.category.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(expense.date), 'dd MMM yyyy', { locale: fr })}
                          </span>
                          <span>•</span>
                          <span>{getPaymentMethodLabel(expense.paymentMethod)}</span>
                          {expense.reference && (
                            <>
                              <span>•</span>
                              <span>Réf: {expense.reference}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>Par {expense.user.name}</span>
                        </div>
                        {expense.notes && (
                          <p className="text-sm text-gray-600 mt-1">{expense.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          {Number(expense.amount).toFixed(2)} DH
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditExpense(expense)}
                          className="hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Stats */}
        {stats && stats.byCategory.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Dépenses par Catégorie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.byCategory.map((item) => {
                  const percentage = (Number(item.total) / Number(stats.total)) * 100
                  return (
                    <div key={item.category.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item.category.icon}</span>
                          <span className="font-medium">{item.category.name}</span>
                          <span className="text-sm text-gray-500">
                            ({item.count} dépense{item.count > 1 ? 's' : ''})
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {Number(item.total).toFixed(2)} DH
                          </div>
                          <div className="text-sm text-gray-500">
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: item.category.color
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <ExpenseDialog
        open={isExpenseDialogOpen}
        onOpenChange={setIsExpenseDialogOpen}
        onSuccess={handleExpenseSuccess}
        categories={categories}
        expense={editingExpense}
      />

      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        onSuccess={handleCategorySuccess}
        category={editingCategory}
      />
    </div>
  )
}

