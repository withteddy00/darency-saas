'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Wrench } from 'lucide-react'
import { DashboardLayout, SectionCard, EmptyState } from '@/components/dashboard'

interface PageProps {
  params: { locale: string }
}

export default function ResidentRequestsPage({ params }: PageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { locale } = params

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`)
    } else if (status === 'authenticated' && session?.user?.role !== 'RESIDENT') {
      if (session?.user?.role === 'OWNER') {
        router.push(`/${locale}/owner`)
      } else if (session?.user?.role === 'ADMIN') {
        router.push(`/${locale}/admin`)
      }
    }
  }, [status, session, router, locale])

  if (status === 'loading') {
    return (
      <DashboardLayout locale={locale} role="RESIDENT">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session || session.user.role !== 'RESIDENT') {
    return null
  }

  const t = {
    fr: {
      title: 'Mes demandes',
      description: 'Suivez vos demandes de maintenance',
      emptyTitle: 'Aucune demande',
      emptyDescription: 'Vos demandes de maintenance apparaîtront ici',
      createRequest: 'Créer une demande',
    },
    ar: {
      title: 'طلباتي',
      description: 'تتبع طلبات الصيانة',
      emptyTitle: 'لا توجد طلبات',
      emptyDescription: 'ستظهر طلبات الصيانة هنا',
      createRequest: 'إنشاء طلب',
    }
  }

  const translations = t[locale as 'fr' | 'ar'] || t.fr

  return (
    <DashboardLayout locale={locale} role="RESIDENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{translations.title}</h1>
          <p className="text-text-secondary mt-1">{translations.description}</p>
        </div>
        <SectionCard title={translations.title}>
          <EmptyState 
            icon={Wrench}
            title={translations.emptyTitle}
            description={translations.emptyDescription}
          />
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
