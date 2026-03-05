'use client'

import { useTranslations } from '@/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const residents = [
  { id: 1, name: 'Mohamed Rachidi', email: 'mohamed.rachidi@email.com', phone: '+212 6 12 34 56 78', apartment: 'A12', building: 'Résidence Al-Manar', role: 'owner' },
  { id: 2, name: 'Fatima Zahra', email: 'fatima.zahra@email.com', phone: '+212 6 23 45 67 89', apartment: 'B8', building: 'Résidence Al-Manar', role: 'resident' },
  { id: 3, name: 'Ahmed Kaddouri', email: 'ahmed.kaddouri@email.com', phone: '+212 6 34 56 78 90', apartment: 'C3', building: 'Résidence Assa', role: 'owner' },
  { id: 4, name: 'Youssef Amrani', email: 'youssef.amrani@email.com', phone: '+212 6 45 67 89 01', apartment: 'B12', building: 'Résidence Assa', role: 'resident' },
  { id: 5, name: 'Khadija Idrissi', email: 'khadija.idrissi@email.com', phone: '+212 6 56 78 90 12', apartment: 'D5', building: 'Résidence Oasis', role: 'owner' },
  { id: 6, name: 'Omar Bensaid', email: 'omar.bensaid@email.com', phone: '+212 6 67 89 01 23', apartment: 'A3', building: 'Résidence Les Palmes', role: 'resident' },
]

export default function ResidentsPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const t = useTranslations(locale)

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">{t('residents.title')}</h1>
          <p className="page-subtitle">{t('dashboard.stats.residents')}</p>
        </div>
        <Button>
          <PlusIcon className="w-4 h-4 mr-2" />
          {t('residents.add')}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">{t('residents.list.name')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">{t('residents.list.apartment')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">{t('residents.list.email')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">{t('residents.list.phone')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">{t('residents.list.role')}</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-text-secondary">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {residents.map((resident, index) => (
                  <tr key={resident.id} className="border-b border-border hover:bg-surface-elevated/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">{resident.name.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-text-primary">{resident.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{resident.apartment}</td>
                    <td className="px-6 py-4 text-text-secondary">{resident.email}</td>
                    <td className="px-6 py-4 text-text-secondary">{resident.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${resident.role === 'owner' ? 'badge-warning' : 'badge-info'}`}>
                        {t(`residents.roles.${resident.role}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-surface-elevated rounded-lg transition-colors">
                        <EyeIcon className="w-4 h-4 text-text-tertiary" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
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

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}
