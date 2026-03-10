'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Building2, 
  Users, 
  CreditCard, 
  Wrench,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface SubscriptionRequest {
  id: string
  // Contact / Account Information
  fullName: string
  email: string
  phone: string
  passwordTemp: string | null
  preferredLanguage: string
  // Residence / Organization Information
  organizationName: string
  residenceName: string
  address: string
  city: string
  country: string
  numberOfBuildings: number
  numberOfFloors: number
  numberOfApartments: number
  estimatedNumberOfResidents: number | null
  // Subscription Information
  plan: {
    id: string
    name: string
    price: number
    yearlyPrice: number | null
  } | null
  selectedPlanSlug: string
  billingCycle: string
  notes: string | null
  // Business Information
  ice: string | null
  rc: string | null
  taxId: string | null
  website: string | null
  // Payment Information
  paymentReference: string
  bankTransferProofUrl: string | null
  bankTransferProofName: string | null
  // Status
  status: string
  adminNotes: string | null
  createdAt: string
  expiresAt: string | null
}

export default function SubscriptionRequestsPage({ params }: { params: { locale: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { locale } = params
  
  const [requests, setRequests] = useState<SubscriptionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')

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
      fetchRequests()
    }
  }, [status, session])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/owner/subscription-requests')
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests)
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    setProcessing(requestId)
    try {
      const response = await fetch('/api/owner/subscription-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, requestId, notes })
      })
      
      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        fetchRequests()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to process request')
      }
    } catch (error) {
      console.error('Error processing request:', error)
      alert('Failed to process request')
    } finally {
      setProcessing(null)
    }
  }

  const filteredRequests = requests.filter(r => 
    filter === 'ALL' ? true : r.status === filter
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> En attente</span>
      case 'APPROVED':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approuvé</span>
      case 'REJECTED':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejeté</span>
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
      title: 'Demandes d\'abonnement',
      subtitle: 'Gérez les demandes d\'abonnement des clients',
      back: 'Retour au tableau de bord',
      organization: 'Organisation',
      email: 'Email',
      phone: 'Téléphone',
      plan: 'Plan',
      apartments: 'Appartements',
      requestDate: 'Date de demande',
      status: 'Statut',
      actions: 'Actions',
      approve: 'Approuver',
      reject: 'Rejeter',
      all: 'Tous',
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      address: 'Adresse',
      city: 'Ville',
      noRequests: 'Aucune demande trouvée',
      processing: 'Traitement en cours...'
    },
    ar: {
      title: 'طلبات الاشتراك',
      subtitle: 'إدارة طلبات الاشتراك من العملاء',
      back: 'العودة إلى لوحة التحكم',
      organization: 'المنظمة',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      plan: 'الخطة',
      apartments: 'الشقق',
      requestDate: 'تاريخ الطلب',
      status: 'الحالة',
      actions: 'الإجراءات',
      approve: 'موافقة',
      reject: 'رفض',
      all: 'الكل',
      pending: 'قيد الانتظار',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
      address: 'العنوان',
      city: 'المدينة',
      noRequests: 'لا توجد طلبات',
      processing: 'جارٍ المعالجة...'
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
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((f) => (
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
              {f === 'PENDING' && translations.pending}
              {f === 'APPROVED' && translations.approved}
              {f === 'REJECTED' && translations.rejected}
            </button>
          ))}
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-elevated">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.organization}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.email}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.plan}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{locale === 'fr' ? 'Facturation' : locale === 'ar' ? 'الفوترة' : 'Billing'}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.apartments}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.requestDate}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.status}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-text-tertiary">
                      {translations.noRequests}
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-surface-elevated transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-text-primary">{request.residenceName}</div>
                          <div className="text-sm text-text-tertiary">{request.city}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-text-primary">
                        <div>{request.email}</div>
                        <div className="text-sm text-text-tertiary">{request.phone}</div>
                      </td>
                      <td className="px-4 py-4 text-text-primary">
                        {request.plan ? (
                          <>
                            <span className="font-medium">{request.plan.name}</span>
                            <span className="text-text-tertiary ml-1">
                              ({request.billingCycle === 'yearly' && request.plan.yearlyPrice ? request.plan.yearlyPrice : request.plan.price} MAD)
                            </span>
                          </>
                        ) : (
                          <span className="text-text-tertiary">{request.selectedPlanSlug}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-text-primary">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.billingCycle === 'yearly' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {request.billingCycle === 'yearly' 
                            ? (locale === 'fr' ? 'Annuel' : locale === 'ar' ? 'سنوي' : 'Yearly')
                            : (locale === 'fr' ? 'Mensuel' : locale === 'ar' ? 'شهري' : 'Monthly')}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-text-primary">{request.numberOfApartments}</td>
                      <td className="px-4 py-4 text-text-secondary">
                        {new Date(request.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR')}
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(request.status)}</td>
                      <td className="px-4 py-4">
                        {request.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAction(request.id, 'approve')}
                              disabled={processing === request.id}
                              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              {processing === request.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              {translations.approve}
                            </button>
                            <button
                              onClick={() => handleAction(request.id, 'reject')}
                              disabled={processing === request.id}
                              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                              {translations.reject}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
