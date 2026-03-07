'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users, Plus, X, Search, Filter, Mail, Phone, Building2,
  Shield, Home, UserCheck, UserX, MoreVertical, Trash2, Edit
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  apartment?: { number: string; building?: string; residence?: string }
  residence?: string
  createdAt: string
}

interface Residence {
  id: string
  name: string
}

interface Apartment {
  id: string
  number: string
  building?: string
  residence?: { name: string }
}

export default function OwnerUsersPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [residences, setResidences] = useState<Residence[]>([])
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    residenceId: '',
    apartmentId: '',
    password: ''
  })

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/owner/users')
      if (response.ok) {
        const data = await response.json()
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

  const fetchResidences = async () => {
    try {
      const response = await fetch('/api/owner/residences')
      if (response.ok) {
        const data = await response.json()
        const residencesArray = Array.isArray(data) ? data : (data.residences || [])
        setResidences(residencesArray)
      }
    } catch (error) {
      console.error('Error fetching residences:', error)
    }
  }

  const fetchApartments = async (residenceId: string) => {
    if (!residenceId) {
      setApartments([])
      return
    }
    try {
      const response = await fetch(`/api/admin/apartments?residenceId=${residenceId}`)
      if (response.ok) {
        const data = await response.json()
        setApartments(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching apartments:', error)
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
      fetchResidences()
    }
  }, [status, session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/owner/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsModalOpen(false)
        setFormData({
          name: '', email: '', phone: '', role: '',
          residenceId: '', apartmentId: '', password: ''
        })
        fetchUsers()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) return
    
    try {
      const response = await fetch(`/api/owner/users?id=${userId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchUsers()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleRoleChange = (role: string) => {
    setFormData({ 
      ...formData, 
      role, 
      residenceId: '', 
      apartmentId: '' 
    })
    setApartments([])
  }

  const handleResidenceChange = (residenceId: string) => {
    setFormData({ ...formData, residenceId, apartmentId: '' })
    fetchApartments(residenceId)
  }

  const filteredUsers = Array.isArray(users) 
    ? users.filter(u => {
        const matchesFilter = filter === 'all' || u.role === filter
        const matchesSearch = !searchQuery || 
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesFilter && matchesSearch
      })
    : []

  const translations = {
    fr: {
      title: 'Utilisateurs',
      subtitle: 'Gérez les utilisateurs et leurs rôles',
      addUser: 'Ajouter un utilisateur',
      search: 'Rechercher...',
      name: 'Nom complet',
      email: 'Email',
      phone: 'Téléphone',
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
      selectResidence: 'Sélectionner une résidence',
      apartment: 'Appartement',
      selectApartment: 'Sélectionner un appartement',
      invite: 'Ajouter',
      password: 'Mot de passe',
      createdAt: 'Créé le',
      confirmDelete: 'Voulez-vous supprimer cet utilisateur?',
      noResidence: 'Aucune',
    },
    ar: {
      title: 'المستخدمون',
      subtitle: 'إدارة المستخدمين وأدوارهم',
      addUser: 'إضافة مستخدم',
      search: 'بحث...',
      name: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
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
      selectResidence: 'اختر العقار',
      apartment: 'الشقة',
      selectApartment: 'اختر الشقة',
      invite: 'إضافة',
      password: 'كلمة المرور',
      createdAt: 'تاريخ الإنشاء',
      confirmDelete: 'هل تريد حذف هذا المستخدم؟',
      noResidence: 'لا يوجد',
    }
  }

  const t = translations[locale as 'fr' | 'ar'] || translations.fr

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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Shield className="w-4 h-4" />
      case 'ADMIN':
        return <Building2 className="w-4 h-4" />
      case 'RESIDENT':
        return <Home className="w-4 h-4" />
      default:
        return <UserCheck className="w-4 h-4" />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER': return t.owner
      case 'ADMIN': return t.admin
      case 'RESIDENT': return t.resident
      default: return role
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-MA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

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

  return (
    <div className={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="page-header">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">{t.title}</h1>
            <p className="page-subtitle">{t.subtitle}</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
            {t.addUser}
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
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'OWNER', 'ADMIN', 'RESIDENT'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? t.all : getRoleLabel(f)}
            </Button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-text-tertiary mb-4" />
              <p className="text-text-secondary">{t.noUsers}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-elevated">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">{t.name}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">{t.email}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">{t.role}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">{t.residence}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">{t.createdAt}</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-elevated">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {getRoleIcon(user.role)}
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${getRoleBadge(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {user.apartment 
                          ? `${user.apartment.number}${user.apartment.building ? ` (${user.apartment.building})` : ''}`
                          : user.residence || t.noResidence}
                      </td>
                      <td className="px-4 py-3 text-text-secondary text-sm">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            className="text-error hover:text-error"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t.addUser}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">{t.name} *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary"
                    placeholder="Mohamed Benali"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">{t.email} *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">{t.phone}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary"
                    placeholder="+212 6XX XXX XXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">{t.password} *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">{t.role} *</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary"
                  >
                    <option value="">{t.selectRole}</option>
                    <option value="ADMIN">{t.admin}</option>
                    <option value="RESIDENT">{t.resident}</option>
                  </select>
                </div>

                {formData.role === 'ADMIN' && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.residence} *</label>
                    <select
                      required
                      value={formData.residenceId}
                      onChange={(e) => handleResidenceChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary"
                    >
                      <option value="">{t.selectResidence}</option>
                      {residences.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.role === 'RESIDENT' && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">{t.apartment} *</label>
                    <select
                      required
                      value={formData.apartmentId}
                      onChange={(e) => setFormData({ ...formData, apartmentId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary"
                    >
                      <option value="">{t.selectApartment}</option>
                      {apartments.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.number} {a.building ? `(${a.building})` : ''} - {a.residence?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    {t.cancel}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? '...' : t.invite}
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
