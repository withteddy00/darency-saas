'use client'

import { useTranslations } from '@/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const buildings = [
  { id: 1, name: 'Résidence Al-Manar', address: 'Avenue Mohammed V, Rabat', city: 'Rabat', residents: 24, apartments: 24 },
  { id: 2, name: 'Résidence Assa', address: 'Boulevard Hassan II, Casablanca', city: 'Casablanca', residents: 36, apartments: 36 },
  { id: 3, name: 'Résidence Oasis', address: 'Route d\'El Jadida, Marrakech', city: 'Marrakech', residents: 18, apartments: 20 },
  { id: 4, name: 'Résidence Les Palmes', address: 'Corniche, Agadir', city: 'Agadir', residents: 30, apartments: 30 },
]

export default function BuildingsPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const t = useTranslations(locale)

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">{t('buildings.title')}</h1>
          <p className="page-subtitle">{t('dashboard.stats.buildings')}</p>
        </div>
        <Button>
          <PlusIcon className="w-4 h-4 mr-2" />
          {t('buildings.add')}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buildings.map((building, index) => (
          <Card key={building.id} className="hover:shadow-card-hover transition-shadow cursor-pointer animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{building.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-text-secondary">
                  <LocationIcon className="w-4 h-4" />
                  <span className="text-sm">{building.address}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <CityIcon className="w-4 h-4" />
                  <span className="text-sm">{building.city}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{building.apartments}</p>
                    <p className="text-xs text-text-tertiary">Appartements</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary">{building.residents}</p>
                    <p className="text-xs text-text-tertiary">Résidents</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function CityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}
