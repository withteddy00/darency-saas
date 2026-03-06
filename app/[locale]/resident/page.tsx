'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { 
  Building2, 
  CreditCard, 
  Wrench, 
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Bell,
  Home,
  DollarSign,
  User
} from 'lucide-react'
import { DashboardLayout, StatCard, SectionCard, ActivityList, QuickActionCard } from '@/components/dashboard'
import { formatCurrency } from '@/lib/utils'

export default function ResidentDashboard({ params }: { params: { locale: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { locale } = params

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`)
    } else if (status === 'authenticated' && session?.user?.role !== 'RESIDENT') {
      if (session?.user?.role === 'OWNER') {
        router.push(`/${locale}/owner`)
      } else if (session?.user?.role === 'ADMIN') {
        router.push(`/${locale}/admin`)
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

  if (!session || session.user.role !== 'RESIDENT') {
    return null
  }

  const t = {
    fr: {
      welcome: 'Bienvenue',
      overview: 'Vue d\'ensemble',
      myApartment: 'Mon appartement',
      monthlyRent: 'Loyer mensuel',
      paymentStatus: 'Statut du paiement',
      unpaidAmount: 'Montant impayé',
      latestPayment: 'Dernier paiement',
      openRequests: 'Demandes ouvertes',
      myPayments: 'Mes paiements',
      myCharges: 'Mes charges',
      myRequests: 'Mes demandes',
      announcements: 'Annonces',
      documents: 'Documents',
      profile: 'Profil',
      quickActions: 'Actions rapides',
      viewAll: 'Voir tout',
      payNow: 'Payer maintenant',
      submitRequest: 'Soumettre une demande',
      viewDocuments: 'Voir mes documents',
      editProfile: 'Modifier mon profil',
      recentActivity: 'Activité récente',
      noUnpaid: 'Aucun montant impayé',
      paymentDue: 'Paiement dû',
      paymentOverdue: 'Paiement en retard',
    },
    ar: {
      welcome: 'مرحباً',
      overview: 'نظرة عامة',
      myApartment: 'شقتي',
      monthlyRent: 'الإيجار الشهري',
      paymentStatus: 'حالة الدفع',
      unpaidAmount: 'المبلغ غير المدفوع',
      latestPayment: 'آخر دفعة',
      openRequests: 'الطلبات المفتوحة',
      myPayments: 'مدفوعاتي',
      myCharges: 'رسومي',
      myRequests: 'طلباتي',
      announcements: 'الإعلانات',
      documents: 'المستندات',
      profile: 'الملف الشخصي',
      quickActions: 'إجراءات سريعة',
      viewAll: 'عرض الكل',
      payNow: 'ادفع الآن',
      submitRequest: 'تقديم طلب',
      viewDocuments: 'عرض مستنداتي',
      editProfile: 'تعديل ملفي',
      recentActivity: 'النشاط الأخير',
      noUnpaid: 'لا يوجد مبلغ مستحق',
      paymentDue: 'الدفع مستحق',
      paymentOverdue: 'الدفع متأخر',
    }
  }

  const translations = t[locale as 'fr' | 'ar'] || t.fr

  // Mock data
  const stats = [
    { title: translations.monthlyRent, value: formatCurrency(3500), change: 'Dû le 28/02', changeType: 'neutral' as const, icon: Home, iconColor: 'text-primary' },
    { title: translations.unpaidAmount, value: formatCurrency(0), change: translations.noUnpaid, changeType: 'positive' as const, icon: CreditCard, iconColor: 'text-success' },
    { title: translations.openRequests, value: '1', change: 'En cours', changeType: 'neutral' as const, icon: Wrench, iconColor: 'text-warning' },
  ]

  const recentActivity = [
    { id: '1', title: 'Paiement effectué', description: '3 500 DH - Janvier 2026', time: 'Il y a 5 jours', icon: CreditCard, iconColor: 'text-success' },
    { id: '2', title: 'Demande de maintenance', description: 'Réparation climatisation', time: 'Il y a 1 semaine', icon: Wrench, iconColor: 'text-warning' },
    { id: '3', title: 'Annonce publiée', description: 'Maintenance préventive', time: 'Il y a 2 semaines', icon: Bell, iconColor: 'text-primary' },
  ]

  const paymentHistory = [
    { id: '1', month: 'Janvier 2026', amount: 3500, status: 'paid' as const, date: '25/01/2026' },
    { id: '2', month: 'Décembre 2025', amount: 3500, status: 'paid' as const, date: '28/12/2025' },
    { id: '3', month: 'Novembre 2025', amount: 3500, status: 'paid' as const, date: '27/11/2025' },
  ]

  const maintenanceRequests = [
    { id: '1', title: 'Climatisation ne fonctionne pas', date: 'Il y a 3 jours', status: 'in_progress', priority: 'high' as const },
    { id: '2', title: 'Fuite dans la salle de bain', date: 'Il y a 2 semaines', status: 'completed', priority: 'medium' as const },
  ]

  const announcements = [
    { id: '1', title: 'Maintenance préventive', date: '15/02/2026', content: 'La maintenance des ascenseurs aura lieu...' },
    { id: '2', title: 'Réunion des résidents', date: '01/02/2026', content: 'Une réunion aura lieu le...' },
  ]

  return (
    <DashboardLayout locale={locale} role="RESIDENT">
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
            <span className="px-3 py-1 bg-success/10 text-success text-sm font-medium rounded-full">
              RÉSIDENT
            </span>
          </div>
        </div>

        {/* Apartment Info Banner */}
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">{translations.myApartment}</p>
              <p className="text-2xl font-bold mt-1">
                {session.user.apartmentNumber || 'A1'} - {session.user.residenceName || 'Résidence Al-Manar'}
              </p>
            </div>
            <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
              <Building2 className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            >
              <ActivityList items={recentActivity} />
            </SectionCard>
          </div>

          {/* Quick Actions */}
          <div>
            <SectionCard title={translations.quickActions}>
              <div className="space-y-3">
                <QuickActionCard
                  icon={DollarSign}
                  title={translations.payNow}
                  description="Payer votre loyer"
                />
                <QuickActionCard
                  icon={Wrench}
                  title={translations.submitRequest}
                  description="Signaler un problème"
                />
                <QuickActionCard
                  icon={FileText}
                  title={translations.viewDocuments}
                  description="Voir mes documents"
                />
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Payment History & Maintenance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard 
            title={translations.myPayments}
            action={
              <Link href={`/${locale}/resident/payments`} className="text-sm text-primary hover:underline flex items-center gap-1">
                {translations.viewAll} <ArrowRight className="w-4 h-4" />
              </Link>
            }
          >
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-elevated transition-colors">
                  <div>
                    <p className="font-medium text-text-primary">{payment.month}</p>
                    <p className="text-sm text-text-tertiary">{payment.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-text-primary">{formatCurrency(payment.amount)}</p>
                    <span className="px-2 py-1 text-xs rounded-full bg-success/10 text-success">
                      Payé
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard 
            title={translations.myRequests}
            action={
              <Link href={`/${locale}/resident/requests`} className="text-sm text-primary hover:underline flex items-center gap-1">
                {translations.viewAll} <ArrowRight className="w-4 h-4" />
              </Link>
            }
          >
            <div className="space-y-3">
              {maintenanceRequests.map((request) => (
                <div key={request.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-elevated transition-colors">
                  <div className={`p-2 rounded-lg ${
                    request.priority === 'high' ? 'bg-error/10 text-error' :
                    request.priority === 'medium' ? 'bg-warning/10 text-warning' :
                    'bg-surface-elevated text-text-tertiary'
                  }`}>
                    {request.status === 'in_progress' ? (
                      <Clock className="w-4 h-4" />
                    ) : request.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{request.title}</p>
                    <p className="text-sm text-text-tertiary">{request.date}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    request.status === 'in_progress' ? 'bg-primary/10 text-primary' :
                    request.status === 'completed' ? 'bg-success/10 text-success' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {request.status === 'in_progress' ? 'En cours' : 'Terminé'}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Announcements */}
        <SectionCard 
          title={translations.announcements}
          action={
            <Link href={`/${locale}/resident/announcements`} className="text-sm text-primary hover:underline flex items-center gap-1">
              {translations.viewAll} <ArrowRight className="w-4 h-4" />
            </Link>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="p-4 rounded-lg bg-surface-elevated hover:bg-border/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <span className="text-xs text-text-tertiary">{announcement.date}</span>
                </div>
                <h4 className="font-semibold text-text-primary">{announcement.title}</h4>
                <p className="text-sm text-text-secondary mt-1 line-clamp-2">{announcement.content}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
