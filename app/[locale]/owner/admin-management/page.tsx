'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Plus,
  User,
  Mail,
  Building2,
  Phone,
  MoreVertical,
  Power,
  Key,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface Admin {
  id: string
  name: string
  email: string
  phone: string | null
  createdAt: string
  updatedAt: string
  residence: {
    id: string
    name: string
    organization: string
  } | null
}

interface Residence {
  id: string
  name: string
}

export default function AdminManagementPage({ params }: { params: { locale: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { locale } = params
  
  const [admins, setAdmins] = useState<Admin[]>([])
  const [residences, setResidences] = useState<Residence[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showResidenceModal, setShowResidenceModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [saving, setSaving] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    residenceId: ''
  })
  const [newResidenceId, setNewResidenceId] = useState('')

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
      fetchData()
    }
  }, [status, session])

  const fetchData = async () => {
    try {
      const [adminsRes, residencesRes] = await Promise.all([
        fetch('/api/owner/admins'),
        fetch('/api/owner/residences-management')
      ])
      
      if (adminsRes.ok) {
        const adminsData = await adminsRes.json()
        setAdmins(adminsData.admins)
      }
      
      if (residencesRes.ok) {
        const residencesData = await residencesRes.json()
        setResidences(residencesData.residences)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/owner/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Admin créé avec mot de passe temporaire: ${data.tempPassword}`)
        setShowModal(false)
        resetForm()
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create admin')
      }
    } catch (error) {
      console.error('Error creating admin:', error)
      alert('Failed to create admin')
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async (adminId: string) => {
    if (!confirm('Réinitialiser le mot de passe de cet admin ?')) return
    
    setProcessing(adminId)
    try {
      const response = await fetch('/api/owner/admins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, action: 'resetPassword' })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Nouveau mot de passe temporaire: ${data.temporaryPassword}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Failed to reset password')
    } finally {
      setProcessing(null)
    }
  }

  const handleSuspend = async (adminId: string) => {
    setProcessing(adminId)
    try {
      const response = await fetch('/api/owner/admins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, action: 'suspend' })
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error suspending admin:', error)
    } finally {
      setProcessing(null)
    }
  }

  const handleChangeResidence = async () => {
    if (!selectedAdmin || !newResidenceId) return
    
    setProcessing(selectedAdmin.id)
    try {
      const response = await fetch('/api/owner/admins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: selectedAdmin.id, action: 'changeResidence', residenceId: newResidenceId })
      })

      if (response.ok) {
        setShowResidenceModal(false)
        setSelectedAdmin(null)
        setNewResidenceId('')
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to change residence')
      }
    } catch (error) {
      console.error('Error changing residence:', error)
    } finally {
      setProcessing(null)
    }
  }

  const handleDelete = async (adminId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet admin ?')) return

    try {
      const response = await fetch(`/api/owner/admins?adminId=${adminId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete admin')
      }
    } catch (error) {
      console.error('Error deleting admin:', error)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', residenceId: '' })
  }

  const openResidenceModal = (admin: Admin) => {
    setSelectedAdmin(admin)
    setNewResidenceId(admin.residence?.id || '')
    setShowResidenceModal(true)
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

  const t = {
    fr: {
      title: 'Gestion des administrateurs',
      subtitle: 'Gérez les administrateurs de toutes les résidences',
      back: 'Retour au tableau de bord',
      addAdmin: 'Ajouter un admin',
      name: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      residence: 'Résidence',
      organization: 'Organisation',
      createdAt: 'Créé le',
      actions: 'Actions',
      resetPassword: 'Réinitialiser mot de passe',
      changeResidence: 'Changer résidence',
      suspend: 'Suspendre',
      activate: 'Activer',
      delete: 'Supprimer',
      save: 'Enregistrer',
      cancel: 'Annuler',
      noAdmins: 'Aucun administrateur trouvé',
      selectResidence: 'Sélectionner une résidence',
      newResidence: 'Nouvelle résidence'
    },
    ar: {
      title: 'إدارة المسؤولين',
      subtitle: 'إدارة مسؤولي جميع العقارات',
      back: 'العودة إلى لوحة التحكم',
      addAdmin: 'إضافة مسؤول',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      residence: 'العقار',
      organization: 'المنظمة',
      createdAt: 'تاريخ الإنشاء',
      actions: 'الإجراءات',
      resetPassword: 'إعادة تعيين كلمة المرور',
      changeResidence: 'تغيير العقار',
      suspend: 'تعليق',
      activate: 'تفعيل',
      delete: 'حذف',
      save: 'حفظ',
      cancel: 'إلغاء',
      noAdmins: 'لا يوجد مسؤولون',
      selectResidence: 'اختر عقار',
      newResidence: 'العقار الجديد'
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
              onClick={() => { resetForm(); setShowModal(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {translations.addAdmin}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admins Table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-elevated">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.name}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.email}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.phone}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.residence}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.createdAt}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">{translations.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-text-tertiary">
                      {translations.noAdmins}
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-surface-elevated transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium text-text-primary">{admin.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-text-primary">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-text-tertiary" />
                          {admin.email}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-text-secondary">
                        {admin.phone || '-'}
                      </td>
                      <td className="px-4 py-4">
                        {admin.residence ? (
                          <div>
                            <div className="flex items-center gap-2 text-text-primary">
                              <Building2 className="w-4 h-4 text-text-tertiary" />
                              {admin.residence.name}
                            </div>
                            <div className="text-sm text-text-tertiary">{admin.residence.organization}</div>
                          </div>
                        ) : (
                          <span className="text-text-tertiary">Non assigné</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-text-secondary">
                        {new Date(admin.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR')}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResetPassword(admin.id)}
                            disabled={processing === admin.id}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                            title={translations.resetPassword}
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openResidenceModal(admin)}
                            className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                            title={translations.changeResidence}
                          >
                            <Building2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSuspend(admin.id)}
                            disabled={processing === admin.id}
                            className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors disabled:opacity-50"
                            title={translations.suspend}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            title={translations.delete}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-text-primary">{translations.addAdmin}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">{translations.name}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">{translations.email}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">{translations.phone}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">{translations.residence}</label>
                <select
                  value={formData.residenceId}
                  onChange={(e) => setFormData({ ...formData, residenceId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">{translations.selectResidence}</option>
                  {residences.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-border text-text-secondary rounded-lg hover:bg-surface-elevated transition-colors"
                >
                  {translations.cancel}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {translations.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Residence Modal */}
      {showResidenceModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-text-primary">{translations.changeResidence}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">{translations.newResidence}</label>
                <select
                  value={newResidenceId}
                  onChange={(e) => setNewResidenceId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">{translations.selectResidence}</option>
                  {residences.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowResidenceModal(false); setSelectedAdmin(null) }}
                  className="flex-1 px-4 py-2 border border-border text-text-secondary rounded-lg hover:bg-surface-elevated transition-colors"
                >
                  {translations.cancel}
                </button>
                <button
                  onClick={handleChangeResidence}
                  disabled={processing === selectedAdmin.id || !newResidenceId}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing === selectedAdmin.id && <Loader2 className="w-4 h-4 animate-spin" />}
                  {translations.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
