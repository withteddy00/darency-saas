'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Search,
  Filter,
  User,
  Activity,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react'

interface ActivityLog {
  id: string
  action: string
  target: string
  targetId: string | null
  description: string | null
  metadata: Record<string, any> | null
  userId: string | null
  userName: string | null
  userEmail: string | null
  userRole: string | null
  organizationId: string | null
  residenceId: string | null
  residenceName: string | null
  createdAt: string
}

interface UserFilter {
  id: string
  name: string
  email: string
  role: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ActivityLogsPage({ params }: { params: { locale: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { locale } = params
  
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [users, setUsers] = useState<UserFilter[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 })
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    target: '',
    dateFrom: '',
    dateTo: ''
  })

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
      fetchLogs()
    }
  }, [status, session, pagination.page])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', pagination.page.toString())
      params.append('limit', '50')
      if (filters.userId) params.append('userId', filters.userId)
      if (filters.action) params.append('action', filters.action)
      if (filters.target) params.append('target', filters.target)

      const response = await fetch(`/api/owner/activity-logs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
        setPagination(prev => ({ ...prev, ...data.pagination }))
        if (data.filters?.users) {
          setUsers(data.filters.users)
        }
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchLogs()
  }

  const clearFilters = () => {
    setFilters({ userId: '', action: '', target: '', dateFrom: '', dateTo: '' })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      APPROVE: 'bg-green-100 text-green-800',
      REJECT: 'bg-red-100 text-red-800',
      SUSPEND: 'bg-yellow-100 text-yellow-800',
      ACTIVATE: 'bg-green-100 text-green-800',
      RENEW: 'bg-purple-100 text-purple-800',
      CANCEL: 'bg-red-100 text-red-800',
      RESET_PASSWORD: 'bg-orange-100 text-orange-800',
      LOGIN: 'bg-blue-100 text-blue-800',
      LOGOUT: 'bg-gray-100 text-gray-800'
    }
    const color = colors[action] || 'bg-gray-100 text-gray-800'
    return <span className={`px-2 py-0.5 text-xs rounded-full ${color}`}>{action}</span>
  }

  const uniqueActions = Array.from(new Set(logs.map(l => l.action).filter(Boolean)))
  const uniqueTargets = Array.from(new Set(logs.map(l => l.target).filter(Boolean)))

  if (status === 'loading' || loading && logs.length === 0) {
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
      title: 'Journal d\'activité',
      subtitle: 'Historique de toutes les actions sur la plateforme',
      back: 'Retour au tableau de bord',
      user: 'Utilisateur',
      role: 'Rôle',
      action: 'Action',
      target: 'Cible',
      residence: 'Résidence',
      timestamp: 'Date/Heure',
      filters: 'Filtres',
      apply: 'Appliquer',
      clear: 'Effacer',
      allUsers: 'Tous les utilisateurs',
      allActions: 'Toutes les actions',
      allTargets: 'Toutes les cibles',
      noLogs: 'Aucune activité trouvée',
      previous: 'Précédent',
      next: 'Suivant',
      page: 'Page',
      of: 'sur',
      refresh: 'Actualiser'
    },
    ar: {
      title: 'سجل النشاط',
      subtitle: 'سجل جميع الإجراءات على المنصة',
      back: 'العودة إلى لوحة التحكم',
      user: 'المستخدم',
      role: 'الدور',
      action: 'الإجراء',
      target: 'الهدف',
      residence: 'العقار',
      timestamp: 'التاريخ/الوقت',
      filters: 'الفلاتر',
      apply: 'تطبيق',
      clear: 'مسح',
      allUsers: 'جميع المستخدمين',
      allActions: 'جميع الإجراءات',
      allTargets: 'جميع الأهداف',
      noLogs: 'لا يوجد نشاط',
      previous: 'السابق',
      next: 'التالي',
      page: 'صفحة',
      of: 'من',
      refresh: 'تحديث'
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
            <button
              onClick={fetchLogs}
              className="flex items-center gap-2 px-4 py-2 bg-surface-elevated text-text-secondary rounded-lg hover:bg-border transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {translations.refresh}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-border p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-text-secondary" />
            <span className="font-medium text-text-primary">{translations.filters}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">{translations.user}</label>
              <select
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">{translations.allUsers}</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.name || user.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">{translations.action}</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">{translations.allActions}</option>
                {uniqueActions.map((action) => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">{translations.target}</label>
              <select
                value={filters.target}
                onChange={(e) => handleFilterChange('target', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">{translations.allTargets}</option>
                {uniqueTargets.map((target) => (
                  <option key={target} value={target}>{target}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={applyFilters}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                {translations.apply}
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-border text-text-secondary rounded-lg hover:bg-surface-elevated transition-colors"
              >
                {translations.clear}
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-elevated">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.timestamp}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.user}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.action}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.target}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.residence}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-text-tertiary">
                      {translations.noLogs}
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-elevated transition-colors">
                      <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString(locale === 'ar' ? 'ar-MA' : 'fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-text-tertiary" />
                          <div>
                            <div className="text-sm text-text-primary">{log.userName || 'System'}</div>
                            <div className="text-xs text-text-tertiary">{log.userEmail}</div>
                          </div>
                        </div>
                        {log.userRole && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{log.userRole}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-text-primary">{log.target}</div>
                        {log.targetId && <div className="text-xs text-text-tertiary">{log.targetId.slice(0, 8)}...</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {log.residenceName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary max-w-xs truncate">
                        {log.description || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-border flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                {translations.page} {pagination.page} {translations.of} {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="p-2 border border-border rounded-lg hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 border border-border rounded-lg hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
