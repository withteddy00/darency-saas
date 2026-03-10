'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from '@/hooks/use-translations'
import { Loader2, Check, Star } from 'lucide-react'

interface Plan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number | null
  features: string[]
  isPopular: boolean
}

export default function LandingPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const t = useTranslations(locale)
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)

  const toggleLanguage = (newLocale: string) => {
    window.location.href = `/${newLocale}`
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true)
      const response = await fetch('/api/public/plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans || [])
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoadingPlans(false)
    }
  }

  const getYearlySavings = (monthlyPrice: number, yearlyPrice: number | null) => {
    if (!yearlyPrice) return 0
    const monthlyEquivalent = yearlyPrice / 12
    const savings = monthlyPrice - monthlyEquivalent
    return Math.round((savings / monthlyPrice) * 100)
  }

  const features = [
    {
      key: 'buildings',
      icon: <BuildingsIcon />,
    },
    {
      key: 'residents',
      icon: <ResidentsIcon />,
    },
    {
      key: 'finances',
      icon: <FinancesIcon />,
    },
    {
      key: 'maintenance',
      icon: <MaintenanceIcon />,
    },
    {
      key: 'communication',
      icon: <CommunicationIcon />,
    },
    {
      key: 'reports',
      icon: <ReportsIcon />,
    },
  ]

  const stats = [
    { value: '500+', label: t('landing.stats.buildings') },
    { value: '25,000+', label: t('landing.stats.residents') },
    { value: '50,000+', label: t('landing.stats.requests') },
    { value: '99.9%', label: t('landing.stats.uptime') },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-xl">د</span>
              </div>
              <span className="font-heading font-bold text-xl text-text-primary">Darency</span>
            </Link>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-text-secondary hover:text-primary transition-colors">
                {t('landing.features.title')}
              </a>
              <a href="#pricing" className="text-text-secondary hover:text-primary transition-colors">
                {t('landing.cta.title').split('?')[0]}
              </a>
              <a href="#contact" className="text-text-secondary hover:text-primary transition-colors">
                {t('landing.footer.contact')}
              </a>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-elevated transition-colors"
                >
                  <GlobeIcon className="w-5 h-5 text-text-secondary" />
                  <span className="text-sm font-medium text-text-secondary uppercase">{locale}</span>
                </button>
                {isLangMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-surface rounded-lg shadow-card-hover border border-border py-1">
                    <button
                      onClick={() => toggleLanguage('fr')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-surface-elevated"
                    >
                      🇫🇷 Français
                    </button>
                    <button
                      onClick={() => toggleLanguage('ar')}
                      className="w-full px-4 py-2 text-right text-sm hover:bg-surface-elevated"
                    >
                      🇲🇦 العربية
                    </button>
                  </div>
                )}
              </div>

              <Link href={`/${locale}/login`} className="btn-ghost hidden sm:flex">
                {t('auth.login.title')}
              </Link>
              <Link href={`/${locale}/login`} className="btn-primary">
                {t('landing.hero.cta')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 pattern-dots opacity-50" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">{t('common.tagline')}</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold text-text-primary leading-tight mb-6 animate-slide-up">
              {t('landing.hero.title').split(' ').map((word, i) => 
                word === 'simplicité' || word === 'البساطة' ? (
                  <span key={i} className="text-gradient">{word} </span>
                ) : (
                  <span key={i}>{word} </span>
                )
              )}
            </h1>

            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-slide-up animate-stagger-1">
              {t('landing.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animate-stagger-2">
              <Link href={`/${locale}/login`} className="btn-primary text-lg px-8 py-4">
                {t('landing.hero.cta')}
                <ArrowRightIcon className="inline-block ml-2 w-5 h-5" />
              </Link>
              <Link href={`/${locale}/login`} className="btn-secondary text-lg px-8 py-4">
                {t('landing.hero.ctaSecondary')}
              </Link>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative animate-slide-up animate-stagger-3">
            <div className="bg-surface rounded-2xl shadow-card-hover border border-border overflow-hidden">
              <div className="h-8 bg-surface-elevated border-b border-border flex items-center gap-2 px-4">
                <div className="w-3 h-3 rounded-full bg-error/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <div className="p-6 grid grid-cols-4 gap-4">
                {/* Mock Dashboard */}
                <div className="col-span-3 grid grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-surface-elevated rounded-xl p-4 h-24 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <div className="col-span-1 bg-surface-elevated rounded-xl p-4 h-full min-h-[300px]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-elevated">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-text-primary mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.key}
                className="card group hover:border-primary/30 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {t(`landing.features.${feature.key}.title`)}
                </h3>
                <p className="text-text-secondary">
                  {t(`landing.features.${feature.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-text-primary mb-4">
              {t('landing.stats.title')}
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-5xl font-heading font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-text-secondary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-elevated">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-text-primary mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              {locale === 'fr' 
                ? 'Choisissez le plan qui correspond à vos besoins' 
                : locale === 'ar'
                ? 'اختر الخطة التي تناسب احتياجاتك'
                : 'Choose the plan that fits your needs'}
            </p>
          </div>

          {loadingPlans ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">
                {locale === 'fr' 
                  ? 'Aucun plan disponible pour le moment' 
                  : locale === 'ar'
                  ? 'لا توجد خطط متاحة حالياً'
                  : 'No plans available at the moment'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan) => {
                const savings = getYearlySavings(plan.monthlyPrice, plan.yearlyPrice)
                return (
                  <div 
                    key={plan.id}
                    className={`relative bg-surface rounded-2xl p-8 border transition-all hover:shadow-xl ${
                      plan.isPopular 
                        ? 'border-primary shadow-xl shadow-primary/10 transform md:-translate-y-2' 
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current" />
                        {locale === 'fr' ? 'Populaire' : locale === 'ar' ? 'شائع' : 'Popular'}
                      </div>
                    )}
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-text-primary mb-2">{plan.name}</h3>
                      <p className="text-text-secondary text-sm">{plan.description}</p>
                    </div>
                    <div className="text-center mb-6">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-text-primary">
                          {plan.monthlyPrice}
                        </span>
                        <span className="text-text-secondary ml-2">DH/{locale === 'fr' ? 'mois' : locale === 'ar' ? 'شهر' : 'mo'}</span>
                      </div>
                      {plan.yearlyPrice && (
                        <div className="mt-2">
                          <p className="text-text-primary font-medium">{plan.yearlyPrice.toLocaleString()} DH {locale === 'fr' ? 'annuel' : locale === 'ar' ? 'سنوي' : '/yr'}</p>
                          {savings > 0 && (
                            <p className="text-green-600 text-sm flex items-center justify-center gap-1">
                              <Check className="w-4 h-4" /> {locale === 'fr' ? 'Économie' : locale === 'ar' ? 'توفير' : 'Save'} {savings}%
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features?.slice(0, 5).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-text-secondary">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/${locale}/login`}
                      className={`block w-full py-3 px-6 rounded-xl font-semibold text-center transition-colors ${
                        plan.isPopular 
                          ? 'bg-primary text-white hover:bg-primary-dark' 
                          : 'bg-surface-elevated text-text-primary hover:bg-primary hover:text-white border border-border'
                      }`}
                    >
                      {locale === 'fr' ? 'Choisir ce plan' : locale === 'ar' ? 'اختر هذه الخطة' : 'Choose Plan'}
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary via-primary-dark to-secondary relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-10" />
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6">
            {t('landing.cta.title')}
          </h2>
          <p className="text-xl text-white/80 mb-10">
            {t('landing.cta.subtitle')}
          </p>
          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-semibold text-lg hover:bg-surface-elevated transition-colors"
          >
            {t('landing.cta.button')}
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text-primary text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <span className="text-white font-bold text-xl">د</span>
                </div>
                <span className="font-heading font-bold text-xl">Darency</span>
              </div>
              <p className="text-white/60 text-sm">
                {t('landing.footer.tagline')}
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">{t('landing.footer.product')}</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">{t('landing.footer.company')}</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">{t('landing.footer.legal')}</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.privacy')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.terms')}</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-center text-white/40 text-sm">
            {t('landing.footer.copyright')}
          </div>
        </div>
      </footer>
    </div>
  )
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  )
}

function BuildingsIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}

function ResidentsIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}

function FinancesIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function MaintenanceIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  )
}

function CommunicationIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

function ReportsIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}
