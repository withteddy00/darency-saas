'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  RefreshCw,
  Pause,
  Play,
  X,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Loader2
} from 'lucide-react'

interface Subscription {
  id: string
  name: string
  slug: string
  email: string
  city: string
  plan: {
    id: string
    name: string
    price: number
  } | null
  subscriptionStatus: string
  planStartDate: string
  planEndDate: string | null
  residences: {
    id: string
    name: string
    city: string
    status: string
  }[]
  usersCount: number
  residencesCount: number
  totalRevenue: number
  createdAt: string
}

interface Plan {
  id: string
  name: string
  price: number
}

interface Stats {
  totalActive: number
  totalSuspended: number
  totalCancelled: number
  total: number
}

export default function SubscriptionsManagementPage({ params }: { params: { locale: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { locale } = params
  
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [stats, setStats] = useState<Stats>({ totalActive: 0, totalSuspended: 0, totalCancelled: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')
  const [processing, setProcessing] = useState<string | null>(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState('')

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
      fetchData()
    }
  }, [status, session, filter])

  const fetchData = async () => {
    try {
      const url = filter === 'ALL' 
        ? '/api/owner/subscriptions' 
        : `/api/owner/subscriptions?status=${filter}`
      
      const [subsRes, plansRes] = await Promise.all([
        fetch(url),
        fetch('/api/owner/plans')
      ])
      
      if (subsRes.ok) {
        const subsData = await subsRes.json()
        setSubscriptions(subsData.subscriptions)
        setStats(subsData.stats)
      }
      
      if (plansRes.ok) {
        const plansData = await plansRes.json()
        setPlans(plansData.plans)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (subscriptionId: string, action: string, data?: any) => {
    setProcessing(subscriptionId)
    try {
      const response = await fetch('/api/owner/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: subscriptionId, action, ...data })
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to perform action')
      }
    } catch (error) {
      console.error('Error performing action:', error)
      alert('Failed to perform action')
    } finally {
      setProcessing(null)
    }
  }

  const handleChangePlan = async () => {
    if (!selectedSub || !selectedPlanId) return
    
    const selectedPlan = plans.find(p => p.id === selectedPlanId)
    const currentPrice = selectedSub.plan?.price || 0
    const newPrice = selectedPlan?.price || 0
    const action = newPrice > currentPrice ? 'upgrade' : 'downgrade'

    setProcessing(selectedSub.id)
    try {
      const response = await fetch('/api/owner/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: selectedSub.id, action, planId: selectedPlanId })
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        setShowPlanModal(false)
        setSelectedSub(null)
        setSelectedPlanId('')
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to change plan')
      }
    } catch (error) {
      console.error('Error changing plan:', error)
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1"><Play className="w-3 h-3" /> Actif</span>
      case 'SUSPENDED':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1"><Pause className="w-3 h-3" /> Suspendu</span>
      case 'CANCELLED':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1"><X className="w-3 h-3" /> Annulé</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>
    }
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
      title: 'Gestion des abonnements',
      subtitle: 'Gérez tous les abonnements des organisations',
      back: 'Retour au tableau de bord',
      organization: 'Organisation',
      plan: 'Plan',
      billingCycle: 'Facturation',
      startDate: 'Date de début',
      endDate: 'Date de fin',
      nextBilling: 'Prochaine facturation',
      status: 'Statut',
      actions: 'Actions',
      renew: 'Renouveler',
      suspend: 'Suspendre',
      reactivate: 'Réactiver',
      cancel: 'Annuler',
      upgrade: 'Upgrade',
      downgrade: 'Downgrade',
      all: 'Tous',
      active: 'Actifs',
      suspended: 'Suspendus',
      cancelled: 'Annulés',
      residences: 'Résidences',
      users: 'Utilisateurs',
      revenue: 'Revenus',
      noSubscriptions: 'Aucun abonnement trouvé',
      changePlan: 'Changer le plan',
      selectPlan: 'Sélectionner un plan',
      save: 'Enregistrer'
    },
    ar: {
      title: 'إدارة الاشتراكات',
      subtitle: 'إدارة جميع اشتراكات المؤسسات',
      back: 'العودة إلى لوحة التحكم',
      organization: 'المنظمة',
      plan: 'الخطة',
      billingCycle: 'الفوترة',
      startDate: 'تاريخ البدء',
      endDate: 'تاريخ الانتهاء',
      nextBilling: 'الفوترة التالية',
      status: 'الحالة',
      actions: 'الإجراءات',
      renew: 'تجديد',
      suspend: 'تعليق',
      reactivate: 'تفعيل',
      cancel: 'إلغاء',
      upgrade: 'ترقية',
      downgrade: 'تخفيض',
      all: 'الكل',
      active: 'نشط',
      suspended: 'معلق',
      cancelled: 'ملغى',
      residences: 'العقارات',
      users: 'المستخدمون',
      revenue: 'الإيرادات',
      noSubscriptions: 'لا توجد اشتراكات',
      changePlan: 'تغيير الخطة',
      selectPlan: 'اختر خطة',
      save: 'حفظ'
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
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-border">
            <div className="text-2xl font-bold text-text-primary">{stats.total}</div>
            <div className="text-sm text-text-secondary">Total</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border">
            <div className="text-2xl font-bold text-green-600">{stats.totalActive}</div>
            <div className="text-sm text-text-secondary">{translations.active}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border">
            <div className="text-2xl font-bold text-yellow-600">{stats.totalSuspended}</div>
            <div className="text-sm text-text-secondary">{translations.suspended}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border">
            <div className="text-2xl font-bold text-red-600">{stats.totalCancelled}</div>
            <div className="text-sm text-text-secondary">{translations.cancelled}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['ALL', 'ACTIVE', 'SUSPENDED', 'CANCELLED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-text-secondary hover:bg-surface-elevated border border-border'
              }`}
            >
              {f === 'ALL' && translations.all}
              {f === 'ACTIVE' && translations.active}
              {f === 'SUSPENDED' && translations.suspended}
              {f === 'CANCELLED' && translations.cancelled}
            </button>
          ))}
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-elevated">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.organization}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.plan}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.startDate}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.endDate}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.residences}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.revenue}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.status}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-text-tertiary">
                      {translations.noSubscriptions}
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-surface-elevated transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-text-primary">{sub.name}</div>
                          <div className="text-sm text-text-tertiary">{sub.email}</div>
                          <div className="text-sm text-text-tertiary">{sub.city}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {sub.plan ? (
                          <div>
                            <div className="font-medium text-text-primary">{sub.plan.name}</div>
                            <div className="text-sm text-text-tertiary">{sub.plan.price} MAD/mois</div>
                          </div>
                        ) : (
                          <span className="text-text-tertiary">Aucun</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-text-secondary">
                        {new Date(sub.planStartDate).toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR')}
                      </td>
                      <td className="px-4 py-4 text-text-secondary">
                        {sub.planEndDate ? new Date(sub.planEndDate).toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR') : '-'}
                      </td>
                      <td className="px-4 py-4 text-text-secondary">
                        {sub.residencesCount}
                      </td>
                      <td className="px-4 py-4 text-text-primary font-medium">
                        {sub.totalRevenue.toLocaleString()} MAD
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(sub.subscriptionStatus)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2 flex-wrap">
                          {sub.subscriptionStatus === 'ACTIVE' && (
                            <>
                              <button
                                onClick={() => handleAction(sub.id, 'renew', { duration: 30 })}
                                disabled={processing === sub.id}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                                title={translations.renew}
                              >
                                <RefreshCw className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleAction(sub.id, 'suspend')}
                                disabled={processing === sub.id}
                                className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-lg hover:bg-yellow-200 transition-colors disabled:opacity-50"
                                title={translations.suspend}
                              >
                                <Pause className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleAction(sub.id, 'cancel')}
                                disabled={processing === sub.id}
                                className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                title={translations.cancel}
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => { setSelectedSub(sub); setShowPlanModal(true) }}
                                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-lg hover:bg-purple-200 transition-colors"
                                title={translations.changePlan}
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                            </>
                          )}
                          {sub.subscriptionStatus === 'SUSPENDED' && (
                            <button
                              onClick={() => handleAction(sub.id, 'reactivate')}
                              disabled={processing === sub.id}
                              className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                              title={translations.reactivate}
                            >
                              <Play className="w-3 h-3" />
                            </button>
                          )}
                          {sub.subscriptionStatus === 'CANCELLED' && (
                            <button
                              onClick={() => handleAction(sub.id, 'reactivate')}
                              disabled={processing === sub.id}
                              className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                              title={translations.reactivate}
                            >
                              <Play className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Change Plan Modal */}
      {showPlanModal && selectedSub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-text-primary">{translations.changePlan}</h2>
              <p className="text-sm text-text-secondary">{selectedSub.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">{translations.selectPlan}</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">{translations.selectPlan}</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {plan.price} MAD/mois
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { setShowPlanModal(false); setSelectedSub(null) }}
                  className="flex-1 px-4 py-2 border border-border text-text-secondary rounded-lg hover:bg-surface-elevated transition-colors"
                >
                  {translations.cancel}
                </button>
                <button
                  onClick={handleChangePlan}
                  disabled={processing === selectedSub.id || !selectedPlanId}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing === selectedSub.id && <Loader2 className="w-4 h-4 animate-spin" />}
                  {translations.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
