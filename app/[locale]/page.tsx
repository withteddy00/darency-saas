'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from '@/hooks/use-translations'
import { Loader2, Check, Star, Building2, Users, Shield, Crown, Home, Wrench, Bell, CreditCard, FileText, BarChart3, ArrowRight, Play } from 'lucide-react'
import { SubscriptionModal } from '@/components/subscription-modal'

interface Plan {
  id: string
  name: string
  slug: string
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  const toggleLanguage = (newLocale: string) => {
    window.location.href = `/${newLocale}`
  }

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan)
    setIsModalOpen(true)
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
      title: locale === 'fr' ? 'Gestion des résidences' : locale === 'ar' ? 'إدارة العقارات' : 'Residence Management',
      description: locale === 'fr' ? 'Gérez plusieurs résidences, immeubles et appartements depuis une seule plateforme centralisée.' : locale === 'ar' ? 'إدارة عدة عقارات ومبانٍ وشقق من منصة مركزية واحدة.' : 'Manage multiple residences, buildings, and apartments from a single centralized platform.'
    },
    {
      key: 'residents',
      icon: <ResidentsIcon />,
      title: locale === 'fr' ? 'Suivi des résidents' : locale === 'ar' ? 'تتبع المقيمين' : 'Resident Tracking',
      description: locale === 'fr' ? 'Gardez un registre précis de tous les résidents, leur historique et leurs coordonnées.' : locale === 'ar' ? 'احتفظ بسجل دقيق لجميع المقيمين وتفاصيلهم ومعلوماتهم.' : 'Keep accurate records of all residents, their history, and contact information.'
    },
    {
      key: 'finances',
      icon: <FinancesIcon />,
      title: locale === 'fr' ? 'Gestion financière' : locale === 'ar' ? 'الإدارة المالية' : 'Financial Management',
      description: locale === 'fr' ? 'Suivez les charges, les paiements et générez des rapports financiers détaillés.' : locale === 'ar' ? 'تتبع الرسوم والمدفوعات وأنشئ تقارير مالية مفصلة.' : 'Track charges, payments, and generate detailed financial reports.'
    },
    {
      key: 'maintenance',
      icon: <MaintenanceIcon />,
      title: locale === 'fr' ? 'Demandes de maintenance' : locale === 'ar' ? 'طلبات الصيانة' : 'Maintenance Requests',
      description: locale === 'fr' ? 'Gérez les demandes de maintenance des résidents avec un suivi complet.' : locale === 'ar' ? 'إدارة طلبات الصيانة من المقيمين مع متابعة شاملة.' : 'Manage resident maintenance requests with complete tracking.'
    },
    {
      key: 'communication',
      icon: <CommunicationIcon />,
      title: locale === 'fr' ? 'Communication' : locale === 'ar' ? 'التواصل' : 'Communication',
      description: locale === 'fr' ? 'Envoyez des annonces et communiquez facilement avec tous les résidents.' : locale === 'ar' ? 'أرسل الإعلانات وتواصل بسهولة مع جميع المقيمين.' : 'Send announcements and easily communicate with all residents.'
    },
    {
      key: 'reports',
      icon: <ReportsIcon />,
      title: locale === 'fr' ? 'Rapports analytics' : locale === 'ar' ? 'تقارير تحليلية' : 'Analytics Reports',
      description: locale === 'fr' ? 'Accédez à des tableaux de bord analytics et des rapports détaillés.' : locale === 'ar' ? 'الوصول إلى لوحات المعلومات والتحارير المفصلة.' : 'Access analytics dashboards and detailed reports.'
    },
  ]

  // Role definitions for the roles section
  const roles = [
    {
      key: 'owner',
      icon: Crown,
      color: 'bg-gradient-to-br from-amber-500 to-orange-600',
      title: locale === 'fr' ? 'Propriétaire' : locale === 'ar' ? 'المالك' : 'Owner',
      description: locale === 'fr' 
        ? 'Paissez gérer l\'ensemble de la plateforme. Accédez aux statistiques globales, gérez les organisations, les plans et surveillez l\'activité.' 
        : locale === 'ar' 
        ? 'قم بإدارة المنصة بالكامل. الوصول إلى الإحصائيات العالمية وإدارة الخطط ومراقبة النشاط.'
        : 'Manage the entire platform. Access global statistics, manage organizations, plans, and monitor activity.',
      features: [
        locale === 'fr' ? 'Tableau de bord global' : locale === 'ar' ? 'لوحة القيادة العالمية' : 'Global dashboard',
        locale === 'fr' ? 'Gestion des organisations' : locale === 'ar' ? 'إدارة المنظمات' : 'Organization management',
        locale === 'fr' ? 'Gestion des plans tarifaires' : locale === 'ar' ? 'إدارة الخطط التسعيرية' : 'Plan management',
        locale === 'fr' ? 'Suivi des abonnements' : locale === 'ar' ? 'تتبع الاشتراكات' : 'Subscription tracking',
        locale === 'fr' ? 'Rapports financiers globaux' : locale === 'ar' ? 'التقارير المالية العالمية' : 'Global financial reports',
      ]
    },
    {
      key: 'admin',
      icon: Shield,
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      title: locale === 'fr' ? 'Administrateur (Syndic)' : locale === 'ar' ? 'المسؤول (المُ syndic)' : 'Administrator (Syndic)',
      description: locale === 'fr' 
        ? 'Gérez une résidence spécifique. Coordonnées, résidents, charges, paiements et demandes de maintenance.' 
        : locale === 'ar' 
        ? 'إدارة عقار معين. التنسيق والمقيمين والرسوم والمدفوعات وطلبات الصيانة.'
        : 'Manage a specific residence. Coordinate residents, charges, payments, and maintenance requests.',
      features: [
        locale === 'fr' ? 'Gestion d\'une résidence' : locale === 'ar' ? 'إدارة العقار' : 'Residence management',
        locale === 'fr' ? 'Gestion des appartements' : locale === 'ar' ? 'إدارة الشقق' : 'Apartment management',
        locale === 'fr' ? 'Suivi des paiements' : locale === 'ar' ? 'تتبع المدفوعات' : 'Payment tracking',
        locale === 'fr' ? 'Demandes de maintenance' : locale === 'ar' ? 'طلبات الصيانة' : 'Maintenance requests',
        locale === 'fr' ? 'Annonces aux résidents' : locale === 'ar' ? 'إعلانات للمقيمين' : 'Resident announcements',
      ]
    },
    {
      key: 'resident',
      icon: Home,
      color: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      title: locale === 'fr' ? 'Résident' : locale === 'ar' ? 'المقيم' : 'Resident',
      description: locale === 'fr' 
        ? 'Accédez à votre espace personnel. Consultez vos charges, effectuez vos paiements et soumettez des demandes.' 
        : locale === 'ar' 
        ? 'الوصول إلى مساحتك الشخصية. عرض الرسوم وتقديم الطلبات.'
        : 'Access your personal space. View charges, make payments, and submit requests.',
      features: [
        locale === 'fr' ? 'Consultation des charges' : locale === 'ar' ? 'عرض الرسوم' : 'View charges',
        locale === 'fr' ? 'Paiements en ligne' : locale === 'ar' ? 'الدفع عبر الإنترنت' : 'Online payments',
        locale === 'fr' ? 'Demandes de maintenance' : locale === 'ar' ? 'طلبات الصيانة' : 'Maintenance requests',
        locale === 'fr' ? 'Consultation des annonces' : locale === 'ar' ? 'عرض الإعلانات' : 'View announcements',
        locale === 'fr' ? 'Espace documentaire' : locale === 'ar' ? 'مساحة المستندات' : 'Document space',
      ]
    },
  ]

  const stats = [
    { value: '500+', label: locale === 'fr' ? 'Résidences' : locale === 'ar' ? 'عقار' : 'Residences', icon: Building2 },
    { value: '25,000+', label: locale === 'fr' ? 'Résident(s)' : locale === 'ar' ? 'مقيم' : 'Residents', icon: Users },
    { value: '50,000+', label: locale === 'fr' ? 'Demandes' : locale === 'ar' ? 'طلبات' : 'Requests', icon: Wrench },
    { value: '99.9%', label: locale === 'fr' ? 'Disponibilité' : locale === 'ar' ? 'التوفر' : 'Uptime', icon: BarChart3 },
  ]

  const benefits = [
    {
      key: 'efficiency',
      title: locale === 'fr' ? 'Gain de temps' : locale === 'ar' ? 'توفير الوقت' : 'Time Savings',
      description: locale === 'fr' ? 'Automatisez les tâches récurrentes et concentrez-vous sur l\'essentiel.' : locale === 'ar' ? 'أتمتة المهام المتكررة والتركيز على'essentiel.' : 'Automate recurring tasks and focus on what matters.',
    },
    {
      key: 'transparency',
      title: locale === 'fr' ? 'Transparence totale' : locale === 'ar' ? 'الشفافية التامة' : 'Total Transparency',
      description: locale === 'fr' ? 'Tous les résidents ont accès à leurs informations en temps réel.' : locale === 'ar' ? 'جميع المقيمين يمكنهم الوصول إلى معلوماتهم في الوقت الفعلي.' : 'All residents have access to their information in real-time.',
    },
    {
      key: 'security',
      title: locale === 'fr' ? 'Sécurisé' : locale === 'ar' ? 'آمن' : 'Secure',
      description: locale === 'fr' ? 'Vos données sont protégées avec les derniers standards de sécurité.' : locale === 'ar' ? 'بياناتك محمية بأحدث معايير الأمان.' : 'Your data is protected with the latest security standards.',
    },
    {
      key: 'support',
      title: locale === 'fr' ? 'Support réactif' : locale === 'ar' ? 'دعم سريع الاستجابة' : 'Responsive Support',
      description: locale === 'fr' ? 'Notre équipe est disponible pour vous accompagner.' : locale === 'ar' ? 'فريقنا متاح لمساعدتك.' : 'Our team is available to help you.',
    },
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
                {locale === 'fr' ? 'Fonctionnalités' : locale === 'ar' ? 'المميزات' : 'Features'}
              </a>
              <a href="#roles" className="text-text-secondary hover:text-primary transition-colors">
                {locale === 'fr' ? 'Rôles' : locale === 'ar' ? 'الأدوار' : 'Roles'}
              </a>
              <a href="#pricing" className="text-text-secondary hover:text-primary transition-colors">
                {locale === 'fr' ? 'Tarifs' : locale === 'ar' ? 'الأسعار' : 'Pricing'}
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

            <Link href={`/${locale}/login`} className="btn-ghost hidden sm:flex items-center gap-2">
                <Play className="w-4 h-4" />
                {locale === 'fr' ? 'Démo' : locale === 'ar' ? 'تجربة' : 'Demo'}
              </Link>
              <Link href={`/${locale}/login`} className="btn-primary">
                {t('auth.login.title')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">{t('common.tagline')}</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold text-text-primary leading-tight mb-6 animate-slide-up">
              {locale === 'fr' ? (
                <>
                  La gestion simplifiée{' '}
                  <span className="text-gradient">des résidences</span>{' '}
                  au Maroc
                </>
              ) : locale === 'ar' ? (
                <>
                  إدارة العقارات{' '}
                  <span className="text-gradient">المبسطة</span>{' '}
                  في المغرب
                </>
              ) : (
                <>
                  Simplified{' '}
                  <span className="text-gradient">residence management</span>{' '}
                  in Morocco
                </>
              )}
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-slide-up animate-stagger-1">
              {locale === 'fr' ? (
                <>
                  Darency est la plateforme tout-en-un pour gérer vos résidences, 
                  suivre les paiements et communiquer avec vos résidents en toute simplicité.
                </>
              ) : locale === 'ar' ? (
                <>
                  ديرانسي هي المنصة الشاملة لإدارة عقاراتك وتتبع المدفوعات 
                  والتواصل مع مقيميكن بسهولة.
                </>
              ) : (
                <>
                  Darency is the all-in-one platform to manage your residences, 
                  track payments, and communicate with your residents with ease.
                </>
              )}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animate-stagger-2">
              <Link href={`/${locale}/subscribe`} className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
                {locale === 'fr' ? 'Commencer gratuitement' : locale === 'ar' ? 'ابدأ مجاناً' : 'Start Free'}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href={`/${locale}/login`} className="btn-secondary text-lg px-8 py-4 flex items-center gap-2">
                <Play className="w-5 h-5" />
                {locale === 'fr' ? 'Voir la démo' : locale === 'ar' ? 'مشاهدة العرض' : 'Watch Demo'}
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 animate-slide-up animate-stagger-3">
              <div className="flex items-center gap-2 text-text-tertiary">
                <Check className="w-5 h-5 text-success" />
                <span className="text-sm">{locale === 'fr' ? 'Essai gratuit de 14 jours' : locale === 'ar' ? 'تجربة مجانية 14 يوم' : '14-day free trial'}</span>
              </div>
              <div className="flex items-center gap-2 text-text-tertiary">
                <Check className="w-5 h-5 text-success" />
                <span className="text-sm">{locale === 'fr' ? 'Sans engagement' : locale === 'ar' ? 'بدون التزام' : 'No commitment'}</span>
              </div>
              <div className="flex items-center gap-2 text-text-tertiary">
                <Check className="w-5 h-5 text-success" />
                <span className="text-sm">{locale === 'fr' ? 'Annulable à tout moment' : locale === 'ar' ? 'الإلغاء في أي وقت' : 'Cancel anytime'}</span>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative animate-slide-up animate-stagger-3">
            <div className="bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden">
              <div className="h-10 bg-surface-elevated border-b border-border flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-error/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex items-center gap-2 text-text-tertiary text-sm">
                  <Building2 className="w-4 h-4" />
                  <span>Darency Dashboard</span>
                </div>
              </div>
              <div className="p-6 grid grid-cols-4 gap-4">
                {/* Mock Dashboard */}
                <div className="col-span-3 grid grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-surface-elevated rounded-xl p-4 h-28 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <div className="col-span-1 bg-surface-elevated rounded-xl p-4 h-full min-h-[300px]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-elevated">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-text-primary mb-4">
              {locale === 'fr' ? 'Tout ce dont vous avez besoin' : locale === 'ar' ? 'كل ما تحتاجه' : 'Everything You Need'}
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              {locale === 'fr' 
                ? 'Une suite complète d\'outils pour gérer votre propriété efficacement.' 
                : locale === 'ar' 
                ? 'مجموعة شاملة من الأدوات لإدارة عقارك بكفاءة.' 
                : 'A complete suite of tools to manage your property efficiently.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.key}
                className="card group hover:border-primary/30 transition-all duration-300 animate-slide-up p-6"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits / Why Choose Us */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-text-primary mb-4">
              {locale === 'fr' ? 'Pourquoi choisir Darency ?' : locale === 'ar' ? 'لماذا تختار ديرانسي؟' : 'Why Choose Darency?'}
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              {locale === 'fr' 
                ? 'Les avantages qui font de Darency la meilleure solution pour la gestion résidentielle.' 
                : locale === 'ar' 
                ? 'المزايا التي تجعل ديرانسي أفضل حل لإدارة العقارات.' 
                : 'The benefits that make Darency the best solution for residential management.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.key}
                className="text-center p-6 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {benefit.title}
                </h3>
                <p className="text-text-secondary">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary via-primary-dark to-secondary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 pattern-dots opacity-10" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-white mb-4">
              {locale === 'fr' ? 'Des résultats prouvés' : locale === 'ar' ? 'نتائج مثبتة' : 'Proven Results'}
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              {locale === 'fr' 
                ? 'Rejoignez les centaines de résidences qui font confiance à Darency.' 
                : locale === 'ar' 
                ? 'انضم إلى مئات العقارات التي تثق بديرانسي.' 
                : 'Join the hundreds of residences that trust Darency.'}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl font-heading font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-elevated">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-text-primary mb-4">
              {locale === 'fr' ? 'Trois rôles pour une solution complète' : locale === 'ar' ? 'ثلاثة أدوار لحل شامل' : 'Three Roles for a Complete Solution'}
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              {locale === 'fr' 
                ? 'Darency s\'adapte aux besoins de chaque utilisateur.' 
                : locale === 'ar' 
                ? 'ديرانسي تتكيف مع احتياجات كل مستخدم.' 
                : 'Darency adapts to the needs of each user.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <div
                key={role.key}
                className="card group hover:border-primary/30 transition-all duration-300 animate-slide-up overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Role Header */}
                <div className={`${role.color} p-6 text-white`}>
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                    <role.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{role.title}</h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {role.description}
                  </p>
                </div>
                
                {/* Role Features */}
                <div className="p-6">
                  <ul className="space-y-3">
                    {role.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-success" />
                        </div>
                        <span className="text-text-secondary text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    href={`/${locale}/login`}
                    className="mt-6 flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-surface-elevated text-text-primary font-medium hover:bg-primary hover:text-white transition-colors"
                  >
                    {locale === 'fr' ? 'Essayer' : locale === 'ar' ? 'جرب' : 'Try'}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-text-primary mb-4">
              {locale === 'fr' ? 'Tarifs simples et transparents' : locale === 'ar' ? 'أسعار بسيطة وشفافة' : 'Simple and Transparent Pricing'}
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              {locale === 'fr' 
                ? 'Choisissez le plan qui correspond à vos besoins. Sans frais cachés.' 
                : locale === 'ar'
                ? 'اختر الخطة التي تناسب احتياجاتك. بدون رسوم خفية.'
                : 'Choose the plan that fits your needs. No hidden fees.'}
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
                        <span className="text-5xl font-bold text-text-primary">
                          {plan.monthlyPrice}
                        </span>
                        <span className="text-text-secondary ml-2">DH<span className="text-sm">/{locale === 'fr' ? 'mois' : locale === 'ar' ? 'شهر' : 'mo'}</span></span>
                      </div>
                      {plan.yearlyPrice && (
                        <div className="mt-3">
                          <p className="text-text-primary font-medium">{plan.yearlyPrice.toLocaleString()} DH <span className="text-sm">{locale === 'fr' ? 'par an' : locale === 'ar' ? 'سنوي' : '/yr'}</span></p>
                          {savings > 0 && (
                            <p className="text-green-600 text-sm flex items-center justify-center gap-1 mt-1">
                              <Check className="w-4 h-4" /> {locale === 'fr' ? 'Économie' : locale === 'ar' ? 'توفير' : 'Save'} {savings}%
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features?.slice(0, 5).map((feature, index) => (
                        <li key={index} className="flex items-start gap-3 text-text-secondary">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handlePlanSelect(plan)}
                      className={`block w-full py-4 px-6 rounded-xl font-semibold text-center transition-colors cursor-pointer ${
                        plan.isPopular 
                          ? 'bg-primary text-white hover:bg-primary-dark' 
                          : 'bg-surface-elevated text-text-primary hover:bg-primary hover:text-white border border-border'
                      }`}
                    >
                      {locale === 'fr' ? 'Commencer maintenant' : locale === 'ar' ? 'ابدأ الآن' : 'Get Started'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary via-primary-dark to-secondary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 pattern-dots opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6">
            {locale === 'fr' ? 'Prêt à simplifier la gestion de vos résidences ?' : locale === 'ar' ? 'هل أنت مستعد لتبسيط إدارة عقاراتك؟' : 'Ready to simplify your residence management?'}
          </h2>
          <p className="text-xl text-white/80 mb-10">
            {locale === 'fr' 
              ? 'Rejoignez des centaines de gestionnaires qui font confiance à Darency.' 
              : locale === 'ar'
              ? 'انضم إلى مئات المديرين الذين يثقون بديرانسي.'
              : 'Join hundreds of managers who trust Darency.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${locale}/subscribe`}
              className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-semibold text-lg hover:bg-surface-elevated transition-colors"
            >
              {locale === 'fr' ? 'Essai gratuit de 14 jours' : locale === 'ar' ? 'تجربة مجانية 14 يوم' : '14-Day Free Trial'}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              <Play className="w-5 h-5" />
              {locale === 'fr' ? 'Voir la démo' : locale === 'ar' ? 'مشاهدة العرض' : 'Watch Demo'}
            </Link>
          </div>
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

      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false)
          setSelectedPlan(null)
        }}
        plan={selectedPlan}
        locale={locale}
      />
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
