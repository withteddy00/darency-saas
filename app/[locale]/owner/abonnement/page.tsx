'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Building2, User, Mail, Phone, MapPin, Home, CheckCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Plan {
  id: string
  name: string
  slug: string
  description: string
  price: number
  maxResidences: number
  maxAdmins: number
  maxApartments: number
}

export default function OwnerAbonnementPage({ params }: { params: { locale: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale } = params
  
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    residenceName: '',
    residenceAddress: '',
    city: '',
    numberOfApartments: '',
  })

  const t = {
    fr: {
      title: 'Demande d\'abonnement',
      subtitle: 'Complétez le formulaire pour soumettre votre demande',
      personalInfo: 'Informations personnelles',
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      residenceInfo: 'Informations de la résidence',
      residenceName: 'Nom de la résidence',
      residenceAddress: 'Adresse',
      city: 'Ville',
      numberOfApartments: 'Nombre d\'appartements',
      planSelection: 'Plan sélectionné',
      selectPlan: 'Sélectionnez un plan',
      submit: 'Soumettre la demande',
      submitting: 'Envoi en cours...',
      success: 'Demande soumise avec succès!',
      successMessage: 'Nous avons reçu votre demande. Vous recevrez un email avec vos identifiants une fois votre demande approuvée.',
      back: 'Retour aux plans',
      maxResidences: 'Résidences',
      maxAdmins: 'Administrateurs',
      maxApartments: 'Appartements',
    },
    ar: {
      title: 'طلب الاشتراك',
      subtitle: 'أكمل النموذج لتقديم طلبك',
      personalInfo: 'المعلومات الشخصية',
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      residenceInfo: 'معلومات الإقامة',
      residenceName: 'اسم الإقامة',
      residenceAddress: 'العنوان',
      city: 'المدينة',
      numberOfApartments: 'عدد الشقق',
      planSelection: 'الخطة المختارة',
      selectPlan: 'اختر خطة',
      submit: 'تقديم الطلب',
      submitting: 'جاري الإرسال...',
      success: 'تم تقديم الطلب بنجاح!',
      successMessage: 'لقد تلقينا طلبك. ستتلقى بريدًا إلكترونيًا بمعلومات تسجيل الدخول بمجرد الموافقة على طلبك.',
      back: 'العودة إلى الخطط',
      maxResidences: 'عقارات',
      maxAdmins: 'مشرفون',
      maxApartments: 'شقق',
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

  useEffect(() => {
    const planParam = searchParams.get('plan')
    if (planParam) {
      setSelectedPlanSlug(planParam)
    }
  }, [searchParams])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlanSlug) return

    setSubmitting(true)
    
    try {
      const plan = plans.find(p => p.slug === selectedPlanSlug)
      if (!plan) return

      const response = await fetch('/api/owner/subscription-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          planId: plan.id,
          numberOfApartments: parseInt(formData.numberOfApartments),
        })
      })

      if (response.ok) {
        setSubmitted(true)
      }
    } catch (error) {
      console.error('Error submitting request:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const selectedPlan = plans.find(p => p.slug === selectedPlanSlug)

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

  if (submitted) {
    return (
      <DashboardLayout locale={locale} role="OWNER">
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => router.push(`/${locale}/owner/plan`)}>
            <ArrowLeft className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
            {translations.back}
          </Button>

          <Card className="max-w-lg mx-auto">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">{translations.success}</h2>
              <p className="text-text-secondary">{translations.successMessage}</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout locale={locale} role="OWNER">
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push(`/${locale}/owner/plan`)}>
          <ArrowLeft className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
          {translations.back}
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{translations.title}</h1>
            <p className="text-text-secondary mt-1">{translations.subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>{translations.personalInfo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">{translations.firstName}</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">{translations.lastName}</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">{translations.email}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{translations.phone}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>{translations.residenceInfo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="residenceName">{translations.residenceName}</Label>
                    <Input
                      id="residenceName"
                      value={formData.residenceName}
                      onChange={(e) => setFormData({ ...formData, residenceName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="residenceAddress">{translations.residenceAddress}</Label>
                    <Input
                      id="residenceAddress"
                      value={formData.residenceAddress}
                      onChange={(e) => setFormData({ ...formData, residenceAddress: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">{translations.city}</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="numberOfApartments">{translations.numberOfApartments}</Label>
                      <Input
                        id="numberOfApartments"
                        type="number"
                        min="1"
                        value={formData.numberOfApartments}
                        onChange={(e) => setFormData({ ...formData, numberOfApartments: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6">
                <Button type="submit" disabled={submitting || !selectedPlanSlug} className="w-full">
                  {submitting ? translations.submitting : translations.submit}
                </Button>
              </div>
            </form>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>{translations.planSelection}</CardTitle>
                <CardDescription>{translations.selectPlan}</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedPlanSlug} onValueChange={setSelectedPlanSlug}>
                  <SelectTrigger>
                    <SelectValue placeholder={translations.selectPlan} />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.slug}>
                        {plan.name} - {plan.price} DH{locale === 'ar' ? '/شهر' : '/mois'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedPlan && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold">{selectedPlan.name}</h4>
                    <p className="text-sm text-text-secondary">{selectedPlan.description}</p>
                    <div className="mt-2 text-sm space-y-1">
                      <p>{translations.maxResidences}: {selectedPlan.maxResidences}</p>
                      <p>{translations.maxAdmins}: {selectedPlan.maxAdmins}</p>
                      <p>{translations.maxApartments}: {selectedPlan.maxApartments}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
