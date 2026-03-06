'use client'

import { ReactNode, useState } from 'react'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: ReactNode
  locale: string
  role: string
}

export function DashboardLayout({ children, locale, role }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        locale={locale} 
        role={role} 
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Topbar 
        locale={locale} 
        role={role}
        sidebarCollapsed={sidebarCollapsed}
      />
      <main className={cn(
        'pt-16 min-h-screen transition-all duration-300',
        sidebarCollapsed ? 'pl-16' : 'pl-64'
      )}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
