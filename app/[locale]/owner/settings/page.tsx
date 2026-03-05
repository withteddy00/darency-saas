'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function OwnerSettingsPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const { data: session, status } = useSession()
  const router = useRouter()

  const translations = {
    fr: {
      title: 'Paramètres',
      subtitle: 'Configurez votre compte et votre organisation',
      profile: 'Profil',
      organization: 'Organisation',
      security: 'Sécurité',
      notifications: 'Notifications',
      name: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      organizationName: 'Nom de l\'organisation',
      address: 'Adresse',
      city: 'Ville',
      save: 'Enregistrer',
      changePassword: 'Changer le mot de passe',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
    },
    ar: {
      title: 'الإعدادات',
      subtitle: 'إعداد حسابك ومؤسستك',
      profile: 'الملف الشخصي',
      organization: 'المؤسسة',
      security: 'الأمان',
      notifications: 'الإشعارات',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      organizationName: 'اسم المؤسسة',
      address: 'العنوان',
      city: 'المدينة',
      save: 'حفظ',
      changePassword: 'تغيير كلمة المرور',
      currentPassword: 'كلمة المرور الحالية',
      newPassword: 'كلمة المرور الجديدة',
      confirmPassword: 'تأكيد كلمة المرور',
    }
  }

  const t = translations[locale as 'fr' | 'ar'] || translations.fr

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

  return (
    <div className={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="page-header">
        <h1 className="page-title">{t.title}</h1>
        <p className="page-subtitle">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t.profile}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label={t.name} defaultValue={session.user.name} />
            <Input label={t.email} defaultValue={session.user.email} type="email" />
            <Input label={t.phone} placeholder="+212 6XX XXX XXX" />
            <Button className="w-full">{t.save}</Button>
          </CardContent>
        </Card>

        {/* Organization Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t.organization}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label={t.organizationName} defaultValue={session.user.organizationName} />
            <Input label={t.address} placeholder="123 Avenue Mohammed V" />
            <Input label={t.city} placeholder="Casablanca" />
            <Button className="w-full">{t.save}</Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t.security}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label={t.currentPassword} type="password" />
            <Input label={t.newPassword} type="password" />
            <Input label={t.confirmPassword} type="password" />
            <Button className="w-full">{t.changePassword}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
