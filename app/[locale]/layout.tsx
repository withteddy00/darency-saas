'use client'

import { TranslationProvider } from '@/hooks/use-translations'
import { AuthProvider } from '@/components/providers/auth-provider'

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  return (
    <AuthProvider>
      <TranslationProvider locale={params.locale}>
        {children}
      </TranslationProvider>
    </AuthProvider>
  )
}
