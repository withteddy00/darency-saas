'use client'

import { useState } from 'react'
import { useTranslations } from '@/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SettingsPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const t = useTranslations(locale)
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { key: 'profile', label: t('settings.profile'), icon: <UserIcon /> },
    { key: 'notifications', label: t('settings.notifications'), icon: <BellIcon /> },
    { key: 'language', label: t('settings.language'), icon: <GlobeIcon /> },
    { key: 'security', label: t('settings.security'), icon: <ShieldIcon /> },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('settings.title')}</h1>
        <p className="page-subtitle">{t('nav.profile')}</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === tab.key
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-surface-elevated'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.profile')}</CardTitle>
                <CardDescription>Gérez vos informations personnelles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">AM</span>
                  </div>
                  <div>
                    <Button variant="secondary" size="sm">Changer la photo</Button>
                    <p className="text-xs text-text-tertiary mt-1">JPG, PNG ou GIF. Max 2MB</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input label="Nom complet" defaultValue="Ahmed Mohammedi" />
                  <Input label="Email" type="email" defaultValue="ahmed.mohammedi@email.com" />
                  <Input label="Téléphone" type="tel" defaultValue="+212 6 12 34 56 78" />
                  <Input label="Fonction" defaultValue="Syndic" />
                </div>

                <div className="flex justify-end">
                  <Button>{t('common.save')}</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.notifications')}</CardTitle>
                <CardDescription>Gérez vos préférences de notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Nouvelles demandes de maintenance', description: 'Recevoir une notification pour chaque nouvelle demande' },
                  { label: 'Paiements reçus', description: 'Notifications lors des paiements' },
                  { label: 'Rappels de charges', description: 'Rappels pour les charges mensuelles' },
                  { label: 'Actualités et mises à jour', description: 'Dernières nouvelles de Darency' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl">
                    <div>
                      <p className="font-medium text-text-primary">{item.label}</p>
                      <p className="text-sm text-text-tertiary">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === 'language' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.language')}</CardTitle>
                <CardDescription>Choisissez votre langue préférée</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { code: 'fr', label: 'Français', flag: '🇫🇷' },
                  { code: 'ar', label: 'العربية', flag: '🇲🇦' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
                      locale === lang.code
                        ? 'bg-primary text-white'
                        : 'bg-surface-elevated hover:bg-surface-elevated/80'
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-medium">{lang.label}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.security')}</CardTitle>
                <CardDescription>Gérez la sécurité de votre compte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-surface-elevated rounded-xl">
                  <h4 className="font-medium text-text-primary mb-2">Mot de passe</h4>
                  <p className="text-sm text-text-tertiary mb-4">Dernière modification: Il y a 3 mois</p>
                  <Button variant="secondary" size="sm">Changer le mot de passe</Button>
                </div>

                <div className="p-4 bg-surface-elevated rounded-xl">
                  <h4 className="font-medium text-text-primary mb-2">Authentification à deux facteurs</h4>
                  <p className="text-sm text-text-tertiary mb-4">Ajoutez une couche de sécurité supplémentaire</p>
                  <Button variant="secondary" size="sm">Activer 2FA</Button>
                </div>

                <div className="p-4 bg-error/5 border border-error/20 rounded-xl">
                  <h4 className="font-medium text-error mb-2">Zone dangereuse</h4>
                  <p className="text-sm text-text-tertiary mb-4">La suppression de votre compte est irréversible</p>
                  <Button variant="danger" size="sm">Supprimer mon compte</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}
