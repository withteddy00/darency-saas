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
  DollarSign,
  FileText,
  Bell
} from 'lucide-react'
import { DashboardLayout, StatCard, SectionCard, ActivityList, QuickActionCard } from '@/components/dashboard'
import { formatCurrency } from '@/lib/utils'

export default function AdminDashboard({ params }: { params: { locale: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { locale } = params
  
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`)
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      if (session?.user?.role === 'OWNER') {
        router.push(`/${locale}/owner`)
      } else if (session?.user?.role === 'RESIDENT') {
        router.push(`/${locale}/resident`)
      }
    }
  }, [status, session, router, locale])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchDashboard()
    }
  }, [status, session])

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  const t = {
    fr: {
      welcome: 'Bienvenue',
      overview: 'Vue d\'ensemble',
      apartments: 'Appartements',
      residents: 'Résidents',
      unpaidCharges: 'Charges impayées',
      pendingRequests: 'Demandes en attente',
      collectedPayments: 'Paiements collectés',
      openRequests: 'Demandes ouvertes',
      monthlyCollection: 'Taux de recouvrement',
      recentActivity: 'Activité récente',
      quickActions: 'Actions rapides',
      viewAll: 'Voir tout',
      pendingPayments: 'Paiements en attente',
      maintenanceBoard: 'Tableau de maintenance',
      announcements: 'Annonces',
      documents: 'Documents',
      recentActions: 'Actions récentes',
      validatePayment: 'Valider paiement',
      addResident: 'Ajouter résident',
      createAnnouncement: 'Créer annonce',
      viewDocuments: 'Voir documents',
    },
    ar: {
      welcome: 'مرحباً',
      overview: 'نظرة عامة',
      apartments: 'الشقق',
      residents: 'المقيمون',
      unpaidCharges: 'الرسوم غير المدفوعة',
      pendingRequests: 'الطلبات المعلقة',
      collectedPayments: 'المدفوعات المحصلة',
      openRequests: 'الطلبات المفتوحة',
      monthlyCollection: 'معدل التحصيل',
      recentActivity: 'النشاط الأخير',
      quickActions: 'إجراءات سريعة',
      viewAll: 'عرض الكل',
      pendingPayments: 'المدفوعات المعلقة',
      maintenanceBoard: 'لوحة الصيانة',
      announcements: 'الإعلانات',
      documents: 'المستندات',
      recentActions: 'الإجراءات الأخيرة',
      validatePayment: 'تحقق من الدفع',
      addResident: 'إضافة مقيم',
      createAnnouncement: 'إنشاء إعلان',
      viewDocuments: 'عرض المستندات',
    }
  }

  const translations = t[locale as 'fr' | 'ar'] || t.fr

  if (loading || !dashboardData) {
    return (
      <DashboardLayout locale={locale} role="ADMIN">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  const { residence, stats, recentPayments, recentMaintenanceRequests } = dashboardData

  const statCards = [
    { title: translations.apartments, value: stats.totalApartments.toString(), change: `${stats.occupancyRate}% occupés`, changeType: 'positive' as const, icon: Building2, iconColor: 'text-primary' },
    { title: translations.residents, value: stats.residentsCount.toString(), change: `${stats.occupiedApartments} occupés`, changeType: 'positive' as const, icon: Users, iconColor: 'text-secondary' },
    { title: translations.unpaidCharges, value: formatCurrency(stats.unpaidAmount), change: `${stats.unpaidCount} en attente`, changeType: 'negative' as const, icon: CreditCard, iconColor: 'text-warning' },
    { title: translations.pendingRequests, value: stats.openRequests.toString(), change: `${stats.inProgressRequests} en cours`, changeType: 'negative' as const, icon: Wrench, iconColor: 'text-error' },
  ]

  const activityItems: any[] = [
    ...(recentPayments || []).map((p: any) => ({
      id: p.id,
      title: 'Paiement validé',
      description: `${formatCurrency(p.amount)} - Appartement ${p.apartment}`,
      time: p.paidDate ? `Le ${new Date(p.paidDate).toLocaleDateString('fr-MA')}` : 'Récent',
      icon: CreditCard,
      iconColor: 'text-success'
    })),
    ...(recentMaintenanceRequests || []).map((m: any) => ({
      id: m.id,
      title: m.title,
      description: `Appartement ${m.apartment}`,
      time: new Date(m.createdAt).toLocaleDateString('fr-MA'),
      icon: Wrench,
      iconColor: 'text-warning'
    }))
  ].slice(0, 5)

  const pendingPaymentsList = (recentPayments || []).slice(0, 3).map((p: any) => ({
    id: p.id,
    resident: 'Résident',
    apartment: `Appartement ${p.apartment}`,
    amount: p.amount,
    dueDate: new Date().toLocaleDateString('fr-MA'),
    status: 'pending' as const
  }))

  const maintenanceItems = (recentMaintenanceRequests || []).slice(0, 3).map((m: any) => ({
    id: m.id,
    title: m.title,
    apartment: `Appartement ${m.apartment}`,
    priority: (m.priority || 'LOW').toLowerCase() as 'high' | 'medium' | 'low',
    status: (m.status || 'PENDING').toLowerCase().replace('_', '') as 'pending' | 'in_progress' | 'completed',
    date: new Date(m.createdAt).toLocaleDateString('fr-MA')
  }))

  return (
    <DashboardLayout locale={locale} role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {translations.welcome}, {session.user.name} 👋
            </h1>
            <p className="text-text-secondary mt-1">{residence?.name || translations.overview}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-secondary/10 text-secondary text-sm font-medium rounded-full">
              {residence?.city || 'ADMINISTRATEUR'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
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
                <Link href={`/${locale}/admin/requests`} className="text-sm text-primary hover:underline flex items-center gap-1">
                  {translations.viewAll} <ArrowRight className="w-4 h-4" />
                </Link>
              }
            >
              <ActivityList items={activityItems} />
            </SectionCard>
          </div>

          {/* Pending Payments */}
          <div>
            <SectionCard 
              title={translations.pendingPayments}
              action={
                <Link href={`/${locale}/admin/payments`} className="text-sm text-primary hover:underline flex items-center gap-1">
                  {translations.viewAll} <ArrowRight className="w-4 h-4" />
                </Link>
              }
            >
              <div className="space-y-3">
                {pendingPaymentsList.map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-elevated transition-colors">
                    <div>
                      <p className="font-medium text-text-primary">{payment.resident}</p>
                      <p className="text-sm text-text-tertiary">{payment.apartment}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-text-primary">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-warning">
                        En attente
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Maintenance Board & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard 
            title={translations.maintenanceBoard}
            action={
              <Link href={`/${locale}/admin/requests`} className="text-sm text-primary hover:underline flex items-center gap-1">
                {translations.viewAll} <ArrowRight className="w-4 h-4" />
              </Link>
            }
          >
            <div className="space-y-4">
              {maintenanceItems.map((item: any) => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-elevated transition-colors">
                  <div className={`p-2 rounded-lg ${
                    item.priority === 'high' ? 'bg-error/10 text-error' :
                    item.priority === 'medium' ? 'bg-warning/10 text-warning' :
                    'bg-surface-elevated text-text-tertiary'
                  }`}>
                    {item.priority === 'high' ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : item.priority === 'medium' ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{item.title}</p>
                    <p className="text-sm text-text-tertiary">{item.apartment} • {item.date}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.status === 'in_progress' ? 'bg-primary/10 text-primary' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {item.status === 'in_progress' ? 'En cours' : 'En attente'}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={translations.quickActions}>
            <div className="grid grid-cols-2 gap-4">
              <QuickActionCard
                icon={DollarSign}
                title={translations.validatePayment}
                description="Valider un paiement"
              />
              <QuickActionCard
                icon={Users}
                title={translations.addResident}
                description="Ajouter un résident"
              />
              <QuickActionCard
                icon={Bell}
                title={translations.createAnnouncement}
                description="Publier une annonce"
              />
              <QuickActionCard
                icon={FileText}
                title={translations.viewDocuments}
                description="Gérer les documents"
              />
            </div>
          </SectionCard>
        </div>

        {/* Financial Summary */}
        <SectionCard title={translations.collectedPayments}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 bg-surface-elevated rounded-xl">
              <p className="text-sm text-text-secondary">Ce mois</p>
              <p className="text-2xl font-bold text-success mt-1">{formatCurrency(28500)}</p>
              <p className="text-xs text-success mt-1">+12% vs mois dernier</p>
            </div>
            <div className="p-4 bg-surface-elevated rounded-xl">
              <p className="text-sm text-text-secondary">En attente</p>
              <p className="text-2xl font-bold text-warning mt-1">{formatCurrency(4500)}</p>
              <p className="text-xs text-text-tertiary mt-1">3 paiements en retard</p>
            </div>
            <div className="p-4 bg-surface-elevated rounded-xl">
              <p className="text-sm text-text-secondary">{translations.monthlyCollection}</p>
              <p className="text-2xl font-bold text-primary mt-1">86%</p>
              <p className="text-xs text-success mt-1">+5% vs mois dernier</p>
            </div>
            <div className="p-4 bg-surface-elevated rounded-xl">
              <p className="text-sm text-text-secondary">Total annuel</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{formatCurrency(342000)}</p>
              <p className="text-xs text-text-tertiary mt-1">Année 2026</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
