'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import frTranslations from '@/lib/locales/fr/translation.json'
import arTranslations from '@/lib/locales/ar/translation.json'

type Translations = typeof frTranslations

const translations: Record<string, Translations> = {
  fr: frTranslations,
  ar: arTranslations,
}

interface TranslationContextType {
  locale: string
  t: (key: string) => string
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
  const [dir, setDir] = useState(locale === 'ar' ? 'rtl' : 'ltr')

  useEffect(() => {
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = locale
    setDir(locale === 'ar' ? 'rtl' : 'ltr')
  }, [locale])

  const t = (key: string): string => {
    const keys = key.split('.')
    let result: unknown = translations[locale]
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = (result as Record<string, unknown>)[k]
      } else {
        return key
      }
    }
    
    return typeof result === 'string' ? result : key
  }

  return (
    <TranslationContext.Provider value={{ locale, t, isRTL: locale === 'ar' }}>
      <div dir={dir}>
        {children}
      </div>
    </TranslationContext.Provider>
  )
}

export function useTranslations(locale: string) {
  const context = useContext(TranslationContext)
  
  if (!context) {
    const t = (key: string): string => {
      const keys = key.split('.')
      let result: unknown = translations[locale]
      
      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = (result as Record<string, unknown>)[k]
        } else {
          return key
        }
      }
      
      return typeof result === 'string' ? result : key
    }
    return t
  }
  
  return context.t
}
