'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/hooks/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard'

export default function PaymentsPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations(locale)
  
  const [payments, setPayments] = useState<any[]>([])
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
      fetchPayments()
    }
  }, [status, session])

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments')
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch payments')
      }
    } catch (err) {
      setError('Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-success/10 text-success'
      case 'PENDING': return 'bg-warning/10 text-warning'
      case 'OVERDUE': return 'bg-error/10 text-error'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle className="w-5 h-5 text-success" />
      case 'PENDING': return <Clock className="w-5 h-5 text-warning" />
      case 'OVERDUE': return <AlertCircle className="w-5 h-5 text-error" />
      default: return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout locale={locale} role="ADMIN">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout locale={locale} role="ADMIN">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <p className="text-error">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  const paidAmount = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0)
  
  const pendingAmount = payments
    .filter(p => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0)

  const paidCount = payments.filter(p => p.status === 'PAID').length
  const pendingCount = payments.filter(p => p.status === 'PENDING').length

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('payments.title') || 'Paiements'}</h1>
          <p className="page-subtitle">{t('payments.subtitle') || 'Suivez les paiements des charges'}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{payments.length}</p>
                <p className="text-sm text-text-secondary">{t('payments.total') || 'Total'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{formatCurrency(paidAmount)}</p>
                <p className="text-sm text-text-secondary">{t('payments.paid') || 'Payé'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">{formatCurrency(pendingAmount)}</p>
                <p className="text-sm text-text-secondary">{t('payments.pending') || 'En attente'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-info/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{paidCount}/{payments.length}</p>
                <p className="text-sm text-text-secondary">{t('payments.rate') || 'Taux'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('payments.history') || 'Historique des paiements'}</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary">{t('payments.empty') || 'Aucun paiement trouvé'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(payment.status)}
                    <div>
                      <p className="font-medium">{payment.charge?.title || 'Charge'}</p>
                      <p className="text-sm text-text-secondary">
                        {payment.apartment?.building && <span>Bâtiment {payment.apartment.building} - </span>}
                        Appartement {payment.apartment?.number}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {payment.charge?.month && monthNames[payment.charge.month - 1]} {payment.charge?.year}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(payment.amount)}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status === 'PAID' ? (t('payments.paid') || 'Payé') :
                       payment.status === 'PENDING' ? (t('payments.pending') || 'En attente') :
                       (t('payments.overdue') || 'En retard')}
                    </span>
                    {payment.paidDate && (
                      <p className="text-xs text-text-tertiary mt-1">
                        {t('payments.paidOn') || 'Payé le'} {new Date(payment.paidDate).toLocaleDateString('fr-MA')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
