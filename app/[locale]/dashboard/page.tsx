'use client'

import Link from 'next/link'
import { useTranslations } from '@/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

// Mock data
const stats = [
  { key: 'buildings', value: 12, change: '+2', changeType: 'positive' },
  { key: 'residents', value: 248, change: '+18', changeType: 'positive' },
  { key: 'pendingRequests', value: 7, change: '-3', changeType: 'positive' },
  { key: 'monthlyRevenue', value: 124500, change: '+12%', changeType: 'positive', isCurrency: true },
]

const recentRequests = [
  { id: 1, title: 'Fuite d\'eau dans l\'appartement B4', status: 'pending', priority: 'high', building: 'Résidence Al-Manar' },
  { id: 2, title: 'Panne d\'ascenseur', status: 'in_progress', priority: 'urgent', building: 'Résidence Assa' },
  { id: 3, title: 'Réparation éclairage hall', status: 'completed', priority: 'low', building: 'Résidence Oasis' },
  { id: 4, title: 'Maintenance climatisation', status: 'pending', priority: 'medium', building: 'Résidence Al-Manar' },
]

const upcomingPayments = [
  { id: 1, resident: 'Mohamed Rachidi', apartment: 'A12', amount: 2500, dueDate: '05/03/2026' },
  { id: 2, resident: 'Fatima Zahra', apartment: 'B8', amount: 3200, dueDate: '07/03/2026' },
  { id: 3, resident: 'Ahmed Kaddouri', apartment: 'C3', amount: 2800, dueDate: '10/03/2026' },
]

const recentActivity = [
  { id: 1, action: 'Nouveau résident ajouté', user: 'Admin', building: 'Résidence Al-Manar', time: 'Il y a 2h' },
  { id: 2, action: 'Paiement reçu', user: 'Ahmed M.', building: 'Résidence Assa', time: 'Il y a 4h' },
  { id: 3, action: 'Demande traitée', user: 'Admin', building: 'Résidence Oasis', time: 'Il y a 6h' },
  { id: 4, action: 'Dépense enregistrée', user: 'Admin', building: 'Résidence Al-Manar', time: 'Hier' },
]

export default function DashboardPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const t = useTranslations(locale)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'badge-warning'
      case 'in_progress': return 'badge-info'
      case 'completed': return 'badge-success'
      case 'cancelled': return 'badge-error'
      default: return 'badge-info'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-error'
      case 'high': return 'text-warning'
      case 'medium': return 'text-info'
      case 'low': return 'text-text-tertiary'
      default: return 'text-text-secondary'
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('dashboard.overview')}</h1>
        <p className="page-subtitle">{t('dashboard.welcome')} 👋</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={stat.key} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">{t(`dashboard.stats.${stat.key}`)}</p>
                  <p className="text-3xl font-bold text-text-primary">
                    {stat.isCurrency ? formatCurrency(stat.value) : stat.value}
                  </p>
                </div>
                <div className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-success' : 'text-error'}`}>
                  {stat.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>{t('dashboard.recentRequests.title')}</CardTitle>
            <Link href={`/${locale}/dashboard/requests`} className="text-sm text-primary hover:underline">
              {t('dashboard.recentRequests.viewAll')}
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${request.priority === 'urgent' ? 'bg-error' : request.priority === 'high' ? 'bg-warning' : 'bg-success'}`} />
                    <div>
                      <p className="font-medium text-text-primary">{request.title}</p>
                      <p className="text-sm text-text-tertiary">{request.building}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={getPriorityColor(request.priority)}>
                      {t(`requests.priority.${request.priority}`)}
                    </span>
                    <span className={getStatusColor(request.status)}>
                      {t(`requests.status.${request.status}`)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('dashboard.upcomingPayments.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-surface-elevated rounded-xl">
                  <div>
                    <p className="font-medium text-text-primary text-sm">{payment.resident}</p>
                    <p className="text-xs text-text-tertiary">{payment.apartment} • {payment.dueDate}</p>
                  </div>
                  <p className="font-semibold text-primary">{formatCurrency(payment.amount)}</p>
                </div>
              ))}
            </div>
            <Link 
              href={`/${locale}/dashboard/finances`} 
              className="block mt-4 text-center text-sm text-primary hover:underline"
            >
              {t('common.viewAll')}
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-4 bg-surface-elevated rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <ActivityIcon className="w-5 h-5 text-primary" />
                  <span className="font-medium text-text-primary text-sm">{activity.action}</span>
                </div>
                <p className="text-xs text-text-tertiary">{activity.building}</p>
                <p className="text-xs text-text-tertiary">{activity.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle>{t('dashboard.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { key: 'add', label: t('buildings.add'), icon: <PlusIcon />, href: `/${locale}/dashboard/buildings` },
              { key: 'residents', label: t('residents.add'), icon: <UserPlusIcon />, href: `/${locale}/dashboard/residents` },
              { key: 'expense', label: t('finances.addExpense'), icon: <ReceiptIcon />, href: `/${locale}/dashboard/finances` },
              { key: 'request', label: t('requests.add'), icon: <TicketIcon />, href: `/${locale}/dashboard/requests` },
            ].map((action) => (
              <Link
                key={action.key}
                href={action.href}
                className="flex flex-col items-center justify-center p-4 bg-surface-elevated rounded-xl hover:bg-primary-light/20 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-text-secondary group-hover:text-primary transition-colors">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function UserPlusIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  )
}

function ReceiptIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
    </svg>
  )
}

function TicketIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  )
}
