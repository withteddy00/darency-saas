'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

interface Plan {
  id: string
  name: string
  slug: string
  description: string | null
  monthlyPrice: number
  yearlyPrice: number | null
}

export default function SubscribePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planSlug = searchParams.get('plan') || 'starter'
  
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organizationName: '',
    residenceName: '',
    address: '',
    city: '',
    numberOfApartments: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [paymentRef, setPaymentRef] = useState('')

  useEffect(() => {
    fetch('/api/public/plans')
      .then(res => res.json())
      .then(data => {
        setPlans(data.plans || [])
        const found = data.plans?.find((p: Plan) => p.slug === planSlug)
        if (found) setSelectedPlan(found)
      })
      .finally(() => setLoading(false))
  }, [planSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const res = await fetch('/api/public/subscription-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, planId: selectedPlan?.id })
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(true)
        setPaymentRef(data.paymentReference || 'DRN-000000-000000')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-green-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyee!</h1>
          <p className="text-gray-600 mb-6">Reference: <span className="font-mono font-bold">{paymentRef}</span></p>
          <button onClick={() => router.push('/fr')} className="px-6 py-3 bg-primary text-white rounded-lg">
            Retour a l&apos;accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Abonnement {selectedPlan?.name}</h1>
        
        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
              <input required type="text" value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input required type="email" value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
              <input required type="tel" value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organisation *</label>
              <input required type="text" value={formData.organizationName}
                onChange={e => setFormData({...formData, organizationName: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Résidence *</label>
              <input required type="text" value={formData.residenceName}
                onChange={e => setFormData({...formData, residenceName: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
              <input required type="text" value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                <input required type="text" value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nb appartements *</label>
                <input required type="number" value={formData.numberOfApartments}
                  onChange={e => setFormData({...formData, numberOfApartments: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50">
              {submitting ? 'Envoi...' : 'Soumettre'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
