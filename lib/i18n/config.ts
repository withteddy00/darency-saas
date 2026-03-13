/**
 * i18n Configuration
 * 
 * Centralized locale configuration for the Darency SaaS application.
 * This file defines all supported locales and their properties.
 * 
 * To add a new locale:
 * 1. Add the locale to the `locales` array below
 * 2. Create a new folder in `lib/locales/{locale}/` with translation.json
 * 3. Add the locale to middleware.ts locales array
 * 4. Add the locale to next.config.js headers (if needed for CSP)
 */

export const i18n = {
  /** Default locale - used when no locale is specified */
  defaultLocale: 'fr',
  
  /** Array of supported locales */
  locales: ['fr', 'ar'] as const,
  
  /** Locale configurations with metadata */
  localeConfig: {
    fr: {
      name: 'Français',
      nativeName: 'Français',
      direction: 'ltr',
      currency: 'MAD',
      dateFormat: 'DD/MM/YYYY',
    },
    ar: {
      name: 'Arabic',
      nativeName: 'العربية',
      direction: 'rtl',
      currency: 'MAD',
      dateFormat: 'DD/MM/YYYY',
    },
  } as const,
}

/** Type for supported locale values */
export type Locale = typeof i18n.locales[number]

/** Type for locale configuration */
export type LocaleConfig = typeof i18n.localeConfig[Locale]

/**
 * Check if a string is a valid locale
 */
export function isLocale(value: string): value is Locale {
  return i18n.locales.includes(value as Locale)
}

/**
 * Get locale configuration for a given locale
 */
export function getLocaleConfig(locale: string): LocaleConfig | undefined {
  return i18n.localeConfig[locale as Locale]
}

/**
 * Get direction (ltr/rtl) for a locale
 */
export function getDirection(locale: string): 'ltr' | 'rtl' {
  return i18n.localeConfig[locale as Locale]?.direction ?? 'ltr'
}

/**
 * Get all available locales with their metadata
 */
export function getAvailableLocales(): Array<{ code: Locale; name: string; nativeName: string }> {
  return i18n.locales.map(locale => ({
    code: locale,
    name: i18n.localeConfig[locale].name,
    nativeName: i18n.localeConfig[locale].nativeName,
  }))
}
