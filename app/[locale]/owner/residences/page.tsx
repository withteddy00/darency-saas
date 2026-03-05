'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Mock data for residences
const mockResidences = [
  { id: '1', name: 'Résidence Al-Manar', address: '45 Boulevard Zerktouni, Casablanca', apartments: 3, residents: 3, status: 'active' },
  { id: '2', name: 'Résidence Assa', address: '12 Avenue Hassan II, Rabat', apartments: 24, residents: 18, status: 'active' },
  { id: '3', name: 'Résidence Oasis', address: '88 Rue Mohammed V, Marrakech', apartments: 36, residents: 28, status: 'active' },
]

export default function OwnerResidencesPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [residences, setResidences] = useState(mockResidences)

  const translations = {
    fr: {
      title: 'Résidences',
      subtitle: 'Gérez vos résidences',
      addResidence: 'Ajouter une résidence',
      name: 'Nom',
      address: 'Adresse',
      city: 'Ville',
      apartments: 'Appartements',
      residents: 'Résidents',
      status: 'Statut',
      actions: 'Actions',
      active: 'Actif',
      inactive: 'Inactif',
      edit: 'Modifier',
      delete: 'Supprimer',
      save: 'Enregistrer',
      cancel: 'Annuler',
      view: 'Voir',
      noResidences: 'Aucune résidence trouvée',
    },
    ar: {
      title: 'العقارات',
      subtitle: 'إدارة العقارات',
      addResidence: 'إضافة عقار',
      name: 'الاسم',
      address: 'العنوان',
      city: 'المدينة',
      apartments: 'الشقق',
      residents: 'المقيمين',
      status: 'الحالة',
      actions: 'الإجراءات',
      active: 'نشط',
      inactive: 'غير نشط',
      edit: 'تعديل',
      delete: 'حذف',
      save: 'حفظ',
      cancel: 'إلغاء',
      view: 'عرض',
      noResidences: 'لا توجد عقارات',
    }
  }

  const t = translations[locale as 'fr' | 'ar'] || translations.fr

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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'OWNER') {
    return null
  }

  return (
    <div className={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">{t.title}</h1>
            <p className="page-subtitle">{t.subtitle}</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <svg className="w-5 h-5 ltr:mr-2 rtl:ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {t.addResidence}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {residences.map((residence) => (
          <Card key={residence.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{residence.name}</CardTitle>
                <span className={`badge ${residence.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                  {residence.status === 'active' ? t.active : t.inactive}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary mb-4">{residence.address}</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-text-tertiary">{t.apartments}</p>
                  <p className="font-semibold">{residence.apartments}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary">{t.residents}</p>
                  <p className="font-semibold">{residence.residents}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  {t.edit}
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  {t.view}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Residence Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle>{t.addResidence}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <Input label={t.name} placeholder="Résidence Al-Manar" />
                <Input label={t.address} placeholder="45 Boulevard Zerktouni" />
                <Input label={t.city} placeholder="Casablanca" />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    {t.cancel}
                  </Button>
                  <Button type="submit">
                    {t.save}
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
