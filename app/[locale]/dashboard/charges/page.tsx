'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Receipt, Search, Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { DashboardLayout, SectionCard, EmptyState, StatCard } from '@/components/dashboard'
import { formatCurrency } from '@/lib/utils'

interface Charge {
  id: string
  title: string
  category: string
  amount: number
  month: number
  year: number
  dueDate: string
  apartment: {
    number: string
    building: string | null
    residence: {
      name: string
    }
  }
}

interface PageProps {
  params: { locale: string }
}

const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export default function ChargesPage({ params }: PageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { locale } = params
  const [charges, setCharges] = useState<Charge[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMonth, setSelectedMonth] = useState<number | ''>('')
  const [selectedYear, setSelectedYear] = useState<number | ''>('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`)
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push(`/${locale}/owner`)
    }
  }, [status, session, router, locale])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchCharges()
    }
  }, [status, session])

  const fetchCharges = async () => {
    try {
      const response = await fetch('/api/charges')
      if (response.ok) {
        const data = await response.json()
        setCharges(data)
      }
    } catch (error) {
      console.error('Error fetching charges:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout locale={locale} role="ADMIN">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  const t = {
    fr: {
      title: 'Charges',
      description: 'Gérez les charges mensuelles',
      searchPlaceholder: 'Rechercher une charge...',
      emptyTitle: 'Aucune charge',
      emptyDescription: 'Les charges apparaîtront ici une fois créées',
      totalCharges: 'Total charges',
      totalAmount: 'Montant total',
      pendingAmount: 'En attente',
      paidAmount: 'Payé',
      month: 'Mois',
      year: 'Année',
      allMonths: 'Tous les mois',
      allYears: 'Toutes les années',
      actions: 'Actions',
    },
    ar: {
      title: 'الرسوم',
      description: 'إدارة الرسوم الشهرية',
      searchPlaceholder: 'البحث عن رسوم...',
      emptyTitle: 'لا توجد رسوم',
      emptyDescription: 'ستظهر الرسوم هنا بمجرد إنشائها',
      totalCharges: 'إجمالي الرسوم',
      totalAmount: 'المبلغ الإجمالي',
      pendingAmount: 'معلق',
      paidAmount: 'مدفوع',
      month: 'الشهر',
      year: 'السنة',
      allMonths: 'جميع الأشهر',
      allYears: 'جميع السنوات',
      actions: 'الإجراءات',
    }
  }

  const translations = t[locale as 'fr' | 'ar'] || t.fr

  const filteredCharges = charges.filter(charge => {
    const matchesSearch = charge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      charge.apartment.number.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesMonth = selectedMonth === '' || charge.month === selectedMonth
    const matchesYear = selectedYear === '' || charge.year === selectedYear
    return matchesSearch && matchesMonth && matchesYear
  })

  const totalAmount = filteredCharges.reduce((sum, c) => sum + c.amount, 0)

  const stats = [
    { title: translations.totalCharges, value: filteredCharges.length.toString(), change: '', changeType: 'neutral' as const, icon: Receipt, iconColor: 'text-primary' },
    { title: translations.totalAmount, value: formatCurrency(totalAmount), change: '', changeType: 'neutral' as const, icon: Receipt, iconColor: 'text-secondary' },
  ]

  return (
    <DashboardLayout locale={locale} role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{translations.title}</h1>
            <p className="text-text-secondary mt-1">{translations.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              placeholder={translations.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : '')}
            className="px-4 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">{translations.allMonths}</option>
            {monthNames.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : '')}
            className="px-4 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">{translations.allYears}</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>

        {/* Charges Table */}
        <SectionCard title="">
          {filteredCharges.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Titre</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Appartement</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">{translations.month}</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-text-secondary">Montant</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-text-secondary">{translations.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCharges.map((charge) => (
                    <tr key={charge.id} className="border-b border-border hover:bg-surface-elevated/50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium text-text-primary">{charge.title}</span>
                          <p className="text-xs text-text-tertiary">{charge.category}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {charge.apartment.number}
                        {charge.apartment.building && <span className="text-text-tertiary"> ({charge.apartment.building})</span>}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {monthNames[charge.month - 1]} {charge.year}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-text-primary">
                        {formatCurrency(charge.amount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-2 hover:bg-surface-elevated rounded-lg transition-colors" title="View">
                            <Eye className="w-4 h-4 text-text-tertiary" />
                          </button>
                          <button className="p-2 hover:bg-surface-elevated rounded-lg transition-colors" title="Edit">
                            <Edit className="w-4 h-4 text-text-tertiary" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState 
              icon={Receipt}
              title={translations.emptyTitle}
              description={translations.emptyDescription}
            />
          )}
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
