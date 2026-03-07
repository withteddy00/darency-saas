'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Clock, CheckCircle, XCircle, AlertCircle, History } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SubscriptionRequest {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  residenceName: string
  city: string
  status: string
  createdAt: string
  activatedAt: string | null
  plan: {
    name: string
    price: number
  }
}

export default function OwnerAbonnementsPage({ params }: { params: { locale: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { locale } = params
  const [subscriptions, setSubscriptions] = useState<SubscriptionRequest[]>([])
  const [loading, setLoading] = useState(true)

  const t = {
    fr: {
      title: 'Mes abonnements',
      subtitle: 'Suivez l\'état de vos demandes d\'abonnement',
      noSubscriptions: 'Aucune demande d\'abonnement',
      noSubscriptionsMessage: 'Vous n\'avez pas encore de demandes d\'abonnement.',
      status: 'Statut',
      submittedOn: 'Soumis le',
      activatedOn: 'Activé le',
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      expired: 'Expiré',
      viewDetails: 'Voir les détails',
      history: 'Historique',
    },
    ar: {
      title: 'اشتراكاتي',
      subtitle: 'تتبع حالة طلبات الاشتراك الخاصة بك',
      noSubscriptions: 'لا توجد طلبات اشتراك',
      noSubscriptionsMessage: 'ليس لديك أي طلبات اشتراك بعد.',
      status: 'الحالة',
      submittedOn: 'تاريخ التقديم',
      activatedOn: 'تاريخ التفعيل',
      pending: 'قيد الانتظار',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
      expired: 'منتهي الصلاحية',
      viewDetails: 'عرض التفاصيل',
      history: 'السجل',
    }
  }

  const translations = t[locale as 'fr' | 'ar'] || t.fr

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`)
    } else if (status === 'authenticated' && session?.user?.role !== 'OWNER') {
      router.push(`/${locale}/`)
    }
  }, [status, session, router, locale])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'OWNER') {
      fetchSubscriptions()
    }
  }, [status, session])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/owner/subscriptions')
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      EXPIRED: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
    }
    
    const config = statusConfig[status] || statusConfig.PENDING
    const Icon = config.icon
    
    const statusLabels: Record<string, Record<string, string>> = {
      fr: { PENDING: 'En attente', APPROVED: 'Approuvé', REJECTED: 'Rejeté', EXPIRED: 'Expiré' },
      ar: { PENDING: 'قيد الانتظار', APPROVED: 'موافق عليه', REJECTED: 'مرفوض', EXPIRED: 'منتهي' },
    }
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {statusLabels[locale]?.[status] || status}
      </Badge>
    )
  }

  const getStatusCount = () => {
    return {
      total: subscriptions.length,
      pending: subscriptions.filter(s => s.status === 'PENDING').length,
      approved: subscriptions.filter(s => s.status === 'APPROVED').length,
      rejected: subscriptions.filter(s => s.status === 'REJECTED').length,
      expired: subscriptions.filter(s => s.status === 'EXPIRED').length,
    }
  }

  const counts = getStatusCount()

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

  return (
    <DashboardLayout locale={locale} role="OWNER">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{translations.title}</h1>
            <p className="text-text-secondary mt-1">{translations.subtitle}</p>
          </div>
        </div>

        {/* Status Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{counts.total}</p>
                <p className="text-sm text-text-secondary">{locale === 'ar' ? 'الإجمالي' : 'Total'}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{counts.pending}</p>
                <p className="text-sm text-text-secondary">{translations.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{counts.approved}</p>
                <p className="text-sm text-text-secondary">{translations.approved}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{counts.rejected + counts.expired}</p>
                <p className="text-sm text-text-secondary">{locale === 'ar' ? 'أخرى' : 'Autres'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription List */}
        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <History className="w-12 h-12 text-text-tertiary mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">{translations.noSubscriptions}</h3>
              <p className="text-text-secondary text-center">{translations.noSubscriptionsMessage}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {subscriptions.map((subscription) => (
              <Card key={subscription.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{subscription.residenceName}</h3>
                        {getStatusBadge(subscription.status)}
                      </div>
                      <p className="text-text-secondary">{subscription.plan.name} - {subscription.plan.price} DH{locale === 'ar' ? '/شهر' : '/mois'}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
                        <span>{subscription.firstName} {subscription.lastName}</span>
                        <span>•</span>
                        <span>{subscription.email}</span>
                        <span>•</span>
                        <span>{subscription.city}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-text-secondary">
                        {translations.submittedOn}: {new Date(subscription.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR')}
                      </p>
                      {subscription.activatedAt && (
                        <p className="text-sm text-text-secondary">
                          {translations.activatedOn}: {new Date(subscription.activatedAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
