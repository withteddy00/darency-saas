'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar locale={params.locale} />
      <div className="lg:pl-64">
        <Header locale={params.locale} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
