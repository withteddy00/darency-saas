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

  // Mock data for demonstration
  const stats = [
    { title: translations.apartments, value: '12', change: '100% occupés', changeType: 'positive' as const, icon: Building2, iconColor: 'text-primary' },
    { title: translations.residents, value: '28', change: '+5 ce mois', changeType: 'positive' as const, icon: Users, iconColor: 'text-secondary' },
    { title: translations.unpaidCharges, value: formatCurrency(4500), change: '3 en retard', changeType: 'negative' as const, icon: CreditCard, iconColor: 'text-warning' },
    { title: translations.pendingRequests, value: '5', change: '2 urgentes', changeType: 'negative' as const, icon: Wrench, iconColor: 'text-error' },
  ]

  const recentActivity = [
    { id: '1', title: 'Paiement validé', description: '2 500 DH - Appartement 204', time: 'Il y a 1h', icon: CreditCard, iconColor: 'text-success' },
    { id: '2', title: 'Nouveau résident', description: 'Youssef Amrani - Appartement 108', time: 'Il y a 3h', icon: Users, iconColor: 'text-primary' },
    { id: '3', title: 'Demande de maintenance', description: 'Fuite d\'eau - Appartement 305', time: 'Il y a 5h', icon: Wrench, iconColor: 'text-warning' },
    { id: '4', title: 'Charge mensuelle créée', description: 'Février 2026', time: 'Hier', icon: FileText, iconColor: 'text-secondary' },
  ]

  const pendingPayments = [
    { id: '1', resident: 'Ahmed Benali', apartment: 'Appartement 102', amount: 2500, dueDate: '15/02/2026', status: 'overdue' as const },
    { id: '2', resident: 'Fatima Zahra', apartment: 'Appartement 205', amount: 1800, dueDate: '20/02/2026', status: 'pending' as const },
    { id: '3', resident: 'Mohamed El Amrani', apartment: 'Appartement 301', amount: 3200, dueDate: '25/02/2026', status: 'pending' as const },
  ]

  const maintenanceBoard = [
    { id: '1', title: 'Fuite d\'eau dans la cuisine', apartment: 'Appartement 305', priority: 'high' as const, status: 'in_progress', date: 'Il y a 2h' },
    { id: '2', title: 'Climatisation ne fonctionne pas', apartment: 'Appartement 108', priority: 'medium' as const, status: 'pending', date: 'Hier' },
    { id: '3', title: 'Porte de garage cassée', apartment: 'Résidence', priority: 'high' as const, status: 'pending', date: 'Il y a 2 jours' },
  ]

  return (
    <DashboardLayout locale={locale} role="ADMIN">
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
            <span className="px-3 py-1 bg-secondary/10 text-secondary text-sm font-medium rounded-full">
              ADMINISTRATEUR
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
                <Link href={`/${locale}/dashboard/requests`} className="text-sm text-primary hover:underline flex items-center gap-1">
                  {translations.viewAll} <ArrowRight className="w-4 h-4" />
                </Link>
              }
            >
              <ActivityList items={recentActivity} />
            </SectionCard>
          </div>

          {/* Pending Payments */}
          <div>
            <SectionCard 
              title={translations.pendingPayments}
              action={
                <Link href={`/${locale}/dashboard/finances`} className="text-sm text-primary hover:underline flex items-center gap-1">
                  {translations.viewAll} <ArrowRight className="w-4 h-4" />
                </Link>
              }
            >
              <div className="space-y-3">
                {pendingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-elevated transition-colors">
                    <div>
                      <p className="font-medium text-text-primary">{payment.resident}</p>
                      <p className="text-sm text-text-tertiary">{payment.apartment}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-text-primary">{formatCurrency(payment.amount)}</p>
                      <p className={`text-xs ${payment.status === 'overdue' ? 'text-error' : 'text-warning'}`}>
                        {payment.status === 'overdue' ? 'En retard' : 'En attente'}
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
              <Link href={`/${locale}/dashboard/requests`} className="text-sm text-primary hover:underline flex items-center gap-1">
                {translations.viewAll} <ArrowRight className="w-4 h-4" />
              </Link>
            }
          >
            <div className="space-y-4">
              {maintenanceBoard.map((item) => (
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
