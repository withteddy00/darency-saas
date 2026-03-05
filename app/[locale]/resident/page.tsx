'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">
              {locale === 'ar' ? 'لوحة تحكم المقيم' : 'Dashboard Résident'}
            </h1>
            <p className="page-subtitle">
              {locale === 'ar' 
                ? `مرحباً، ${session.user.name}` 
                : `Bienvenue, ${session.user.name}`}
              👋
            </p>
          </div>
          <div className="badge badge-success">
            {locale === 'ar' ? 'مقيم' : 'RÉSIDENT'}
          </div>
        </div>
      </div>

      {/* Apartment Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">
            {locale === 'ar' ? 'معلومات الشقة' : 'Information de l\'appartement'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-text-secondary">
                {locale === 'ar' ? 'رقم الشقة' : 'Numéro d\'appartement'}
              </p>
              <p className="font-medium">{session.user.apartmentNumber || 'A1'}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">
                {locale === 'ar' ? 'العقار' : 'Résidence'}
              </p>
              <p className="font-medium">{session.user.residenceName || 'Résidence Al-Manar'}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">
                {locale === 'ar' ? 'المؤسسة' : 'Organisation'}
              </p>
              <p className="font-medium">{session.user.organizationName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary mb-1">
              {locale === 'ar' ? 'الإيجار الشهري' : 'Loyer mensuel'}
            </p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(3500)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary mb-1">
              {locale === 'ar' ? 'حالة الدفع' : 'Statut du paiement'}
            </p>
            <p className="text-3xl font-bold text-warning">
              {locale === 'ar' ? 'معلق' : 'En attente'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary mb-1">
              {locale === 'ar' ? 'طلبات الصيانة' : 'Demandes de maintenance'}
            </p>
            <p className="text-3xl font-bold text-text-primary">1</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>
            {locale === 'ar' ? 'إجراءات سريعة' : 'Actions rapides'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <a
              href={`/${locale}/resident/payment`}
              className="flex flex-col items-center justify-center p-4 bg-surface-elevated rounded-xl hover:bg-primary-light/20 transition-colors group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-text-secondary group-hover:text-primary">
                {locale === 'ar' ? 'الدفع' : 'Paiement'}
              </span>
            </a>
            <a
              href={`/${locale}/resident/requests`}
              className="flex flex-col items-center justify-center p-4 bg-surface-elevated rounded-xl hover:bg-primary-light/20 transition-colors group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-sm font-medium text-text-secondary group-hover:text-primary">
                {locale === 'ar' ? 'الطلبات' : 'Demandes'}
              </span>
            </a>
            <a
              href={`/${locale}/resident/documents`}
              className="flex flex-col items-center justify-center p-4 bg-surface-elevated rounded-xl hover:bg-primary-light/20 transition-colors group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-text-secondary group-hover:text-primary">
                {locale === 'ar' ? 'المستندات' : 'Documents'}
              </span>
            </a>
            <a
              href={`/${locale}/resident/settings`}
              className="flex flex-col items-center justify-center p-4 bg-surface-elevated rounded-xl hover:bg-primary-light/20 transition-colors group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-text-secondary group-hover:text-primary">
                {locale === 'ar' ? 'الإعدادات' : 'Paramètres'}
              </span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
