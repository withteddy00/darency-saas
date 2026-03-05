'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">
              {locale === 'ar' ? 'لوحة تحكم المسؤول' : 'Dashboard Administrateur'}
            </h1>
            <p className="page-subtitle">
              {locale === 'ar' 
                ? `مرحباً، ${session.user.name}` 
                : `Bienvenue, ${session.user.name}`}
              👋
            </p>
          </div>
          <div className="badge badge-info">
            {locale === 'ar' ? 'مسؤول' : 'ADMINISTRATEUR'}
          </div>
        </div>
      </div>

      {/* Residence Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">
            {locale === 'ar' ? 'معلومات العقار' : 'Information de la résidence'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-secondary">
                {locale === 'ar' ? 'اسم العقار' : 'Nom de la résidence'}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary mb-1">
              {locale === 'ar' ? 'الشقق' : 'Appartements'}
            </p>
            <p className="text-3xl font-bold text-text-primary">3</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary mb-1">
              {locale === 'ar' ? 'المقيمين' : 'Résidents'}
            </p>
            <p className="text-3xl font-bold text-text-primary">1</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary mb-1">
              {locale === 'ar' ? 'الطلبات المعلقة' : 'Demandes en attente'}
            </p>
            <p className="text-3xl font-bold text-warning">2</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-secondary mb-1">
              {locale === 'ar' ? 'الإيرادات الشهرية' : 'Revenus mensuels'}
            </p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(13000)}</p>
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
            <Link
              href={`/${locale}/admin/residents`}
              className="flex flex-col items-center justify-center p-4 bg-surface-elevated rounded-xl hover:bg-primary-light/20 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-text-secondary group-hover:text-primary">
                {locale === 'ar' ? 'المقيمون' : 'Résidents'}
              </span>
            </Link>
            <Link
              href={`/${locale}/admin/requests`}
              className="flex flex-col items-center justify-center p-4 bg-surface-elevated rounded-xl hover:bg-primary-light/20 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <span className="text-sm font-medium text-text-secondary group-hover:text-primary">
                {locale === 'ar' ? 'الطلبات' : 'Demandes'}
              </span>
            </Link>
            <Link
              href={`/${locale}/admin/finances`}
              className="flex flex-col items-center justify-center p-4 bg-surface-elevated rounded-xl hover:bg-primary-light/20 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-text-secondary group-hover:text-primary">
                {locale === 'ar' ? 'المالية' : 'Finances'}
              </span>
            </Link>
            <Link
              href={`/${locale}/admin/settings`}
              className="flex flex-col items-center justify-center p-4 bg-surface-elevated rounded-xl hover:bg-primary-light/20 transition-colors group"
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
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
