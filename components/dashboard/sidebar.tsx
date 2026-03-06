'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Settings, 
  FileBarChart,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

interface SidebarProps {
  locale: string
  role: string
  isCollapsed?: boolean
  onToggle?: () => void
}

const ownerNavItems: NavItem[] = [
  { href: '/owner', label: 'Overview', icon: LayoutDashboard },
  { href: '/owner/residences', label: 'Residences', icon: Building2 },
  { href: '/owner/users', label: 'Users', icon: Users },
  { href: '/owner/reports', label: 'Reports', icon: FileBarChart },
  { href: '/owner/settings', label: 'Settings', icon: Settings },
]

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/residents', label: 'Residents', icon: Users },
  { href: '/dashboard/buildings', label: 'Buildings', icon: Building2 },
  { href: '/dashboard/finances', label: 'Finances', icon: FileBarChart },
  { href: '/dashboard/requests', label: 'Requests', icon: LayoutDashboard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const residentNavItems: NavItem[] = [
  { href: '/resident', label: 'Overview', icon: LayoutDashboard },
  { href: '/resident/payments', label: 'Payments', icon: FileBarChart },
  { href: '/resident/requests', label: 'Requests', icon: LayoutDashboard },
  { href: '/resident/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ locale, role, isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  
  const navItems = role === 'OWNER' ? ownerNavItems 
    : role === 'ADMIN' ? adminNavItems 
    : residentNavItems

  const translations = {
    fr: {
      dashboard: 'Tableau de bord',
      signOut: 'Déconnexion'
    },
    ar: {
      dashboard: 'لوحة التحكم',
      signOut: 'تسجيل الخروج'
    }
  }

  const t = translations[locale as 'fr' | 'ar'] || translations.fr

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen bg-surface border-r border-border flex flex-col transition-all duration-300 z-40',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <Link href={`/${locale}/${role.toLowerCase()}`} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">د</span>
          </div>
          {!isCollapsed && (
            <span className="font-heading font-bold text-text-primary">Darency</span>
          )}
        </Link>
        {onToggle && (
          <button 
            onClick={onToggle}
            className="p-1 rounded hover:bg-surface-elevated transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-text-secondary" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-text-secondary" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === `/${locale}${item.href}` || 
            (item.href !== `/${role.toLowerCase()}` && pathname.startsWith(`/${locale}${item.href}`))
          
          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                  : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary',
                isCollapsed && 'justify-center'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-border">
        <Link
          href={`/${locale}`}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors',
            isCollapsed && 'justify-center'
          )}
          title={isCollapsed ? t.dashboard : undefined}
        >
          <Home className="w-5 h-5" />
          {!isCollapsed && (
            <span className="font-medium text-sm">{t.dashboard}</span>
          )}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-error/10 hover:text-error transition-colors',
            isCollapsed && 'justify-center'
          )}
          title={isCollapsed ? t.signOut : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && (
            <span className="font-medium text-sm">{t.signOut}</span>
          )}
        </button>
      </div>
    </aside>
  )
}
