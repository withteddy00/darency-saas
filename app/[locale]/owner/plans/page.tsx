'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Building2, 
  Users, 
  CreditCard, 
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Check,
  X,
  Loader2
} from 'lucide-react'

interface Plan {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  yearlyPrice: number | null
  billingCycle: string
  features: string[]
  maxResidences: number
  maxAdmins: number
  maxApartments: number
  maxResidents: number
  hasAdvancedReports: boolean
  hasPrioritySupport: boolean
  hasApiAccess: boolean
  isActive: boolean
  isVisible: boolean
  isPopular: boolean
  activeSubscriptions: number
  createdAt: string
  updatedAt: string
}

export default function PlansManagementPage({ params }: { params: { locale: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { locale } = params
  
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    yearlyPrice: '',
    billingCycle: 'MONTHLY',
    maxResidences: '1',
    maxAdmins: '1',
    maxApartments: '50',
    maxResidents: '100',
    features: '',
    isVisible: true,
    isPopular: false
  })

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

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'OWNER') {
      fetchPlans()
    }
  }, [status, session])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/owner/plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        yearlyPrice: formData.yearlyPrice ? parseFloat(formData.yearlyPrice) : null,
        maxResidences: parseInt(formData.maxResidences),
        maxAdmins: parseInt(formData.maxAdmins),
        maxApartments: parseInt(formData.maxApartments),
        maxResidents: parseInt(formData.maxResidents),
        features: formData.features.split('\n').filter(f => f.trim())
      }

      let response
      if (editingPlan) {
        response = await fetch('/api/owner/plans', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, planId: editingPlan.id })
        })
      } else {
        response = await fetch('/api/owner/plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      if (response.ok) {
        setShowModal(false)
        setEditingPlan(null)
        resetForm()
        fetchPlans()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save plan')
      }
    } catch (error) {
      console.error('Error saving plan:', error)
      alert('Failed to save plan')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (planId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce plan ?')) return

    try {
      const response = await fetch(`/api/owner/plans?planId=${planId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchPlans()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete plan')
      }
    } catch (error) {
      console.error('Error deleting plan:', error)
      alert('Failed to delete plan')
    }
  }

  const handleToggleVisibility = async (plan: Plan) => {
    try {
      const response = await fetch('/api/owner/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, isVisible: !plan.isVisible })
      })

      if (response.ok) {
        fetchPlans()
      }
    } catch (error) {
      console.error('Error toggling visibility:', error)
    }
  }

  const handleTogglePopular = async (plan: Plan) => {
    try {
      const response = await fetch('/api/owner/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, isPopular: !plan.isPopular })
      })

      if (response.ok) {
        fetchPlans()
      }
    } catch (error) {
      console.error('Error toggling popular:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      yearlyPrice: '',
      billingCycle: 'MONTHLY',
      maxResidences: '1',
      maxAdmins: '1',
      maxApartments: '50',
      maxResidents: '100',
      features: '',
      isVisible: true,
      isPopular: false
    })
  }

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      price: plan.price.toString(),
      yearlyPrice: plan.yearlyPrice?.toString() || '',
      billingCycle: plan.billingCycle,
      maxResidences: plan.maxResidences.toString(),
      maxAdmins: plan.maxAdmins.toString(),
      maxApartments: plan.maxApartments.toString(),
      maxResidents: plan.maxResidents.toString(),
      features: plan.features.join('\n'),
      isVisible: plan.isVisible,
      isPopular: plan.isPopular
    })
    setShowModal(true)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'OWNER') {
    return null
  }

  const t = {
    fr: {
      title: 'Gestion des plans',
      subtitle: 'Créez et gérez les plans d\'abonnement',
      back: 'Retour au tableau de bord',
      addPlan: 'Ajouter un plan',
      name: 'Nom',
      slug: 'Slug',
      description: 'Description',
      monthlyPrice: 'Prix mensuel (MAD)',
      yearlyPrice: 'Prix annuel (MAD)',
      billingCycle: 'Cycle de facturation',
      maxResidences: 'Résidences max',
      maxAdmins: 'Administrateurs max',
      maxApartments: 'Appartements max',
      maxResidents: 'Residents max',
      features: 'Fonctionnalités (une par ligne)',
      visible: 'Visible',
      popular: 'Populaire',
      activeSubscriptions: 'Abonnements actifs',
      actions: 'Actions',
      edit: 'Modifier',
      delete: 'Supprimer',
      save: 'Enregistrer',
      cancel: 'Annuler',
      monthly: 'Mensuel',
      yearly: 'Annuel',
      noPlans: 'Aucun plan trouvé'
    },
    ar: {
      title: 'إدارة الخطط',
      subtitle: 'إنشاء وإدارة خطط الاشتراك',
      back: 'العودة إلى لوحة التحكم',
      addPlan: 'إضافة خطة',
      name: 'الاسم',
      slug: 'المعرف',
      description: 'الوصف',
      monthlyPrice: 'السعر الشهري (MAD)',
      yearlyPrice: 'السعر السنوي (MAD)',
      billingCycle: 'دورة الفوترة',
      maxResidences: 'الحد الأقصى للعقارات',
      maxAdmins: 'الحد الأقصى للمسؤولين',
      maxApartments: 'الحد الأقصى للشقق',
      maxResidents: 'الحد الأقصى للمقيمين',
      features: 'الميزات (واحدة في كل سطر)',
      visible: 'مرئي',
      popular: 'شائع',
      activeSubscriptions: 'الاشتراكات النشطة',
      actions: 'الإجراءات',
      edit: 'تعديل',
      delete: 'حذف',
      save: 'حفظ',
      cancel: 'إلغاء',
      monthly: 'شهري',
      yearly: 'سنوي',
      noPlans: 'لا توجد خطط'
    }
  }

  const translations = t[locale as 'fr' | 'ar'] || t.fr

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href={`/${locale}/owner`} className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-text-primary">{translations.title}</h1>
                <p className="text-sm text-text-secondary">{translations.subtitle}</p>
              </div>
            </div>
            <button
              onClick={() => { resetForm(); setEditingPlan(null); setShowModal(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {translations.addPlan}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.length === 0 ? (
            <div className="col-span-full text-center py-12 text-text-tertiary">
              {translations.noPlans}
            </div>
          ) : (
            plans.map((plan) => (
              <div key={plan.id} className={`bg-white rounded-xl border ${plan.isPopular ? 'border-primary ring-2 ring-primary/20' : 'border-border'} overflow-hidden`}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-text-primary">{plan.name}</h3>
                        {plan.isPopular && (
                          <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" /> Populaire
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-tertiary">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-bold text-text-primary">{plan.price}</span>
                    <span className="text-text-tertiary"> MAD</span>
                    {plan.yearlyPrice && (
                      <span className="text-sm text-text-tertiary ml-2">/ {plan.yearlyPrice} MAD/an</span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-text-secondary mb-4">
                    <div className="flex justify-between">
                      <span>{translations.maxResidences}:</span>
                      <span className="font-medium">{plan.maxResidences}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{translations.maxAdmins}:</span>
                      <span className="font-medium">{plan.maxAdmins}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{translations.maxApartments}:</span>
                      <span className="font-medium">{plan.maxApartments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{translations.maxResidents}:</span>
                      <span className="font-medium">{plan.maxResidents}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-text-tertiary mb-4">
                    <span>{translations.activeSubscriptions}: {plan.activeSubscriptions}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(plan)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-surface-elevated text-text-secondary rounded-lg hover:bg-border transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      {translations.edit}
                    </button>
                    <button
                      onClick={() => handleToggleVisibility(plan)}
                      className={`p-2 rounded-lg transition-colors ${plan.isVisible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                      title={translations.visible}
                    >
                      {plan.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleTogglePopular(plan)}
                      className={`p-2 rounded-lg transition-colors ${plan.isPopular ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}
                      title={translations.popular}
                    >
                      <Star className={`w-4 h-4 ${plan.isPopular ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      title={translations.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-text-primary">
                {editingPlan ? translations.edit : translations.addPlan}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">{translations.name}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">{translations.slug}</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">{translations.description}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">{translations.monthlyPrice}</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">{translations.yearlyPrice}</label>
                  <input
                    type="number"
                    value={formData.yearlyPrice}
                    onChange={(e) => setFormData({ ...formData, yearlyPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">{translations.billingCycle}</label>
                  <select
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="MONTHLY">{translations.monthly}</option>
                    <option value="YEARLY">{translations.yearly}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">{translations.maxApartments}</label>
                  <input
                    type="number"
                    value={formData.maxApartments}
                    onChange={(e) => setFormData({ ...formData, maxApartments: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">{translations.maxAdmins}</label>
                  <input
                    type="number"
                    value={formData.maxAdmins}
                    onChange={(e) => setFormData({ ...formData, maxAdmins: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">{translations.maxResidents}</label>
                  <input
                    type="number"
                    value={formData.maxResidents}
                    onChange={(e) => setFormData({ ...formData, maxResidents: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">{translations.features}</label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={4}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                  />
                  <span className="text-sm text-text-secondary">{translations.visible}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                  />
                  <span className="text-sm text-text-secondary">{translations.popular}</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingPlan(null) }}
                  className="flex-1 px-4 py-2 border border-border text-text-secondary rounded-lg hover:bg-surface-elevated transition-colors"
                >
                  {translations.cancel}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {translations.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
