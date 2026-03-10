'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { 
  Building2, MapPin, Users, Home, AlertCircle, CheckCircle2, 
  Clock, Search, Filter, Plus, X, ChevronDown, ChevronRight
} from 'lucide-react'

interface Residence {
  id: string
  name: string
  address: string
  city: string
  postalCode?: string
  description?: string
  numberOfBuildings?: number
  numberOfApartments?: number
  contactPhone?: string
  email?: string
  status: string
  apartments: number
  occupiedApartments: number
  vacantApartments: number
  occupancyRate: number
  residents: number
  admin?: { name: string; email: string }
  unpaidCharges: number
  totalRevenue: number
  openMaintenanceRequests: number
}

export default function OwnerResidencesPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [residences, setResidences] = useState<Residence[]>([])
  const [groupedByCity, setGroupedByCity] = useState<Record<string, Residence[]>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set())
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    description: '',
    numberOfBuildings: 1,
    numberOfApartments: '',
    contactPhone: '',
    email: '',
    notes: '',
    status: 'ACTIVE',
    adminUserId: ''
  })

  const fetchResidences = async () => {
    try {
      const response = await fetch('/api/owner/residences')
      if (response.ok) {
        const data = await response.json()
        const residencesArray = Array.isArray(data) ? data : (data.residences || [])
        setResidences(residencesArray)
        
        // Group by city
        const grouped: Record<string, Residence[]> = {}
        for (const res of residencesArray) {
          if (!grouped[res.city]) grouped[res.city] = []
          grouped[res.city].push(res)
        }
        setGroupedByCity(grouped)
        
        // Expand all cities by default
        setExpandedCities(new Set(Object.keys(grouped)))
      }
    } catch (error) {
      console.error('Error fetching residences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/owner/users')
      if (response.ok) {
        const data = await response.json()
        return Array.isArray(data) ? data.filter((u: any) => u.role === 'ADMIN') : []
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
    }
    return []
  }

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
      fetchResidences()
    }
  }, [status, session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/owner/residences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setIsModalOpen(false)
        setFormData({
          name: '', address: '', city: '', postalCode: '', description: '',
          numberOfBuildings: 1, numberOfApartments: '',
          contactPhone: '', email: '', notes: '', status: 'ACTIVE', adminUserId: ''
        })
        fetchResidences()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create residence')
      }
    } catch (error) {
      console.error('Error creating residence:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleCity = (city: string) => {
    const newExpanded = new Set(expandedCities)
    if (newExpanded.has(city)) {
      newExpanded.delete(city)
    } else {
      newExpanded.add(city)
    }
    setExpandedCities(newExpanded)
  }

  const filteredResidences = residences.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const filteredGroupedByCity: Record<string, Residence[]> = {}
  for (const [city, resList] of Object.entries(groupedByCity)) {
    const filtered = resList.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           r.address.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filterStatus === 'all' || r.status === filterStatus
      return matchesSearch && matchesStatus
    })
    if (filtered.length > 0) {
      filteredGroupedByCity[city] = filtered
    }
  }

  const translations = {
    fr: {
      title: 'Résidences',
      subtitle: 'Gérez toutes vos résidences',
      addResidence: 'Ajouter une résidence',
      search: 'Rechercher une résidence...',
      filterAll: 'Tous les statuts',
      filterActive: 'Actif',
      filterInactive: 'Inactif',
      name: 'Nom',
      address: 'Adresse',
      city: 'Ville',
      postalCode: 'Code postal',
      description: 'Description',
      numberOfBuildings: 'Nombre de bâtiments',
      numberOfApartments: "Nombre d'appartements",
      contactPhone: 'Téléphone',
      email: 'Email',
      notes: 'Notes',
      status: 'Statut',
      admin: 'Syndic',
      selectAdmin: 'Sélectionner un syndic',
      save: 'Enregistrer',
      cancel: 'Annuler',
      noResidences: 'Aucune résidence trouvée',
      addFirst: 'Ajoutez votre première résidence pour commencer',
      apartments: 'Appartements',
      residents: 'Résidents',
      occupancy: 'Occupation',
      unpaid: 'Charges impayées',
      revenue: 'Revenus',
      requests: 'Demandes',
      active: 'Actif',
      inactive: 'Inactif',
      maintenance: 'En maintenance',
      edit: 'Modifier',
      details: 'Détails',
      buildings: 'bâtiments',
      editResidence: 'Modifier la résidence',
      residenceDetails: 'Détails de la résidence',
    },
    ar: {
      title: 'العقارات',
      subtitle: 'إدارة جميع العقارات',
      addResidence: 'إضافة عقار',
      search: 'البحث عن عقار...',
      filterAll: 'جميع الحالات',
      filterActive: 'نشط',
      filterInactive: 'غير نشط',
      name: 'الاسم',
      address: 'العنوان',
      city: 'المدينة',
      postalCode: 'الرمز البريدي',
      description: 'الوصف',
      numberOfBuildings: 'عدد المباني',
      numberOfApartments: 'عدد الشقق',
      contactPhone: 'الهاتف',
      email: 'البريد الإلكتروني',
      notes: 'ملاحظات',
      status: 'الحالة',
      admin: 'المسؤول',
      selectAdmin: 'اختر المسؤول',
      save: 'حفظ',
      cancel: 'إلغاء',
      noResidences: 'لا توجد عقارات',
      addFirst: 'أضف عقارك الأول للبدء',
      apartments: 'شقق',
      residents: 'مقيمون',
      occupancy: 'الإشغال',
      unpaid: 'الرسوم غير المدفوعة',
      revenue: 'الإيرادات',
      requests: 'الطلبات',
      active: 'نشط',
      inactive: 'غير نشط',
      maintenance: 'صيانة',
      edit: 'تعديل',
      details: 'التفاصيل',
      buildings: 'مباني',
      editResidence: 'تعديل العقار',
      residenceDetails: 'تفاصيل العقار',
    }
  }

  const t = translations[locale as 'fr' | 'ar'] || translations.fr

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="badge badge-success">{t.active}</span>
      case 'INACTIVE':
        return <span className="badge badge-warning">{t.inactive}</span>
      case 'MAINTENANCE':
        return <span className="badge badge-info">{t.maintenance}</span>
      default:
        return <span className="badge badge-secondary">{status}</span>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(amount)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'OWNER') {
    return null
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t.title}</h1>
            <p className="text-text-secondary mt-1">{t.subtitle}</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
            {t.addResidence}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          <input
            type="text"
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">{t.filterAll}</option>
          <option value="ACTIVE">{t.filterActive}</option>
          <option value="INACTIVE">{t.filterInactive}</option>
        </select>
      </div>

      {/* Residences by City */}
      {Object.keys(filteredGroupedByCity).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-text-tertiary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">{t.noResidences}</h3>
            <p className="text-text-secondary mb-6">{t.addFirst}</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
              {t.addResidence}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(filteredGroupedByCity).map(([city, cityResidences]) => (
            <div key={city}>
              {/* City Header */}
              <button
                onClick={() => toggleCity(city)}
                className="flex items-center gap-2 mb-4 text-lg font-semibold text-text-primary hover:text-primary transition-colors"
              >
                {expandedCities.has(city) ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
                <MapPin className="w-5 h-5 text-primary" />
                {city}
                <span className="text-sm font-normal text-text-tertiary">
                  ({cityResidences.length} {cityResidences.length === 1 ? 'résidence' : 'résidences'})
                </span>
              </button>
              
              {/* Residences Grid */}
              {expandedCities.has(city) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cityResidences.map((residence) => (
                    <Card key={residence.id} className="hover:shadow-lg transition-all border-border/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg font-semibold">{residence.name}</CardTitle>
                            <p className="text-sm text-text-secondary mt-1">{residence.address}</p>
                          </div>
                          {getStatusBadge(residence.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-surface-elevated rounded-lg p-3">
                            <div className="flex items-center gap-2 text-text-tertiary mb-1">
                              <Home className="w-4 h-4" />
                              <span className="text-xs">{t.apartments}</span>
                            </div>
                            <p className="text-lg font-bold text-text-primary">
                              {residence.apartments}
                              <span className="text-xs font-normal text-text-tertiary ltr:ml-1 rtl:mr-1">
                                ({residence.occupiedApartments} {t.residents})
                              </span>
                            </p>
                          </div>
                          <div className="bg-surface-elevated rounded-lg p-3">
                            <div className="flex items-center gap-2 text-text-tertiary mb-1">
                              <Users className="w-4 h-4" />
                              <span className="text-xs">{t.occupancy}</span>
                            </div>
                            <p className="text-lg font-bold text-text-primary">{residence.occupancyRate}%</p>
                          </div>
                          <div className="bg-surface-elevated rounded-lg p-3">
                            <div className="flex items-center gap-2 text-text-tertiary mb-1">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs">{t.unpaid}</span>
                            </div>
                            <p className={`text-lg font-bold ${residence.unpaidCharges > 0 ? 'text-warning' : 'text-success'}`}>
                              {formatCurrency(residence.unpaidCharges)}
                            </p>
                          </div>
                          <div className="bg-surface-elevated rounded-lg p-3">
                            <div className="flex items-center gap-2 text-text-tertiary mb-1">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-xs">{t.requests}</span>
                            </div>
                            <p className={`text-lg font-bold ${residence.openMaintenanceRequests > 0 ? 'text-error' : 'text-success'}`}>
                              {residence.openMaintenanceRequests}
                            </p>
                          </div>
                        </div>
                        
                        {/* Admin */}
                        {residence.admin && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-text-tertiary">{t.admin}:</span>
                            <span className="font-medium text-text-primary">{residence.admin.name}</span>
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-border">
                          <Button variant="outline" size="sm" className="flex-1">
                            {t.details}
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            {t.edit}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Residence Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t.addResidence}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.name} *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Résidence Al-Manar"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.address} *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="45 Boulevard Zerktouni"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.city} *</label>
                    <select
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Sélectionner une ville</option>
                      <option value="Casablanca">Casablanca</option>
                      <option value="Rabat">Rabat</option>
                      <option value="Marrakech">Marrakech</option>
                      <option value="Fès">Fès</option>
                      <option value="Tanger">Tanger</option>
                      <option value="Agadir">Agadir</option>
                      <option value="Meknès">Meknès</option>
                      <option value="Oujda">Oujda</option>
                      <option value="Kénitra">Kénitra</option>
                      <option value="Tétouan">Tétouan</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.postalCode}</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="20000"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.description}</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Description de la résidence..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.numberOfBuildings}</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.numberOfBuildings}
                      onChange={(e) => setFormData({ ...formData, numberOfBuildings: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.numberOfApartments}</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.numberOfApartments}
                      onChange={(e) => setFormData({ ...formData, numberOfApartments: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="24"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.contactPhone}</label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="+212 6XX XXX XXX"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.email}</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="contact@residence.ma"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.status}</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="ACTIVE">{t.active}</option>
                      <option value="INACTIVE">{t.inactive}</option>
                      <option value="MAINTENANCE">{t.maintenance}</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.notes}</label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Notes supplémentaires..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    {t.cancel}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? '...' : t.save}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
