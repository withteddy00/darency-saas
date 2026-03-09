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
  ChevronRight,
  CreditCard,
  Wrench,
  Bell,
  FileText,
  Receipt,
  DollarSign,
  ClipboardList,
  CheckCircle2
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
  { href: '/owner/plans', label: 'Plans', icon: CreditCard },
  { href: '/owner/subscriptions', label: 'Subscriptions', icon: CheckCircle2 },
  { href: '/owner/subscription-requests', label: 'Requests', icon: FileText },
  { href: '/owner/admins', label: 'Administrators', icon: Users },
  { href: '/owner/activity-logs', label: 'Activity', icon: ClipboardList },
  { href: '/owner/settings', label: 'Settings', icon: Settings },
]

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/residents', label: 'Residents', icon: Users },
  { href: '/admin/apartments', label: 'Apartments', icon: Building2 },
  { href: '/admin/charges', label: 'Charges', icon: Receipt },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/requests', label: 'Maintenance', icon: Wrench },
  { href: '/admin/announcements', label: 'Announcements', icon: Bell },
  { href: '/admin/documents', label: 'Documents', icon: FileText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

const residentNavItems: NavItem[] = [
  { href: '/resident', label: 'Overview', icon: LayoutDashboard },
  { href: '/resident/charges', label: 'My Charges', icon: Receipt },
  { href: '/resident/payments', label: 'My Payments', icon: CreditCard },
  { href: '/resident/requests', label: 'Requests', icon: Wrench },
  { href: '/resident/announcements', label: 'Announcements', icon: Bell },
  { href: '/resident/documents', label: 'Documents', icon: FileText },
  { href: '/resident/profile', label: 'Profile', icon: Users },
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
      signOut: 'Déconnexion',
      Overview: 'Vue d\'ensemble',
      Residences: 'Résidences',
      Users: 'Utilisateurs',
      Reports: 'Rapports',
      Settings: 'Paramètres',
      Plans: 'Plans',
      Subscriptions: 'Abonnements',
      Requests: 'Demandes',
      Activity: 'Activité',
      Administrators: 'Administrateurs',
      Residents: 'Résidents',
      Apartments: 'Appartements',
      Charges: 'Charges',
      Payments: 'Paiements',
      Maintenance: 'Maintenance',
      Announcements: 'Annonces',
      Documents: 'Documents',
      'My Charges': 'Mes charges',
      'My Payments': 'Mes paiements',
      Profile: 'Profil',
    },
    ar: {
      dashboard: 'لوحة التحكم',
      signOut: 'تسجيل الخروج',
      Overview: 'نظرة عامة',
      Residences: 'العقارات',
      Users: 'المستخدمون',
      Reports: 'التقارير',
      Settings: 'الإعدادات',
      Plans: 'الخطط',
      Subscriptions: 'الاشتراكات',
      Requests: 'الطلبات',
      Activity: 'النشاط',
      Administrators: 'المسؤولون',
      Residents: 'المقيمون',
      Apartments: 'الشقق',
      Charges: 'الرسوم',
      Payments: 'المدفوعات',
      Maintenance: 'الصيانة',
      Announcements: 'الإعلانات',
      Documents: 'المستندات',
      'My Charges': 'رسومي',
      'My Payments': 'مدفوعاتي',
      Profile: 'الملف الشخصي',
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
              title={isCollapsed ? (t[item.label as keyof typeof t] || item.label) : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium text-sm">{t[item.label as keyof typeof t] || item.label}</span>
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
