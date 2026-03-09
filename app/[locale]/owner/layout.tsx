'use client'

import { ReactNode, useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Topbar } from '@/components/dashboard/topbar'
import { cn } from '@/lib/utils'

interface OwnerLayoutProps {
  children: ReactNode
  params: {
    locale: string
  }
}

export default function OwnerLayout({ children, params }: OwnerLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        locale={params.locale} 
        role="OWNER"
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Topbar 
        locale={params.locale} 
        role="OWNER"
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
