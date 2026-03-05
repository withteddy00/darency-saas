'use client'

import { TranslationProvider } from '@/hooks/use-translations'

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  return (
    <TranslationProvider locale={params.locale}>
      {children}
    </TranslationProvider>
  )
}
