'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Upload, Check, Loader2, Building2, MapPin, Home, Users, CreditCard, ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  plan: Plan | null
  locale: string
}

export function SubscriptionModal({ isOpen, onClose, plan, locale }: SubscriptionModalProps) {
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    residenceName: '',
    city: '',
    address: '',
    numberOfApartments: '',
    notes: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [paymentReference, setPaymentReference] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = locale === 'fr' ? 'Le nom complet est requis' : locale === 'ar' ? 'الاسم الكامل مطلوب' : 'Full name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = locale === 'fr' ? 'L\'email est requis' : locale === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = locale === 'fr' ? 'Email invalide' : locale === 'ar' ? 'بريد إلكتروني غير صالح' : 'Invalid email'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = locale === 'fr' ? 'Le téléphone est requis' : locale === 'ar' ? 'الهاتف مطلوب' : 'Phone is required'
    }
    if (!formData.residenceName.trim()) {
      newErrors.residenceName = locale === 'fr' ? 'Le nom de la résidence est requis' : locale === 'ar' ? 'اسم العقار مطلوب' : 'Residence name is required'
    }
    if (!formData.city.trim()) {
      newErrors.city = locale === 'fr' ? 'La ville est requise' : locale === 'ar' ? 'المدينة مطلوبة' : 'City is required'
    }
    if (!formData.address.trim()) {
      newErrors.address = locale === 'fr' ? 'L\'adresse est requise' : locale === 'ar' ? 'العنوان مطلوب' : 'Address is required'
    }
    if (!formData.numberOfApartments.trim()) {
      newErrors.numberOfApartments = locale === 'fr' ? 'Le nombre d\'appartements est requis' : locale === 'ar' ? 'عدد الشقق مطلوب' : 'Number of apartments is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFormNext = () => {
    if (!validateForm()) return
    // Move to payment step without submitting yet
    setStep('payment')
  }

  const handleSubmitWithPayment = async () => {
    if (!file) {
      setErrors({ ...errors, file: locale === 'fr' ? 'La preuve de paiement est requise' : locale === 'ar' ? 'مطلوب إثبات الدفع' : 'Payment proof is required' })
      return
    }
    
    setLoading(true)
    try {
      // First create the subscription request
      const subResponse = await fetch('/api/public/subscription-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          numberOfApartments: parseInt(formData.numberOfApartments),
          planId: plan?.id,
          selectedPlanSlug: plan?.slug,
          billingCycle: billingCycle,
          preferredLanguage: locale
        })
      })
      
      const subData = await subResponse.json()
      
      if (!subResponse.ok) {
        setErrors({ submit: subData.error || (locale === 'fr' ? 'Erreur lors de la soumission' : locale === 'ar' ? 'خطأ في الإرسال' : 'Submission error') })
        setLoading(false)
        return
      }
      
      setPaymentReference(subData.paymentReference)
      
      // Then upload the payment proof
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('paymentReference', subData.paymentReference)
      
      const proofResponse = await fetch('/api/public/payment-proof', {
        method: 'POST',
        body: formDataUpload
      })
      
      const proofData = await proofResponse.json()
      
      if (proofResponse.ok) {
        setStep('success')
      } else {
        setErrors({ submit: proofData.error || (locale === 'fr' ? 'Erreur lors de l\'upload' : locale === 'ar' ? 'خطأ في الرفع' : 'Upload error') })
      }
    } catch (error) {
      setErrors({ submit: locale === 'fr' ? 'Erreur de connexion' : locale === 'ar' ? 'خطأ في الاتصال' : 'Connection error' })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!allowedTypes.includes(selectedFile.type)) {
        setErrors({ ...errors, file: locale === 'fr' ? 'Type de fichier non autorisé' : locale === 'ar' ? 'نوع الملف غير مسموح' : 'File type not allowed' })
        return
      }
      // Validate file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, file: locale === 'fr' ? 'Fichier trop volumineux (max 5MB)' : locale === 'ar' ? 'الملف كبير جداً (بحد أقصى 5 ميجابايت)' : 'File too large (max 5MB)' })
        return
      }
      setFile(selectedFile)
      setErrors({ ...errors, file: '' })
      
      // Create preview
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview(reader.result as string)
        }
        reader.readAsDataURL(selectedFile)
      } else {
        setFilePreview(null)
      }
    }
  }

  const t = {
    fr: {
      title: 'Demande d\'abonnement',
      subtitle: 'Remplissez le formulaire pour commencer',
      fullName: 'Nom complet',
      email: 'Email',
      phone: 'Téléphone',
      residenceName: 'Nom de la résidence',
      city: 'Ville',
      address: 'Adresse',
      numberOfApartments: 'Nombre d\'appartements',
      notes: 'Notes (optionnel)',
      selectedPlan: 'Plan sélectionné',
      monthly: 'mois',
      yearly: 'an',
      submit: 'Soumettre la demande',
      back: 'Retour',
      paymentTitle: 'Effectuez votre paiement',
      paymentInstructions: 'Effectuez un virement bancaire avec les informations ci-dessous:',
      beneficiary: 'Bénéficiaire',
      bank: 'Banque',
      rib: 'RIB',
      amount: 'Montant',
      reference: 'Référence de paiement',
      includeReference: 'Incluez cette référence dans votre virement',
      uploadProof: 'Preuve de virement',
      uploadButton: 'Télécharger le fichier',
      uploadSubmit: 'Confirmer le paiement',
      successTitle: 'Demande soumise!',
      successMessage: 'Votre demande a été enregistrée. Nous la traiterons sous 24-48h.',
      close: 'Fermer',
      or: 'ou',
      continueToPayment: 'Continuer vers le paiement'
    },
    ar: {
      title: 'طلب الاشتراك',
      subtitle: 'املأ النموذج للبدء',
      fullName: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      residenceName: 'اسم العقار',
      city: 'المدينة',
      address: 'العنوان',
      numberOfApartments: 'عدد الشقق',
      notes: 'ملاحظات (اختياري)',
      selectedPlan: 'الخطة المختارة',
      monthly: 'شهر',
      yearly: 'سنة',
      submit: 'إرسال الطلب',
      back: 'رجوع',
      paymentTitle: 'قم بالدفع',
      paymentInstructions: 'قم بتحويل مصرفي بالمعلومات أدناه:',
      beneficiary: 'المستفيد',
      bank: 'البنك',
      rib: 'الرقم الدولي للحساب',
      amount: 'المبلغ',
      reference: 'مرجع الدفع',
      includeReference: 'أدخل هذا المرجع في تحويلك',
      uploadProof: 'إثبات التحويل',
      uploadButton: 'تحميل الملف',
      uploadSubmit: 'تأكيد الدفع',
      successTitle: 'تم إرسال الطلب!',
      successMessage: 'تم تسجيل طلبك. سنعالج خلال 24-48 ساعة.',
      close: 'إغلاق',
      or: 'أو',
      continueToPayment: 'المتابعة للدفع'
    },
    en: {
      title: 'Subscription Request',
      subtitle: 'Fill out the form to get started',
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      residenceName: 'Residence Name',
      city: 'City',
      address: 'Address',
      numberOfApartments: 'Number of Apartments',
      notes: 'Notes (optional)',
      selectedPlan: 'Selected Plan',
      monthly: 'month',
      yearly: 'year',
      submit: 'Submit Request',
      back: 'Back',
      paymentTitle: 'Make Your Payment',
      paymentInstructions: 'Make a bank transfer with the information below:',
      beneficiary: 'Beneficiary',
      bank: 'Bank',
      rib: 'IBAN',
      amount: 'Amount',
      reference: 'Payment Reference',
      includeReference: 'Include this reference in your transfer',
      uploadProof: 'Transfer Proof',
      uploadButton: 'Upload File',
      uploadSubmit: 'Confirm Payment',
      successTitle: 'Request Submitted!',
      successMessage: 'Your request has been recorded. We will process it within 24-48h.',
      close: 'Close',
      or: 'or',
      continueToPayment: 'Continue to Payment'
    }
  }

  const translations = t[locale as keyof typeof t] || t.fr
  const price = billingCycle === 'YEARLY' && plan?.yearlyPrice 
    ? Math.round(plan.yearlyPrice / 12) 
    : plan?.monthlyPrice
  
  const fullPrice = billingCycle === 'YEARLY' && plan?.yearlyPrice 
    ? plan.yearlyPrice 
    : plan?.monthlyPrice

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-scale-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-elevated">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              {step === 'form' && translations.title}
              {step === 'payment' && translations.paymentTitle}
              {step === 'success' && translations.successTitle}
            </h2>
            {step === 'form' && (
              <p className="text-sm text-text-secondary mt-1">{translations.subtitle}</p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface transition-colors text-text-secondary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {step === 'form' && (
            <div className="space-y-4">
              {/* Selected Plan Badge */}
              {plan && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary">{translations.selectedPlan}</p>
                      <p className="text-lg font-bold text-primary">{plan.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-text-primary">{price} DH</p>
                      <p className="text-sm text-text-secondary">/{billingCycle === 'MONTHLY' ? (locale === 'fr' ? 'mois' : locale === 'ar' ? 'شهر' : 'month') : (locale === 'fr' ? 'an' : locale === 'ar' ? 'سنة' : 'year')}</p>
                    </div>
                  </div>
                  
                  {/* Billing Cycle Selector */}
                  <div className="mt-4">
                    <div className="flex bg-surface rounded-lg p-1 border border-border">
                      <button
                        type="button"
                        onClick={() => setBillingCycle('MONTHLY')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          billingCycle === 'MONTHLY'
                            ? 'bg-primary text-white'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {locale === 'fr' ? 'Mensuel' : locale === 'ar' ? 'شهري' : 'Monthly'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingCycle('YEARLY')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          billingCycle === 'YEARLY'
                            ? 'bg-primary text-white'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {locale === 'fr' ? 'Annuel' : locale === 'ar' ? 'سنوي' : 'Yearly'}
                        {plan.yearlyPrice && (
                          <span className="block text-xs opacity-75">
                            {locale === 'fr' ? 'Économie' : locale === 'ar' ? 'توفير' : 'Save'} {Math.round((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100)}%
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  {translations.fullName} *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.fullName ? 'border-error' : 'border-border'} bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-primary/50`}
                  placeholder={translations.fullName}
                />
                {errors.fullName && <p className="text-error text-sm mt-1">{errors.fullName}</p>}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {translations.email} *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-error' : 'border-border'} bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-primary/50`}
                    placeholder="exemple@email.com"
                  />
                  {errors.email && <p className="text-error text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {translations.phone} *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-error' : 'border-border'} bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-primary/50`}
                    placeholder="+212 6XX XXX XXX"
                  />
                  {errors.phone && <p className="text-error text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Residence Name */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  {translations.residenceName} *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                  <input
                    type="text"
                    value={formData.residenceName}
                    onChange={(e) => setFormData({ ...formData, residenceName: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.residenceName ? 'border-error' : 'border-border'} bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-primary/50`}
                    placeholder={translations.residenceName}
                  />
                </div>
                {errors.residenceName && <p className="text-error text-sm mt-1">{errors.residenceName}</p>}
              </div>

              {/* City & Address */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {translations.city} *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.city ? 'border-error' : 'border-border'} bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-primary/50`}
                      placeholder={translations.city}
                    />
                  </div>
                  {errors.city && <p className="text-error text-sm mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {translations.numberOfApartments} *
                  </label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                    <input
                      type="number"
                      value={formData.numberOfApartments}
                      onChange={(e) => setFormData({ ...formData, numberOfApartments: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.numberOfApartments ? 'border-error' : 'border-border'} bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-primary/50`}
                      placeholder="10"
                      min="1"
                    />
                  </div>
                  {errors.numberOfApartments && <p className="text-error text-sm mt-1">{errors.numberOfApartments}</p>}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  {translations.address} *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.address ? 'border-error' : 'border-border'} bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-primary/50`}
                  placeholder={translations.address}
                />
                {errors.address && <p className="text-error text-sm mt-1">{errors.address}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  {translations.notes}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder={translations.notes}
                  rows={2}
                />
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
                  {errors.submit}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleFormNext}
                className="w-full py-3 px-6 bg-primary text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors"
              >
                {locale === 'fr' ? 'Continuer vers le paiement' : locale === 'ar' ? 'المتابعة للدفع' : 'Continue to Payment'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div className="w-8 h-0.5 bg-primary" />
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white text-sm font-medium">2</span>
                </div>
              </div>

              {/* Bank Transfer Instructions */}
              <div className="bg-surface-elevated rounded-xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  {locale === 'fr' ? 'Informations bancaires' : locale === 'ar' ? 'المعلومات المصرفية' : 'Bank Information'}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-text-secondary">{locale === 'fr' ? 'Bénéficiaire' : locale === 'ar' ? 'المستفيد' : 'Beneficiary'}</span>
                    <span className="font-semibold text-text-primary">DARENCY</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-text-secondary">{locale === 'fr' ? 'Banque' : locale === 'ar' ? 'البنك' : 'Bank'}</span>
                    <span className="font-semibold text-text-primary">Banque Populaire</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-text-secondary">{locale === 'fr' ? 'RIB' : locale === 'ar' ? 'الرقم الدولي' : 'IBAN'}</span>
                    <span className="font-mono text-sm text-text-primary">123456789012345678901234</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-text-secondary">{locale === 'fr' ? 'Montant' : locale === 'ar' ? 'المبلغ' : 'Amount'}</span>
                    <span className="font-bold text-xl text-primary">
                      {fullPrice} MAD
                      <span className="text-sm font-normal text-text-secondary ml-1">
                        /{billingCycle === 'MONTHLY' ? (locale === 'fr' ? 'mois' : locale === 'ar' ? 'شهر' : 'mo') : (locale === 'fr' ? 'an' : locale === 'ar' ? 'سنة' : 'yr')}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Reference - will be shown after submission */}
              {paymentReference && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                  <p className="text-sm text-text-secondary mb-2">{locale === 'fr' ? 'Référence de paiement' : locale === 'ar' ? 'مرجع الدفع' : 'Payment Reference'}</p>
                  <p className="text-3xl font-mono font-bold text-center text-primary tracking-wider">{paymentReference}</p>
                  <p className="text-center text-text-secondary text-sm mt-2">{locale === 'fr' ? 'Incluez cette référence dans votre virement' : locale === 'ar' ? 'أدخل هذا المرجع في تحويلك' : 'Include this reference in your transfer'}</p>
                </div>
              )}

              {/* Upload Section */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {translations.uploadProof} <span className="text-error">*</span>
                </label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                  {file ? (
                    <div className="space-y-3">
                      {filePreview ? (
                        <img src={filePreview} alt="Preview" className="max-h-32 mx-auto rounded-lg" />
                      ) : (
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                          <CreditCard className="w-8 h-8 text-primary" />
                        </div>
                      )}
                      <p className="text-sm text-text-primary font-medium">{file.name}</p>
                      <button
                        type="button"
                        onClick={() => { setFile(null); setFilePreview(null) }}
                        className="text-sm text-error hover:underline"
                      >
                        {locale === 'fr' ? 'Supprimer' : locale === 'ar' ? 'حذف' : 'Remove'}
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="payment-proof"
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="payment-proof" className="cursor-pointer">
                        <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-3">
                          <Upload className="w-8 h-8 text-text-tertiary" />
                        </div>
                        <p className="text-text-primary font-medium">{translations.uploadButton}</p>
                        <p className="text-text-tertiary text-sm mt-1">JPEG, PNG, PDF (max 5MB)</p>
                      </label>
                    </>
                  )}
                </div>
                {errors.file && <p className="text-error text-sm mt-1">{errors.file}</p>}
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
                  {errors.submit}
                </div>
              )}

              {/* Submit Button - submits both request and proof */}
              <button
                type="button"
                onClick={handleSubmitWithPayment}
                disabled={loading || !file}
                className="w-full py-3 px-6 bg-primary text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {locale === 'fr' ? 'Soumettre la demande' : locale === 'ar' ? 'إرسال الطلب' : 'Submit Request'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full py-3 px-6 border border-border text-text-primary rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-surface-elevated transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                {translations.back}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">{translations.successTitle}</h3>
              <p className="text-text-secondary mb-6">{translations.successMessage}</p>
              
              <div className="bg-surface-elevated rounded-xl p-4 mb-6">
                <p className="text-sm text-text-secondary mb-1">{translations.reference}</p>
                <p className="text-xl font-mono font-bold text-primary">{paymentReference}</p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-6 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
              >
                {translations.close}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
