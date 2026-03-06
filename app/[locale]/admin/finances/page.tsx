'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Plus as PlusIcon, AlertCircle } from 'lucide-react'

const CATEGORIES = {
  MAINTENANCE: 'Maintenance',
  EQUIPMENT: 'Équipements',
  SERVICES: 'Services',
  UTILITIES: 'Services publics',
  OTHER: 'Autre'
}

export default function FinancesPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations(locale)
  
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [income, setIncome] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'MAINTENANCE', date: '' })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`)
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push(`/${locale}/owner`)
    }
  }, [status, session, router, locale])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchExpenses()
      fetchIncome()
    }
  }, [status, session])

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/admin/expenses')
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch expenses')
      }
    } catch (err) {
      setError('Failed to fetch expenses')
    } finally {
      setLoading(false)
    }
  }

  const fetchIncome = async () => {
    try {
      const response = await fetch('/api/admin/payments')
      if (response.ok) {
        const data = await response.json()
        const totalIncome = data
          .filter((p: any) => p.status === 'PAID')
          .reduce((sum: number, p: any) => sum + p.amount, 0)
        setIncome(totalIncome)
      }
    } catch (err) {
      console.error('Error fetching income:', err)
    }
  }

  const handleCreateExpense = async () => {
    try {
      const response = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newExpense,
          amount: parseFloat(newExpense.amount)
        })
      })
      if (response.ok) {
        setShowModal(false)
        setNewExpense({ description: '', amount: '', category: 'MAINTENANCE', date: '' })
        fetchExpenses()
      }
    } catch (err) {
      console.error('Error creating expense:', err)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/expenses?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchExpenses()
      }
    } catch (err) {
      console.error('Error deleting expense:', err)
    }
  }

  useEffect(() => {
    if (status === 'loading' || loading) {
      return
    }

    if (!session || session.user.role !== 'ADMIN') {
      return
    }
  }, [status, loading, session])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
          <p className="text-error">{error}</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const balance = income - totalExpenses

  const translations = {
    fr: {
      title: 'Finances',
      expenses: 'Dépenses',
      income: 'Revenus',
      balance: 'Solde',
      addExpense: 'Ajouter dépense',
      emptyTitle: 'Aucune dépense',
      emptyDescription: 'Les dépenses apparaîtront ici une fois ajoutées',
      table: {
        date: 'Date',
        description: 'Description',
        category: 'Catégorie',
        amount: 'Montant',
        actions: 'Actions'
      },
      form: {
        description: 'Description',
        amount: 'Montant (DH)',
        category: 'Catégorie',
        date: 'Date',
        save: 'Enregistrer',
        cancel: 'Annuler'
      }
    },
    ar: {
      title: 'المالية',
      expenses: 'المصروفات',
      income: 'الإيرادات',
      balance: 'الرصيد',
      addExpense: 'إضافة مصروف',
      emptyTitle: 'لا توجد مصروفات',
      emptyDescription: 'ستظهر المصروفات هنا بمجرد إضافتها',
      table: {
        date: 'التاريخ',
        description: 'الوصف',
        category: 'الفئة',
        amount: 'المبلغ',
        actions: 'الإجراءات'
      },
      form: {
        description: 'الوصف',
        amount: 'المبلغ (DH)',
        category: 'الفئة',
        date: 'التاريخ',
        save: 'حفظ',
        cancel: 'إلغاء'
      }
    }
  }

  const trans = translations[locale as 'fr' | 'ar'] || translations.fr

  const getCategoryLabel = (category: string) => {
    return CATEGORIES[category as keyof typeof CATEGORIES] || category
  }

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">{trans.title}</h1>
          <p className="page-subtitle">{trans.expenses}</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          {trans.addExpense}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary mb-1">{trans.expenses}</p>
            <p className="text-3xl font-bold text-error">{formatCurrency(totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary mb-1">{trans.income}</p>
            <p className="text-3xl font-bold text-success">{formatCurrency(income)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary mb-1">{trans.balance}</p>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-primary' : 'text-error'}`}>
              {formatCurrency(balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>{trans.expenses}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">{trans.emptyDescription}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">{trans.table.date}</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">{trans.table.description}</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">{trans.table.category}</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-text-secondary">{trans.table.amount}</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-text-secondary">{trans.table.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-border hover:bg-surface-elevated/50 transition-colors">
                      <td className="px-6 py-4 text-text-secondary">
                        {new Date(expense.date).toLocaleDateString('fr-MA')}
                      </td>
                      <td className="px-6 py-4 font-medium text-text-primary">{expense.description}</td>
                      <td className="px-6 py-4">
                        <span className="badge badge-info">{getCategoryLabel(expense.category)}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-error">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteExpense(expense.id)}>
                          <span className="text-error">{trans.table.actions}</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-text-primary mb-4">{trans.addExpense}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  {trans.form.description}
                </label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  {trans.form.amount}
                </label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  {trans.form.category}
                </label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary"
                >
                  {Object.entries(CATEGORIES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  {trans.form.date}
                </label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                {trans.form.cancel}
              </Button>
              <Button onClick={handleCreateExpense}>
                {trans.form.save}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
