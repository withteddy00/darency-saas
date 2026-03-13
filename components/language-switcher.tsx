'use client'

import { useState } from 'react'

interface LanguageSwitcherProps {
  currentLocale: string
}

/**
 * Language Switcher Component
 * Client component for language selection
 */
export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleLanguage = (newLocale: string) => {
    window.location.href = `/${newLocale}`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
        aria-label="Select language"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
        {currentLocale.toUpperCase()}
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <button
            onClick={() => toggleLanguage('fr')}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${currentLocale === 'fr' ? 'text-primary font-medium' : 'text-gray-700'}`}
          >
            Français
          </button>
          <button
            onClick={() => toggleLanguage('ar')}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${currentLocale === 'ar' ? 'text-primary font-medium' : 'text-gray-700'}`}
          >
            العربية
          </button>
        </div>
      )}
    </div>
  )
}
