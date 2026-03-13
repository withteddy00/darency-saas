/**
 * Translation Dictionary
 * 
 * Provides type-safe translation loading and access.
 * Supports both static (build-time) and dynamic translation loading.
 */

import frTranslations from '@/lib/locales/fr/translation.json'
import arTranslations from '@/lib/locales/ar/translation.json'
import { i18n, Locale } from './config'

// Static translation dictionary - loaded at build time
// Using 'any' type to handle slight differences between locale files
const translationDict: Record<Locale, any> = {
  fr: frTranslations,
  ar: arTranslations,
}

/**
 * Get translation for a given key and locale
 */
export function getTranslation(locale: Locale, key: string): string {
  const translations = translationDict[locale]
  if (!translations) return key

  const keys = key.split('.')
  let result: unknown = translations

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = (result as Record<string, unknown>)[k]
    } else {
      return key
    }
  }

  return typeof result === 'string' ? result : key
}

/**
 * Get all translations for a locale
 */
export function getTranslations(locale: Locale): typeof frTranslations {
  return translationDict[locale] || translationDict.fr
}

/**
 * Check if a translation key exists
 */
export function hasTranslation(locale: Locale, key: string): boolean {
  const translations = translationDict[locale]
  if (!translations) return false

  const keys = key.split('.')
  let result: unknown = translations

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = (result as Record<string, unknown>)[k]
    } else {
      return false
    }
  }

  return typeof result === 'string'
}

/**
 * Get all available locales
 */
export function getSupportedLocales(): readonly Locale[] {
  return i18n.locales
}

/**
 * Default locale
 */
export function getDefaultLocale(): Locale {
  return i18n.defaultLocale as Locale
}

// Re-export for convenience
export type { Locale }
