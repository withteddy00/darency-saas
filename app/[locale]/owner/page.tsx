'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
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
  Clock
} from 'lucide-react'
import { DashboardLayout, StatCard, SectionCard, ActivityList, QuickActionCard } from '@/components/dashboard'
import { formatCurrency } from '@/lib/utils'

export default function OwnerDashboard({ params }: { params: { locale: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { locale } = params

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

  const t = {
    fr: {
      welcome: 'Bienvenue',
      overview: 'Vue d\'ensemble',
      totalResidences: 'Résidences',
      totalAdmins: 'Administrateurs',
      totalResidents: 'Résidents',
      unpaidCharges: 'Charges impayées',
      maintenanceRequests: 'Demandes de maintenance',
      occupancyRate: 'Taux d\'occupation',
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
    },
    ar: {
      welcome: 'مرحباً',
      overview: 'نظرة عامة',
      totalResidences: 'العقارات',
      totalAdmins: 'المسؤولون',
      totalResidents: 'المقيمون',
      unpaidCharges: 'الرسوم غير المدفوعة',
      maintenanceRequests: 'طلبات الصيانة',
      occupancyRate: 'معدل الإشغال',
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
    }
  }

  const translations = t[locale as 'fr' | 'ar'] || t.fr

  // Mock data for demonstration
  const stats = [
    { title: translations.totalResidences, value: '3', change: '+1 ce mois', changeType: 'positive' as const, icon: Building2, iconColor: 'text-primary' },
    { title: translations.totalAdmins, value: '1', change: 'Actif', changeType: 'neutral' as const, icon: Users, iconColor: 'text-secondary' },
    { title: translations.totalResidents, value: '12', change: '+3 ce mois', changeType: 'positive' as const, icon: Users, iconColor: 'text-accent' },
    { title: translations.unpaidCharges, value: formatCurrency(4500), change: '2 en retard', changeType: 'negative' as const, icon: CreditCard, iconColor: 'text-warning' },
  ]

  const recentActivity = [
    { id: '1', title: 'Nouveau résident enregistré', description: 'Ahmed Benali - Résidence Al-Manar', time: 'Il y a 2h', icon: Users, iconColor: 'text-success' },
    { id: '2', title: 'Paiement reçu', description: '2 500 DH - Mohamed Khatri', time: 'Il y a 5h', icon: CreditCard, iconColor: 'text-primary' },
    { id: '3', title: 'Demande de maintenance', description: 'Fuite d\'eau - Appartement 204', time: 'Hier', icon: Wrench, iconColor: 'text-warning' },
    { id: '4', title: 'Rapport mensuel généré', description: 'Janvier 2026', time: 'Il y a 2 jours', icon: TrendingUp, iconColor: 'text-secondary' },
  ]

  const topResidences = [
    { name: 'Résidence Al-Manar', units: 12, occupancy: 92, revenue: 15000 },
    { name: 'Résidence Les Oliviers', units: 8, occupancy: 100, revenue: 12000 },
    { name: 'Résidence Marina', units: 6, occupancy: 83, revenue: 9000 },
  ]

  const pendingTasks = [
    { id: '1', title: 'Valider le paiement de 2 500 DH', type: 'payment', priority: 'high' as const },
    { id: '2', title: 'Approuver la demande de maintenance #124', type: 'maintenance', priority: 'medium' as const },
    { id: '3', title: 'Mettre à jour les charges mensuelles', type: 'charge', priority: 'low' as const },
  ]

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
                {pendingTasks.map((task) => (
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
                ))}
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
              {topResidences.map((residence, index) => (
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
              ))}
            </div>
          </SectionCard>

          <SectionCard title={translations.quickActions}>
            <div className="grid grid-cols-2 gap-4">
              <QuickActionCard
                icon={Building2}
                title={translations.addResidence}
                description="Ajouter une nouvelle propriété"
              />
              <QuickActionCard
                icon={Users}
                title={translations.manageUsers}
                description="Gérer les utilisateurs"
              />
              <QuickActionCard
                icon={TrendingUp}
                title={translations.viewReports}
                description="Voir les statistiques"
              />
              <QuickActionCard
                icon={Wrench}
                title={translations.settings}
                description="Configurer le compte"
              />
            </div>
          </SectionCard>
        </div>

        {/* Financial Summary */}
        <SectionCard title={translations.financialSummary}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 bg-surface-elevated rounded-xl">
              <p className="text-sm text-text-secondary">{translations.revenue}</p>
              <p className="text-2xl font-bold text-success mt-1">{formatCurrency(36000)}</p>
            </div>
            <div className="p-4 bg-surface-elevated rounded-xl">
              <p className="text-sm text-text-secondary">{translations.expenses}</p>
              <p className="text-2xl font-bold text-error mt-1">{formatCurrency(8500)}</p>
            </div>
            <div className="p-4 bg-surface-elevated rounded-xl">
              <p className="text-sm text-text-secondary">{translations.netIncome}</p>
              <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(27500)}</p>
            </div>
            <div className="p-4 bg-surface-elevated rounded-xl">
              <p className="text-sm text-text-secondary">{translations.unpaidCharges}</p>
              <p className="text-2xl font-bold text-warning mt-1">{formatCurrency(4500)}</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
