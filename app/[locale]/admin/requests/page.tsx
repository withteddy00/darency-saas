'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus as PlusIconLucide, AlertCircle } from 'lucide-react'

export default function RequestsPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations(locale)
  
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`)
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push(`/${locale}/owner`)
    }
  }, [status, session, router, locale])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchRequests()
    }
  }, [status, session])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/admin/maintenance')
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch requests')
      }
    } catch (err) {
      setError('Failed to fetch requests')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'badge-warning'
      case 'IN_PROGRESS': return 'badge-info'
      case 'COMPLETED': return 'badge-success'
      case 'CANCELLED': return 'badge-error'
      default: return 'badge-info'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-error'
      case 'HIGH': return 'text-warning'
      case 'MEDIUM': return 'text-info'
      case 'LOW': return 'text-text-tertiary'
      default: return 'text-text-secondary'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return t('requests.status.pending') || 'En attente'
      case 'IN_PROGRESS': return t('requests.status.inProgress') || 'En cours'
      case 'COMPLETED': return t('requests.status.completed') || 'Terminé'
      case 'CANCELLED': return t('requests.status.cancelled') || 'Annulé'
      default: return status
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'URGENT': return t('requests.priority.urgent') || 'Urgent'
      case 'HIGH': return t('requests.priority.high') || 'Élevé'
      case 'MEDIUM': return t('requests.priority.medium') || 'Moyen'
      case 'LOW': return t('requests.priority.low') || 'Faible'
      default: return priority
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

  const pendingCount = requests.filter(r => r.status === 'PENDING').length
  const inProgressCount = requests.filter(r => r.status === 'IN_PROGRESS').length
  const completedCount = requests.filter(r => r.status === 'COMPLETED').length

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">{t('requests.title')}</h1>
          <p className="page-subtitle">{t('dashboard.stats.pendingRequests')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <AlertCircle className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-text-secondary">{t('requests.status.pending') || 'En attente'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-info/10 rounded-lg">
                <AlertCircle className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressCount}</p>
                <p className="text-sm text-text-secondary">{t('requests.status.inProgress') || 'En cours'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <AlertCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-sm text-text-secondary">{t('requests.status.completed') || 'Terminé'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                    <td className="px-6 py-4 text-text-secondary">
                      {request.apartment?.building && <span>Bâtiment {request.apartment.building} - </span>}
                      {request.apartment?.number}
                    </td>
                    <td className="px-6 py-4">
                      <span className={getPriorityColor(request.priority)}>
                        {getPriorityLabel(request.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusColor(request.status)}>
                        {getStatusLabel(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {request.createdAt ? new Date(request.createdAt).toLocaleDateString('fr-MA') : '-'}
                    </td>
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
