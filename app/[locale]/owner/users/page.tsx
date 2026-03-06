'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function OwnerUsersPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/owner/users')
      if (response.ok) {
        const data = await response.json()
        // Handle both array and object response shapes
        const usersArray = Array.isArray(data) ? data : (data.users || [])
        setUsers(usersArray)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
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
      fetchUsers()
    }
  }, [status, session])

  const translations = {
    fr: {
      title: 'Utilisateurs',
      subtitle: 'Gérez les utilisateurs et leurs rôles',
      addUser: 'Ajouter un utilisateur',
      name: 'Nom',
      email: 'Email',
      role: 'Rôle',
      status: 'Statut',
      actions: 'Actions',
      active: 'Actif',
      inactive: 'Inactif',
      edit: 'Modifier',
      delete: 'Supprimer',
      save: 'Enregistrer',
      cancel: 'Annuler',
      noUsers: 'Aucun utilisateur trouvé',
      all: 'Tous',
      owner: 'Propriétaire',
      admin: 'Administrateur',
      resident: 'Résident',
      selectRole: 'Sélectionner un rôle',
      residence: 'Résidence',
      apartment: 'Appartement',
      invite: 'Inviter',
    },
    ar: {
      title: 'المستخدمون',
      subtitle: 'إدارة المستخدمين وأدوارهم',
      addUser: 'إضافة مستخدم',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      role: 'الدور',
      status: 'الحالة',
      actions: 'الإجراءات',
      active: 'نشط',
      inactive: 'غير نشط',
      edit: 'تعديل',
      delete: 'حذف',
      save: 'حفظ',
      cancel: 'إلغاء',
      noUsers: 'لا يوجد مستخدمون',
      all: 'الكل',
      owner: 'مالك',
      admin: 'مسؤول',
      resident: 'مقيم',
      selectRole: 'اختر الدور',
      residence: 'العقار',
      apartment: 'الشقة',
      invite: 'دعوة',
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'OWNER') {
    return null
  }

  const filteredUsers = Array.isArray(users) ? (filter === 'all' ? users : users.filter(u => u.role === filter)) : []

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'badge-primary'
      case 'ADMIN':
        return 'badge-info'
      case 'RESIDENT':
        return 'badge-success'
      default:
        return 'badge-secondary'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER':
        return t.owner
      case 'ADMIN':
        return t.admin
      case 'RESIDENT':
        return t.resident
      default:
        return role
    }
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
            {t.addUser}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          {t.all}
        </Button>
        <Button
          variant={filter === 'OWNER' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('OWNER')}
        >
          {t.owner}
        </Button>
        <Button
          variant={filter === 'ADMIN' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('ADMIN')}
        >
          {t.admin}
        </Button>
        <Button
          variant={filter === 'RESIDENT' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('RESIDENT')}
        >
          {t.resident}
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-elevated">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">{t.name}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">{t.email}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">{t.role}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">{t.residence}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">{t.status}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-elevated">
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${getRoleBadge(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {user.residence || user.apartment || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        {user.status === 'active' ? t.active : t.inactive}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">{t.edit}</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle>{t.addUser}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <Input label={t.name} placeholder="Nom complet" />
                <Input label={t.email} placeholder="email@exemple.com" type="email" />
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">{t.role}</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary">
                    <option value="">{t.selectRole}</option>
                    <option value="ADMIN">{t.admin}</option>
                    <option value="RESIDENT">{t.resident}</option>
                  </select>
                </div>
                <Input label={t.residence} placeholder="Résidence Al-Manar" />
                <Input label={t.apartment} placeholder="A1" />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    {t.cancel}
                  </Button>
                  <Button type="submit">
                    {t.invite}
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
