'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from '@/hooks/use-translations'
import { SubscriptionModal } from '@/components/subscription-modal'
import { LanguageSwitcher } from '@/components/language-switcher'

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

interface LandingPageClientProps {
  locale: string
}

/**
 * Client Component for Landing Page Interactivity
 * - Plan fetching
 * - Modal state
 * - Language switching
 * - All user interactions
 * 
 * Note: Translations are handled internally via useTranslations hook
 * to avoid passing functions from Server Components to Client Components
 */
export function LandingPageClient({ locale }: LandingPageClientProps) {
  // Use the translation hook internally - this works because
  // TranslationProvider wraps this component in the layout
  const t = useTranslations(locale)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

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

  const renderPrice = (plan: Plan, isYearly: boolean) => {
    if (isYearly && plan.yearlyPrice) {
      return {
        price: Math.round(plan.yearlyPrice / 12),
        period: t('landing.pricing.perMonth'),
        totalYearly: plan.yearlyPrice,
        savings: getYearlySavings(plan.monthlyPrice, plan.yearlyPrice)
      }
    }
    return {
      price: plan.monthlyPrice,
      period: t('landing.pricing.perMonth'),
      totalYearly: null,
      savings: 0
    }
  }

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Darency</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-primary transition-colors">{t('landing.nav.features')}</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary transition-colors">{t('landing.nav.pricing')}</a>
              <a href="#contact" className="text-gray-600 hover:text-primary transition-colors">{t('landing.nav.contact')}</a>
            </nav>

            <div className="flex items-center gap-4">
              <LanguageSwitcher currentLocale={locale} />
              
              <a
                href={`/${locale}/login`}
                className="text-gray-600 hover:text-primary font-medium transition-colors"
              >
                {t('landing.nav.login')}
              </a>
              <a
                href={`/${locale}/subscribe`}
                className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                {t('landing.nav.getStarted')}
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('landing.pricing.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('landing.pricing.subtitle')}
            </p>
          </div>

          {loadingPlans ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl p-8 ${
                    plan.isPopular ? 'ring-2 ring-primary shadow-xl' : 'border border-gray-200'
                  }`}
                >
                  {plan.isPopular && (
                    <span className="bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                      {t('landing.pricing.popular')}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mt-4">{plan.name}</h3>
                  <p className="text-gray-500 mt-2 text-sm">{plan.description}</p>
                  
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-gray-900">{renderPrice(plan, false).price}</span>
                    <span className="text-gray-500">{renderPrice(plan, false).period}</span>
                  </div>

                  {renderPrice(plan, false).savings > 0 && (
                    <span className="inline-block mt-2 text-sm text-green-600 font-medium">
                      {t('landing.pricing.save')} {renderPrice(plan, false).savings}%
                    </span>
                  )}

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePlanSelect(plan)}
                    className={`w-full mt-8 py-3 rounded-lg font-medium transition-colors ${
                      plan.isPopular
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {t('landing.pricing.choose')} {plan.name}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">D</span>
                </div>
                <span className="text-xl font-bold">Darency</span>
              </div>
              <p className="mt-4 text-white/60 text-sm">
                {t('landing.footer.tagline')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('landing.footer.product')}</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('landing.footer.company')}</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>

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
    </>
  )
}
