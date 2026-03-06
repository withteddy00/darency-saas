'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default function OwnerReportsPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/owner/reports')
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

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

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'OWNER') {
      fetchReports()
    }
  }, [status, session])

  const translations = {
    fr: {
      title: 'Rapports',
      subtitle: 'Analysez les performances de votre organisation',
      overview: 'Aperçu',
      finances: 'Finances',
      occupancy: 'Occupation',
      revenue: 'Revenus',
      expenses: 'Dépenses',
      profit: 'Profit',
      apartments: 'Appartements',
      occupied: 'Occupés',
      vacant: 'Vacants',
      rate: 'Taux d\'occupation',
    },
    ar: {
      title: 'التقارير',
      subtitle: 'تحليل أداء مؤسستك',
      overview: 'نظرة عامة',
      finances: 'المالية',
      occupancy: 'الإشغال',
      revenue: 'الإيرادات',
      expenses: 'المصروفات',
      profit: 'الربح',
      apartments: 'الشقق',
      occupied: 'مشغولة',
      vacant: 'شاغرة',
      rate: 'معدل الإشغال',
    }
  }

  const t = translations[locale as 'fr' | 'ar'] || translations.fr

  if (status === 'loading' || loading) {
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

      {reportData && (
        <>
          {/* Financial Overview */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">{t.finances}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-text-secondary mb-1">{t.revenue}</p>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(reportData.summary.totalRevenue)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-text-secondary mb-1">{t.expenses}</p>
                  <p className="text-3xl font-bold text-error">{formatCurrency(reportData.summary.totalExpenses)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-text-secondary mb-1">{t.profit}</p>
                  <p className="text-3xl font-bold text-success">{formatCurrency(reportData.summary.profit)}</p>
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
                  <p className="text-3xl font-bold text-text-primary">{reportData.summary.totalApartments}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-text-secondary mb-1">{t.occupied}</p>
                  <p className="text-3xl font-bold text-success">{reportData.summary.occupiedApartments}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-text-secondary mb-1">{t.vacant}</p>
                  <p className="text-3xl font-bold text-warning">{reportData.summary.vacantApartments}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-text-secondary mb-1">{t.rate}</p>
                  <p className="text-3xl font-bold text-primary">{reportData.summary.occupancyRate}%</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
