'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, ArrowRight, Info } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface Plan {
  id: string
  name: string
  slug: string
  description: string
  price: number
  yearlyPrice: number | null
  maxResidences: number
  maxAdmins: number
  maxApartments: number
  hasAdvancedReports: boolean
  hasPrioritySupport: boolean
  hasApiAccess: boolean
}

export default function OwnerPlanPage({ params }: { params: { locale: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { locale } = params
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  const t = {
    fr: {
      title: 'Plans d\'abonnement',
      subtitle: 'Choisissez le plan qui correspond le mieux à vos besoins',
      selectPlan: 'Sélectionner ce plan',
      features: 'Fonctionnalités incluses',
      maxResidences: 'Résidences',
      maxAdmins: 'Administrateurs',
      maxApartments: 'Appartements',
      advancedReports: 'Rapports avancés',
      prioritySupport: 'Support prioritaire',
      apiAccess: 'Accès API',
      perMonth: '/mois',
      perYear: '/an',
      popular: 'Populaire',
      contactUs: 'Contactez-nous',
      cta: 'Choisir ce plan',
    },
    ar: {
      title: 'خطط الاشتراك',
      subtitle: 'اختر الخطة التي تناسب احتياجاتك',
      selectPlan: 'اختر هذه الخطة',
      features: 'الميزات المتضمنة',
      maxResidences: 'عقارات',
      maxAdmins: 'مشرفون',
      maxApartments: 'شقق',
      advancedReports: 'تقارير متقدمة',
      prioritySupport: 'دعم أولوية',
      apiAccess: 'وصول API',
      perMonth: '/شهر',
      perYear: '/سنة',
      popular: 'الأكثر شعبية',
      contactUs: 'اتصل بنا',
      cta: 'اختر هذه الخطة',
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
      fetchPlans()
    }
  }, [status, session])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/owner/plan')
      if (response.ok) {
        const data = await response.json()
        setPlans(data)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <Card 
              key={plan.id} 
              className={`relative ${index === 1 ? 'border-primary shadow-lg' : ''}`}
            >
              {index === 1 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full">
                  {translations.popular}
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-text-secondary">{translations.perMonth}</span>
                </div>
                
                {plan.yearlyPrice && (
                  <div className="mb-4 text-sm text-text-secondary">
                    {plan.yearlyPrice}{translations.perYear} (-17%)
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{translations.maxResidences}: {plan.maxResidences}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{translations.maxAdmins}: {plan.maxAdmins}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{translations.maxApartments}: {plan.maxApartments}</span>
                  </div>
                  {plan.hasAdvancedReports && (
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{translations.advancedReports}</span>
                    </div>
                  )}
                  {plan.hasPrioritySupport && (
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{translations.prioritySupport}</span>
                    </div>
                  )}
                  {plan.hasApiAccess && (
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{translations.apiAccess}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/${locale}/owner/abonnement?plan=${plan.slug}`} className="w-full">
                  <Button className="w-full" variant={index === 1 ? 'primary' : 'outline'}>
                    {translations.cta}
                    <ArrowRight className="w-4 h-4 ltr:ml-2 rtl:mr-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
