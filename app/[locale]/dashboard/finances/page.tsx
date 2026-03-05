'use client'

import { useTranslations } from '@/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

const expenses = [
  { id: 1, description: 'Entretien espaces verts', amount: 2500, category: 'Maintenance', date: '2026-03-01', building: 'Résidence Al-Manar' },
  { id: 2, description: 'Réparation ascenseur', amount: 8500, category: 'Équipements', date: '2026-02-28', building: 'Résidence Assa' },
  { id: 3, description: 'Nettoyage communs', amount: 3200, category: 'Services', date: '2026-02-25', building: 'Résidence Al-Manar' },
  { id: 4, description: 'Électricité éclairage', amount: 4100, category: 'Services', date: '2026-02-20', building: 'Résidence Oasis' },
  { id: 5, description: 'Réparation porte garage', amount: 6200, category: 'Maintenance', date: '2026-02-15', building: 'Résidence Les Palmes' },
]

export default function FinancesPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const t = useTranslations(locale)

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">{t('finances.title')}</h1>
          <p className="page-subtitle">{t('finances.expenses')}</p>
        </div>
        <Button>
          <PlusIcon className="w-4 h-4 mr-2" />
          {t('finances.addExpense')}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary mb-1">{t('finances.expenses')}</p>
            <p className="text-3xl font-bold text-error">{formatCurrency(totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary mb-1">{t('finances.income')}</p>
            <p className="text-3xl font-bold text-success">{formatCurrency(124500)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary mb-1">{t('finances.balance')}</p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(124500 - totalExpenses)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>{t('finances.expenses')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">{t('finances.table.date')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">{t('finances.table.description')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">{t('finances.table.category')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">{t('common.address')}</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-text-secondary">{t('finances.table.amount')}</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, index) => (
                  <tr key={expense.id} className="border-b border-border hover:bg-surface-elevated/50 transition-colors">
                    <td className="px-6 py-4 text-text-secondary">{new Date(expense.date).toLocaleDateString('fr-MA')}</td>
                    <td className="px-6 py-4 font-medium text-text-primary">{expense.description}</td>
                    <td className="px-6 py-4">
                      <span className="badge badge-info">{expense.category}</span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{expense.building}</td>
                    <td className="px-6 py-4 text-right font-semibold text-error">{formatCurrency(expense.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}
