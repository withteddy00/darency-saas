'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/dashboard'
import { formatCurrency } from '@/lib/utils'
import { 
  TrendingUp, TrendingDown, DollarSign, Home, Users, Building2,
  Calendar, Activity, PieChart, BarChart3
} from 'lucide-react'

interface ReportData {
  summary: {
    totalResidences: number
    totalApartments: number
    occupiedApartments: number
    vacantApartments: number
    occupancyRate: number
    totalRevenue: number
    totalExpenses: number
    profit: number
    totalResidents: number
    openRequests: number
  }
  monthlyData: Array<{
    month: number
    year: number
    label: string
    revenue: number
    expenses: number
    profit: number
  }>
  residenceBreakdown: Array<{
    id: string
    name: string
    city: string
    apartments: number
    occupied: number
    revenue: number
    expenses: number
    profit: number
    occupancyRate: number
  }>
  recentTransactions: Array<{
    id: string
    type: string
    amount: number
    date: string
    description: string
  }>
}

export default function OwnerReportsPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('12m')

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
      overview: 'Aperçu global',
      finances: 'Finances',
      occupancy: 'Occupation',
      revenue: 'Revenus',
      expenses: 'Dépenses',
      profit: 'Profit',
      apartments: 'Appartements',
      occupied: 'Occupés',
      vacant: 'Vacants',
      rate: "Taux d'occupation",
      residences: 'Résidences',
      residents: 'Résidents',
      requests: 'Demandes',
      noData: 'Aucune donnée disponible',
      recentTransactions: 'Transactions récentes',
      byResidence: 'Par résidence',
      monthlyEvolution: 'Évolution mensuelle',
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
      residences: 'العقارات',
      residents: 'المقيمين',
      requests: 'الطلبات',
      noData: 'لا توجد بيانات',
      recentTransactions: 'المعاملات الأخيرة',
      byResidence: 'حسب العقار',
      monthlyEvolution: 'التطور الشهري',
    }
  }

  const t = translations[locale as 'fr' | 'ar'] || translations.fr

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', { 
      style: 'currency', 
      currency: 'MAD', 
      maximumFractionDigits: 0 
    }).format(amount)
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout locale={locale} role="OWNER">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session || session.user.role !== 'OWNER') {
    return (
      <DashboardLayout locale={locale} role="OWNER">
        <div className="flex items-center justify-center h-64">
          <p className="text-text-secondary">Unauthorized</p>
        </div>
      </DashboardLayout>
    )
  }

  const summary = reportData?.summary

  return (
    <DashboardLayout locale={locale} role="OWNER">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t.title}</h1>
            <p className="text-text-secondary mt-1">{t.subtitle}</p>
          </div>
        </div>
        </div>

      {!reportData || !summary ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="w-12 h-12 text-text-tertiary mb-4" />
            <p className="text-text-secondary">{t.noData}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="w-8 h-8 text-primary" />
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <p className="text-sm text-text-secondary mb-1">{t.residences}</p>
                <p className="text-3xl font-bold text-text-primary">{summary.totalResidences}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Home className="w-8 h-8 text-primary" />
                  <span className="text-sm font-medium text-success">{summary.occupancyRate}%</span>
                </div>
                <p className="text-sm text-text-secondary mb-1">{t.apartments}</p>
                <p className="text-3xl font-bold text-text-primary">
                  {summary.occupiedApartments}
                  <span className="text-lg font-normal text-text-tertiary">/{summary.totalApartments}</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-text-secondary mb-1">{t.residents}</p>
                <p className="text-3xl font-bold text-text-primary">{summary.totalResidents}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-text-secondary mb-1">{t.revenue}</p>
                <p className="text-3xl font-bold text-success">{formatCurrency(summary.totalRevenue)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Financial Overview */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">{t.finances}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-success" />
                    <p className="text-sm text-text-secondary">{t.revenue}</p>
                  </div>
                  <p className="text-3xl font-bold text-success">{formatCurrency(summary.totalRevenue)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-5 h-5 text-error" />
                    <p className="text-sm text-text-secondary">{t.expenses}</p>
                  </div>
                  <p className="text-3xl font-bold text-error">{formatCurrency(summary.totalExpenses)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <p className="text-sm text-text-secondary">{t.profit}</p>
                  </div>
                  <p className={`text-3xl font-bold ${summary.profit >= 0 ? 'text-success' : 'text-error'}`}>
                    {formatCurrency(summary.profit)}
                  </p>
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
                  <p className="text-3xl font-bold text-text-primary">{summary.totalApartments}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-text-secondary mb-1">{t.occupied}</p>
                  <p className="text-3xl font-bold text-success">{summary.occupiedApartments}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-text-secondary mb-1">{t.vacant}</p>
                  <p className="text-3xl font-bold text-warning">{summary.vacantApartments}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-text-secondary mb-1">{t.rate}</p>
                  <p className="text-3xl font-bold text-primary">{summary.occupancyRate}%</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
