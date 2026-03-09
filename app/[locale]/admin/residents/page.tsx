'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Users, Search, Edit, Eye } from 'lucide-react'
import { DashboardLayout, SectionCard, EmptyState, StatCard } from '@/components/dashboard'

interface ResidentWithApartment {
  id: string
  name: string
  email: string
  phone: string | null
  apartment: {
    number: string
    building: string | null
    type: string
    status: string
  } | null
}

interface PageProps {
  params: { locale: string }
}

export default function ResidentsPage({ params }: PageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { locale } = params
  const [residents, setResidents] = useState<ResidentWithApartment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`)
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN' && session?.user?.role !== 'OWNER') {
      if (session?.user?.role === 'RESIDENT') {
        router.push(`/${locale}/resident`)
      }
    }
  }, [status, session, router, locale])

  useEffect(() => {
    if (status === 'authenticated' && (session?.user?.role === 'ADMIN' || session?.user?.role === 'OWNER')) {
      fetchResidents()
    }
  }, [status, session])

  const fetchResidents = async () => {
    try {
      const response = await fetch('/api/residents')
      if (response.ok) {
        const data = await response.json()
        setResidents(data)
      }
    } catch (error) {
      console.error('Error fetching residents:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout locale={locale} role={session?.user?.role || 'ADMIN'}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
    return null
  }

  const t = {
    fr: {
      title: 'Résidents',
      description: 'Gérez les résidents de votre propriété',
      searchPlaceholder: 'Rechercher un résident...',
      emptyTitle: 'Aucun résident',
      emptyDescription: 'Les résidents apparaîtront ici une fois ajoutés',
      addResident: 'Ajouter un résident',
      totalResidents: 'Total résidents',
      occupiedApartments: 'Appartements occupés',
      vacantApartments: 'Appartements vacants',
      name: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      apartment: 'Appartement',
      status: 'Statut',
      actions: 'Actions',
      OCCUPIED: 'Occupé',
      VACANT: 'Vacant',
    },
    ar: {
      title: 'المقيمين',
      description: 'إدارة المقيمين في عقارك',
      searchPlaceholder: 'البحث عن مقيم...',
      emptyTitle: 'لا يوجد مقيمون',
      emptyDescription: 'سيظهر المقيمون هنا بمجرد إضافتهم',
      addResident: 'إضافة مقيم',
      totalResidents: 'إجمالي المقيمين',
      occupiedApartments: 'الشقق المشغولة',
      vacantApartments: 'الشقق الشاغرة',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      apartment: 'الشقة',
      status: 'الحالة',
      actions: 'الإجراءات',
      OCCUPIED: 'مشغول',
      VACANT: 'شاغر',
    }
  }

  const translations = t[locale as 'fr' | 'ar'] || t.fr

  const filteredResidents = residents.filter(resident =>
    resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resident.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (resident.apartment && resident.apartment.number.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const stats = [
    { title: translations.totalResidents, value: residents.length.toString(), change: '', changeType: 'neutral' as const, icon: Users, iconColor: 'text-primary' },
    { title: translations.occupiedApartments, value: residents.filter(r => r.apartment?.status === 'OCCUPIED').length.toString(), change: '', changeType: 'positive' as const, icon: Users, iconColor: 'text-success' },
    { title: translations.vacantApartments, value: residents.filter(r => !r.apartment || r.apartment.status === 'VACANT').length.toString(), change: '', changeType: 'neutral' as const, icon: Users, iconColor: 'text-warning' },
  ]

  return (
    <DashboardLayout locale={locale} role={session.user.role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{translations.title}</h1>
            <p className="text-text-secondary mt-1">{translations.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          <input
            type="text"
            placeholder={translations.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Residents Table */}
        <SectionCard title="">
          {filteredResidents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">{translations.name}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">{translations.apartment}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">{translations.email}</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">{translations.phone}</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-text-secondary">{translations.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResidents.map((resident) => (
                    <tr key={resident.id} className="border-b border-border hover:bg-surface-elevated/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-medium">{resident.name.charAt(0)}</span>
                          </div>
                          <span className="font-medium text-text-primary">{resident.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {resident.apartment ? (
                          <div>
                            <span className="text-text-primary">{resident.apartment.number}</span>
                            {resident.apartment.building && (
                              <span className="text-text-tertiary text-sm ml-1">({resident.apartment.building})</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-text-tertiary">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{resident.email}</td>
                      <td className="px-4 py-3 text-text-secondary">{resident.phone || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-2 hover:bg-surface-elevated rounded-lg transition-colors" title="View">
                            <Eye className="w-4 h-4 text-text-tertiary" />
                          </button>
                          <button className="p-2 hover:bg-surface-elevated rounded-lg transition-colors" title="Edit">
                            <Edit className="w-4 h-4 text-text-tertiary" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState 
              icon={Users}
              title={translations.emptyTitle}
              description={translations.emptyDescription}
            />
          )}
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
