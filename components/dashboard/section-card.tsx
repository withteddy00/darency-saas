'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionCardProps {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className
}: SectionCardProps) {
  return (
    <div className={cn(
      'bg-surface rounded-xl border border-border overflow-hidden',
      className
    )}>
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          {subtitle && (
            <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}
