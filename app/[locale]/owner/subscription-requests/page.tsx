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

interface ApprovalResult {
  success: boolean
  message: string
  admin?: {
    id: string
    email: string
    temporaryPassword: string
  }
  organization?: {
    id: string
    name: string
  }
  residence?: {
    id: string
    name: string
  }
}

export default function SubscriptionRequestsPage({ params }: { params: { locale: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { locale } = params
  
  const [requests, setRequests] = useState<SubscriptionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null)
  const [approvalResult, setApprovalResult] = useState<ApprovalResult | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')

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
        
        if (action === 'approve') {
          // Store the approval result to show credentials
          setApprovalResult(data)
          setSelectedRequest(null) // Close detail modal
        } else {
          alert(data.message)
        }
        
        fetchRequests()
        setShowRejectModal(false)
        setRejectNotes('')
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
      fullName: 'Nom complet',
      organization: 'Organisation',
      residenceName: 'Résidence',
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
      fullName: 'الاسم الكامل',
      organization: 'المنظمة',
      residenceName: 'العقار',
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
                        <div className="flex gap-2">
                          {/* View Details Button */}
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors"
                          >
                            {locale === 'fr' ? 'Voir' : locale === 'ar' ? 'عرض' : 'View'}
                          </button>
                          
                          {request.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleAction(request.id, 'approve')}
                                disabled={processing === request.id}
                                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                              >
                                {processing === request.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                {translations.approve}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request)
                                  setShowRejectModal(true)
                                }}
                                disabled={processing === request.id}
                                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                              >
                                <XCircle className="w-4 h-4" />
                                {translations.reject}
                              </button>
                            </>
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


      {/* Detail Modal */}
      {selectedRequest && !showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-text-primary">
                  {locale === 'fr' ? 'Détails de la demande' : locale === 'ar' ? 'تفاصيل الطلب' : 'Request Details'}
                </h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-text-tertiary" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Client Info */}
              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase mb-3">
                  {locale === 'fr' ? 'Informations client' : locale === 'ar' ? 'معلومات العميل' : 'Client Information'}
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-surface-elevated p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-text-tertiary">{locale === 'fr' ? 'Nom complet' : locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}</p>
                    <p className="font-medium text-text-primary">{selectedRequest.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary">Email</p>
                    <p className="font-medium text-text-primary">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary">{locale === 'fr' ? 'Téléphone' : locale === 'ar' ? 'الهاتف' : 'Phone'}</p>
                    <p className="font-medium text-text-primary">{selectedRequest.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary">{locale === 'fr' ? 'Langue' : locale === 'ar' ? 'اللغة' : 'Language'}</p>
                    <p className="font-medium text-text-primary">{selectedRequest.preferredLanguage}</p>
                  </div>
                </div>
              </div>

              {/* Residence Info */}
              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase mb-3">
                  {locale === 'fr' ? 'Informations résidence' : locale === 'ar' ? 'معلومات العقار' : 'Residence Information'}
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-surface-elevated p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-text-tertiary">{locale === 'fr' ? 'Organisation' : locale === 'ar' ? 'المنظمة' : 'Organization'}</p>
                    <p className="font-medium text-text-primary">{selectedRequest.organizationName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary">{locale === 'fr' ? 'Résidence' : locale === 'ar' ? 'العقار' : 'Residence'}</p>
                    <p className="font-medium text-text-primary">{selectedRequest.residenceName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary">{locale === 'fr' ? 'Adresse' : locale === 'ar' ? 'العنوان' : 'Address'}</p>
                    <p className="font-medium text-text-primary">{selectedRequest.address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary">{locale === 'fr' ? 'Ville' : locale === 'ar' ? 'المدينة' : 'City'}</p>
                    <p className="font-medium text-text-primary">{selectedRequest.city}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary">{locale === 'fr' ? 'Appartements' : locale === 'ar' ? 'الشقق' : 'Apartments'}</p>
                    <p className="font-medium text-text-primary">{selectedRequest.numberOfApartments}</p>
                  </div>
                </div>
              </div>

              {/* Plan & Billing */}
              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase mb-3">
                  {locale === 'fr' ? 'Plan et facturation' : locale === 'ar' ? 'الخطة والفوترة' : 'Plan & Billing'}
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-surface-elevated p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-text-tertiary">{locale === 'fr' ? 'Plan' : locale === 'ar' ? 'الخطة' : 'Plan'}</p>
                    <p className="font-medium text-text-primary">{selectedRequest.plan?.name || selectedRequest.selectedPlanSlug}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary">{locale === 'fr' ? 'Facturation' : locale === 'ar' ? 'الفوترة' : 'Billing'}</p>
                    <p className="font-medium text-text-primary">
                      {selectedRequest.billingCycle === 'yearly' 
                        ? (locale === 'fr' ? 'Annuel' : locale === 'ar' ? 'سنوي' : 'Yearly')
                        : (locale === 'fr' ? 'Mensuel' : locale === 'ar' ? 'شهري' : 'Monthly')}
                    </p>
                  </div>
                  {selectedRequest.plan && (
                    <div>
                      <p className="text-xs text-text-tertiary">{locale === 'fr' ? 'Prix' : locale === 'ar' ? 'السعر' : 'Price'}</p>
                      <p className="font-medium text-text-primary">
                        {selectedRequest.billingCycle === 'yearly' && selectedRequest.plan.yearlyPrice 
                          ? `${selectedRequest.plan.yearlyPrice} MAD`
                          : `${selectedRequest.plan.price} MAD`}
                        <span className="text-text-tertiary text-sm">
                          /{selectedRequest.billingCycle === 'yearly' 
                            ? (locale === 'fr' ? 'an' : locale === 'ar' ? 'سنة' : 'year')
                            : (locale === 'fr' ? 'mois' : locale === 'ar' ? 'شهر' : 'month')}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase mb-3">
                  {locale === 'fr' ? 'Paiement' : locale === 'ar' ? 'الدفع' : 'Payment'}
                </h3>
                <div className="bg-surface-elevated p-4 rounded-xl space-y-3">
                  <div>
                    <p className="text-xs text-text-tertiary">{locale === 'fr' ? 'Référence' : locale === 'ar' ? 'المرجع' : 'Reference'}</p>
                    <p className="font-mono font-medium text-text-primary">{selectedRequest.paymentReference}</p>
                  </div>
                  {selectedRequest.bankTransferProofUrl && (
                    <div>
                      <p className="text-xs text-text-tertiary mb-2">{locale === 'fr' ? 'Preuve' : locale === 'ar' ? 'الإثبات' : 'Proof'}</p>
                      <a
                        href={selectedRequest.bankTransferProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        <CreditCard className="w-4 h-4" />
                        {locale === 'fr' ? 'Voir' : locale === 'ar' ? 'عرض' : 'View'}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedRequest.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-text-secondary uppercase mb-3">
                    {locale === 'fr' ? 'Notes' : locale === 'ar' ? 'ملاحظات' : 'Notes'}
                  </h3>
                  <div className="bg-surface-elevated p-4 rounded-xl">
                    <p className="text-text-primary">{selectedRequest.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            {selectedRequest.status === 'PENDING' && (
              <div className="p-6 border-t border-border flex gap-3 justify-end">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 text-text-secondary hover:bg-surface-elevated rounded-lg transition-colors"
                >
                  {locale === 'fr' ? 'Fermer' : locale === 'ar' ? 'إغلاق' : 'Close'}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  {locale === 'fr' ? 'Rejeter' : locale === 'ar' ? 'رفض' : 'Reject'}
                </button>
                <button
                  onClick={() => handleAction(selectedRequest.id, 'approve')}
                  disabled={processing === selectedRequest.id}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {processing === selectedRequest.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {locale === 'fr' ? 'Approuver' : locale === 'ar' ? 'موافقة' : 'Approve'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-text-primary">
                {locale === 'fr' ? 'Rejeter la demande' : locale === 'ar' ? 'رفض الطلب' : 'Reject Request'}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-text-secondary mb-4">
                {locale === 'fr' 
                  ? `Êtes-vous sûr de vouloir rejeter la demande de ${selectedRequest.email} ?`
                  : locale === 'ar'
                  ? `هل أنت متأكد من رفض طلب ${selectedRequest.email}؟`
                  : `Are you sure you want to reject the request from ${selectedRequest.email}?`}
              </p>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {locale === 'fr' ? 'Raison (optionnel)' : locale === 'ar' ? 'السبب (اختياري)' : 'Reason (optional)'}
                </label>
                <textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <button
                onClick={() => { setShowRejectModal(false); setRejectNotes('') }}
                className="px-4 py-2 text-text-secondary hover:bg-surface-elevated rounded-lg transition-colors"
              >
                {locale === 'fr' ? 'Annuler' : locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => handleAction(selectedRequest.id, 'reject', rejectNotes)}
                disabled={processing === selectedRequest.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {processing === selectedRequest.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                {locale === 'fr' ? 'Rejeter' : locale === 'ar' ? 'رفض' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Success Modal */}
      {approvalResult && approvalResult.success && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-border text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary">
                {locale === 'fr' ? 'Demande approuvée!' : locale === 'ar' ? 'تمت الموافقة!' : 'Request Approved!'}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-text-secondary mb-6">
                {locale === 'fr' 
                  ? 'Organisation et administrateur créés avec succès.'
                  : locale === 'ar'
                  ? 'تم إنشاء المنظمة والمسؤول بنجاح.'
                  : 'Organization and admin created successfully.'}
              </p>
              
              <div className="bg-surface-elevated rounded-xl p-4 space-y-4">
                <div>
                  <p className="text-xs text-text-tertiary">{locale === 'fr' ? 'Organisation' : locale === 'ar' ? 'المنظمة' : 'Organization'}</p>
                  <p className="font-medium text-text-primary">{approvalResult.organization?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">{locale === 'fr' ? 'Email admin' : locale === 'ar' ? 'بريد المسؤول' : 'Admin Email'}</p>
                  <p className="font-medium text-text-primary">{approvalResult.admin?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">{locale === 'fr' ? 'Mot de passe temporaire' : locale === 'ar' ? 'كلمة المرور المؤقتة' : 'Temporary Password'}</p>
                  <p className="font-mono font-bold text-lg text-primary bg-white px-3 py-2 rounded-lg border border-border">
                    {approvalResult.admin?.temporaryPassword}
                  </p>
                </div>
              </div>
              
              <p className="text-xs text-text-tertiary mt-4 text-center">
                {locale === 'fr' 
                  ? 'Veuillez partager ces identifiants avec le client.'
                  : locale === 'ar'
                  ? 'يرجى مشاركة هذه البيانات مع العميل.'
                  : 'Please share these credentials with the client.'}
              </p>
            </div>
            <div className="p-6 border-t border-border">
              <button
                onClick={() => setApprovalResult(null)}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                {locale === 'fr' ? 'Fermer' : locale === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
