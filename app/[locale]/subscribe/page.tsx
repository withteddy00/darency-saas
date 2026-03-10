'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Check, Loader2, Upload, Building2, User, CreditCard, FileText, AlertCircle } from 'lucide-react'

interface Plan {
  id: string
  name: string
  slug: string
  description: string | null
  monthlyPrice: number
  yearlyPrice: number | null
  features: string[]
}

interface FormData {
  // Contact / Account Information
  fullName: string
  email: string
  phone: string
  password: string
  preferredLanguage: string
  
  // Residence / Organization Information
  organizationName: string
  residenceName: string
  address: string
  city: string
  country: string
  numberOfBuildings: string
  numberOfFloors: string
  numberOfApartments: string
  estimatedNumberOfResidents: string
  
  // Subscription Information
  billingCycle: string
  notes: string
  
  // Optional Business Information
  ice: string
  rc: string
  taxId: string
  website: string
}

const initialFormData: FormData = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  preferredLanguage: 'fr',
  organizationName: '',
  residenceName: '',
  address: '',
  city: '',
  country: 'Maroc',
  numberOfBuildings: '1',
  numberOfFloors: '1',
  numberOfApartments: '',
  estimatedNumberOfResidents: '',
  billingCycle: 'monthly',
  notes: '',
  ice: '',
  rc: '',
  taxId: '',
  website: ''
}

function SubscribeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planSlug = searchParams.get('plan') || 'starter'
  
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitData, setSubmitData] = useState<{ paymentReference: string; amount: number } | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentSection, setCurrentSection] = useState(0)

  const sections = [
    { id: 'contact', label: 'Contact', icon: User },
    { id: 'residence', label: 'Résidence', icon: Building2 },
    { id: 'subscription', label: 'Abonnement', icon: CreditCard },
    { id: 'business', label: 'Complémentaire', icon: FileText },
  ]

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/public/plans')
      const data = await res.json()
      setPlans(data.plans || [])
      
      // Find selected plan from slug
      const found = data.plans?.find((p: Plan) => p.slug === planSlug)
      if (found) {
        setSelectedPlan(found)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoadingPlans(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Contact validation
    if (!formData.fullName.trim()) newErrors.fullName = 'Le nom complet est requis'
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide'
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis'
    
    // Residence validation
    if (!formData.organizationName.trim()) newErrors.organizationName = 'Le nom de l\'organisation est requis'
    if (!formData.residenceName.trim()) newErrors.residenceName = 'Le nom de la résidence est requis'
    if (!formData.address.trim()) newErrors.address = 'L\'adresse est requise'
    if (!formData.city.trim()) newErrors.city = 'La ville est requise'
    if (!formData.numberOfApartments.trim()) newErrors.numberOfApartments = 'Le nombre d\'appartements est requis'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setSubmitting(true)
    
    try {
      const response = await fetch('/api/public/subscription-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          selectedPlanSlug: selectedPlan?.slug,
          planId: selectedPlan?.id,
          numberOfBuildings: parseInt(formData.numberOfBuildings),
          numberOfFloors: parseInt(formData.numberOfFloors),
          numberOfApartments: parseInt(formData.numberOfApartments),
          estimatedNumberOfResidents: formData.estimatedNumberOfResidents ? parseInt(formData.estimatedNumberOfResidents) : null
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitData({
          paymentReference: data.paymentReference,
          amount: data.amount
        })
        setSubmitSuccess(true)
      } else {
        setErrors({ submit: data.error || 'Erreur lors de la soumission' })
      }
    } catch (error) {
      console.error('Error submitting:', error)
      setErrors({ submit: 'Erreur lors de la soumission' })
    } finally {
      setSubmitting(false)
    }
  }

  const handlePlanChange = (slug: string) => {
    const plan = plans.find(p => p.slug === slug)
    if (plan) {
      setSelectedPlan(plan)
    }
  }

  // Success Page
  if (submitSuccess && submitData) {
    const amount = selectedPlan?.monthlyPrice || 0
    const isYearly = formData.billingCycle === 'yearly'
    const finalAmount = isYearly ? (selectedPlan?.yearlyPrice || amount * 12) : amount

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Success Header */}
            <div className="bg-green-600 p-8 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Demande soumise avec succès!</h1>
              <p className="text-green-100">Votre demande d&apos;abonnement a été enregistrée</p>
            </div>

            <div className="p-8">
              {/* Payment Reference */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-amber-800 mb-4">Référence de paiement</h2>
                <div className="text-center mb-4">
                  <span className="text-3xl font-mono font-bold text-amber-700">{submitData.paymentReference}</span>
                </div>
                <p className="text-sm text-amber-700 text-center">
                  ⚠️ Veuillez inclure cette référence dans votre virement bancaire
                </p>
              </div>

              {/* Bank Transfer Details */}
              <div className="border border-border rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Informations pour le virement</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-text-secondary">Montant à payer:</span>
                    <span className="font-semibold text-text-primary">{finalAmount} MAD / {isYearly ? 'an' : 'mois'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-text-secondary">Bénéficiaire:</span>
                    <span className="font-medium text-text-primary">DARENCY</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-text-secondary">Banque:</span>
                    <span className="font-medium text-text-primary">Banque Populaire</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-text-secondary">RIB:</span>
                    <span className="font-mono text-text-primary">123456789012345678901234</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-text-secondary">IBAN:</span>
                    <span className="font-mono text-text-primary">MA12 1234 5678 9012 3456 7890 123</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-text-secondary">SWIFT:</span>
                    <span className="font-mono text-text-primary">BCMAMAMC</span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-blue-800 mb-3">Prochaines étapes</h2>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
                  <li>Effectuez le virement de <strong>{finalAmount} MAD</strong></li>
                  <li>Incluez la référence <strong>{submitData.paymentReference}</strong> dans le motif</li>
                  <li>Téléchargez la preuve de virement ci-dessous (optionnel)</li>
                  <li>Nous validerons votre paiement sous 24-48h</li>
                </ol>
              </div>

              {/* Upload Proof */}
              <div className="text-center">
                <button
                  onClick={() => router.push(`/fr/payment-proof?ref=${submitData.paymentReference}`)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  Télécharger la preuve de virement
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Demande d&apos;abonnement</h1>
          <p className="text-text-secondary">Remplissez le formulaire ci-dessous pour démarrer votre essai</p>
        </div>

        {/* Plan Selector */}
        {loadingPlans ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-border p-6 mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-3">Plan sélectionné</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map(plan => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => handlePlanChange(plan.slug)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedPlan?.slug === plan.slug
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold text-text-primary">{plan.name}</div>
                  <div className="text-sm text-text-secondary">{plan.monthlyPrice} MAD/mois</div>
                  {plan.yearlyPrice && (
                    <div className="text-xs text-green-600">{plan.yearlyPrice} MAD/an</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          {/* Progress Steps */}
          <div className="border-b border-border">
            <div className="flex">
              {sections.map((section, idx) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setCurrentSection(idx)}
                  className={`flex-1 py-4 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                    currentSection === idx
                      ? 'bg-primary/5 text-primary border-b-2 border-primary'
                      : 'text-text-secondary hover:bg-gray-50'
                  }`}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                {errors.submit}
              </div>
            )}

            {/* Section 1: Contact Information */}
            {currentSection === 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Informations de contact</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.fullName ? 'border-red-500' : 'border-border'}`}
                      placeholder="Mohamed Alaoui"
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.email ? 'border-red-500' : 'border-border'}`}
                      placeholder="contact@exemple.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-border'}`}
                      placeholder="+212 6XX XXX XXX"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Langue préférée
                    </label>
                    <select
                      value={formData.preferredLanguage}
                      onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="fr">Français</option>
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Mot de passe (optionnel)
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Laissez vide pour générer automatiquement"
                    />
                    <p className="text-xs text-text-tertiary mt-1">Si laissé vide, un mot de passe temporaire sera généré</p>
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Residence Information */}
            {currentSection === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Informations de la résidence</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Nom de l&apos;organisation *
                    </label>
                    <input
                      type="text"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.organizationName ? 'border-red-500' : 'border-border'}`}
                      placeholder="Société Immobilière X"
                    />
                    {errors.organizationName && <p className="text-red-500 text-sm mt-1">{errors.organizationName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Nom de la résidence *
                    </label>
                    <input
                      type="text"
                      value={formData.residenceName}
                      onChange={(e) => setFormData({ ...formData, residenceName: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.residenceName ? 'border-red-500' : 'border-border'}`}
                      placeholder="Résidence Les Jardins"
                    />
                    {errors.residenceName && <p className="text-red-500 text-sm mt-1">{errors.residenceName}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.address ? 'border-red-500' : 'border-border'}`}
                      placeholder="123 Avenue Mohammed V, Quartier"
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Ville *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.city ? 'border-red-500' : 'border-border'}`}
                      placeholder="Casablanca"
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Pays
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Nombre de bâtiments
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.numberOfBuildings}
                      onChange={(e) => setFormData({ ...formData, numberOfBuildings: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Nombre d&apos;étages
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.numberOfFloors}
                      onChange={(e) => setFormData({ ...formData, numberOfFloors: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Nombre d&apos;appartements *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.numberOfApartments}
                      onChange={(e) => setFormData({ ...formData, numberOfApartments: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.numberOfApartments ? 'border-red-500' : 'border-border'}`}
                      placeholder="50"
                    />
                    {errors.numberOfApartments && <p className="text-red-500 text-sm mt-1">{errors.numberOfApartments}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Nombre预计 de résidents
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.estimatedNumberOfResidents}
                      onChange={(e) => setFormData({ ...formData, estimatedNumberOfResidents: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="150"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Subscription Information */}
            {currentSection === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Informations d&apos;abonnement</h3>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-3">
                    Cycle de facturation
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, billingCycle: 'monthly' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.billingCycle === 'monthly'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-semibold text-text-primary">Mensuel</div>
                      <div className="text-sm text-text-secondary">
                        {selectedPlan?.monthlyPrice || 0} MAD/mois
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, billingCycle: 'yearly' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.billingCycle === 'yearly'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-semibold text-text-primary">Annuel</div>
                      <div className="text-sm text-green-600">
                        {selectedPlan?.yearlyPrice || (selectedPlan?.monthlyPrice || 0) * 12} MAD/an
                      </div>
                      <div className="text-xs text-green-600">Économisez ~17%</div>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Notes supplémentaires
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Informations complémentaires..."
                  />
                </div>
              </div>
            )}

            {/* Section 4: Business Information */}
            {currentSection === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Informations complémentaires (optionnel)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      ICE (Identifiant Commun de l&apos;Entreprise)
                    </label>
                    <input
                      type="text"
                      value={formData.ice}
                      onChange={(e) => setFormData({ ...formData, ice: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="001234567890123"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      RC (Registre de Commerce)
                    </label>
                    <input
                      type="text"
                      value={formData.rc}
                      onChange={(e) => setFormData({ ...formData, rc: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="12345"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Identifiant fiscal
                    </label>
                    <input
                      type="text"
                      value={formData.taxId}
                      onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="12345678"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Site web
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="https://exemple.com"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Navigation */}
          <div className="border-t border-border p-6 bg-gray-50 flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
              className="px-6 py-2 border border-border rounded-lg text-text-secondary hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            
            {currentSection < sections.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentSection(currentSection + 1)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Suivant
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Soumettre la demande
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SubscribeContent />
    </Suspense>
  )
}
