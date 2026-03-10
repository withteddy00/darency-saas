'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Building2,
  Users,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Search,
  Phone,
  Mail,
  Home,
  X
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface Admin {
  id: string
  name: string
  email: string
  phone: string
  createdAt: string
  residence: {
    id: string
    name: string
    organization: string
  } | null
}

interface Residence {
  id: string
  name: string
  organizationName: string
}

export default function OwnerAdminsPage({ params }: { params: { locale: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { locale } = params

  const [admins, setAdmins] = useState<Admin[]>([])
  const [residences, setResidences] = useState<Residence[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    residenceId: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`)
    }
  }, [status, router, locale])

  useEffect(() => {
    if (session?.user?.role === 'OWNER') {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [adminsRes, residencesRes] = await Promise.all([
        fetch('/api/owner/admins'),
        fetch('/api/owner/residences')
      ])

      if (adminsRes.ok) {
        const data = await adminsRes.json()
        setAdmins(data.admins || [])
      }

      if (residencesRes.ok) {
        const data = await residencesRes.json()
        setResidences(data.residences || [])
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/owner/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create admin')
        return
      }

      setSuccessMessage(`Admin created! Temporary password: ${data.tempPassword}`)
      setShowModal(false)
      setFormData({ name: '', email: '', phone: '', residenceId: '' })
      fetchData()

      setTimeout(() => setSuccessMessage(''), 10000)
    } catch (err) {
      setError('Failed to create admin')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (adminId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet administrateur?')) return

    try {
      const res = await fetch(`/api/owner/admins?adminId=${adminId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchData()
      } else {
        setError('Failed to delete admin')
      }
    } catch (err) {
      setError('Failed to delete admin')
    }
  }

  const handleResetPassword = async (adminId: string) => {
    try {
      const res = await fetch('/api/owner/admins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, action: 'resetPassword' })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccessMessage(`Password reset! New temporary password: ${data.temporaryPassword}`)
        setTimeout(() => setSuccessMessage(''), 10000)
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch (err) {
      setError('Failed to reset password')
    }
  }

  const handleChangeResidence = async (adminId: string, newResidenceId: string) => {
    try {
      const res = await fetch('/api/owner/admins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, action: 'changeResidence', residenceId: newResidenceId })
      })

      if (res.ok) {
        fetchData()
        setEditingAdmin(null)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to change residence')
      }
    } catch (err) {
      setError('Failed to change residence')
    }
  }

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (admin.residence?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {locale === 'fr' ? 'Administrateurs' : locale === 'ar' ? 'المسؤولون' : 'Administrators'}
            </h1>
            <p className="text-text-secondary">
              {locale === 'fr' 
                ? 'Gérer les administrateurs des résidences' 
                : locale === 'ar' 
                ? 'إدارة مسؤولي العقارات'
                : 'Manage residence administrators'}
            </p>
          </div>

          <Button className="bg-primary hover:bg-primary-dark" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {locale === 'fr' ? 'Ajouter un admin' : locale === 'ar' ? 'إضافة مسؤول' : 'Add Admin'}
          </Button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {successMessage}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <Input
            placeholder={locale === 'fr' ? 'Rechercher...' : locale === 'ar' ? 'بحث...' : 'Search...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Admin List */}
        {filteredAdmins.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">
                {locale === 'fr' ? 'Aucun administrateur trouvé' : locale === 'ar' ? 'لم يتم العثور على مسؤولين' : 'No administrators found'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredAdmins.map((admin) => (
              <Card key={admin.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {admin.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">{admin.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-text-secondary">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {admin.email}
                          </span>
                          {admin.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {admin.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {admin.residence ? (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Home className="w-3 h-3" />
                          {admin.residence.name}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {locale === 'fr' ? 'Non assigné' : locale === 'ar' ? 'غير معين' : 'Unassigned'}
                        </Badge>
                      )}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetPassword(admin.id)}
                          title={locale === 'fr' ? 'Réinitialiser le mot de passe' : locale === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset password'}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingAdmin(admin)}
                          title={locale === 'fr' ? 'Changer la résidence' : locale === 'ar' ? 'تغيير العقار' : 'Change residence'}
                        >
                          <Building2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(admin.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title={locale === 'fr' ? 'Supprimer' : locale === 'ar' ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Admin Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {locale === 'fr' ? 'Nouvel administrateur' : locale === 'ar' ? 'مسؤول جديد' : 'New Administrator'}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                  <div>
                    <Label htmlFor="name">
                      {locale === 'fr' ? 'Nom complet' : locale === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={locale === 'fr' ? 'John Doe' : locale === 'ar' ? 'جون دو' : 'John Doe'}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">
                      {locale === 'fr' ? 'Téléphone' : locale === 'ar' ? 'الهاتف' : 'Phone'}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+212 6 00 00 00 00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="residence">
                      {locale === 'fr' ? 'Résidence' : locale === 'ar' ? 'العقار' : 'Residence'} *
                    </Label>
                    <select
                      id="residence"
                      value={formData.residenceId}
                      onChange={(e) => setFormData({ ...formData, residenceId: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg"
                      required
                    >
                      <option value="">
                        {locale === 'fr' ? 'Sélectionner une résidence' : locale === 'ar' ? 'اختر عقار' : 'Select a residence'}
                      </option>
                      {residences.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.organizationName})
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {locale === 'fr' ? 'Créer l\'administrateur' : locale === 'ar' ? 'إنشاء المسؤول' : 'Create Administrator'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Change Residence Modal */}
        {editingAdmin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {locale === 'fr' ? 'Changer la résidence' : locale === 'ar' ? 'تغيير العقار' : 'Change Residence'}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setEditingAdmin(null)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <p className="text-text-secondary">
                    {locale === 'fr' 
                      ? `Sélectionner une nouvelle résidence pour ${editingAdmin.name}` 
                      : locale === 'ar' 
                      ? `اختر عقار جديد لـ ${editingAdmin.name}`
                      : `Select a new residence for ${editingAdmin.name}`}
                  </p>
                  <select
                    value={editingAdmin.residence?.id || ''}
                    onChange={(e) => handleChangeResidence(editingAdmin.id, e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg"
                  >
                    <option value="">
                      {locale === 'fr' ? 'Sélectionner une résidence' : locale === 'ar' ? 'اختر عقار' : 'Select a residence'}
                    </option>
                    {residences.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.organizationName})
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
