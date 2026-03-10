'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function SubscribePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planSlug = searchParams.get('plan') || 'starter'
  
  const [plans, setPlans] = useState<any[]>([])
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', ice: '',
    organizationName: '', residenceName: '', address: '', city: '',
    numberOfBuildings: '1', numberOfApartments: '',
    rc: '', taxId: '', website: '', notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [paymentRef, setPaymentRef] = useState('')

  useEffect(() => {
    fetch('/api/public/plans').then(r => r.json()).then(data => {
      setPlans(data.plans || [])
      const found = data.plans?.find((p: any) => p.slug === planSlug)
      if (found) setSelectedPlan(found)
      setLoading(false)
    })
  }, [planSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/public/subscription-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, planId: selectedPlan?.id, billingCycle })
      })
      const data = await res.json()
      if (res.ok) { setSuccess(true); setPaymentRef(data.paymentReference || 'DRN-000000') }
    } finally { setSubmitting(false) }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-green-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyee!</h1>
          <p className="text-gray-600 mb-2">Reference: <span className="font-mono font-bold">{paymentRef}</span></p>
          <p className="text-sm text-gray-500 mb-6">Montant: {billingCycle === 'yearly' && selectedPlan?.yearlyPrice ? selectedPlan.yearlyPrice : selectedPlan?.monthlyPrice} MAD</p>
          <button onClick={() => router.push(`/fr/payment-proof?ref=${paymentRef}`)} className="px-6 py-3 bg-primary text-white rounded-lg">Telecharger preuve</button>
        </div>
      </div>
    )
  }

  const steps = ['Contact', 'Residence', 'Abonnement', 'Entreprise']

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Commencez votre essai gratuit</h1>
        
        {!loading && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="inline-flex bg-gray-100 rounded-full p-1">
                <button onClick={() => setBillingCycle('monthly')} className={`px-4 py-2 rounded-full text-sm ${billingCycle === 'monthly' ? 'bg-white shadow' : ''}`}>Mensuel</button>
                <button onClick={() => setBillingCycle('yearly')} className={`px-4 py-2 rounded-full text-sm flex gap-1 ${billingCycle === 'yearly' ? 'bg-white shadow' : ''}`}>Annuel <span className="text-xs bg-green-100 text-green-700 px-1 rounded">-17%</span></button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {plans.map(plan => {
                const price = billingCycle === 'yearly' && plan.yearlyPrice ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice
                const isSelected = selectedPlan?.slug === plan.slug
                return (
                  <button key={plan.id} onClick={() => { setSelectedPlan(plan); router.replace(`/fr/subscribe?plan=${plan.slug}`, { scroll: false }) }}
                    className={`p-4 rounded-xl border-2 text-left ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                    <div className="font-semibold">{plan.name}</div>
                    <div className="text-xl font-bold">{price} MAD<span className="text-sm text-gray-500">/mois</span></div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b">
            {steps.map((s, i) => (
              <button key={s} type="button" onClick={() => setCurrentStep(i)}
                className={`flex-1 py-3 text-sm font-medium ${currentStep === i ? 'bg-white text-primary border-b-2 border-primary' : 'bg-gray-50 text-gray-400'}`}>{s}</button>
            ))}
          </div>
          <div className="p-6">
            {currentStep === 0 && (
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Nom complet *" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="px-4 py-3 border rounded-lg" />
                <input required type="email" placeholder="Email *" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="px-4 py-3 border rounded-lg" />
                <input required placeholder="Telephone *" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="px-4 py-3 border rounded-lg" />
                <input placeholder="ICE (Optionnel)" value={formData.ice} onChange={e => setFormData({...formData, ice: e.target.value})} className="px-4 py-3 border rounded-lg" />
              </div>
            )}
            {currentStep === 1 && (
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Organisation *" value={formData.organizationName} onChange={e => setFormData({...formData, organizationName: e.target.value})} className="px-4 py-3 border rounded-lg" />
                <input required placeholder="Residence *" value={formData.residenceName} onChange={e => setFormData({...formData, residenceName: e.target.value})} className="px-4 py-3 border rounded-lg" />
                <input required placeholder="Adresse *" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="col-span-2 px-4 py-3 border rounded-lg" />
                <input required placeholder="Ville *" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="px-4 py-3 border rounded-lg" />
                <input required type="number" placeholder="Nb apartments *" value={formData.numberOfApartments} onChange={e => setFormData({...formData, numberOfApartments: e.target.value})} className="px-4 py-3 border rounded-lg" />
              </div>
            )}
            {currentStep === 2 && selectedPlan && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div><div className="font-semibold">{selectedPlan.name}</div><div className="text-sm text-gray-600">{selectedPlan.description}</div></div>
                  <div className="text-2xl font-bold text-primary">{billingCycle === 'yearly' && selectedPlan.yearlyPrice ? Math.round(selectedPlan.yearlyPrice/12) : selectedPlan.monthlyPrice} MAD</div>
                </div>
              </div>
            )}
            {currentStep === 3 && (
              <div className="space-y-4">
                <textarea placeholder="Notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} className="w-full px-4 py-3 border rounded-lg" />
              </div>
            )}
            <div className="flex justify-between mt-6 pt-4 border-t">
              <button type="button" onClick={() => setCurrentStep(c => c - 1)} disabled={currentStep === 0} className="px-6 py-2 text-gray-600 disabled:text-gray-300">Retour</button>
              {currentStep < 3 ? <button type="button" onClick={() => setCurrentStep(c => c + 1)} className="px-6 py-2 bg-primary text-white rounded-lg">Suivant</button> : <button type="submit" disabled={submitting} className="px-8 py-2 bg-primary text-white rounded-lg disabled:opacity-50">{submitting ? 'Envoi...' : 'Soumettre'}</button>}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
