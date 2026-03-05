'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default function OwnerReportsPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const { data: session, status } = useSession()
  const router = useRouter()

  const translations = {
    fr: {
      title: 'Rapports',
      subtitle: 'Analysez les performances de votre organisation',
      overview: 'Aperçu',
      finances: 'Finances',
      occupancy: 'Occupation',
      maintenance: 'Maintenance',
      revenue: 'Revenus',
      expenses: 'Dépenses',
      profit: 'Profit',
      apartments: 'Appartements',
      occupied: 'Occupés',
      vacant: 'Vacants',
      rate: 'Taux d\'occupation',
      requests: 'Demandes',
      pending: 'En attente',
      completed: 'Terminées',
      thisMonth: 'Ce mois',
      thisYear: 'Cette année',
    },
    ar: {
      title: 'التقارير',
      subtitle: 'تحليل أداء مؤسستك',
      overview: 'نظرة عامة',
      finances: 'المالية',
      occupancy: 'الإشغال',
      maintenance: 'الصيانة',
      revenue: 'الإيرادات',
      expenses: 'المصروفات',
      profit: 'الربح',
      apartments: 'الشقق',
      occupied: 'مشغولة',
      vacant: 'شاغرة',
      rate: 'معدل الإشغال',
      requests: 'الطلبات',
      pending: 'قيد الانتظار',
      completed: 'مكتملة',
      thisMonth: 'هذا الشهر',
      thisYear: 'هذه السنة',
    }
  }

  const t = translations[locale as 'fr' | 'ar'] || translations.fr

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`)
    } else if (status === 'authenticated' && session?.user?.role !== 'OWNER') {
      if (session?.user?.role === 'ADMIN') {
        router.push(`/${locale}/admin`)
      } else if (session?.user?.role === 'RESIDENT') {
        router.push(`/${locale}/resident`)
      }
    }
  }, [status, session, router, locale])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'OWNER') {
    return null
  }

  return (
    <div className={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="page-header">
        <h1 className="page-title">{t.title}</h1>
        <p className="page-subtitle">{t.subtitle}</p>
      </div>

      {/* Financial Overview */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t.finances} - {t.thisMonth}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-text-secondary mb-1">{t.revenue}</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(13000)}</p>
              <p className="text-xs text-success mt-1">+12% {t.thisMonth}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-text-secondary mb-1">{t.expenses}</p>
              <p className="text-3xl font-bold text-error">{formatCurrency(4500)}</p>
              <p className="text-xs text-error mt-1">+5% {t.thisMonth}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-text-secondary mb-1">{t.profit}</p>
              <p className="text-3xl font-bold text-success">{formatCurrency(8500)}</p>
              <p className="text-xs text-success mt-1">+18% {t.thisMonth}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Occupancy Stats */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t.occupancy}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-text-secondary mb-1">{t.apartments}</p>
              <p className="text-3xl font-bold text-text-primary">63</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-text-secondary mb-1">{t.occupied}</p>
              <p className="text-3xl font-bold text-success">49</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-text-secondary mb-1">{t.vacant}</p>
              <p className="text-3xl font-bold text-warning">14</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-text-secondary mb-1">{t.rate}</p>
              <p className="text-3xl font-bold text-primary">78%</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Maintenance Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t.maintenance}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-text-secondary mb-1">{t.requests}</p>
              <p className="text-3xl font-bold text-text-primary">24</p>
              <p className="text-xs text-text-tertiary mt-1">{t.thisMonth}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-text-secondary mb-1">{t.pending}</p>
              <p className="text-3xl font-bold text-warning">7</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-text-secondary mb-1">{t.completed}</p>
              <p className="text-3xl font-bold text-success">17</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
