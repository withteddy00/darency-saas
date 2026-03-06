'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { CreditCard } from 'lucide-react'
import { DashboardLayout, SectionCard, EmptyState } from '@/components/dashboard'

interface PageProps {
  params: { locale: string }
}

export default function PaymentsPage({ params }: PageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { locale } = params

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`)
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      if (session?.user?.role === 'OWNER') {
        router.push(`/${locale}/owner`)
      } else if (session?.user?.role === 'RESIDENT') {
        router.push(`/${locale}/resident`)
      }
    }
  }, [status, session, router, locale])

  if (status === 'loading') {
    return (
      <DashboardLayout locale={locale} role="ADMIN">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  const t = {
    fr: {
      title: 'Paiements',
      description: 'Validez et gérez les paiements des résidents',
      emptyTitle: 'Aucun paiement',
      emptyDescription: 'Les paiements apparaîtront ici une fois effectués',
    },
    ar: {
      title: 'المدفوعات',
      description: 'تحقق من المدفوعات وإدارتها',
      emptyTitle: 'لا توجد مدفوعات',
      emptyDescription: 'ستظهر المدفوعات هنا بمجرد إجرائها',
    }
  }

  const translations = t[locale as 'fr' | 'ar'] || t.fr

  return (
    <DashboardLayout locale={locale} role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{translations.title}</h1>
          <p className="text-text-secondary mt-1">{translations.description}</p>
        </div>

        {/* Content */}
        <SectionCard title={translations.title}>
          <EmptyState 
            icon={CreditCard}
            title={translations.emptyTitle}
            description={translations.emptyDescription}
          />
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
