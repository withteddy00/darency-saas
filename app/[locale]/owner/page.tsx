'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Building2, 
  Users, 
  CreditCard, 
  Wrench, 
  TrendingUp,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Home,
  DollarSign,
  FileText,
  Settings,
  UserCog,
  Activity,
  CreditCard as PaymentIcon
} from 'lucide-react'
import { DashboardLayout, StatCard, SectionCard, ActivityList, QuickActionCard } from '@/components/dashboard'
import { formatCurrency } from '@/lib/utils'

export default function OwnerDashboard({ params }: { params: { locale: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { locale } = params
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
      fetchDashboardData()
    }
  }, [status, session])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/owner/dashboard')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const t = {
    fr: {
      welcome: 'Bienvenue',
      overview: 'Vue d\'ensemble',
      totalResidences: 'Résidences',
      totalAdmins: 'Administrateurs',
      totalResidents: 'Résidents',
      totalApartments: 'Appartements',
      occupancyRate: 'Taux d\'occupation',
      unpaidCharges: 'Charges impayées',
      maintenanceRequests: 'Demandes de maintenance',
      monthlyRevenue: 'Revenus mensuels',
      recentActivity: 'Activité récente',
      quickActions: 'Actions rapides',
      viewAll: 'Voir tout',
      topResidences: 'Résidences principales',
      pendingTasks: 'Tâches en attente',
      financialSummary: 'Résumé financier',
      payments: 'Paiements',
      expenses: 'Dépenses',
      revenue: 'Revenus',
      netIncome: 'Revenu net',
      addResidence: 'Ajouter une résidence',
      manageUsers: 'Gérer les utilisateurs',
      viewReports: 'Voir les rapports',
      settings: 'Paramètres',
      managePlans: 'Gérer les plans',
      manageAdmins: 'Gérer les administrateurs',
      manageSubscriptions: 'Gérer les abonnements',
      viewActivityLogs: 'Voir le journal d\'activité'
    },
    ar: {
      welcome: 'مرحباً',
      overview: 'نظرة عامة',
      totalResidences: 'العقارات',
      totalAdmins: 'المسؤولون',
      totalResidents: 'المقيمون',
      totalApartments: 'الشقق',
      occupancyRate: 'معدل الإشغال',
      unpaidCharges: 'الرسوم غير المدفوعة',
      maintenanceRequests: 'طلبات الصيانة',
      monthlyRevenue: 'الإيرادات الشهرية',
      recentActivity: 'النشاط الأخير',
      quickActions: 'إجراءات سريعة',
      viewAll: 'عرض الكل',
      topResidences: 'أفضل العقارات',
      pendingTasks: 'المهام المعلقة',
      financialSummary: 'الملخص المالي',
      payments: 'المدفوعات',
      expenses: 'المصروفات',
      revenue: 'الإيرادات',
      netIncome: 'صافي الدخل',
      addResidence: 'إضافة عقار',
      manageUsers: 'إدارة المستخدمين',
      viewReports: 'عرض التقارير',
      settings: 'الإعدادات',
      managePlans: 'إدارة الخطط',
      manageAdmins: 'إدارة المسؤولين',
      manageSubscriptions: 'إدارة الاشتراكات',
      viewActivityLogs: 'سجل النشاط'
    }
  }

  const translations = t[locale as 'fr' | 'ar'] || t.fr

  // Use real data from API
  const stats = dashboardData ? [
    { title: translations.totalResidences, value: String(dashboardData.stats.totalResidences), change: '', changeType: 'neutral' as const, icon: Building2, iconColor: 'text-primary' },
    { title: translations.totalApartments, value: String(dashboardData.stats.totalApartments), change: '', changeType: 'neutral' as const, icon: Home, iconColor: 'text-secondary' },
    { title: translations.totalResidents, value: String(dashboardData.stats.totalResidents), change: '', changeType: 'neutral' as const, icon: Users, iconColor: 'text-accent' },
    { title: translations.occupancyRate, value: `${dashboardData.stats.occupancyRate}%`, change: '', changeType: 'neutral' as const, icon: TrendingUp, iconColor: 'text-success' },
  ] : []

  const recentActivity = dashboardData ? [
    ...dashboardData.recentPayments.slice(0, 3).map((p: any) => ({
      id: p.id,
      title: 'Paiement reçu',
      description: `${formatCurrency(p.amount)} - Appartement ${p.apartment}`,
      time: p.paidDate ? new Date(p.paidDate).toLocaleDateString('fr-FR') : '',
      icon: CreditCard,
      iconColor: 'text-primary'
    })),
    ...dashboardData.recentMaintenanceRequests.slice(0, 2).map((m: any) => ({
      id: m.id,
      title: m.title,
      description: `Appartement ${m.apartment} - ${m.status}`,
      time: new Date(m.createdAt).toLocaleDateString('fr-FR'),
      icon: Wrench,
      iconColor: 'text-warning'
    }))
  ] : []

  const topResidences = dashboardData ? dashboardData.topResidences.map((r: any) => ({
    name: r.name,
    units: r.units,
    occupancy: r.occupancy,
    revenue: r.revenue
  })) : []

  // Build pending tasks from real data
  const pendingTasks: Array<{id: string, title: string, type: string, priority: 'low' | 'medium' | 'high'}> = []

  // Add unpaid charges as pending tasks
  if (dashboardData?.stats?.unpaidCharges > 0) {
    pendingTasks.push({
      id: 'task-unpaid',
      title: `Suivre les charges impayées: ${formatCurrency(dashboardData.stats.unpaidCharges)}`,
      type: 'payment',
      priority: 'high'
    })
  }

  // Add open maintenance requests as pending tasks
  if (dashboardData?.stats?.openMaintenanceRequests > 0) {
    pendingTasks.push({
      id: 'task-maintenance',
      title: `${dashboardData.stats.openMaintenanceRequests} demande(s) de maintenance en attente`,
      type: 'maintenance',
      priority: 'medium'
    })
  }

  // Calculate financial summary from dashboard data
  const financialSummary = dashboardData ? {
    revenue: dashboardData.topResidences.reduce((sum: number, r: any) => sum + r.revenue, 0),
    expenses: dashboardData.stats.unpaidCharges || 0,
    netIncome: dashboardData.topResidences.reduce((sum: number, r: any) => sum + r.revenue, 0) - (dashboardData.stats.unpaidCharges || 0),
    unpaidCharges: dashboardData.stats.unpaidCharges
  } : { revenue: 0, expenses: 0, netIncome: 0, unpaidCharges: 0 }

  return (
    <DashboardLayout locale={locale} role="OWNER">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {translations.welcome}, {session.user.name} 👋
            </h1>
            <p className="text-text-secondary mt-1">{translations.overview}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
              PROPRIÉTAIRE
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <SectionCard 
              title={translations.recentActivity}
              action={
                <Link href={`/${locale}/owner/reports`} className="text-sm text-primary hover:underline flex items-center gap-1">
                  {translations.viewAll} <ArrowRight className="w-4 h-4" />
                </Link>
              }
            >
              <ActivityList items={recentActivity} />
            </SectionCard>
          </div>

          {/* Pending Tasks */}
          <div>
            <SectionCard title={translations.pendingTasks}>
              <div className="space-y-3">
                {pendingTasks.length > 0 ? (
                  pendingTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-elevated transition-colors">
                      <div className={`p-2 rounded-lg ${
                        task.priority === 'high' ? 'bg-error/10 text-error' :
                        task.priority === 'medium' ? 'bg-warning/10 text-warning' :
                        'bg-surface-elevated text-text-tertiary'
                      }`}>
                        {task.priority === 'high' ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : task.priority === 'medium' ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary">{task.title}</p>
                        <p className="text-xs text-text-tertiary mt-0.5 capitalize">{task.type}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg">
                    <div className="p-2 rounded-lg bg-success/10 text-success">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <p className="text-sm text-text-secondary">Aucune tâche en attente</p>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Top Residences & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard 
            title={translations.topResidences}
            action={
              <Link href={`/${locale}/owner/residences`} className="text-sm text-primary hover:underline flex items-center gap-1">
                {translations.viewAll} <ArrowRight className="w-4 h-4" />
              </Link>
            }
          >
            <div className="space-y-4">
              {topResidences.length > 0 ? (
                topResidences.map((residence: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-elevated transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{residence.name}</p>
                        <p className="text-sm text-text-tertiary">{residence.units} unités</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-text-primary">{formatCurrency(residence.revenue)}</p>
                      <p className="text-sm text-success">{residence.occupancy}% occupation</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  <Building2 className="w-12 h-12 mx-auto mb-2 text-text-tertiary" />
                  <p>Aucune résidence trouvée</p>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title={translations.quickActions}>
            <div className="grid grid-cols-2 gap-4">
              <Link href={`/${locale}/owner/subscription-requests`} className="block">
                <QuickActionCard
                  icon={FileText}
                  title="Demandes"
                  description="Voir les demandes d'abonnement"
                />
              </Link>
              <Link href={`/${locale}/owner/plans-management`} className="block">
                <QuickActionCard
                  icon={CreditCard}
                  title={translations.managePlans}
                  description="Gérer les plans tarifaires"
                />
              </Link>
              <Link href={`/${locale}/owner/admin-management`} className="block">
                <QuickActionCard
                  icon={UserCog}
                  title={translations.manageAdmins}
                  description="Gérer les administrateurs"
                />
              </Link>
              <Link href={`/${locale}/owner/subscriptions-management`} className="block">
                <QuickActionCard
                  icon={PaymentIcon}
                  title={translations.manageSubscriptions}
                  description="Voir les abonnements"
                />
              </Link>
              <Link href={`/${locale}/owner/activity-logs`} className="block">
                <QuickActionCard
                  icon={Activity}
                  title={translations.viewActivityLogs}
                  description="Historique des activités"
                />
              </Link>
              <Link href={`/${locale}/owner/settings`} className="block">
                <QuickActionCard
                  icon={Settings}
                  title={translations.settings}
                  description="Configurer le compte"
                />
              </Link>
            </div>
          </SectionCard>
        </div>

        {/* Financial Summary */}
        <SectionCard title={translations.financialSummary}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 bg-surface-elevated rounded-xl">
              <p className="text-sm text-text-secondary">{translations.revenue}</p>
              <p className="text-2xl font-bold text-success mt-1">{formatCurrency(financialSummary.revenue)}</p>
            </div>
            <div className="p-4 bg-surface-elevated rounded-xl">
              <p className="text-sm text-text-secondary">{translations.expenses}</p>
              <p className="text-2xl font-bold text-error mt-1">{formatCurrency(financialSummary.expenses)}</p>
            </div>
            <div className="p-4 bg-surface-elevated rounded-xl">
              <p className="text-sm text-text-secondary">{translations.netIncome}</p>
              <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(financialSummary.netIncome)}</p>
            </div>
            <div className="p-4 bg-surface-elevated rounded-xl">
              <p className="text-sm text-text-secondary">{translations.unpaidCharges}</p>
              <p className="text-2xl font-bold text-warning mt-1">{formatCurrency(financialSummary.unpaidCharges)}</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
