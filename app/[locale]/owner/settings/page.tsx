'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { User, Building2, Shield, Bell, Save, Lock, Mail, Phone } from 'lucide-react'

export default function OwnerSettingsPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: ''
  })
  
  const [orgForm, setOrgForm] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: ''
  })
  
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setProfileForm({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: ''
      })
      setOrgForm({
        name: session.user.organizationName || '',
        address: '',
        city: '',
        phone: '',
        email: ''
      })
    }
  }, [session, status])

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

  const handleSaveProfile = async () => {
    setIsSubmitting(true)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 500))
    setSuccessMessage('Profil enregistré avec succès')
    setIsSubmitting(false)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleSaveOrg = async () => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setSuccessMessage('Organisation mise à jour')
    setIsSubmitting(false)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleChangePassword = async () => {
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas')
      return
    }
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setSuccessMessage('Mot de passe changé avec succès')
    setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setIsSubmitting(false)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const translations = {
    fr: {
      title: 'Paramètres',
      subtitle: 'Configurez votre compte et votre organisation',
      profile: 'Profil',
      organization: 'Organisation',
      security: 'Sécurité',
      notifications: 'Notifications',
      name: 'Nom complet',
      email: 'Email',
      phone: 'Téléphone',
      organizationName: "Nom de l'organisation",
      address: 'Adresse',
      city: 'Ville',
      save: 'Enregistrer',
      changePassword: 'Changer le mot de passe',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      saved: 'Enregistré avec succès',
    },
    ar: {
      title: 'الإعدادات',
      subtitle: 'إعداد حسابك ومؤسستك',
      profile: 'الملف الشخصي',
      organization: 'المؤسسة',
      security: 'الأمان',
      notifications: 'الإشعارات',
      name: 'الاسم الكامل',
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
      saved: 'تم الحفظ بنجاح',
    }
  }

  const t = translations[locale as 'fr' | 'ar'] || translations.fr

  if (status === 'loading') {
    return (
      <div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'OWNER') {
    return null
  }

  const tabs = [
    { id: 'profile', label: t.profile, icon: User },
    { id: 'organization', label: t.organization, icon: Building2 },
    { id: 'security', label: t.security, icon: Shield },
  ]

    return (
      <div>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t.title}</h1>
            <p className="text-text-secondary mt-1">{t.subtitle}</p>
          </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-success/10 text-success rounded-lg border border-success/20">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 shrink-0">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-text-secondary hover:bg-surface-elevated'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t.profile}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.name}</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.email}</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.phone}</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary"
                      placeholder="+212 6XX XXX XXX"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={isSubmitting}>
                    <Save className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                    {isSubmitting ? '...' : t.save}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'organization' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {t.organization}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.organizationName}</label>
                    <input
                      type="text"
                      value={orgForm.name}
                      onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.address}</label>
                    <input
                      type="text"
                      value={orgForm.address}
                      onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.city}</label>
                    <input
                      type="text"
                      value={orgForm.city}
                      onChange={(e) => setOrgForm({ ...orgForm, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.phone}</label>
                    <input
                      type="tel"
                      value={orgForm.phone}
                      onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveOrg} disabled={isSubmitting}>
                    <Save className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                    {isSubmitting ? '...' : t.save}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {t.security}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.currentPassword}</label>
                    <input
                      type="password"
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.newPassword}</label>
                    <input
                      type="password"
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.confirmPassword}</label>
                    <input
                      type="password"
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleChangePassword} disabled={isSubmitting}>
                    <Lock className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                    {isSubmitting ? '...' : t.changePassword}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
        </div>
      </div>
    )
}
