'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Bell, 
  Globe, 
  ChevronDown,
  User,
  Settings,
  LogOut
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

interface TopbarProps {
  locale: string
  role: string
  sidebarCollapsed?: boolean
}

export function Topbar({ locale, role, sidebarCollapsed = false }: TopbarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const translations = {
    fr: {
      search: 'Rechercher...',
      notifications: 'Notifications',
      profile: 'Profil',
      settings: 'Paramètres',
      signOut: 'Déconnexion'
    },
    ar: {
      search: 'بحث...',
      notifications: 'الإشعارات',
      profile: 'الملف الشخصي',
      settings: 'الإعدادات',
      signOut: 'تسجيل الخروج'
    }
  }

  const t = translations[locale as 'fr' | 'ar'] || translations.fr

  const handleLanguageChange = (newLocale: string) => {
    const currentPath = window.location.pathname
    const newPath = currentPath.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
    setShowLangMenu(false)
  }

  return (
    <header className={cn(
      'fixed top-0 right-0 h-16 bg-surface/80 backdrop-blur-xl border-b border-border z-30 flex items-center justify-between px-6 transition-all duration-300',
      sidebarCollapsed ? 'left-16' : 'left-64'
    )}>
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-elevated border border-border rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="p-2 rounded-lg hover:bg-surface-elevated transition-colors flex items-center gap-2"
          >
            <Globe className="w-5 h-5 text-text-secondary" />
            <span className="text-sm font-medium text-text-secondary uppercase">{locale}</span>
          </button>
          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-surface rounded-lg shadow-lg border border-border py-1 z-50">
              <button
                onClick={() => handleLanguageChange('fr')}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm hover:bg-surface-elevated transition-colors',
                  locale === 'fr' && 'text-primary font-medium'
                )}
              >
                🇫🇷 Français
              </button>
              <button
                onClick={() => handleLanguageChange('ar')}
                className={cn(
                  'w-full px-4 py-2 text-right text-sm hover:bg-surface-elevated transition-colors',
                  locale === 'ar' && 'text-primary font-medium'
                )}
              >
                🇲🇦 العربية
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-surface-elevated transition-colors relative">
          <Bell className="w-5 h-5 text-text-secondary" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-elevated transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {session?.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <span className="text-sm font-medium text-text-primary hidden sm:block">
              {session?.user?.name || 'User'}
            </span>
            <ChevronDown className="w-4 h-4 text-text-secondary" />
          </button>
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-lg border border-border py-1 z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-text-primary">{session?.user?.name}</p>
                <p className="text-xs text-text-tertiary">{session?.user?.email}</p>
              </div>
              <Link
                href={`/${locale}/${role.toLowerCase()}/settings`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-surface-elevated transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings className="w-4 h-4" />
                {t.settings}
              </Link>
              <button
                onClick={() => {
                  setShowUserMenu(false)
                  signOut({ callbackUrl: `/${locale}/login` })
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t.signOut}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
