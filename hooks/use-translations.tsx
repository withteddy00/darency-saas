'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { i18n, Locale, getDirection } from '@/lib/i18n/config'
import { getTranslation, getTranslations } from '@/lib/i18n/dictionary'

interface TranslationContextType {
  locale: Locale
  t: (key: string) => string
  translations: ReturnType<typeof getTranslations>
  isRTL: boolean
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({
  children,
  locale
}: {
  children: React.ReactNode
  locale: string
}) {
  const validLocale = i18n.locales.includes(locale as Locale) ? locale as Locale : i18n.defaultLocale as Locale
  const [dir, setDir] = useState(getDirection(validLocale))
  const [translations, setTranslations] = useState(() => getTranslations(validLocale))

  useEffect(() => {
    const newLocale = i18n.locales.includes(locale as Locale) ? locale as Locale : i18n.defaultLocale as Locale
    document.documentElement.dir = getDirection(newLocale)
    document.documentElement.lang = newLocale
    setDir(getDirection(newLocale))
    setTranslations(getTranslations(newLocale))
  }, [locale])

  const t = (key: string): string => {
    return getTranslation(validLocale, key)
  }

  return (
    <TranslationContext.Provider value={{ 
      locale: validLocale, 
      t, 
      translations,
      isRTL: validLocale === 'ar' 
    }}>
      <div dir={dir}>
        {children}
      </div>
    </TranslationContext.Provider>
  )
}

/**
 * Hook to use translations within a component
 * @param locale - The locale string (e.g., 'fr', 'ar')
 * @returns Translation function (key) => string
 */
export function useTranslations(locale: string) {
  const context = useContext(TranslationContext)

  // If used within TranslationProvider, use context
  if (context) {
    return context.t
  }

  // Fallback: direct access (for components outside provider)
  const validLocale = i18n.locales.includes(locale as Locale) 
    ? locale as Locale 
    : i18n.defaultLocale as Locale

  return (key: string): string => getTranslation(validLocale, key)
}

/**
 * Hook to get the current locale and translations
 * @returns Object with locale, translations, t function, and isRTL
 */
export function useLocale() {
  const context = useContext(TranslationContext)
  
  if (!context) {
    // Fallback to default
    const defaultLocale = i18n.defaultLocale as Locale
    return {
      locale: defaultLocale,
      translations: getTranslations(defaultLocale),
      t: (key: string) => getTranslation(defaultLocale, key),
      isRTL: defaultLocale === 'ar',
    }
  }
  
  return context
}
