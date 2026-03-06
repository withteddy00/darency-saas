'use client'

import { useTranslations } from '@/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const requests = [
  { id: 1, title: 'Fuite d\'eau dans l\'appartement B4', description: 'Fuite importante au niveau du robinet de l\'évier', status: 'pending', priority: 'high', building: 'Résidence Al-Manar', apartment: 'B4', date: '2026-03-04' },
  { id: 2, title: 'Panne d\'ascenseur', description: 'L\'ascenseur est bloqué au 5ème étage', status: 'in_progress', priority: 'urgent', building: 'Résidence Assa', apartment: 'Hall', date: '2026-03-03' },
  { id: 3, title: 'Réparation éclairage hall', description: 'Lumière du hall d\'entrée défectueuse', status: 'completed', priority: 'low', building: 'Résidence Oasis', apartment: 'Hall', date: '2026-03-01' },
  { id: 4, title: 'Maintenance climatisation', description: 'La climatisation ne fonctionne pas correctement', status: 'pending', priority: 'medium', building: 'Résidence Al-Manar', apartment: 'A8', date: '2026-03-02' },
  { id: 5, title: 'Porte de garage cassée', description: 'La porte de garage ne se ferme plus', status: 'pending', priority: 'high', building: 'Résidence Les Palmes', apartment: 'Garage', date: '2026-03-04' },
]

export default function RequestsPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const t = useTranslations(locale)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'badge-warning'
      case 'in_progress': return 'badge-info'
      case 'completed': return 'badge-success'
      case 'cancelled': return 'badge-error'
      default: return 'badge-info'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-error'
      case 'high': return 'text-warning'
      case 'medium': return 'text-info'
      case 'low': return 'text-text-tertiary'
      default: return 'text-text-secondary'
    }
  }

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">{t('requests.title')}</h1>
          <p className="page-subtitle">{t('dashboard.stats.pendingRequests')}</p>
        </div>
        <Button>
          <PlusIcon className="w-4 h-4 mr-2" />
          {t('requests.add')}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">{t('requests.table.title')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">{t('common.address')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">{t('requests.table.priority')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">{t('requests.table.status')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">{t('requests.table.date')}</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-text-secondary">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request, index) => (
                  <tr key={request.id} className="border-b border-border hover:bg-surface-elevated/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-text-primary">{request.title}</p>
                        <p className="text-sm text-text-tertiary">{request.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{request.building} - {request.apartment}</td>
                    <td className="px-6 py-4">
                      <span className={getPriorityColor(request.priority)}>
                        {t(`requests.priority.${request.priority}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusColor(request.status)}>
                        {t(`requests.status.${request.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{new Date(request.date).toLocaleDateString('fr-MA')}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-surface-elevated rounded-lg transition-colors">
                          <EyeIcon className="w-4 h-4 text-text-tertiary" />
                        </button>
                        <button className="p-2 hover:bg-surface-elevated rounded-lg transition-colors">
                          <EditIcon className="w-4 h-4 text-text-tertiary" />
                        </button>
                      </div>
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

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}
