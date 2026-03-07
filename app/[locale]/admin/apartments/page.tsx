'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/dashboard'
import { Building2, Users, Plus, Home, DoorOpen, AlertCircle } from 'lucide-react'

export default function ApartmentsPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations(locale)
  
  const [apartments, setApartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`)
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      if (session?.user?.role === 'OWNER') {
        router.push(`/${locale}/owner`)
      } else if (session?.user?.role === 'RESIDENT') {
        router.push(`/${locale}/resident`)
      }
    }
  }, [status, session, router, locale])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchApartments()
    }
  }, [status, session])

  const fetchApartments = async () => {
    try {
      const response = await fetch('/api/admin/apartments')
      if (response.ok) {
        const data = await response.json()
        setApartments(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch apartments')
      }
    } catch (err) {
      setError('Failed to fetch apartments')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
          <p className="text-error">{error}</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  const occupiedCount = apartments.filter(a => a.status === 'OCCUPIED').length
  const vacantCount = apartments.filter(a => a.status === 'VACANT').length

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">{t('apartments.title') || 'Appartements'}</h1>
          <p className="page-subtitle">{t('apartments.subtitle') || 'Gérez vos appartements'}</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t('apartments.add') || 'Ajouter'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{apartments.length}</p>
                <p className="text-sm text-text-secondary">{t('apartments.total') || 'Total'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <Users className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{occupiedCount}</p>
                <p className="text-sm text-text-secondary">{t('apartments.occupied') || 'Occupés'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <DoorOpen className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vacantCount}</p>
                <p className="text-sm text-text-secondary">{t('apartments.vacant') || 'Vacants'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Apartments Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apartments.map((apartment, index) => (
          <Card key={apartment.id} className="hover:shadow-card-hover transition-shadow" style={{ animationDelay: `${index * 0.05}s` }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {apartment.building && <span>Bâtiment {apartment.building}</span>}
                  <span>Appartement {apartment.number}</span>
                </CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  apartment.status === 'OCCUPIED' ? 'bg-success/10 text-success' :
                  apartment.status === 'VACANT' ? 'bg-warning/10 text-warning' :
                  'bg-error/10 text-error'
                }`}>
                  {apartment.status === 'OCCUPIED' ? (t('apartments.occupied') || 'Occupé') :
                   apartment.status === 'VACANT' ? (t('apartments.vacant') || 'Vacant') :
                   (t('apartments.maintenance') || 'Maintenance')}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{t('apartments.type') || 'Type'}</span>
                  <span className="font-medium">{apartment.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{t('apartments.floor') || 'Étage'}</span>
                  <span className="font-medium">{apartment.floor}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{t('apartments.area') || 'Surface'}</span>
                  <span className="font-medium">{apartment.area} m²</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{t('apartments.bedrooms') || 'Chambres'}</span>
                  <span className="font-medium">{apartment.bedrooms}</span>
                </div>
                {apartment.resident && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-text-secondary mb-1">{t('apartments.resident') || 'Résident'}</p>
                    <p className="font-medium">{apartment.resident.name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {apartments.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
          <p className="text-text-secondary">{t('apartments.empty') || 'Aucun appartement trouvé'}</p>
        </div>
      )}
    </div>
  )
}
